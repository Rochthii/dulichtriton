import json
import os
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

src = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'triton_pois_full.json')
with open(src, 'r', encoding='utf-8') as f:
    places = json.load(f)

# Categorization logic
buckets = {
    'am_thuc_quan_an': {'title': 'Ẩm Thực & Quán Ăn Đặc Sản', 'icon': '🍲', 'items': []},
    'chua_tam_linh': {'title': 'Chùa Khmer & Di Tích Lịch Sử', 'icon': '🏛️', 'items': []},
    'thang_canh_nui_ho': {'title': 'Danh Thắng Thiên Nhiên, Núi & Hồ Nước', 'icon': '🏞️', 'items': []},
    'checkin_song_ao': {'title': 'Điểm Check-in & Cảnh Quan Nổi Bật', 'icon': '📸', 'items': []},
    'ca_phe_giai_tri': {'title': 'Cà Phê View Đẹp & Tri Tôn Về Đêm', 'icon': '☕', 'items': []},
    'luu_tru_homestay': {'title': 'Lưu Trú, Homestay & Khách Sạn', 'icon': '🏡', 'items': []},
}

for p in places:
    name = (p.get('name') or '').lower()
    cat = (p.get('category') or '').lower()
    subcat = (p.get('subcategory') or '').lower()
    tcat = (p.get('tourism_category') or '').lower()

    if 'stay' in cat or 'hotel' in cat or 'homestay' in cat or 'lưu trú' in tcat or 'khách sạn' in name or 'nhà nghỉ' in name:
        buckets['luu_tru_homestay']['items'].append(p)
    elif 'cafe' in subcat or 'cà phê' in name or 'coffee' in name or 'chợ đêm' in name:
        buckets['ca_phe_giai_tri']['items'].append(p)
    elif 'chùa' in name or 'wat ' in name or 'chưn-kôm' in name or 'svay ton' in name or 'di tích' in name or 'nhà mồ' in name or 'ô tà sóc' in name or 'tức dụp' in name or 'history' in cat or 'spiritual' in cat:
        buckets['chua_tam_linh']['items'].append(p)
    elif 'check-in' in cat or 'cổng trời' in name or 'thốt nốt trái tim' in name or 'cầu gỗ' in name or 'vồ hội' in name or 'cánh đồng lúa' in name:
        buckets['checkin_song_ao']['items'].append(p)
    elif 'gà đốt' in name or 'cháo bò' in name or 'bún cá' in name or 'bò 7 món' in name or 'đu đủ đâm' in name or 'bánh bò' in name or 'quán' in name or 'lẩu' in name or 'food' in cat or 'gastronomy' in cat:
        buckets['am_thuc_quan_an']['items'].append(p)
    else:
        buckets['thang_canh_nui_ho']['items'].append(p)

print(f'=== TỔNG QUAN PHÂN LOẠI {len(places)} ĐỊA ĐIỂM DU LỊCH TRI TÔN ===\n')
total_checked = 0
for k, b in buckets.items():
    cnt = len(b['items'])
    total_checked += cnt
    pct = (cnt / len(places)) * 100
    print(f"{b['icon']} {b['title']}: {cnt} địa điểm ({pct:.1f}%)")
    for p in b['items'][:4]:
        print(f"   • {p.get('name')} ({p.get('commune')})")
    if cnt > 4:
        print(f"   ... và {cnt - 4} địa điểm khác.")
    print()

print(f"Tổng cộng: {total_checked}/{len(places)} địa điểm đã phân loại.")
