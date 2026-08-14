"""
Script: setup_preset_itineraries_db.py
Dùng Supabase Management API để tạo bảng và seed data.
"""
import os, json, sys, urllib.request, urllib.error
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')

SUPABASE_URL  = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_KEY   = os.environ['SUPABASE_SERVICE_ROLE_KEY']
DB_URL        = os.environ.get('DATABASE_URL', '')

# ── Extract project ref from URL ──────────────────────────────────────────────
# URL format: https://knmlbwsmfljlabhvqfid.supabase.co
project_ref = SUPABASE_URL.replace('https://', '').split('.')[0]
print(f"Project ref: {project_ref}")

def run_query_via_rest(sql: str) -> dict:
    """Use Supabase's postgres functions to run raw SQL via service role."""
    # Try via pg_meta endpoint (management)
    url = f"{SUPABASE_URL}/rest/v1/rpc/query"
    payload = json.dumps({"query": sql}).encode('utf-8')
    req = urllib.request.Request(
        url, data=payload,
        headers={
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return {"ok": True, "data": json.loads(r.read().decode('utf-8'))}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return {"ok": False, "code": e.code, "body": body}

def upsert_rows(table: str, rows: list) -> int:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    payload = json.dumps(rows, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        url, data=payload,
        headers={
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Prefer': 'resolution=merge-duplicates,return=minimal',
        }
    )
    req.get_method = lambda: 'POST'
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"  [ERR] {e.code}: {body[:300]}")
        return e.code

# ── STEP 1: Try to create table via psycopg2 (direct DB connection) ───────────
CREATE_SQL = """
CREATE TABLE IF NOT EXISTS preset_itineraries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  emoji        TEXT NOT NULL,
  title        TEXT NOT NULL,
  tagline      TEXT NOT NULL,
  for_whom     TEXT NOT NULL,
  duration     TEXT NOT NULL,
  budget_range TEXT,
  stops        JSONB NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE preset_itineraries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'preset_itineraries'
    AND policyname = 'Allow public read preset_itineraries'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow public read preset_itineraries"
      ON preset_itineraries FOR SELECT USING (is_active = true)';
  END IF;
END
$$;
"""

print("Attempting to create table via psycopg2...")
try:
    import psycopg2
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(CREATE_SQL)
    conn.close()
    print("[SUCCESS] Table created via psycopg2!")
    table_ready = True
except ImportError:
    print("  psycopg2 not installed. Trying alternative...")
    table_ready = False
except Exception as e:
    print(f"  psycopg2 error: {e}")
    table_ready = False

if not table_ready:
    # Try via urllib pg_meta
    print("Attempting via Supabase pg_meta API...")
    PG_META_URL = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
    payload = json.dumps({"query": CREATE_SQL}).encode('utf-8')
    # Try to get management API token from env
    mgmt_token = os.environ.get('SUPABASE_ACCESS_TOKEN', '')
    if mgmt_token:
        req = urllib.request.Request(
            PG_META_URL, data=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {mgmt_token}',
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                print(f"[SUCCESS] pg_meta: {r.status}")
                table_ready = True
        except urllib.error.HTTPError as e:
            print(f"  pg_meta error: {e.code} — {e.read().decode()[:200]}")
    else:
        print("  No SUPABASE_ACCESS_TOKEN in env.")

# ── STEP 2: Print SQL for manual execution if auto-create failed ──────────────
if not table_ready:
    print("\n" + "="*60)
    print("AUTO-CREATE FAILED. Run this SQL in Supabase Dashboard:")
    print("https://supabase.com/dashboard/project/knmlbwsmfljlabhvqfid/sql")
    print("="*60)
    print(CREATE_SQL)
    print("="*60)
    print("\nAfter running SQL, re-run: python scripts/seed_preset_itineraries.py")
    sys.exit(0)

# ── STEP 3: Seed data ──────────────────────────────────────────────────────────
print("Table ready. Seeding 8 preset itineraries...")

from preset_data import PRESETS
status = upsert_rows('preset_itineraries', PRESETS)
if status in [200, 201, 204]:
    print(f"[SUCCESS] All {len(PRESETS)} preset itineraries seeded!")
else:
    print(f"Upsert returned: {status}")
