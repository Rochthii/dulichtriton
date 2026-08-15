import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f"Total current places: {len(pois)}\n")

suspects = []
duplicates = []
seen_names = {}

for i, p in enumerate(pois):
    pid = p.get('id', '')
    name = p.get('name', '').strip()
    slug = p.get('slug', '').strip()
    cat = p.get('category', '')
    commune = p.get('commune', '')
    story = p.get('detailed_story', '') or ''
    
    # Normalize name for duplicate detection
    norm_name = re.sub(r'[^a-zA-Z0-9\s\u00C0-\u1EF9]', '', name.lower()).strip()
    
    # 1. Duplicates
    if norm_name in seen_names:
        duplicates.append((seen_names[norm_name], p))
    else:
        seen_names[norm_name] = p
        
    # 2. Suspect/Junk entries
    reason = []
    if name in ['Tri Tôn', 'Cô Tô', 'Ba Chúc', 'NHÀ HÀNG ĂN', 'Khmer Temple', 'Giá gà đốt Ô Thum', 'nhà thiếu nhi', 'mỹ trúc', 'tigon', 'Tinh Tam', 'Hanh Tam', 'Thien Duyan']:
        reason.append("Tên địa danh chung / rác OSM")
    if pid in ['diem-du-lich-tri-ton-12', 'gia-ga-ot-o-thum', 'khmer-temple', 'nha-hang-an', 'tinh-tam', 'hanh-tam', 'thien-duyan', 'my-truc', 'tigon', 'nha-tro-quoc-tien', 'tri-ton', 'co-to', 'ba-chuc']:
        reason.append("ID rác hoặc địa danh cấp xã/huyện")
    if pid.endswith('-2'):
        reason.append("ID trùng lặp (-2)")
    if 'ភូមិស្រែឃ្មួញ' in name:
        reason.append("Tên tiếng Khmer không xác định điểm cụ thể")
        
    if reason:
        suspects.append((p, ", ".join(reason)))

print(f"=== 1. TÌM THẤY {len(duplicates)} CẶP TRÙNG LẶP ===")
for orig, dup in duplicates:
    print(f"- GỐC: [{orig.get('id')}] {orig.get('name')} <==> TRÙNG: [{dup.get('id')}] {dup.get('name')}")

print(f"\n=== 2. TÌM THẤY {len(suspects)} ĐỊA ĐIỂM RÁC / KHÔNG TỒN TẠI / TÊN CHUNG ===")
for p, r in suspects:
    print(f"- [{p.get('id')}] {p.get('name')} ({p.get('commune')}) --> Lý do: {r}")
