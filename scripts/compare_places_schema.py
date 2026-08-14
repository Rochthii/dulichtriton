import os
import sys
import psycopg2
import json
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('.env.local')
db_url = os.environ.get('DATABASE_URL')

conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Get column names and types of places
cur.execute("""
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'places' 
    ORDER BY ordinal_position;
""")
cols = cur.fetchall()

print("--- COLUMNS IN PLACES TABLE ---")
for c in cols:
    print(f"  {c[0]} ({c[1]} / {c[2]})")

# Load sample from triton_pois_full.json
with open("data/triton_pois_full.json", "r", encoding="utf-8") as f:
    full_pois = json.load(f)

print(f"\nTotal POIs in triton_pois_full.json: {len(full_pois)}")
print("Sample keys in triton_pois_full.json[0]:")
for k, v in full_pois[0].items():
    v_preview = str(v)[:60] + "..." if len(str(v)) > 60 else str(v)
    print(f"  {k}: {type(v).__name__} -> {v_preview}")

cur.close()
conn.close()
