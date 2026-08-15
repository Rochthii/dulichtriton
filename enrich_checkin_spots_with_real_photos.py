import sys
import json
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

# High quality checkin spots for iconic places
checkin_data = {
    "cong-troi-chua-koh-kas": [
        {
            "title": "Chính diện Cổng Thời Gian & Núi Dài",
            "photo_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg",
            "tip": "Góc chụp từ thấp hướng lên đỉnh tháp thần Brahma đón ánh nắng bình minh rực rỡ từ 06:00 - 07:30 sáng."
        },
        {
            "title": "Dọc hàng thốt nốt & ruộng lúa Châu Lăng",
            "photo_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg",
            "tip": "Bắt trọn bóng đổ dài của hàng cây thốt nốt trên cánh đồng lúa vào khung giờ hoàng hôn 16:30 - 17:45."
        },
        {
            "title": "Toàn cảnh Cổng Trời giữa cánh đồng lúa vàng",
            "photo_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif",
            "tip": "Lý tưởng nhất vào mùa lúa chín tháng 4, tháng 8 và tháng 11 với trang phục áo bà ba hoặc xăm-pốt truyền thống."
        }
    ],
    "chua-ta-pa": [
        {
            "title": "Mặt gương Hồ Tà Pạ & Vách đá hoa cương",
            "photo_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif",
            "tip": "Mặt nước trong vắt màu xanh ngọc bích in bóng mây trời và vách đá sừng sững."
        },
        {
            "title": "Chánh điện Chùa Núi Tà Pạ trên cao",
            "photo_url": "https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1200,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg",
            "tip": "Ngắm toàn cảnh cánh đồng lúa ô vuông bàn cờ trải dài dưới chân đồi."
        }
    ]
}

# 1. Update local files
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

for p in pois:
    pid = p.get('id')
    if pid in checkin_data:
        p['checkin_spots'] = checkin_data[pid]
        p['checkin_spots_json'] = json.dumps(checkin_data[pid], ensure_ascii=False)
        print(f"📸 Đã cập nhật Góc Check-in thật cho: [{pid}] {p.get('name')}")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

# 2. Patch to Supabase
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

for pid, spots in checkin_data.items():
    encoded_id = urllib.parse.quote(pid)
    payload = json.dumps({
        "checkin_spots": spots,
        "updated_at": "2026-08-15T17:20:00Z"
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
            print(f"☁️ Đồng bộ Supabase checkin_spots thành công: {pid}")
    except Exception as e:
        print(f"⚠️ Supabase checkin patch error {pid}: {e}")

print("\n🎉 Hoàn tất nạp Góc Check-in thực tế!")
