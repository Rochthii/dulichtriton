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
    SELECT proname, pg_get_functiondef(oid) 
    FROM pg_proc 
    WHERE proname IN ('match_places', 'match_kb');
""")
for r in cur.fetchall():
    print(f"--- FUNCTION {r[0]} ---")
    print(r[1])

cur.close()
conn.close()
