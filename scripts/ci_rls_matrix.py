#!/usr/bin/env python3
"""
CI Row Level Security (RLS) Access Control Matrix Verification Runner
Task: P05-023
System: Du Lịch Tri Tôn AI Assistant System

Validates the complete 16-table RLS Access Control Matrix:
- 6 Sensitive Tables: admin_users, audit_logs, chat_sessions, chat_logs, eval_cases, eval_runs
  (ZERO access for anon & authenticated; full access strictly for service_role)
- 10 Public Read Tables: places, videos, video_discoveries, preset_itineraries,
  custom_knowledge_base, knowledge_base, golden_answers, system_configs, system_config, semantic_chat_cache
  (SELECT only for anon & authenticated; ZERO mutation privileges; full access for service_role)

Core Security Checks:
1. Baseline Verification: Ensures P02-024 lockdown migration exists and activates RLS on all 16 tables.
2. Final Cumulative Privilege State Tracking: Simulates grants/revokes across migrations to verify
   final state adheres 100% to Zero-Trust (zero access on sensitive tables, SELECT-only on public tables).
3. Post-Baseline Policy Regression Audit: Scans all migrations after P02-024 baseline for any
   unauthorized GRANTs, RLS DISABLE statements, or permissive mutation policies.
4. Live PostgreSQL Matrix Verification (optional): Executes 192 scenario tests (16 tables x 3 roles x 4 ops)
   via SET ROLE transactions.

Exit code 1 is triggered immediately upon any policy regression.
"""

import os
import re
import sys
import argparse
from pathlib import Path

# Force UTF-8 console output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"

SENSITIVE_TABLES = [
    "admin_users",
    "audit_logs",
    "chat_sessions",
    "chat_logs",
    "eval_cases",
    "eval_runs",
]

PUBLIC_READ_TABLES = [
    "places",
    "videos",
    "video_discoveries",
    "preset_itineraries",
    "custom_knowledge_base",
    "knowledge_base",
    "golden_answers",
    "system_configs",
    "system_config",
    "semantic_chat_cache",
]

ALL_TABLES = SENSITIVE_TABLES + PUBLIC_READ_TABLES
ROLES = ["anon", "authenticated", "service_role"]
OPERATIONS = ["SELECT", "INSERT", "UPDATE", "DELETE"]


def clean_sql(content: str) -> str:
    """Removes single-line and multi-line SQL comments."""
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'--[^\n]*', '', content)
    return content


def get_baseline_migration_file(migrations_dir: Path) -> Path:
    """Finds the baseline RLS lockdown migration (P02-024)."""
    for f in sorted(migrations_dir.glob("*.sql")):
        if "p02_024" in f.name and "rls" in f.name:
            return f
    return None


def verify_baseline_rls_lockdown_present(migrations_dir: Path) -> list:
    """
    Verifies that the baseline RLS lockdown migration (P02-024) is present
    and properly enables RLS on all 16 tables.
    """
    errors = []
    baseline_file = get_baseline_migration_file(migrations_dir)
    if not baseline_file:
        errors.append("Baseline RLS lockdown migration (*p02_024*rls*.sql) not found in supabase/migrations/")
        return errors

    with open(baseline_file, "r", encoding="utf-8") as fp:
        content = clean_sql(fp.read())

    for tbl in ALL_TABLES:
        if not re.search(rf'\bALTER\s+TABLE\s+(?:public\.)?{tbl}\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY\b', content, re.IGNORECASE):
            errors.append(f"Baseline migration {baseline_file.name} missing 'ENABLE ROW LEVEL SECURITY' for table 'public.{tbl}'")

    return errors


def track_cumulative_privilege_matrix(migrations_dir: Path) -> tuple[dict, list]:
    """
    Simulates the sequence of SQL migrations to compute the final privilege state
    for roles across all 16 tables.
    Returns (table_privileges, regressions)
    """
    regressions = []
    # table -> role -> set of privileges
    privileges = {
        tbl: {role: set() for role in ROLES}
        for tbl in ALL_TABLES
    }
    # table -> rls_enabled (bool)
    rls_enabled = {tbl: False for tbl in ALL_TABLES}

    files = sorted(list(migrations_dir.glob("*.sql")), key=lambda p: p.name)

    for f in files:
        if not f.exists():
            continue
        try:
            with open(f, "r", encoding="utf-8") as fp:
                sql = clean_sql(fp.read())
        except (UnicodeDecodeError, FileNotFoundError) as e:
            if isinstance(e, UnicodeDecodeError):
                regressions.append(f"{f.name}: UTF-8 decode error: {e}")
            continue

        # Check RLS enable/disable
        for tbl in ALL_TABLES:
            if re.search(rf'\bALTER\s+TABLE\s+(?:public\.)?{tbl}\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY\b', sql, re.IGNORECASE):
                rls_enabled[tbl] = True
            if re.search(rf'\bALTER\s+TABLE\s+(?:public\.)?{tbl}\s+DISABLE\s+ROW\s+LEVEL\s+SECURITY\b', sql, re.IGNORECASE):
                rls_enabled[tbl] = False
                regressions.append(f"{f.name}: [POLICY REGRESSION] Row Level Security explicitly DISABLED on 'public.{tbl}'")

        # Track REVOKE ALL
        for tbl in ALL_TABLES:
            revoke_pattern = re.compile(
                rf'\bREVOKE\s+ALL\s+(?:ON\s+(?:TABLE\s+)?(?:public\.)?{tbl}\s+)?FROM\s+([^;]+);',
                re.IGNORECASE
            )
            for m in revoke_pattern.finditer(sql):
                revoked_roles = m.group(1).lower()
                for r in ROLES:
                    if r in revoked_roles:
                        privileges[tbl][r].clear()

        # Track GRANTs
        for tbl in ALL_TABLES:
            grant_pattern = re.compile(
                rf'\bGRANT\s+([A-Z,\s]+)\s+ON\s+(?:TABLE\s+)?(?:public\.)?{tbl}\b\s+TO\s+([^;]+);',
                re.IGNORECASE
            )
            for m in grant_pattern.finditer(sql):
                privs_str = m.group(1).upper()
                recipients = m.group(2).lower()
                priv_list = [p.strip() for p in privs_str.split(",") if p.strip()]

                for r in ROLES:
                    if r in recipients:
                        for p in priv_list:
                            if p == "ALL":
                                privileges[tbl][r].update(["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"])
                            else:
                                privileges[tbl][r].add(p)

    # Validate final cumulative privilege invariants
    for tbl in SENSITIVE_TABLES:
        if not rls_enabled[tbl]:
            regressions.append(f"[POLICY REGRESSION: FINAL STATE] RLS is NOT enabled on sensitive table 'public.{tbl}'")
        for r in ("anon", "authenticated"):
            active_privs = privileges[tbl][r]
            if active_privs:
                regressions.append(
                    f"[POLICY REGRESSION: FINAL STATE] Sensitive table 'public.{tbl}' has active privileges {sorted(list(active_privs))} for role '{r}'"
                )

    for tbl in PUBLIC_READ_TABLES:
        if not rls_enabled[tbl]:
            regressions.append(f"[POLICY REGRESSION: FINAL STATE] RLS is NOT enabled on public table 'public.{tbl}'")
        for r in ("anon", "authenticated"):
            active_privs = privileges[tbl][r]
            illegal_privs = active_privs - {"SELECT"}
            if illegal_privs:
                regressions.append(
                    f"[POLICY REGRESSION: FINAL STATE] Public table 'public.{tbl}' has illegal mutation privileges {sorted(list(illegal_privs))} for role '{r}'"
                )

    return privileges, regressions


def audit_post_baseline_migrations_for_regressions(migrations_dir: Path) -> list:
    """
    Audits migrations created after the P02-024 baseline.
    Any attempt to grant permissions or create permissive policies for client roles
    is flagged as a policy regression.
    """
    regressions = []
    baseline_file = get_baseline_migration_file(migrations_dir)
    if not baseline_file:
        return ["Baseline migration not found"]

    files = sorted(list(migrations_dir.glob("*.sql")), key=lambda p: p.name)
    baseline_name = baseline_file.name

    post_baseline_files = [f for f in files if f.name > baseline_name]

    for f in post_baseline_files:
        if not f.exists():
            continue
        try:
            with open(f, "r", encoding="utf-8") as fp:
                sql = clean_sql(fp.read())
        except (UnicodeDecodeError, FileNotFoundError) as e:
            if isinstance(e, UnicodeDecodeError):
                regressions.append(f"{f.name}: UTF-8 decode error: {e}")
            continue

        # 1. Any GRANT to anon or authenticated on sensitive tables
        for tbl in SENSITIVE_TABLES:
            grant_pattern = re.compile(
                rf'\bGRANT\s+([A-Z,\s]+)\s+ON\s+(?:TABLE\s+)?(?:public\.)?{tbl}\b\s+TO\s+([^;]+);',
                re.IGNORECASE
            )
            for m in grant_pattern.finditer(sql):
                privs = m.group(1).upper()
                recipients = m.group(2).lower()
                if "anon" in recipients or "authenticated" in recipients or "public" in recipients:
                    regressions.append(
                        f"{f.name}: [POLICY REGRESSION] Unauthorized post-baseline GRANT '{privs.strip()}' on sensitive table 'public.{tbl}' to '{recipients.strip()}'"
                    )

            # Permissive policies on sensitive tables
            policy_pattern = re.compile(
                rf'\bCREATE\s+POLICY\s+["\']?([^"\'\s]+)["\']?\s+ON\s+(?:public\.)?{tbl}\b([^;]+);',
                re.IGNORECASE
            )
            for m in policy_pattern.finditer(sql):
                pol_name = m.group(1)
                pol_body = m.group(2).lower()
                if "to anon" in pol_body or "to authenticated" in pol_body or "to public" in pol_body:
                    regressions.append(
                        f"{f.name}: [POLICY REGRESSION] Post-baseline permissive policy '{pol_name}' on sensitive table 'public.{tbl}' for client roles"
                    )

        # 2. Mutation GRANTs or mutation policies on public tables
        for tbl in PUBLIC_READ_TABLES:
            grant_pattern = re.compile(
                rf'\bGRANT\s+([A-Z,\s]+)\s+ON\s+(?:TABLE\s+)?(?:public\.)?{tbl}\b\s+TO\s+([^;]+);',
                re.IGNORECASE
            )
            for m in grant_pattern.finditer(sql):
                privs = m.group(1).upper()
                recipients = m.group(2).lower()
                if "anon" in recipients or "authenticated" in recipients or "public" in recipients:
                    forbidden = ["ALL", "INSERT", "UPDATE", "DELETE", "TRUNCATE"]
                    for for_priv in forbidden:
                        if re.search(rf'\b{for_priv}\b', privs):
                            regressions.append(
                                f"{f.name}: [POLICY REGRESSION] Unauthorized post-baseline mutation GRANT '{for_priv}' on table 'public.{tbl}' to '{recipients.strip()}'"
                            )

            # Mutation policies on public tables for client roles
            policy_pattern = re.compile(
                rf'\bCREATE\s+POLICY\s+["\']?([^"\'\s]+)["\']?\s+ON\s+(?:public\.)?{tbl}\b([^;]+);',
                re.IGNORECASE
            )
            for m in policy_pattern.finditer(sql):
                pol_name = m.group(1)
                pol_body = m.group(2).lower()
                if "to anon" in pol_body or "to authenticated" in pol_body or "to public" in pol_body:
                    if "for all" in pol_body or "for insert" in pol_body or "for update" in pol_body or "for delete" in pol_body:
                        regressions.append(
                            f"{f.name}: [POLICY REGRESSION] Unauthorized post-baseline mutation policy '{pol_name}' on table 'public.{tbl}' for client roles"
                        )

    return regressions


def run_live_rls_matrix_test(db_url: str) -> list:
    """
    Runs live 192 RLS checks against a live PostgreSQL database instance.
    Uses SET ROLE anon, authenticated, service_role within rollback transactions.
    """
    try:
        import psycopg2
    except ImportError:
        return ["psycopg2 is not installed. Run 'pip install psycopg2-binary' for live testing."]

    errors = []
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False
    except Exception as e:
        return [f"Failed to connect to database: {e}"]

    sample_queries = {
        "SELECT": lambda tbl: f"SELECT count(*) FROM public.{tbl};",
        "INSERT": lambda tbl: f"INSERT INTO public.{tbl} DEFAULT VALUES;" if tbl not in ("places", "admin_users") else f"INSERT INTO public.{tbl} (name) VALUES ('test');",
        "UPDATE": lambda tbl: f"UPDATE public.{tbl} SET id = id WHERE false;",
        "DELETE": lambda tbl: f"DELETE FROM public.{tbl} WHERE false;",
    }

    try:
        with conn.cursor() as cur:
            for tbl in ALL_TABLES:
                for role in ROLES:
                    for op in OPERATIONS:
                        expected_allow = False
                        if role == "service_role":
                            expected_allow = True
                        elif role in ("anon", "authenticated"):
                            if op == "SELECT" and tbl in PUBLIC_READ_TABLES:
                                expected_allow = True
                            else:
                                expected_allow = False

                        sql = f"""
                        BEGIN;
                        SET ROLE {role};
                        {sample_queries[op](tbl)}
                        ROLLBACK;
                        """
                        try:
                            cur.execute(sql)
                            conn.rollback()
                            actual_allow = True
                        except Exception:
                            conn.rollback()
                            actual_allow = False

                        if expected_allow != actual_allow:
                            action = "ALLOWED" if actual_allow else "DENIED"
                            exp_str = "ALLOW" if expected_allow else "DENY"
                            errors.append(
                                f"Live check failed: table={tbl}, role={role}, op={op} -> Expected {exp_str}, got {action}"
                            )
    finally:
        conn.close()

    return errors


def main():
    parser = argparse.ArgumentParser(description="Tri Ton AI CI RLS Matrix Verification")
    parser.add_argument("--validate-only", action="store_true", help="Perform offline static policy and regression analysis only")
    parser.add_argument("--db-url", type=str, default=os.getenv("DATABASE_URL"), help="PostgreSQL connection URL for live matrix test")
    parser.add_argument("--migrations-dir", type=str, default=str(MIGRATIONS_DIR), help="Path to migrations directory")

    args = parser.parse_args()
    migrations_path = Path(args.migrations_dir)

    print("=" * 80)
    print("🛡️  TRI TON AI — CI RLS ACCESS CONTROL MATRIX VERIFICATION (P05-023)")
    print(f"Migrations Dir: {migrations_path}")
    print(f"Total Monitored Tables: {len(ALL_TABLES)} (6 Sensitive, 10 Public Read)")
    print(f"Roles Monitored: {', '.join(ROLES)}")
    print("=" * 80)

    # 1. Baseline RLS setup check
    baseline_errors = verify_baseline_rls_lockdown_present(migrations_path)
    if baseline_errors:
        print("\n❌ BASELINE RLS SPECIFICATION DEFECTS DETECTED:")
        for err in baseline_errors:
            print(f"   - {err}")
        sys.exit(1)
    else:
        print("✔ Baseline RLS lockdown specification verified (16/16 tables RLS enabled).")

    # 2. Cumulative Privilege Matrix tracking
    print("\n🔍 Simulating cumulative privilege transitions across all migrations...")
    _, cumulative_regressions = track_cumulative_privilege_matrix(migrations_path)
    if cumulative_regressions:
        print(f"\n❌ CUMULATIVE STATE REGRESSION DETECTED ({len(cumulative_regressions)} defects):")
        for reg in cumulative_regressions:
            print(f"   - {reg}")
        print("\nCI BUILD FAILED: Cumulative privilege state violates Zero-Trust invariants.")
        sys.exit(1)
    else:
        print("✔ Cumulative privilege state verified: 0 unauthorized privileges in final schema.")

    # 3. Post-baseline migration policy regression audit
    print("\n🔍 Auditing post-baseline migrations for unauthorized grants and mutation policies...")
    post_regressions = audit_post_baseline_migrations_for_regressions(migrations_path)
    if post_regressions:
        print(f"\n❌ POST-BASELINE POLICY REGRESSION DETECTED ({len(post_regressions)} defects):")
        for reg in post_regressions:
            print(f"   - {reg}")
        print("\nCI BUILD FAILED: Post-baseline migration introduces unauthorized policy changes.")
        sys.exit(1)
    else:
        print("✔ Post-baseline migrations verified: 0 policy regressions detected.")

    # 4. Live database matrix test if requested / available
    if not args.validate_only and args.db_url:
        print(f"\n⚡ Running live 192 RLS matrix checks against {args.db_url}...")
        live_errors = run_live_rls_matrix_test(args.db_url)
        if live_errors:
            print(f"\n❌ LIVE RLS MATRIX CHECKS FAILED ({len(live_errors)} violations):")
            for err in live_errors:
                print(f"   - {err}")
            sys.exit(1)
        else:
            print("✔ All 192 live RLS matrix checks PASSED successfully.")

    print("\n" + "=" * 80)
    print("✅ RLS ACCESS CONTROL MATRIX VERIFICATION PASSED (0 REGRESSIONS)")
    print("=" * 80)
    sys.exit(0)


if __name__ == "__main__":
    main()
