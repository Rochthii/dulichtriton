"""
Script sinh Vector Embeddings cho 95+ Địa Điểm Tri Tôn trên Supabase PostgreSQL
Model: text-embedding-004 (768 dimensions)
"""
import os
import sys
import json
import urllib.request
import urllib.parse
from dotenv import load_dotenv

# Fix Windows console UTF-8 output encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load env variables from frontend/.env.local
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
GEMINI_KEY = os.getenv('GEMINI_API_KEY', '')

def get_embedding(text: str) -> list[float]:
    """Tạo Vector Embedding 768 chiều từ Google Gemini API gemini-embedding-001"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {
            "parts": [{"text": text}]
        },
        "outputDimensionality": 768
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        return data['embedding']['values']

def fetch_places():
    """Lấy danh sách địa điểm từ Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/places?select=id,name,commune,category,rating,description,golden_time_windows"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

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
    with urllib.request.urlopen(req) as res:
        return res.status

def main():
    print("[pgvector] Đang tải danh sách địa điểm từ Supabase...")
    places = fetch_places()
    print(f"[pgvector] Đã tìm thấy {len(places)} địa điểm. Bắt đầu sinh Vector Embeddings...")

    success_count = 0
    for idx, p in enumerate(places, 1):
        name = p.get('name', '')
        commune = p.get('commune', '')
        category = p.get('category', '')
        rating = p.get('rating', 5)
        desc = p.get('description', '')
        golden = p.get('golden_time_windows', '')

        # Tạo chuỗi thông tin phong phú ngữ nghĩa
        rich_text = f"Địa điểm: {name}. Thuộc xã/thị trấn: {commune}. Phân loại: {category}. Đánh giá: {rating}/5 sao. Giờ vàng: {golden}. Mô tả: {desc}"

        try:
            vector = get_embedding(rich_text)
            status = update_place_embedding(p['id'], vector)
            if status in (200, 204):
                success_count += 1
                print(f"[{idx}/{len(places)}] ✓ Sinh Vector 768d cho '{name}' ({commune}) thành công!")
        except Exception as e:
            print(f"[{idx}/{len(places)}] ✗ Lỗi khi xử lý '{name}': {e}")

    print(f"\n[pgvector] hoàn tất! Đã cập nhật thành công {success_count}/{len(places)} địa điểm lên Supabase.")

if __name__ == '__main__':
    main()
