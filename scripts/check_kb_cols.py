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

cur.execute("""
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'knowledge_base' 
    ORDER BY ordinal_position;
""")
cols = cur.fetchall()

print("--- COLUMNS IN KNOWLEDGE_BASE TABLE ---")
for c in cols:
    print(f"  {c[0]} ({c[1]} / {c[2]})")

cur.close()
conn.close()
