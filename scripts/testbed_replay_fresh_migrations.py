#!/usr/bin/env python3
"""
Testbed Fresh Migration Replay Script
Task: P02-023
System: Du Lịch Tri Tôn AI Assistant System

Tests the end-to-end replay of all SQL migration files in `supabase/migrations/`
on a completely fresh/blank database within the Docker testbed container (`triton_testbed_w2`).
Ensures zero dependency errors, syntax errors, or schema inconsistencies.
"""

import os
import sys
import time
import subprocess
from pathlib import Path

# Force UTF-8 for console output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

CONTAINER_NAME = "triton_testbed_w2"
DB_NAME = "triton_replay_fresh"
REPO_ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"


def run_psql(cmd_args, input_data=None, db="postgres"):
    """Executes a command via psql inside the Docker testbed container."""
    base_cmd = [
        "docker", "exec", "-i", CONTAINER_NAME,
        "psql", "-U", "postgres", "-d", db
    ] + cmd_args

    res = subprocess.run(
        base_cmd,
        input=input_data.encode("utf-8") if isinstance(input_data, str) else input_data,
        capture_output=True
    )
    return res


def main():
    print("=" * 70)
    print("🚀 P02-023: TESTBED FRESH MIGRATION REPLAY")
    print(f"Container: {CONTAINER_NAME}")
    print(f"Target Database: {DB_NAME}")
    print(f"Migrations Dir: {MIGRATIONS_DIR}")
    print("=" * 70)

    # 1. Check Container Health
    check_res = subprocess.run(
        ["docker", "inspect", "-f", "{{.State.Running}}", CONTAINER_NAME],
        capture_output=True, text=True
    )
    if check_res.returncode != 0 or check_res.stdout.strip() != "true":
        print(f"❌ Error: Docker container '{CONTAINER_NAME}' is not running.")
        sys.exit(1)
    print(f"✔ Docker container '{CONTAINER_NAME}' is running.")

    # 2. Check Available Extensions
    ext_check_sql = """
    SELECT name, default_version 
    FROM pg_available_extensions 
    WHERE name IN ('uuid-ossp', 'pgcrypto', 'vector', 'postgis', 'unaccent', 'pg_trgm')
    ORDER BY name;
    """
    res = run_psql(["-t", "-A", "-c", ext_check_sql])
    if res.returncode != 0:
        print(f"❌ Failed to query pg_available_extensions:\n{res.stderr.decode('utf-8', errors='replace')}")
        sys.exit(1)
    available_exts = [line.split('|')[0] for line in res.stdout.decode('utf-8').strip().split('\n') if line]
    print(f"✔ Available core extensions in testbed: {', '.join(available_exts)}")

    # 3. Drop and Recreate Blank Database
    print(f"\n🔄 Re-creating fresh blank database '{DB_NAME}'...")
    run_psql(["-c", f"DROP DATABASE IF EXISTS {DB_NAME} WITH (FORCE);"])
    res = run_psql(["-v", "ON_ERROR_STOP=1", "-c", f"CREATE DATABASE {DB_NAME};"])
    if res.returncode != 0:
        print(f"❌ Failed to create database '{DB_NAME}':\n{res.stderr.decode('utf-8', errors='replace')}")
        sys.exit(1)
    print(f"✔ Database '{DB_NAME}' created completely blank.")

    # 4. Bootstrap Standard Supabase Roles
    print("\n🔐 Bootstrapping standard Supabase roles (anon, authenticated, service_role)...")
    roles_bootstrap_sql = """
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
      END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
      END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN BYPASSRLS;
      END IF;
    END $$;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
    """
    res = run_psql(["-v", "ON_ERROR_STOP=1", "-c", roles_bootstrap_sql], db=DB_NAME)
    if res.returncode != 0:
        print(f"❌ Failed to bootstrap roles:\n{res.stderr.decode('utf-8', errors='replace')}")
        sys.exit(1)
    print("✔ Supabase roles and default privileges configured.")

    # 5. Discover Migration Files
    migration_files = sorted(list(MIGRATIONS_DIR.glob("*.sql")), key=lambda p: p.name)
    print(f"\n📦 Found {len(migration_files)} migration files to replay:")
    for idx, f in enumerate(migration_files, 1):
        print(f"   {idx:02d}. {f.name}")

    # 6. Replay Migrations Sequentially
    print("\n" + "=" * 70)
    print("▶ EXECUTING MIGRATION REPLAY CHAIN")
    print("=" * 70)

    start_all = time.time()
    for idx, mig in enumerate(migration_files, 1):
        print(f"[{idx:02d}/{len(migration_files):02d}] Applying: {mig.name} ... ", end="", flush=True)
        t0 = time.time()

        with open(mig, "r", encoding="utf-8") as f:
            sql_content = f.read()

        res = run_psql(
            ["-v", "ON_ERROR_STOP=1"],
            input_data=sql_content,
            db=DB_NAME
        )
        elapsed = (time.time() - t0) * 1000

        if res.returncode != 0:
            err_msg = res.stderr.decode("utf-8", errors="replace")
            out_msg = res.stdout.decode("utf-8", errors="replace")
            print(f"❌ FAILED ({elapsed:.1f}ms)")
            print("\n" + "!" * 70)
            print(f"MIGRATION ERROR in: {mig.name}")
            print("STDOUT:\n" + out_msg)
            print("STDERR:\n" + err_msg)
            print("!" * 70)
            sys.exit(1)

        print(f"✔ OK ({elapsed:.1f}ms)")

    total_time = time.time() - start_all
    print("=" * 70)
    print(f"🎉 100% of {len(migration_files)} migration files replayed successfully in {total_time:.2f}s!")
    print("=" * 70)

    # 7. Post-Replay Verification Assertions
    print("\n🔍 Running Post-Replay Verification Assertions...")

    verification_sql = """
    DO $$
    DECLARE
      v_count INT;
      v_geom_type TEXT;
      v_rls_count INT;
    BEGIN
      -- 1. Check core tables
      SELECT count(*) INTO v_count 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN (
          'places', 'admin_users', 'preset_itineraries', 'videos', 'video_discoveries',
          'system_configs', 'chat_sessions', 'chat_logs', 'audit_logs', 'golden_answers',
          'semantic_chat_cache', 'custom_knowledge_base'
        );
      IF v_count < 12 THEN
        RAISE EXCEPTION 'Missing core tables: expected at least 12, found %', v_count;
      END IF;

      -- 2. Check places.geom spatial type
      SELECT udt_name INTO v_geom_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'geom';
      IF v_geom_type != 'geography' THEN
        RAISE EXCEPTION 'places.geom expected type geography, got %', v_geom_type;
      END IF;

      -- 3. Check boundary constraints
      SELECT count(*) INTO v_count
      FROM pg_constraint
      WHERE conname IN (
        'chk_places_latitude_boundary',
        'chk_places_longitude_boundary',
        'chk_places_rating_range'
      );
      IF v_count < 3 THEN
        RAISE EXCEPTION 'Missing CHECK constraints on places: expected 3, found %', v_count;
      END IF;

      -- 4. Check core extensions installed in DB
      SELECT count(*) INTO v_count
      FROM pg_extension
      WHERE extname IN ('postgis', 'vector', 'pgcrypto', 'uuid-ossp', 'unaccent', 'pg_trgm');
      IF v_count < 6 THEN
        RAISE EXCEPTION 'Missing installed extensions: expected 6, found %', v_count;
      END IF;

      -- 5. Check RLS enabled on tables
      SELECT count(*) INTO v_rls_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true;
      IF v_rls_count < 10 THEN
        RAISE EXCEPTION 'Expected RLS enabled on tables, found only %', v_rls_count;
      END IF;

      -- 6. Check RPC functions
      SELECT count(*) INTO v_count
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' 
        AND p.proname IN ('match_places', 'match_places_nearby', 'match_kb', 'match_golden', 'match_semantic_cache');
      IF v_count < 5 THEN
        RAISE EXCEPTION 'Missing core RPC functions: expected 5, found %', v_count;
      END IF;

      RAISE NOTICE 'All verification assertions passed successfully! Tables: 12+, RLS Tables: %, Constraints: 3, Extensions: 6, RPCs: 5', v_rls_count;
    END $$;
    """

    res = run_psql(["-v", "ON_ERROR_STOP=1", "-c", verification_sql], db=DB_NAME)
    if res.returncode != 0:
        print(f"❌ Verification failed:\n{res.stderr.decode('utf-8', errors='replace')}")
        sys.exit(1)

    print("✔ All verification assertions passed!")
    print(res.stderr.decode('utf-8', errors='replace').strip())

    # 8. Summary Table of Tables and Row Level Security
    tables_summary_sql = """
    SELECT 
      c.relname AS table_name,
      c.relrowsecurity AS rls_enabled,
      count(p.polname) AS policy_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_policy p ON p.polrelid = c.oid
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    GROUP BY c.relname, c.relrowsecurity
    ORDER BY c.relname;
    """
    res = run_psql(["-c", tables_summary_sql], db=DB_NAME)
    print("\n📊 Database Schema Replay State:")
    print(res.stdout.decode('utf-8', errors='replace'))

    print("\n✅ P02-023: Fresh migration replay completed with 100% success!")


if __name__ == "__main__":
    main()
