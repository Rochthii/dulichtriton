import psycopg2
import json
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
    SELECT count(*), 
           count(detailed_story), 
           count(travel_guide), 
           count(checkin_spots), 
           count(highlights), 
           count(nearby_cafes_and_food),
           count(tiktok_videos)
    FROM places;
""")
res = cur.fetchone()
print(f"Total places: {res[0]}")
print(f"Places with detailed_story: {res[1]}")
print(f"Places with travel_guide: {res[2]}")
print(f"Places with checkin_spots: {res[3]}")
print(f"Places with highlights: {res[4]}")
print(f"Places with nearby_cafes_and_food: {res[5]}")
print(f"Places with tiktok_videos: {res[6]}")

# Sample one place with detailed_story
cur.execute("SELECT id, name, slug, detailed_story, travel_guide, checkin_spots FROM places WHERE slug='ho-ta-pa' LIMIT 1;")
sample = cur.fetchone()
if sample:
    print(f"\nSample 'ho-ta-pa':")
    print(f"ID: {sample[0]}, Name: {sample[1]}, Slug: {sample[2]}")
    print(f"detailed_story length: {len(sample[3]) if sample[3] else 0}")
    print(f"travel_guide type: {type(sample[4])}, content preview: {str(sample[4])[:100]}")
    print(f"checkin_spots type: {type(sample[5])}, content preview: {str(sample[5])[:100]}")

cur.close()
conn.close()
