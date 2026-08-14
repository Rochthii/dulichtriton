"""
Script: create_table_psycopg2.py
Tạo bảng preset_itineraries trực tiếp qua PostgreSQL connection.
"""
import os, json, sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
DB_URL = os.environ['DATABASE_URL']
SUPABASE_URL = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_KEY  = os.environ['SUPABASE_SERVICE_ROLE_KEY']

import psycopg2
import urllib.request, urllib.error

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
  stops        JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active    BOOLEAN DEFAULT true,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);
"""

RLS_SQL = """
ALTER TABLE preset_itineraries ENABLE ROW LEVEL SECURITY;
"""

POLICY_SQL = """
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

print(f"Connecting to PostgreSQL...")
try:
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Creating table...")
    cur.execute(CREATE_SQL)
    print("[OK] Table created (or already exists)")
    
    print("Enabling RLS...")
    try:
        cur.execute(RLS_SQL)
        print("[OK] RLS enabled")
    except Exception as e:
        print(f"  [WARN] RLS: {e}")
    
    print("Creating policy...")
    try:
        cur.execute(POLICY_SQL)
        print("[OK] Policy created")
    except Exception as e:
        print(f"  [WARN] Policy: {e}")
    
    conn.close()
    print("\nTable setup complete!")
    
except Exception as e:
    print(f"[ERROR] PostgreSQL connection failed: {e}")
    sys.exit(1)

# ── Now seed data via Supabase REST API ───────────────────────────────────────
# Load PRESETS from the existing script
exec(open('scripts/create_preset_itineraries.py', encoding='utf-8').read().split('print(f"Seeding')[0])

print(f"\nSeeding {len(PRESETS)} presets via Supabase REST...")

def upsert_rows(table, rows):
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

status = upsert_rows('preset_itineraries', PRESETS)
if status in [200, 201, 204]:
    print(f"[SUCCESS] All {len(PRESETS)} presets seeded!")
else:
    print(f"Upsert status: {status}")
