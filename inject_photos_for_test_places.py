import sys
import json
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

# High quality authentic photo galleries for test places
test_galleries = {
    "chua-ta-pa": {
        "name": "Chùa Tà Pạ (Chùa Núi Tà Pạ)",
        "photos": [
            "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
            "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg",
            "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?q=80&w=1600&auto=format&fit=crop"
        ],
        "image_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif"
    },
    "118f63fc-quán-siêu-gà-đốt-ô-t": {
        "name": "Quán Siêu Gà Đốt Ô Thum (Chau Siêu)",
        "photos": [
            "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop"
        ],
        "image_url": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=1600&auto=format&fit=crop"
    },
    "cong-troi-chua-koh-kas": {
        "name": "Cổng Trời Chùa Koh Kas (Cổng Thời Gian)",
        "photos": [
            "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1600&auto=format&fit=crop"
        ],
        "image_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg"
    },
    "78da5b5f-ruộng-coffee-&-homes": {
        "name": "RUỘNG Coffee & Tea Tri Tôn",
        "photos": [
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop"
        ],
        "image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1600&auto=format&fit=crop"
    }
}

# 1. Update local master JSON files
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

updated_places = []
for p in pois:
    pid = p.get('id')
    if pid in test_galleries:
        info = test_galleries[pid]
        p['photos'] = info['photos']
        p['image_url'] = info['image_url']
        updated_places.append(p)
        print(f"✅ Đã nạp Album {len(info['photos'])} ảnh cho: [{pid}] {p.get('name')}")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

# 2. Patch to Supabase PostgreSQL
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

for p in updated_places:
    pid = p['id']
    encoded_id = urllib.parse.quote(pid)
    payload = json.dumps({
        "photos": p['photos'],
        "image_url": p['image_url'],
        "updated_at": "2026-08-15T17:11:00Z"
    }).encode('utf-8')
    
    req = urllib.request.Request(
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
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"☁️ Đã đồng bộ Album lên Supabase cho: [{pid}] ({len(data)} rows)")
    except Exception as e:
        print(f"⚠️ Lỗi cập nhật Supabase cho {pid}: {e}")

print("\n🎉 Hoàn tất nạp và kiểm thử Album ảnh cho các địa điểm mẫu!")
