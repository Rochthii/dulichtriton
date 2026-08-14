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

cur.execute("SELECT count(*) FROM places;")
places_count = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM places WHERE detailed_story IS NOT NULL AND detailed_story != '';")
rich_count = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM places WHERE embedding IS NOT NULL;")
emb_count = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM knowledge_base;")
kb_count = cur.fetchone()[0]

print(f"Places total: {places_count}")
print(f"Places with rich detailed_story: {rich_count}")
print(f"Places with vector embeddings: {emb_count}")
print(f"Knowledge Base total: {kb_count}")

cur.close()
conn.close()
