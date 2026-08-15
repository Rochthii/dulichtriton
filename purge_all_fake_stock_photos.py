import sys
import json
import csv
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

# Curated authentic Tri Tôn photography collection
AUTH_PHOTOS = {
    "lake": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
    "temple": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif",
    "gate": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg",
    "palm": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg",
    "mountain": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg",
}

def pick_authentic_photo(name: str, category: str, commune: str = '') -> str:
    n = (name or '').lower()
    c = (category or '').lower()
    
    if 'hồ' in n or 'suối' in n or 'lake' in c or 'nước' in n:
        return AUTH_PHOTOS['lake']
    if 'chùa' in n or 'temple' in c or 'spiritual' in c or 'miếu' in n or 'đình' in n or 'nhà mồ' in n:
        return AUTH_PHOTOS['temple']
    if 'cổng trời' in n or 'koh kas' in n or 'thời gian' in n or 'check-in' in c:
        return AUTH_PHOTOS['gate']
    if 'thốt nốt' in n or 'cánh đồng' in n or 'lúa' in n or 'ruộng' in n or 'ẩm thực' in c or 'gà đốt' in n or 'bò' in n or 'quán' in n:
        return AUTH_PHOTOS['palm']
    if 'núi' in n or 'đồi' in n or 'hang' in n or 'tức dụp' in n or 'cô tô' in n or 'tà pạ' in n:
        return AUTH_PHOTOS['mountain']
    return AUTH_PHOTOS['palm']

# 1. Update data/triton_pois_full.json and frontend/src/data/triton_pois_full.json
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

purged_count = 0
for p in pois:
    name = p.get('name', '')
    cat = p.get('category', '')
    com = p.get('commune', '')
    auth_img = pick_authentic_photo(name, cat, com)

    img = p.get('image_url') or ''
    if not img or 'unsplash' in img:
        p['image_url'] = auth_img
        purged_count += 1

    photos = p.get('photos') or []
    cleaned_photos = []
    for item in photos:
        url = item if isinstance(item, str) else item.get('url', '')
        if url and 'unsplash' not in url:
            cleaned_photos.append(url)
    
    if not cleaned_photos:
        # Give 2 distinct authentic photos
        if auth_img == AUTH_PHOTOS['lake']:
            cleaned_photos = [AUTH_PHOTOS['lake'], AUTH_PHOTOS['mountain']]
        elif auth_img == AUTH_PHOTOS['gate']:
            cleaned_photos = [AUTH_PHOTOS['gate'], AUTH_PHOTOS['palm']]
        elif auth_img == AUTH_PHOTOS['temple']:
            cleaned_photos = [AUTH_PHOTOS['temple'], AUTH_PHOTOS['mountain']]
        else:
            cleaned_photos = [AUTH_PHOTOS['palm'], AUTH_PHOTOS['gate']]

    p['photos'] = cleaned_photos

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"✅ Đã dọn sạch và nạp ảnh thực địa cho {purged_count} địa điểm trong triton_pois_full.json")

# 2. Update Supabase places database
env_path = 'E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local'
supabase_url = None
service_key = None

with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            supabase_url = line.split('=', 1)[1].strip().strip('"').strip("'")
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            service_key = line.split('=', 1)[1].strip().strip('"').strip("'")

# Fetch all places from Supabase
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/places?select=id,slug,name,category,commune,image_url,photos",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }
)

with urllib.request.urlopen(req) as resp:
    db_places = json.loads(resp.read().decode('utf-8'))

supabase_updated = 0
for p in db_places:
    pid = p.get('id')
    name = p.get('name', '')
    cat = p.get('category', '')
    com = p.get('commune', '')
    img = p.get('image_url') or ''
    photos = p.get('photos') or []

    has_unsplash = 'unsplash' in img or not img or any('unsplash' in str(x) for x in photos) or len(photos) == 0
    if has_unsplash:
        auth_img = pick_authentic_photo(name, cat, com)
        if auth_img == AUTH_PHOTOS['lake']:
            auth_photos = [AUTH_PHOTOS['lake'], AUTH_PHOTOS['mountain']]
        elif auth_img == AUTH_PHOTOS['gate']:
            auth_photos = [AUTH_PHOTOS['gate'], AUTH_PHOTOS['palm']]
        elif auth_img == AUTH_PHOTOS['temple']:
            auth_photos = [AUTH_PHOTOS['temple'], AUTH_PHOTOS['mountain']]
        else:
            auth_photos = [AUTH_PHOTOS['palm'], AUTH_PHOTOS['gate']]

        payload = json.dumps({
            "image_url": auth_img,
            "photos": auth_photos,
            "updated_at": "2026-08-15T17:25:00Z"
        }).encode('utf-8')

        encoded_id = urllib.parse.quote(str(pid))
        patch_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}",
            data=payload,
            headers={
                "apikey": service_key,
                "Authorization": f"Bearer {service_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            method='PATCH'
        )
        try:
            with urllib.request.urlopen(patch_req) as res:
                supabase_updated += 1
        except Exception as e:
            print(f"⚠️ Error patching Supabase {pid}: {e}")

print(f"🎉 Hoàn tất thanh lọc và thay thế 100% ảnh thật trên Supabase! Đã cập nhật {supabase_updated} bản ghi.")
