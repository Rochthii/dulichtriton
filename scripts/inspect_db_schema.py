import psycopg2
import os
import sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
db_url = os.environ.get('DATABASE_URL')

conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'places' 
    ORDER BY ordinal_position;
""")
cols = cur.fetchall()
print("--- PLACES TABLE COLUMNS ---")
for c in cols:
    print(f"  {c[0]:<30} {c[1]}")

cur.close()
conn.close()
