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

cur.execute("SELECT id, place_id, slug, name, category, tourism_category, commune FROM places LIMIT 10;")
db_samples = cur.fetchall()

print("--- SAMPLE DB ROWS ---")
for r in db_samples:
    print(r)

cur.close()
conn.close()
