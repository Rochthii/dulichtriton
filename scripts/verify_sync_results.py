import psycopg2
import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('.env.local')
load_dotenv('.env')

DB_URL = os.getenv('DATABASE_URL')
GEMINI_KEY = os.getenv('GEMINI_API_KEY')

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# 1. Verify Places Count and Fields
cur.execute("""
    SELECT count(*), 
           count(detailed_story), 
           count(travel_guide), 
           count(embedding) 
    FROM places 
    WHERE is_active = true;
""")
p_stats = cur.fetchone()
print(f"Places Stats: Total={p_stats[0]}, With Story={p_stats[1]}, With TravelGuide={p_stats[2]}, With Vector768={p_stats[3]}")

# 2. Verify Knowledge Base Count
cur.execute("SELECT count(*), count(embedding) FROM knowledge_base;")
kb_stats = cur.fetchone()
print(f"Knowledge Base Stats: Total={kb_stats[0]}, With Vector768={kb_stats[1]}")

# 3. Test RPC match_places
if GEMINI_KEY:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": "quán gà đốt ngon ở Hồ Ô Thum"}]},
        "outputDimensionality": 768
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        query_emb = json.loads(res.read().decode('utf-8'))['embedding']['values']

    cur.execute("SELECT id, name, commune, category, similarity FROM match_places(%s::vector, 0.4, 3);", (query_emb,))
    print("\n--- TEST RPC match_places ('quán gà đốt ngon ở Hồ Ô Thum') ---")
    for r in cur.fetchall():
        print(f"  [Match {r[4]:.3f}] {r[1]} ({r[2]} - {r[3]})")

    cur.execute("SELECT id, title, category, similarity FROM match_kb(%s::vector, 0.4, 3);", (query_emb,))
    print("\n--- TEST RPC match_kb ('quán gà đốt ngon ở Hồ Ô Thum') ---")
    for r in cur.fetchall():
        print(f"  [Match {r[3]:.3f}] {r[1]} ({r[2]})")

cur.close()
conn.close()
