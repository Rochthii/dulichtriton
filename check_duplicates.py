import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f"=== KIỂM TRA TRÙNG LẶP TRONG CƠ SỞ DỮ LIỆU ({len(pois)} POIs) ===")

# 1. Check duplicate IDs
ids = [p['id'] for p in pois]
dup_ids = set([x for x in ids if ids.count(x) > 1])
print(f"1. Trùng lặp ID: {len(dup_ids)} trường hợp ({dup_ids if dup_ids else 'Không có'})")

# 2. Check duplicate Slugs
slugs = [p.get('slug') for p in pois if p.get('slug')]
dup_slugs = set([x for x in slugs if slugs.count(x) > 1])
print(f"2. Trùng lặp Slug: {len(dup_slugs)} trường hợp ({dup_slugs if dup_slugs else 'Không có'})")

# 3. Check duplicate or highly similar Names
print("\n3. Kiểm tra các cặp tên có nguy cơ trùng lặp:")
dup_pairs = []
for i in range(len(pois)):
    for j in range(i + 1, len(pois)):
        n1 = re.sub(r'\(.*?\)', '', pois[i].get('name', '')).strip().lower()
        n2 = re.sub(r'\(.*?\)', '', pois[j].get('name', '')).strip().lower()
        # strip common words
        clean_n1 = n1.replace('chùa', '').replace('hồ', '').replace('quán', '').replace('khu', '').strip()
        clean_n2 = n2.replace('chùa', '').replace('hồ', '').replace('quán', '').replace('khu', '').strip()
        
        if clean_n1 == clean_n2 and len(clean_n1) >= 3:
            dup_pairs.append((pois[i], pois[j]))
            print(f" - Cặp 1: [{pois[i]['id']}] '{pois[i]['name']}' <==> [{pois[j]['id']}] '{pois[j]['name']}'")

print(f"\nTổng số cặp tương đồng tên: {len(dup_pairs)}")

# 4. Check the 7 newly added items specifically
print("\n4. Kiểm tra 7 địa điểm vừa thêm mới từ Google Sheets:")
new_7_slugs = [
    'con-uong-tuyen-tranh-t941t948',
    'ho-soai-so',
    'cau-go-ong-lua',
    'cau-khi-ong-thot-not',
    'khu-trung-bay-toi-ac-pol-pot',
    'gia-ga-ot-o-thum',
    'lo-uong-thot-not-ut-hue'
]

for s in new_7_slugs:
    found = [p for p in pois if p.get('id') == s or p.get('slug') == s]
    if found:
        p = found[0]
        # Check if there are other similar items
        similar = [o for o in pois if o != p and (
            p['name'].lower() in o['name'].lower() or 
            o['name'].lower() in p['name'].lower()
        )]
        print(f" - [{p['id']}] '{p['name']}' -> Có trùng với điểm nào khác không? {len(similar)} điểm ({[x['name'] for x in similar]})")
