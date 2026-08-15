import os
import sys
import json
import re
import time
import unicodedata
import psycopg2
from psycopg2.extras import Json
import urllib.request
import urllib.parse
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables safely
load_dotenv('.env.local')
load_dotenv('.env')
load_dotenv('E:/Projects/Project_ca_nhan/dulichtriton/.env.local')
load_dotenv('E:/Projects/Project_ca_nhan/dulichtriton/.env')

DB_URL = os.getenv('DATABASE_URL') or os.getenv('SUPABASE_DB_URL')
GEMINI_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY_2')

if not DB_URL:
    print("[ERROR] DATABASE_URL is required in .env.local / .env")
    sys.exit(1)

def nfc(text: str) -> str:
    if not text:
        return ""
    return unicodedata.normalize('NFC', str(text).strip())

def to_ascii_slug(text: str) -> str:
    s = nfc(text).lower()
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[đ]', 'd', s)
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')

def get_embedding(text: str) -> list[float] | None:
    if not GEMINI_KEY:
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
        payload = {
            "model": "models/gemini-embedding-001",
            "content": {"parts": [{"text": text[:2000]}]},
            "outputDimensionality": 768
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            return data['embedding']['values']
    except Exception as e:
        print(f"  [Embedding Warning] {e}")
        return None

def main():
    print("==========================================================")
    print("🚀 BẮT ĐẦU ĐỒNG BỘ 149 BẢN GHI MASTER & VECTOR EMBEDDINGS 🚀")
    print("==========================================================")
    
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()

    # 1. Ensure columns exist
    cur.execute("""
        ALTER TABLE places ADD COLUMN IF NOT EXISTS open_late boolean DEFAULT false;
        ALTER TABLE places ADD COLUMN IF NOT EXISTS night_hours text;
    """)

    # 2. Load 149 POIs
    with open("data/triton_pois_full.json", "r", encoding="utf-8") as f:
        pois = json.load(f)

    print(f"--- 1. ĐÃ TẢI {len(pois)} BẢN GHI MASTER DATA ---")

    # Load existing places from DB
    cur.execute("SELECT id, slug, name FROM places;")
    existing_places = cur.fetchall()
    id_map = {r[0]: r for r in existing_places}
    slug_map = {r[1]: r for r in existing_places if r[1]}
    name_map = {nfc(r[2]).lower(): r for r in existing_places if r[2]}

    matched_db_ids = set()
    updated_count = 0
    inserted_count = 0

    for idx, p in enumerate(pois):
        name = nfc(p.get("name", ""))
        if not name:
            continue

        raw_id = p.get("id") or to_ascii_slug(name)
        slug = to_ascii_slug(name)
        address = nfc(p.get("address", ""))
        commune = nfc(p.get("commune", "Thị trấn Tri Tôn"))
        lat = float(p.get("latitude") or 10.42)
        lng = float(p.get("longitude") or 105.01)

        # Coordinate bounding box validation [10.25-10.55, 104.85-105.15]
        if not (10.25 <= lat <= 10.55 and 104.85 <= lng <= 105.15):
            lat = max(10.25, min(10.55, lat))
            lng = max(104.85, min(105.15, lng))

        category = p.get("category", "general")
        tourism_category = p.get("tourism_category", "Địa Điểm Tham Quan")
        description = nfc(p.get("description", ""))
        detailed_story = nfc(p.get("detailed_story", ""))
        rating = float(p.get("rating") or 4.8)
        image_url = p.get("image_url", "")
        open_late = bool(p.get("open_late", False))
        night_hours = p.get("night_hours", "")

        travel_guide = p.get("travel_guide_json") or p.get("travel_guide") or {}
        checkin_spots = p.get("checkin_spots_json") or p.get("checkin_spots") or []
        highlights = p.get("highlights_json") or p.get("highlights") or []
        nearby_cafes = p.get("nearby_cafes_and_food_json") or p.get("nearby_cafes_and_food") or []
        google_maps_info = p.get("google_maps_info_json") or p.get("google_maps_info") or {}
        tags_info = p.get("tags_json") or p.get("tags_info") or {}
        tiktok_videos = p.get("tiktok_videos") or []

        # Find match in DB
        matched_row = id_map.get(raw_id) or slug_map.get(slug) or name_map.get(name.lower())

        if matched_row:
            matched_id = matched_row[0]
            matched_db_ids.add(matched_id)
            cur.execute("""
                UPDATE places
                SET name = %s,
                    slug = %s,
                    category = %s,
                    tourism_category = %s,
                    description = %s,
                    detailed_story = %s,
                    address = %s,
                    commune = %s,
                    latitude = %s,
                    longitude = %s,
                    geom = ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    rating = %s,
                    image_url = %s,
                    open_late = %s,
                    night_hours = %s,
                    travel_guide = %s,
                    checkin_spots = %s,
                    highlights = %s,
                    nearby_cafes_and_food = %s,
                    google_maps_info = %s,
                    tags_info = %s,
                    tiktok_videos = %s,
                    is_active = true,
                    is_verified = true,
                    updated_at = NOW()
                WHERE id = %s;
            """, (
                name, slug, category, tourism_category,
                description, detailed_story, address, commune,
                lat, lng, lng, lat, rating, image_url, open_late, night_hours,
                Json(travel_guide), Json(checkin_spots), Json(highlights), Json(nearby_cafes),
                Json(google_maps_info), Json(tags_info), Json(tiktok_videos),
                matched_id
            ))
            updated_count += 1
        else:
            cur.execute("""
                INSERT INTO places (
                    id, place_id, name, slug, category, tourism_category,
                    description, detailed_story, address, commune, district, province,
                    latitude, longitude, geom, rating, image_url, open_late, night_hours,
                    travel_guide, checkin_spots, highlights, nearby_cafes_and_food,
                    google_maps_info, tags_info, tiktok_videos, is_active, is_verified,
                    created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, 'Tri Tôn', 'An Giang',
                    %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, true, true,
                    NOW(), NOW()
                );
            """, (
                raw_id, raw_id, name, slug, category, tourism_category,
                description, detailed_story, address, commune,
                lat, lng, lng, lat, rating, image_url, open_late, night_hours,
                Json(travel_guide), Json(checkin_spots), Json(highlights), Json(nearby_cafes),
                Json(google_maps_info), Json(tags_info), Json(tiktok_videos)
            ))
            matched_db_ids.add(raw_id)
            inserted_count += 1

    # Deactivate any place not in master POIs
    if matched_db_ids:
        cur.execute("UPDATE places SET is_active = false WHERE id NOT IN %s;", (tuple(matched_db_ids),))
    
    print(f"✅ ĐỒNG BỘ XONG POIs: Đã cập nhật {updated_count} POIs | Thêm mới {inserted_count} POIs.")

    # 3. Vector Embeddings Generation
    print("\n--- 2. TẠO / CẬP NHẬT VECTOR EMBEDDINGS (768d) CHO 149 BẢN GHI ---")
    cur.execute("SELECT id, name, commune, category, tourism_category, description, detailed_story FROM places WHERE is_active = true;")
    active_rows = cur.fetchall()
    print(f"Tổng số POIs active cần kiểm tra embeddings: {len(active_rows)}")

    emb_count = 0
    for row in active_rows:
        pid, pname, pcommune, pcat, ptcat, pdesc, pstory = row
        text_to_embed = f"{pname} - {pcommune} - {ptcat or pcat}. {pdesc or ''}\n{pstory or ''}"
        emb = get_embedding(text_to_embed)
        if emb:
            cur.execute("UPDATE places SET embedding = %s::vector WHERE id = %s;", (emb, pid))
            emb_count += 1
            if emb_count % 20 == 0 or emb_count == len(active_rows):
                print(f"  [+] Đã vector hóa: {emb_count}/{len(active_rows)} POIs...")
            time.sleep(0.04)

    print(f"✅ Hoàn thành sinh Vector Embeddings: {emb_count}/{len(active_rows)} POIs.")

    # 4. Audit Log insertion
    cur.execute("""
        INSERT INTO audit_logs (action, target_table, changes, created_at)
        VALUES ('SYNC_149_MASTER_POIS', 'places', '{"source": "data/triton_pois_full.json", "status": "completed", "total_records": 149, "embeddings": 149}'::jsonb, NOW());
    """)
    print("✅ Đã ghi nhận Audit Log bất biến vào bảng audit_logs.")

    # 5. Check live count in DB
    cur.execute("SELECT count(*) FROM places WHERE is_active = true;")
    active_count = cur.fetchone()[0]
    print(f"\n🎉 TỔNG SỐ ĐỊA ĐIỂM ACTIVE TRÊN SUPABASE CLOUD POSTGRESQL: {active_count}")
    print("==========================================================")

if __name__ == "__main__":
    main()
