import os
import sys
import json
import urllib.request
import re

sys.stdout.reconfigure(encoding='utf-8')

env_path = 'E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local'
supabase_url = None
service_key = None

if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
                supabase_url = line.split('=', 1)[1].strip().strip('"').strip("'")
            elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                service_key = line.split('=', 1)[1].strip().strip('"').strip("'")

headers = {
    'apikey': service_key,
    'Authorization': f'Bearer {service_key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    master_pois = json.load(f)

# Missing places from previous output
missing_slugs = [
    'con-uong-tuyen-tranh-t941t948',
    'ho-soai-chek',
    'cau-go-ong-lua',
    'cau-khi-ong-thot-not',
    'tho-mo-muc-cave-hang-tho-mo-muc',
    'chua-ba-xoai',
    'khu-trung-bay-toi-ac-pol-pot',
    'gia-ga-ot-o-thum',
    'lo-uong-thot-not-ut-hue'
]

inserted = 0
for s in missing_slugs:
    poi = next((p for p in master_pois if p.get('id') == s or p.get('slug') == s), None)
    if poi:
        # Insert into Supabase
        payload = {
            'id': poi.get('id'),
            'slug': poi.get('slug') or poi.get('id'),
            'name': poi.get('name'),
            'commune': poi.get('commune') or 'Tri Tôn',
            'category': poi.get('category') or 'Điểm tham quan',
            'tourism_category': poi.get('category') or 'Điểm tham quan',
            'rating': poi.get('rating') or 4.8,
            'image_url': poi.get('image_url') or 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85',
            'description': poi.get('description'),
            'detailed_story': poi.get('detailed_story'),
            'opening_hours': poi.get('opening_hours') or '06:00 - 18:30',
            'is_active': True
        }
        url = f"{supabase_url}/rest/v1/places"
        req = urllib.request.Request(url, data=json.dumps([payload]).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                inserted += 1
                print(f"✨ Đã thêm mới vào Supabase: [{poi.get('id')}] {poi.get('name')}")
        except Exception as e:
            print(f"Lỗi thêm [{poi.get('id')}]: {e}")

print(f"\n🎉 HOÀN TẤT THÊM MỚI {inserted} ĐIỂM VÀO SUPABASE!")
