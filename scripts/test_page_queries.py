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

# 1. Total places
cur.execute("SELECT count(*) FROM places WHERE is_active = true;")
print("Total active places:", cur.fetchone()[0])

# 2. Categories in places
cur.execute("SELECT DISTINCT category, tourism_category, count(*) FROM places GROUP BY category, tourism_category ORDER BY count(*) DESC;")
print("\n--- CATEGORY BREAKDOWN ---")
for r in cur.fetchall():
    print(f"  category='{r[0]}', tourism_category='{r[1]}' -> {r[2]} places")

# 3. Communes in places
cur.execute("SELECT DISTINCT commune, count(*) FROM places GROUP BY commune ORDER BY count(*) DESC;")
print("\n--- COMMUNE BREAKDOWN ---")
for r in cur.fetchall():
    print(f"  commune='{r[0]}' -> {r[1]} places")

# 4. Test food query
cur.execute("SELECT count(*) FROM places WHERE category = 'food' OR tourism_category ILIKE '%ẩm thực%' OR tourism_category ILIKE '%cà phê%';")
print("\nFood matches count:", cur.fetchone()[0])

# 5. Test stay query
cur.execute("SELECT count(*) FROM places WHERE category = 'stay' OR tourism_category ILIKE '%homestay%' OR tourism_category ILIKE '%khách sạn%' OR tourism_category ILIKE '%resort%';")
print("Stay matches count:", cur.fetchone()[0])

# 6. Test culture query
cur.execute("SELECT count(*) FROM places WHERE category = 'culture' OR category = 'history' OR tourism_category ILIKE '%văn hóa%' OR tourism_category ILIKE '%tâm linh%' OR tourism_category ILIKE '%di tích%' OR tourism_category ILIKE '%chùa%';")
print("Culture matches count:", cur.fetchone()[0])

# 7. Test nature query
cur.execute("SELECT count(*) FROM places WHERE category = 'nature' OR tourism_category ILIKE '%thiên nhiên%' OR tourism_category ILIKE '%cảnh quan%';")
print("Nature matches count:", cur.fetchone()[0])

cur.close()
conn.close()
