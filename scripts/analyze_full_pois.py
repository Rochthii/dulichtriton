import json
import psycopg2
import os
import sys
from dotenv import load_dotenv
import re
import unicodedata

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('.env.local')
db_url = os.environ.get('DATABASE_URL')

def clean_str(s):
    if not s:
        return ""
    s = unicodedata.normalize('NFC', s.strip())
    return s

def extract_commune(address):
    # Extracts commune/town like "Xã Núi Tô", "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", etc.
    patterns = [
        r"(Thị trấn Tri Tôn|Thị trấn Ba Chúc|Xã Núi Tô|Xã Cô Tô|Xã Ô Lâm|Xã An Tức|Xã Châu Lăng|Xã Lương Phi|Xã Lương An Trà|Xã Tà Đảnh|Xã Tân Tuyến|Xã Vĩnh Phước|Xã Vĩnh Gia|Xã Lạc Quới|Xã Lê Trì)",
    ]
    for p in patterns:
        m = re.search(p, address, re.IGNORECASE)
        if m:
            return m.group(1).title().replace("Xã", "Xã").replace("Thị Trấn", "Thị trấn")
    return "Thị trấn Tri Tôn" # default fallback

with open("data/triton_pois_full.json", "r", encoding="utf-8") as f:
    full_pois = json.load(f)

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT id, name, slug, category, commune, latitude, longitude FROM places;")
existing_db = cur.fetchall()

db_by_slug = {r[2]: r for r in existing_db if r[2]}
db_by_name = {unicodedata.normalize('NFC', r[1].lower().strip()): r for r in existing_db}

print(f"Existing DB places count: {len(existing_db)}")
print(f"JSON POIs count: {len(full_pois)}")

categories_found = set()
communes_found = set()

for idx, p in enumerate(full_pois):
    commune = extract_commune(p.get("address", ""))
    cat = p.get("category", "")
    categories_found.add(cat)
    communes_found.add(commune)

print(f"\nCategories in JSON: {categories_found}")
print(f"Communes in JSON: {communes_found}")

cur.close()
conn.close()
