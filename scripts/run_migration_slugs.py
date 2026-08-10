import psycopg2
import sys
import os
from pathlib import Path

# Load .env.local — NEVER hardcode credentials in source code
def load_env(env_path: Path):
    if not env_path.exists():
        raise FileNotFoundError(f".env file not found: {env_path}")
    for line in env_path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, _, value = line.partition('=')
            os.environ.setdefault(key.strip(), value.strip())

ROOT = Path(__file__).parent.parent
load_env(ROOT / 'frontend' / '.env.local')

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print('[ERROR] DATABASE_URL not found in frontend/.env.local')
    sys.exit(1)

SQL = """
-- 1. Add slug column if not exists
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Unique index (only when slug is set)
CREATE UNIQUE INDEX IF NOT EXISTS places_slug_unique_idx ON public.places (slug) WHERE slug IS NOT NULL;

-- 3. Vietnamese slug generator function
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(input_text);
  result := regexp_replace(result, E'[\\u00e0\\u00e1\\u1ea1\\u1ea3\\u00e3\\u0103\\u1eaf\\u1eb7\\u1eb3\\u1eb5\\u00e2\\u1ea5\\u1ead\\u1ea9\\u1eab]', 'a', 'g');
  result := regexp_replace(result, E'[\\u00c0\\u00c1\\u1ea0\\u1ea2\\u00c3\\u0102\\u1eae\\u1eb6\\u1eb2\\u1eb4\\u00c2\\u1ea4\\u1eac\\u1ea8\\u1eaa]', 'a', 'g');
  result := regexp_replace(result, E'[\\u00e8\\u00e9\\u1eb9\\u1ebb\\u1ebd\\u00ea\\u1ebf\\u1ec7\\u1ec3\\u1ec5]', 'e', 'g');
  result := regexp_replace(result, E'[\\u00c8\\u00c9\\u1eb8\\u1eba\\u1ebc\\u00ca\\u1ebe\\u1ec6\\u1ec2\\u1ec4]', 'e', 'g');
  result := regexp_replace(result, E'[\\u00ec\\u00ed\\u1ecb\\u1ec9\\u0129]', 'i', 'g');
  result := regexp_replace(result, E'[\\u00cc\\u00cd\\u1eca\\u1ec8\\u0128]', 'i', 'g');
  result := regexp_replace(result, E'[\\u00f2\\u00f3\\u1ecd\\u1ecf\\u00f5\\u00f4\\u1ed1\\u1ed9\\u1ed5\\u1ed7\\u01a1\\u1edb\\u1ee3\\u1edf\\u1ee1]', 'o', 'g');
  result := regexp_replace(result, E'[\\u00d2\\u00d3\\u1ecc\\u1ece\\u00d5\\u00d4\\u1ed0\\u1ed8\\u1ed4\\u1ed6\\u01a0\\u1eda\\u1ee2\\u1ede\\u1ee0]', 'o', 'g');
  result := regexp_replace(result, E'[\\u00f9\\u00fa\\u1ee5\\u1ee7\\u0169\\u01b0\\u1ee9\\u1ef1\\u1eeb\\u1eed]', 'u', 'g');
  result := regexp_replace(result, E'[\\u00d9\\u00da\\u1ee4\\u1ee6\\u0168\\u01af\\u1ee8\\u1ef0\\u1eea\\u1eec]', 'u', 'g');
  result := regexp_replace(result, E'[\\u1ef3\\u00fd\\u1ef5\\u1ef7\\u1ef9]', 'y', 'g');
  result := regexp_replace(result, E'[\\u1ef2\\u00dd\\u1ef4\\u1ef6\\u1ef8]', 'y', 'g');
  result := regexp_replace(result, E'[\\u0111\\u0110]', 'd', 'g');
  result := regexp_replace(result, '[^a-z0-9 -]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(BOTH '-' FROM result);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Backfill slugs for rows with NULL slug
UPDATE public.places
SET slug = generate_slug(name) || '-' || lower(id)
WHERE slug IS NULL OR slug = '';

-- 5. Auto-generate slug trigger function
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name) || '-' || lower(COALESCE(NEW.id, extract(epoch from now())::text));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach trigger
DROP TRIGGER IF EXISTS trg_auto_generate_slug ON public.places;
CREATE TRIGGER trg_auto_generate_slug
  BEFORE INSERT ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();
"""

VERIFY_SQL = "SELECT id, name, slug FROM public.places ORDER BY id LIMIT 10;"

try:
    print("Connecting to Supabase PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=15, sslmode='require')
    conn.autocommit = False
    cur = conn.cursor()
    
    print("Running migration SQL...")
    cur.execute(SQL)
    conn.commit()
    print("Migration committed successfully!")
    
    print("\nVerifying slugs:")
    cur.execute(VERIFY_SQL)
    rows = cur.fetchall()
    for row in rows:
        print(f"  id={row[0]} | slug={row[2]} | name={row[1][:35]}")
    
    # Count nulls
    cur.execute("SELECT COUNT(*) FROM public.places WHERE slug IS NULL OR slug = ''")
    null_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM public.places")
    total = cur.fetchone()[0]
    print(f"\nTotal: {total} places | Null slugs remaining: {null_count}")
    
    cur.close()
    conn.close()
    print("\n[SUCCESS] Migration complete!")

except Exception as e:
    print(f"[ERROR] {type(e).__name__}: {e}")
    sys.exit(1)
