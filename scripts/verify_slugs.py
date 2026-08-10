import psycopg2
import sys
import os
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

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

conn = psycopg2.connect(DATABASE_URL, connect_timeout=15, sslmode='require')
cur = conn.cursor()

cur.execute('SELECT COUNT(*) FROM public.places')
total = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM public.places WHERE slug IS NULL OR slug = ''")
nulls = cur.fetchone()[0]

print(f'Total places: {total} | Null slugs remaining: {nulls}')
print()
print('Sample slugs:')
cur.execute('SELECT id, name, slug FROM public.places ORDER BY id LIMIT 12')
for row in cur.fetchall():
    print(f'  {row[0]} | {row[2]} | {row[1][:30]}')

conn.close()
print()
if nulls == 0:
    print('[SUCCESS] All places have slugs!')
else:
    print(f'[WARNING] {nulls} places still missing slugs!')
