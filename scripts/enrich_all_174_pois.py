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

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    full_pois = json.load(f)

print(f"Loaded {len(full_pois)} POIs from triton_pois_full.json")

def safe_json_load(val):
    if val is None:
        return None
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        val = val.strip()
        if (val.startswith('{') and val.endswith('}')) or (val.startswith('[') and val.endswith(']')):
            try:
                return json.loads(val)
            except:
                return None
    return None

updated_count = 0

for poi in full_pois:
    poi_id = poi.get('id')
    name = poi.get('name')
    if not poi_id and not name:
        continue

    detailed_story = poi.get('detailed_story')
    travel_guide = safe_json_load(poi.get('travel_guide_json')) or safe_json_load(poi.get('travel_guide'))
    checkin_spots = safe_json_load(poi.get('checkin_spots_json')) or safe_json_load(poi.get('checkin_spots'))
    highlights = safe_json_load(poi.get('highlights_json')) or safe_json_load(poi.get('highlights'))
    nearby_cafes_and_food = safe_json_load(poi.get('nearby_cafes_and_food_json')) or safe_json_load(poi.get('nearby_cafes_and_food'))
    google_maps_info = safe_json_load(poi.get('google_maps_info_json')) or safe_json_load(poi.get('google_maps_info'))
    tags_info = safe_json_load(poi.get('tags_json')) or safe_json_load(poi.get('tags_info'))
    tiktok_videos = poi.get('tiktok_videos') if isinstance(poi.get('tiktok_videos'), list) else safe_json_load(poi.get('tiktok_videos'))
    reviews = poi.get('reviews') if isinstance(poi.get('reviews'), list) else safe_json_load(poi.get('reviews'))
    best_time = poi.get('best_time')

    # If travel_guide is empty or null, provide a structured default
    if not travel_guide and poi.get('address'):
        travel_guide = {
            "how_to_get_there": f"Từ trung tâm Thị trấn Tri Tôn, di chuyển theo định vị Google Maps đến địa chỉ: {poi.get('address')}. Đường đi thuận tiện cho xe máy và ô tô.",
            "recommended_vehicle": "Xe máy, Ô tô du lịch",
            "best_time": best_time or "06:00 - 09:00 hoặc 16:00 - 17:45",
            "tips": "Nên mặc trang phục lịch sự khi tham quan di tích tâm linh, mang theo nón và nước uống."
        }

    # If highlights is empty, extract from description
    if not highlights and poi.get('description'):
        highlights = [poi.get('description')]

    cur.execute("""
        UPDATE places
        SET detailed_story = COALESCE(%s, detailed_story),
            travel_guide = COALESCE(%s::jsonb, travel_guide),
            checkin_spots = COALESCE(%s::jsonb, checkin_spots),
            highlights = COALESCE(%s::jsonb, highlights),
            nearby_cafes_and_food = COALESCE(%s::jsonb, nearby_cafes_and_food),
            google_maps_info = COALESCE(%s::jsonb, google_maps_info),
            tags_info = COALESCE(%s::jsonb, tags_info),
            tiktok_videos = COALESCE(%s::jsonb, tiktok_videos),
            review_samples = COALESCE(%s::jsonb, review_samples),
            best_visit_time = COALESCE(%s, best_visit_time)
        WHERE id = %s OR slug = %s OR name = %s;
    """, (
        detailed_story,
        json.dumps(travel_guide, ensure_ascii=False) if travel_guide else None,
        json.dumps(checkin_spots, ensure_ascii=False) if checkin_spots else None,
        json.dumps(highlights, ensure_ascii=False) if highlights else None,
        json.dumps(nearby_cafes_and_food, ensure_ascii=False) if nearby_cafes_and_food else None,
        json.dumps(google_maps_info, ensure_ascii=False) if google_maps_info else None,
        json.dumps(tags_info, ensure_ascii=False) if tags_info else None,
        json.dumps(tiktok_videos, ensure_ascii=False) if tiktok_videos else None,
        json.dumps(reviews, ensure_ascii=False) if reviews else None,
        best_time,
        poi_id, poi_id, name
    ))
    if cur.rowcount > 0:
        updated_count += 1

conn.commit()
print(f"Successfully matched and enriched {updated_count} places in Supabase DB!")

# Inspect coverage
cur.execute("""
    SELECT count(*), 
           count(detailed_story), 
           count(travel_guide), 
           count(checkin_spots), 
           count(highlights), 
           count(nearby_cafes_and_food),
           count(tiktok_videos),
           count(review_samples),
           count(google_maps_info),
           count(tags_info),
           count(best_visit_time)
    FROM places;
""")
res = cur.fetchone()
print("\n--- FINAL DATABASE DATA COVERAGE ---")
print(f"Total Places: {res[0]}")
print(f"detailed_story:         {res[1]}/{res[0]} ({(res[1]/res[0])*100:.1f}%)")
print(f"travel_guide:           {res[2]}/{res[0]} ({(res[2]/res[0])*100:.1f}%)")
print(f"checkin_spots:          {res[3]}/{res[0]} ({(res[3]/res[0])*100:.1f}%)")
print(f"highlights:             {res[4]}/{res[0]} ({(res[4]/res[0])*100:.1f}%)")
print(f"nearby_cafes_and_food:  {res[5]}/{res[0]} ({(res[5]/res[0])*100:.1f}%)")
print(f"tiktok_videos:          {res[6]}/{res[0]} ({(res[6]/res[0])*100:.1f}%)")
print(f"review_samples:         {res[7]}/{res[0]} ({(res[7]/res[0])*100:.1f}%)")
print(f"google_maps_info:       {res[8]}/{res[0]} ({(res[8]/res[0])*100:.1f}%)")
print(f"tags_info:              {res[9]}/{res[0]} ({(res[9]/res[0])*100:.1f}%)")
print(f"best_visit_time:        {res[10]}/{res[0]} ({(res[10]/res[0])*100:.1f}%)")

cur.close()
conn.close()
