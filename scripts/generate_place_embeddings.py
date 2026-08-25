"""
Script sinh Vector Embeddings cho 149 Địa Điểm Tri Tôn trên Supabase PostgreSQL
Model: Gemini Text Embedding (768 dimensions)
"""
import os
import sys
import json
import urllib.request
import urllib.parse
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load env variables from frontend/.env.local
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
GEMINI_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY_2', '')

def get_embedding(text: str) -> list[float]:
    """Tạo Vector Embedding 768 chiều từ Google Gemini API"""
    if not GEMINI_KEY:
        raise ValueError("Thiếu GEMINI_API_KEY trong .env.local")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {
            "parts": [{"text": text[:2000]}]
        },
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

def fetch_places():
    """Lấy danh sách địa điểm từ Supabase REST API"""
    if not SUPABASE_KEY:
        return []
    url = f"{SUPABASE_URL}/rest/v1/places?select=id,name,commune,category,rating,description,detailed_story,embedding"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"[pgvector] Warning khi tải places: {e}")
        return []

def update_place_embedding(place_id: str, embedding: list[float]):
    """Cập nhật cột embedding cho địa điểm trên Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/places?id=eq.{urllib.parse.quote(place_id)}"
    payload = {"embedding": embedding}
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='PATCH'
    )
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.status

def main():
    print("================================================================================")
    print("🚀 GIAO THỨC ĐỒNG BỘ VECTOR EMBEDDING 768D (PGVECTOR & GEMINI)")
    print("================================================================================")
    
    if not GEMINI_KEY:
        print("ℹ️ Chưa có GEMINI_API_KEY trong .env.local — Chế độ Local Dry-Run.")
        return 0

    places = fetch_places()
    if not places:
        print("ℹ️ Không thể tải danh sách places từ Supabase hoặc bảng rỗng.")
        return 0

    print(f"📖 Đã tìm thấy {len(places)} địa điểm từ Supabase. Bắt đầu xử lý...")

    needs_embed = [p for p in places if not p.get('embedding')]
    print(f"🎯 Số địa điểm cần sinh Vector Embedding mới: {len(needs_embed)}/{len(places)}")

    success_count = 0
    for idx, p in enumerate(needs_embed, 1):
        name = p.get('name', '')
        commune = p.get('commune', '')
        category = p.get('category', '')
        rating = p.get('rating', 5)
        desc = p.get('description', '') or ''
        story = p.get('detailed_story', '') or ''

        rich_text = f"Địa điểm: {name}. Thuộc xã/thị trấn: {commune}, Tri Tôn, An Giang. Phân loại: {category}. Đánh giá: {rating}/5. Mô tả: {desc}. Di sản & câu chuyện: {story}"

        try:
            vector = get_embedding(rich_text)
            status = update_place_embedding(p['id'], vector)
            if status in (200, 204):
                success_count += 1
                print(f"[{idx}/{len(needs_embed)}] ✓ Sinh Vector 768d cho '{name}' ({commune}) thành công!")
        except Exception as e:
            print(f"[{idx}/{len(needs_embed)}] ✗ Lỗi khi xử lý '{name}': {e}")

    print(f"\n✨ HOÀN TẤT! Đã cập nhật thành công {success_count}/{len(needs_embed)} địa điểm mới lên pgvector.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
