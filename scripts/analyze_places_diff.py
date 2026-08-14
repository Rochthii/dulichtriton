import json
import psycopg2
import os
import sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('.env.local')
db_url = os.environ.get('DATABASE_URL')

conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute("SELECT id, slug, name, category, commune FROM places;")
db_places = cur.fetchall()

print(f"Total DB Places: {len(db_places)}")
db_id_map = {r[0]: r for r in db_places}
db_name_map = {r[2].strip().lower(): r for r in db_places}

with open("data/triton_pois_full.json", "r", encoding="utf-8") as f:
    json_places = json.load(f)

print(f"Total JSON Places: {len(json_places)}")

matched_by_id = 0
matched_by_name = 0
new_places = 0

for p in json_places:
    pid = p.get("id")
    pname = p.get("name", "").strip().lower()
    if pid in db_id_map:
        matched_by_id += 1
    elif pname in db_name_map:
        matched_by_name += 1
    else:
        new_places += 1

print(f"Matched by ID directly: {matched_by_id}")
print(f"Matched by Name: {matched_by_name}")
print(f"Completely New Places: {new_places}")

cur.close()
conn.close()
