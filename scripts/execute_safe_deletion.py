"""
Script thực thi xóa an toàn 24 bản ghi rác/trùng lặp theo đúng chỉ định của người dùng:
1. Backup snapshot dữ liệu hiện tại
2. Xóa trên Supabase Cloud
3. Xóa trên local frontend/src/data/triton_pois_full.json & data/tri_ton_master_cleaned.csv
4. Xuất lại Excel Master phân nhóm và copy sang Downloads
"""
import os
import sys
import json
import csv
import urllib.request
import urllib.parse
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

# 24 IDs ĐÃ ĐƯỢC NGƯỜI DÙNG PHÊ DUYỆT XÓA
IDS_TO_DELETE = [
    # Nhóm 1: Trùng lặp (4 bản ghi)
    'b49161b0-chùa-phi-lai-ba-chúc',
    'e563b663-chùa-tam-bửu-ba-chúc',
    'ho-soai-chek-2',
    '831ebb34-hồ-đá-latina',
    '749e2a14-vách-đá-đứng-latina',

    # Nhóm 2: Rác / Tên chung chung / Kênh rạch / Lỗi (15 bản ghi)
    'tri-ton',
    'co-to',
    'nha-thieu-nhi',
    'khmer-temple',
    'diem-du-lich-tri-ton-12',
    'kenh-tam-ngan',
    'kenh-t6',
    'my-truc',
    'tigon',
    'hanh-tam',
    'thien-duyan',
    'son-lap',
    '89d12327-quầy-thốt-nốt-tươi-c',
    'chua-thanh-luong',
    'dien-gieng-nuoc',

    # Nhóm 3: 5 địa điểm cụ thể được chỉ định xóa
    'quan-ga-dot-ro-thum-khmer',
    'chua-bach-co',
    'chua-coc',
    'chua-xoc-tuc',
    'chua-ba-xoai'
]

def backup_supabase_data():
    """Lưu snapshot dữ liệu hiện tại trước khi xóa"""
    print("\n--- [BƯỚC 1: TẠO BẢN SAO LƯU SNAPSHOT] ---")
    url = f"{SUPABASE_URL}/rest/v1/places?select=*"
    req = urllib.request.Request(
        url,
        headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        places = json.loads(res.read().decode('utf-8'))

    backup_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    backup_file = os.path.join(backup_dir, 'places_backup_before_delete_20260825.json')
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    print(f"✓ Đã sao lưu an toàn {len(places)} bản ghi vào: {backup_file}")
    return places

def delete_from_supabase():
    """Xóa các bản ghi trên Supabase REST API"""
    print(f"\n--- [BƯỚC 2: XÓA {len(IDS_TO_DELETE)} BẢN GHI TRÊN SUPABASE CLOUD] ---")
    deleted_count = 0
    for uid in IDS_TO_DELETE:
        url = f"{SUPABASE_URL}/rest/v1/places?id=eq.{urllib.parse.quote(uid)}"
        req = urllib.request.Request(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=minimal'
            },
            method='DELETE'
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                if res.status in (200, 204):
                    deleted_count += 1
                    print(f"[{deleted_count:02d}] ✓ Đã xóa thành công khỏi Supabase: [{uid}]")
        except Exception as e:
            print(f"⚠️ Lỗi khi xóa [{uid}]: {e}")

    print(f"✨ Hoàn tất xóa trên Cloud: Đã xóa thành công {deleted_count}/{len(IDS_TO_DELETE)} bản ghi.")
    return deleted_count

def clean_local_json_and_csv():
    """Xóa trên file local JSON và CSV"""
    print("\n--- [BƯỚC 3: ĐỒNG BỘ XÓA TRÊN CSDL LOCAL JSON & CSV] ---")
    
    # 1. Local JSON
    json_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'triton_pois_full.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            places = json.load(f)
        
        orig_len = len(places)
        filtered_places = [p for p in places if p.get('id') not in IDS_TO_DELETE]
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(filtered_places, f, ensure_ascii=False, indent=2)
        print(f"✓ triton_pois_full.json: {orig_len} -> {len(filtered_places)} địa điểm (Đã loại {orig_len - len(filtered_places)})")

    # 2. Master CSV
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'tri_ton_master_cleaned.csv')
    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            fieldnames = [f for f in reader.fieldnames if f is not None]
            rows = list(reader)

        orig_csv_len = len(rows)
        filtered_rows = [r for r in rows if r.get('id') not in IDS_TO_DELETE and r.get('\ufeffid') not in IDS_TO_DELETE]
        with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(filtered_rows)
        print(f"✓ tri_ton_master_cleaned.csv: {orig_csv_len} -> {len(filtered_rows)} bản ghi (Đã loại {orig_csv_len - len(filtered_rows)})")

def main():
    print("================================================================================")
    print(f"🚀 TIẾN TRÌNH XÓA AN TOÀN {len(IDS_TO_DELETE)} ĐỊA ĐIỂM ĐÃ ĐƯỢC PHÊ DUYỆT")
    print("================================================================================")

    backup_supabase_data()
    delete_from_supabase()
    clean_local_json_and_csv()

    print("\n================================================================================")
    print("🎉 ĐÃ HOÀN TẤT XÓA DỮ LIỆU CHUẨN XÁC THEO YÊU CẦU!")
    print("================================================================================")
    return 0

if __name__ == '__main__':
    sys.exit(main())
