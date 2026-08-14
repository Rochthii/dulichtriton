"""
Seed preset_itineraries directly via psycopg2 (bypass REST schema cache issue).
"""
import os, json, sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
DB_URL = os.environ['DATABASE_URL']

import psycopg2
import psycopg2.extras

# Load PRESETS data from create_preset_itineraries.py
exec_globals = {}
with open('scripts/create_preset_itineraries.py', encoding='utf-8') as f:
    src = f.read()
# Extract just the PRESETS list
start = src.index('PRESETS = [')
end   = src.index('\nprint(f"Seeding')
presets_src = src[start:end]
exec(presets_src, exec_globals)
PRESETS = exec_globals['PRESETS']

print(f"Inserting {len(PRESETS)} presets directly into PostgreSQL...")

conn = psycopg2.connect(DB_URL)
conn.autocommit = True
cur = conn.cursor()

for p in PRESETS:
    cur.execute("""
        INSERT INTO preset_itineraries 
          (slug, emoji, title, tagline, for_whom, duration, budget_range, stops, sort_order)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (slug) DO UPDATE SET
          emoji        = EXCLUDED.emoji,
          title        = EXCLUDED.title,
          tagline      = EXCLUDED.tagline,
          for_whom     = EXCLUDED.for_whom,
          duration     = EXCLUDED.duration,
          budget_range = EXCLUDED.budget_range,
          stops        = EXCLUDED.stops,
          sort_order   = EXCLUDED.sort_order
    """, (
        p['slug'], p['emoji'], p['title'], p['tagline'],
        p['for_whom'], p['duration'], p.get('budget_range',''),
        json.dumps(p['stops'], ensure_ascii=False),
        p.get('sort_order', 0)
    ))
    print(f"  [OK] {p['emoji']} {p['title']}")

conn.close()
print(f"\n[SUCCESS] All {len(PRESETS)} presets inserted/updated!")

# Verify
conn2 = psycopg2.connect(DB_URL)
cur2  = conn2.cursor()
cur2.execute("SELECT slug, title FROM preset_itineraries ORDER BY sort_order")
rows = cur2.fetchall()
conn2.close()
print(f"\nVerification — {len(rows)} rows in preset_itineraries:")
for slug, title in rows:
    print(f"  {slug}: {title}")
