"""
Re-backfill slugs with proper ASCII normalization using Python's unicodedata module.
Credentials loaded from frontend/.env.local — NEVER hardcoded.
"""
import psycopg2
import unicodedata
import re
import sys
import os
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')

# Load env vars from .env.local
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

def make_slug(name: str, place_id: str) -> str:
    """Convert Vietnamese name to ASCII slug."""
    # Normalize unicode → decompose diacritics
    s = name.lower()
    # Manual Vietnamese replacements before NFD
    viet_map = {
        'đ': 'd', 'Đ': 'd',
        'ă': 'a', 'Ă': 'a', 'â': 'a', 'Â': 'a',
        'ê': 'e', 'Ê': 'e',
        'ô': 'o', 'Ô': 'o', 'ơ': 'o', 'Ơ': 'o',
        'ư': 'u', 'Ư': 'u',
        'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
        'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
        'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
        'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
        'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    }
    for viet, ascii_char in viet_map.items():
        s = s.replace(viet, ascii_char)
    # NFD decompose then strip remaining combining characters
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    # Remove non-alphanumeric except spaces and hyphens
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    # Collapse whitespace to hyphens
    s = re.sub(r'\s+', '-', s)
    s = re.sub(r'-+', '-', s)
    s = s.strip('-')
    return f"{s}-{place_id.lower()}"

conn = psycopg2.connect(DATABASE_URL, connect_timeout=15, sslmode='require')
conn.autocommit = False
cur = conn.cursor()

# Fetch all places
cur.execute("SELECT id, name FROM public.places ORDER BY id")
places = cur.fetchall()
print(f"Processing {len(places)} places...")

updates = []
for place_id, name in places:
    slug = make_slug(name, place_id)
    updates.append((slug, place_id))
    print(f"  {place_id} => {slug}")

# Bulk update
cur.executemany("UPDATE public.places SET slug = %s WHERE id = %s", updates)
conn.commit()

# Verify
cur.execute("SELECT COUNT(*) FROM public.places WHERE slug IS NULL OR slug = ''")
nulls = cur.fetchone()[0]
print(f"\n[DONE] Updated {len(updates)} slugs | Remaining nulls: {nulls}")

conn.close()
