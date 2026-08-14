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
    SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod)
    FROM pg_attribute a
    JOIN pg_class t ON a.attrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'places' AND a.attname = 'embedding';
""")
print("places.embedding type:", cur.fetchall())

cur.execute("""
    SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod)
    FROM pg_attribute a
    JOIN pg_class t ON a.attrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'knowledge_base' AND a.attname = 'embedding';
""")
print("knowledge_base.embedding type:", cur.fetchall())

cur.close()
conn.close()
