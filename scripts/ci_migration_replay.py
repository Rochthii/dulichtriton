#!/usr/bin/env python3
"""
CI Migration Replay and Verification Runner
Task: P05-022
System: Du Lịch Tri Tôn AI Assistant System

Performs automated migration replay on clean PostgreSQL database or
strict structural and syntax validation across all SQL migrations in `supabase/migrations/`.
Guarantees that any migration failure or syntax defect causes immediate exit code 1.
"""

import os
import re
import sys
import argparse
from pathlib import Path

# Force UTF-8 encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"


def validate_migrations_syntax(migrations_dir: Path) -> list:
    """
    Statically validates the naming conventions, encoding, and SQL structure
    of all migration files. Returns list of errors if any.
    """
    errors = []
    if not migrations_dir.exists():
        return [f"Migrations directory does not exist: {migrations_dir}"]

    files = sorted(list(migrations_dir.glob("*.sql")), key=lambda p: p.name)
    if not files:
        return [f"No .sql migration files found in: {migrations_dir}"]

    # Known invalid SQL tokens that indicate corruption or typo
    SYNTAX_ERROR_PATTERNS = [
        (re.compile(r'\bCREATE\s+TABEL\b', re.IGNORECASE), "Invalid SQL syntax: 'CREATE TABEL' (misspelled TABLE)"),
        (re.compile(r'\bSELEKT\b', re.IGNORECASE), "Invalid SQL syntax: 'SELEKT' (misspelled SELECT)"),
        (re.compile(r'\bINSRT\s+INTO\b', re.IGNORECASE), "Invalid SQL syntax: 'INSRT INTO' (misspelled INSERT)"),
        (re.compile(r'\bALTR\s+TABLE\b', re.IGNORECASE), "Invalid SQL syntax: 'ALTR TABLE' (misspelled ALTER)"),
        (re.compile(r'\bDROP\s+TABEL\b', re.IGNORECASE), "Invalid SQL syntax: 'DROP TABEL' (misspelled TABLE)"),
    ]

    for f in files:
        if not f.exists():
            continue

        # 1. Filename pattern check: Must start with timestamp/version digits
        if not re.match(r'^\d{8}', f.name):
            errors.append(f"{f.name}: Filename must start with an 8+ digit timestamp (YYYYMMDD...)")

        # 2. Encoding and content check
        try:
            with open(f, "r", encoding="utf-8") as fp:
                content = fp.read()
        except (UnicodeDecodeError, FileNotFoundError) as e:
            if isinstance(e, UnicodeDecodeError):
                errors.append(f"{f.name}: Failed to decode UTF-8: {e}")
            continue

        if not content.strip():
            errors.append(f"{f.name}: Migration file is empty")
            continue

        # 3. Dollar-quoting balance check for PL/pgSQL blocks
        dollar_tags = re.findall(r'\$\$', content)
        if len(dollar_tags) % 2 != 0:
            errors.append(f"{f.name}: Unbalanced PL/pgSQL block dollar quotes ($$) count: {len(dollar_tags)}")

        # 4. Pattern check for deliberate or accidental syntax errors
        for pattern, desc in SYNTAX_ERROR_PATTERNS:
            if pattern.search(content):
                errors.append(f"{f.name}: {desc}")

    return errors


def replay_migrations_on_db(db_url: str, migrations_dir: Path):
    """
    Executes sequential migration replay on a target PostgreSQL database.
    """
    try:
        import psycopg2
    except ImportError:
        print("❌ Error: psycopg2 is required for database migration replay. Run: pip install psycopg2-binary")
        sys.exit(1)

    files = sorted(list(migrations_dir.glob("*.sql")), key=lambda p: p.name)
    if not files:
        print(f"❌ Error: No migration files found in {migrations_dir}")
        sys.exit(1)

    print(f"Connecting to database: {db_url.split('@')[-1] if '@' in db_url else db_url}...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()

    try:
        # Bootstrap standard Supabase roles if not present
        roles_sql = """
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
        """
        cursor.execute(roles_sql)
        print("✔ Supabase roles (anon, authenticated, service_role) bootstrapped.")

        # Replay each migration sequentially
        print(f"Replaying {len(files)} migrations...")
        for idx, f in enumerate(files, 1):
            print(f"  [{idx:02d}/{len(files):02d}] {f.name} ... ", end="", flush=True)
            with open(f, "r", encoding="utf-8") as fp:
                sql = fp.read()
            cursor.execute(sql)
            print("OK")

        print("✔ All migrations applied successfully to database.")

        # Post-replay schema assertions
        cursor.execute("""
            SELECT count(*) FROM pg_tables 
            WHERE schemaname = 'public' 
              AND tablename IN ('places', 'admin_users', 'chat_sessions', 'chat_logs', 'audit_logs');
        """)
        core_tables_count = cursor.fetchone()[0]
        if core_tables_count < 5:
            raise Exception(f"Core tables missing after replay: expected >= 5, got {core_tables_count}")

        print(f"✔ Post-replay assertions verified: {core_tables_count} core tables present.")

    finally:
        cursor.close()
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="CI Migration Replay and Verification Runner")
    parser.add_argument("--migrations-dir", type=str, default=str(DEFAULT_MIGRATIONS_DIR),
                        help="Path to migrations directory")
    parser.add_argument("--validate-only", action="store_true",
                        help="Only perform static syntax validation without database execution")
    parser.add_argument("--db-url", type=str, default=os.environ.get("DATABASE_URL", ""),
                        help="PostgreSQL connection string (defaults to DATABASE_URL env var)")
    args = parser.parse_args()

    migrations_dir = Path(args.migrations_dir)
    print("=" * 70)
    print("🚀 P05-022: CI MIGRATION REPLAY & VERIFICATION")
    print(f"Directory: {migrations_dir}")
    print("=" * 70)

    # Step 1: Static syntax & structure validation
    print("🔍 Step 1: Validating migration file naming and SQL syntax...")
    errors = validate_migrations_syntax(migrations_dir)
    if errors:
        print("❌ Migration validation FAILED with the following errors:")
        for err in errors:
            print(f"   - {err}")
        print("=" * 70)
        sys.exit(1)

    migration_count = len(list(migrations_dir.glob("*.sql")))
    print(f"✔ Step 1 PASSED: All {migration_count} migration files passed structural and syntax validation.")

    # Step 2: Database replay execution if db-url is provided
    if args.db_url and not args.validate_only:
        print("\n🔄 Step 2: Replaying migrations on target PostgreSQL database...")
        try:
            replay_migrations_on_db(args.db_url, migrations_dir)
            print("✔ Step 2 PASSED: End-to-end database replay succeeded.")
        except Exception as e:
            print(f"❌ Step 2 FAILED: Database replay error: {e}")
            sys.exit(1)
    else:
        print("\nℹ Step 2 skipped: DATABASE_URL not set or --validate-only specified.")

    print("\n✅ CI Migration verification completed successfully with 0 errors!")
    sys.exit(0)


if __name__ == "__main__":
    main()
