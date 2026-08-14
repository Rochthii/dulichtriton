"""
Production Migration & Sync Script: Sync 172+ POIs and Master Data into Supabase Database
"""
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

# Load environment
load_dotenv('.env.local')
load_dotenv('.env')

DB_URL = os.getenv('DATABASE_URL')
GEMINI_KEY = os.getenv('GEMINI_API_KEY')

if not DB_URL:
    print("[ERROR] DATABASE_URL is required in .env.local")
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

def extract_commune(address: str) -> str:
    patterns = [
        r"(Thị trấn Tri Tôn|Thị trấn Ba Chúc|Xã Núi Tô|Xã Cô Tô|Xã Ô Lâm|Xã An Tức|Xã Châu Lăng|Xã Lương Phi|Xã Lương An Trà|Xã Tà Đảnh|Xã Tân Tuyến|Xã Vĩnh Phước|Xã Vĩnh Gia|Xã Lạc Quới|Xã Lê Trì)",
    ]
    for p in patterns:
        m = re.search(p, address or "", re.IGNORECASE)
        if m:
            c = m.group(1).title().replace("Xã", "Xã").replace("Thị Trấn", "Thị trấn")
            return c
    return "Thị trấn Tri Tôn"

def map_category(cat: str, subcat: str) -> tuple[str, str]:
    cat_map = {
        'nature': ('Thiên Nhiên & Cảnh Quan', 'nature'),
        'culture': ('Văn Hóa & Tâm Linh', 'culture'),
        'history': ('Di Tích Lịch Sử', 'history'),
        'gastronomy': ('Ẩm Thực & Đặc Sản', 'food'),
        'festival': ('Lễ Hội & Sự Kiện', 'culture'),
        'general': ('Điểm Tham Quan & Tiện Ích', 'general')
    }
    tc, main_cat = cat_map.get((cat or '').lower(), ('Địa Điểm Tham Quan', 'general'))
    
    sub_lower = (subcat or '').lower()
    if 'cafe' in sub_lower or 'cà phê' in sub_lower:
        tc = 'Quán Cà Phê'
        main_cat = 'food'
    elif 'homestay' in sub_lower:
        tc = 'Homestay & Lưu Trú'
        main_cat = 'stay'
    elif 'hotel' in sub_lower or 'resort' in sub_lower or 'motel' in sub_lower or 'guest_house' in sub_lower:
        tc = 'Khách Sạn & Resort'
        main_cat = 'stay'
    elif 'temple' in sub_lower or 'worship' in sub_lower or 'chùa' in sub_lower:
        tc = 'Tâm Linh & Chùa Chiền'
        main_cat = 'culture'
    elif 'restaurant' in sub_lower or 'gà đốt' in sub_lower:
        tc = 'Ẩm Thực Đặc Sản'
        main_cat = 'food'
        
    return tc, main_cat

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

def parse_json_field(val, default_val):
    if not val:
        return default_val
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return default_val
    return default_val

def main():
    print("==========================================================")
    print("🚀 BẮT ĐẦU SYNC 172+ POIS VÀO CSDL SUPABASE (PRODUCTION) 🚀")
    print("==========================================================")
    
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()

    # 1. Apply Migration DDL
    print("\n--- 1. CẬP NHẬT DDL SCHEMA CHO BẢNG PLACES & EMBEDDING 768d ---")
    with open("supabase/migrations/20260814_enrich_places_schema_and_upsert_172.sql", "r", encoding="utf-8") as f:
        migration_sql = f.read()
    cur.execute(migration_sql)
    print("✅ Cập nhật DDL hoàn tất: Cột rich data & Vector 768d HNSW Index sẵn sàng.")

    # 2. Load 172 POIs from JSON
    with open("data/triton_pois_full.json", "r", encoding="utf-8") as f:
        pois = json.load(f)
    print(f"\n--- 2. XỬ LÝ {len(pois)} POIS TỪ DATA MASTER ---")

    # Load existing places from DB
    cur.execute("SELECT id, name, slug, latitude, longitude FROM places;")
    existing_rows = cur.fetchall()
    
    name_to_id = {nfc(r[1]).lower(): r[0] for r in existing_rows if r[1]}
    slug_to_id = {r[2]: r[0] for r in existing_rows if r[2]}
    id_set = {r[0] for r in existing_rows}

    updated_count = 0
    inserted_count = 0
    skipped_count = 0

    for idx, p in enumerate(pois):
        name = nfc(p.get("name", ""))
        if not name:
            skipped_count += 1
            continue

        raw_id = p.get("id") or to_ascii_slug(name)
        slug = to_ascii_slug(name)
        address = nfc(p.get("address", ""))
        commune = extract_commune(address)
        lat = float(p.get("latitude") or 10.4)
        lng = float(p.get("longitude") or 105.0)

        # Coordinate bounding box validation [10.25-10.55, 104.85-105.15]
        if not (10.25 <= lat <= 10.55 and 104.85 <= lng <= 105.15):
            lat = max(10.25, min(10.55, lat))
            lng = max(104.85, min(105.15, lng))

        category_raw = p.get("category", "")
        subcategory_raw = p.get("subcategory", "")
        tourism_category, category = map_category(category_raw, subcategory_raw)

        description = nfc(p.get("description", ""))
        detailed_story = nfc(p.get("detailed_story", ""))
        best_time = nfc(p.get("best_time", ""))
        rating = float(p.get("rating") or 4.5)

        travel_guide = parse_json_field(p.get("travel_guide_json"), {})
        checkin_spots = parse_json_field(p.get("checkin_spots_json"), [])
        highlights = parse_json_field(p.get("highlights_json"), [])
        nearby_cafes = parse_json_field(p.get("nearby_cafes_and_food_json"), [])
        google_maps_info = parse_json_field(p.get("google_maps_info_json"), {})
        tags_info = parse_json_field(p.get("tags_json"), {})
        tiktok_videos = parse_json_field(p.get("tiktok_videos"), [])

        # Match existing place in DB
        matched_id = None
        if raw_id in id_set:
            matched_id = raw_id
        elif name.lower() in name_to_id:
            matched_id = name_to_id[name.lower()]
        elif slug in slug_to_id:
            matched_id = slug_to_id[slug]

        if matched_id:
            # UPDATE existing record
            cur.execute("""
                UPDATE places
                SET 
                    name = %s,
                    category = %s,
                    subcategory = %s,
                    tourism_category = %s,
                    description = COALESCE(NULLIF(%s, ''), description),
                    detailed_story = %s,
                    address = %s,
                    commune = %s,
                    latitude = %s,
                    longitude = %s,
                    geom = ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    best_visit_time = %s,
                    rating = %s,
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
                name, category, subcategory_raw, tourism_category,
                description, detailed_story, address, commune,
                lat, lng, lng, lat, best_time, rating,
                Json(travel_guide), Json(checkin_spots), Json(highlights),
                Json(nearby_cafes), Json(google_maps_info), Json(tags_info),
                Json(tiktok_videos),
                matched_id
            ))
            updated_count += 1
        else:
            # INSERT new place
            new_id = raw_id
            if new_id in id_set:
                new_id = f"{raw_id}-{idx+1}"
            id_set.add(new_id)

            cur.execute("""
                INSERT INTO places (
                    id, place_id, name, slug, category, subcategory, tourism_category,
                    description, detailed_story, address, commune, district, province,
                    latitude, longitude, geom, best_visit_time, rating,
                    travel_guide, checkin_spots, highlights, nearby_cafes_and_food,
                    google_maps_info, tags_info, tiktok_videos, is_active, is_verified,
                    created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, 'Tri Tôn', 'An Giang',
                    %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, true, true,
                    NOW(), NOW()
                );
            """, (
                new_id, new_id, name, slug, category, subcategory_raw, tourism_category,
                description, detailed_story, address, commune,
                lat, lng, lng, lat, best_time, rating,
                Json(travel_guide), Json(checkin_spots), Json(highlights), Json(nearby_cafes),
                Json(google_maps_info), Json(tags_info), Json(tiktok_videos)
            ))
            inserted_count += 1

    print(f"✅ ĐỒNG BỘ POIs XONG: Đã cập nhật {updated_count} POIs cũ | Thêm mới {inserted_count} POIs mới.")

    # 3. Vector Embeddings generation
    print("\n--- 3. TẠO VECTOR EMBEDDINGS (768d) CHO CÁC POIS ---")
    cur.execute("SELECT id, name, commune, category, tourism_category, description, detailed_story FROM places WHERE is_active = true;")
    all_active = cur.fetchall()
    print(f"Tổng số POIs cần vector embeddings: {len(all_active)}")

    emb_count = 0
    for row in all_active:
        pid, pname, pcommune, pcat, ptcat, pdesc, pstory = row
        text_to_embed = f"{pname} - {pcommune} - {ptcat or pcat}. {pdesc or ''}\n{pstory or ''}"
        emb = get_embedding(text_to_embed)
        if emb:
            cur.execute("UPDATE places SET embedding = %s::vector WHERE id = %s;", (emb, pid))
            emb_count += 1
            if emb_count % 20 == 0 or emb_count == len(all_active):
                print(f"  [+] Đã tạo vector embedding: {emb_count}/{len(all_active)} POIs...")
            time.sleep(0.05) # avoid aggressive rate limit

    print(f"✅ Hoàn thành sinh Vector Embeddings: {emb_count}/{len(all_active)} POIs đã được vector hóa thành công.")

    # 4. Sync Master Itineraries, FAQs, Culture, Transportation into knowledge_base
    print("\n--- 4. NẠP TRI THỨC LỊCH TRÌNH VÀ CẨM NANG VÀO KNOWLEDGE_BASE ---")
    kb_synced = 0
    
    # Helper to insert into KB with topic/title/category/content/summary/related_pois
    def upsert_kb(kb_id, topic, title, category, content, summary, related_pois):
        emb = get_embedding(f"{title}\n{summary}\n{content[:1500]}")
        cur.execute("""
            INSERT INTO knowledge_base (id, topic, title, category, content, summary, related_pois, embedding, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector, NOW())
            ON CONFLICT (id) DO UPDATE
            SET topic = EXCLUDED.topic,
                title = EXCLUDED.title,
                category = EXCLUDED.category,
                content = EXCLUDED.content,
                summary = EXCLUDED.summary,
                related_pois = EXCLUDED.related_pois,
                embedding = EXCLUDED.embedding,
                updated_at = NOW();
        """, (kb_id, topic, title, category, content, summary, related_pois, emb))

    # 4.1 Master Itineraries
    if os.path.exists("data/tri_ton_master_itineraries_and_rules.json"):
        with open("data/tri_ton_master_itineraries_and_rules.json", "r", encoding="utf-8") as f:
            itin_data = json.load(f)
        itin_content = json.dumps(itin_data, ensure_ascii=False, indent=2)
        upsert_kb(
            "kb-itinerary-master-rules",
            "Cẩm Nang Lịch Trình",
            "Cẩm Nang Lịch Trình Master & Quy Tắc Gợi Ý Tour Tri Tôn",
            "itinerary",
            itin_content,
            "Bộ quy tắc gợi ý tour 1N, 2N1Đ, 3N2Đ và top 12 điểm đến hot nhất Tri Tôn theo mùa.",
            ["Hồ Tà Pạ", "Khu Du Lịch Đồi Tức Dụp", "Cổng Trời Tri Tôn", "Chùa Xà Tón", "Hồ Ô Thum"]
        )
        kb_synced += 1

    # 4.2 FAQs
    if os.path.exists("data/tri_ton_faqs.json"):
        with open("data/tri_ton_faqs.json", "r", encoding="utf-8") as f:
            faqs = json.load(f)
        faq_content = json.dumps(faqs, ensure_ascii=False, indent=2)
        upsert_kb(
            "kb-faq-general-travel",
            "Hỏi Đáp Du Lịch",
            "Bộ Câu Hỏi Thường Gặp (FAQs) Khi Du Lịch Tri Tôn",
            "faq",
            faq_content,
            "Giải đáp tất cả thắc mắc thường gặp về thời tiết, ăn uống, di chuyển, khách sạn tại Tri Tôn.",
            ["Hồ Tà Pạ", "Núi Cô Tô", "Ba Chúc", "Ô Lâm"]
        )
        kb_synced += 1

    # 4.3 Khmer Culture Etiquette
    if os.path.exists("data/tri_ton_khmer_culture_etiquette.json"):
        with open("data/tri_ton_khmer_culture_etiquette.json", "r", encoding="utf-8") as f:
            etiquette = json.load(f)
        etq_content = json.dumps(etiquette, ensure_ascii=False, indent=2)
        upsert_kb(
            "kb-culture-khmer-etiquette",
            "Văn Hóa Khmer",
            "Quy Tắc Văn Hóa & Lễ Nghi Viếng Chùa Khmer Tri Tôn",
            "culture",
            etq_content,
            "Hướng dẫn trang phục, quy tắc ứng xử và phong tục khi viếng thăm các chùa Khmer Nam Bộ tại Tri Tôn.",
            ["Chùa Xà Tón", "Chùa Tà Pạ", "Chùa Koh Kas", "Chùa Svay Ta Hon"]
        )
        kb_synced += 1

    # 4.4 Transportation
    if os.path.exists("data/tri_ton_transportation.json"):
        with open("data/tri_ton_transportation.json", "r", encoding="utf-8") as f:
            trans = json.load(f)
        trans_content = json.dumps(trans, ensure_ascii=False, indent=2)
        upsert_kb(
            "kb-transportation-guide",
            "Phương Tiện Di Chuyển",
            "Cẩm Nang Phương Tiện & Lộ Trình Di Chuyển Đến Tri Tôn",
            "transportation",
            trans_content,
            "Tổng hợp các tuyến xe khách, dịch vụ thuê xe máy, xe lôi và cẩm nang đường đi an toàn.",
            ["Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Châu Lăng"]
        )
        kb_synced += 1

    print(f"✅ Đã nạp & đồng bộ {kb_synced} tài liệu tri thức chuyên sâu mới vào bảng knowledge_base.")

    # 5. Final Stats
    cur.execute("SELECT count(*) FROM places WHERE is_active = true;")
    total_active_places = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM places WHERE embedding IS NOT NULL;")
    total_embedded_places = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM knowledge_base;")
    total_kb = cur.fetchone()[0]
    
    print("\n==========================================================")
    print(f"🎉 TỔNG KẾT ĐỒNG BỘ CSDL SUPABASE THÀNH CÔNG RỰC RỠ:")
    print(f"   • Tổng số Places hoạt động: {total_active_places}")
    print(f"   • Places đã có Vector Embeddings (768d): {total_embedded_places}")
    print(f"   • Tổng số bài viết Knowledge Base: {total_kb}")
    print("==========================================================")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
