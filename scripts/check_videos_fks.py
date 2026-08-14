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

cur.execute("SELECT id, place_id, title FROM videos LIMIT 10;")
print("--- VIDEOS ---")
for r in cur.fetchall():
    print(r)

cur.execute("SELECT id, matched_poi_id, video_title FROM video_discoveries LIMIT 10;")
print("--- VIDEO DISCOVERIES ---")
for r in cur.fetchall():
    print(r)

cur.close()
conn.close()
