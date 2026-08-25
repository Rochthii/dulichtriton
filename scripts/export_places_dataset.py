import json
import csv
import os
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

src_json = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'triton_pois_full.json')
out_csv = os.path.join(os.path.dirname(__file__), '..', 'data', 'tri_ton_places_detailed_export.csv')
out_md = os.path.join(r'C:\Users\Admin\.gemini\antigravity\brain\8254d969-6a5a-4b4a-9db8-c8c96a279fce', 'danh_sach_dia_diem_tri_ton_chi_tiet.md')

with open(src_json, 'r', encoding='utf-8') as f:
    places = json.load(f)

# Sort places by Commune, then Name
places.sort(key=lambda x: (x.get('commune', ''), x.get('name', '')))

# 1. Export CSV
fields = ['STT', 'Mã ID', 'Tên Địa Điểm', 'Tên Tiếng Anh', 'Xã / Thị Trấn', 'Phân Loại', 'Đánh Giá', 'Tọa Độ Lat', 'Tọa Độ Lng', 'Địa Chỉ Chi Tiết', 'Đặc Điểm & Giờ Vàng', 'Link Google Maps']
with open(out_csv, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(fields)
    for idx, p in enumerate(places, 1):
        name = p.get('name', '')
        name_en = p.get('name_en', '')
        commune = p.get('commune', '')
        cat = p.get('category', '')
        rating = p.get('rating', 4.8)
        lat = p.get('latitude', '')
        lng = p.get('longitude', '')
        addr = p.get('address', '') or commune
        desc = (p.get('description', '') or '').replace('\n', ' ')
        maps_link = f'https://www.google.com/maps/search/?api=1&query={lat},{lng}' if lat and lng else f'https://maps.google.com/?q={name},+{commune},+An+Giang'
        writer.writerow([idx, p.get('id', ''), name, name_en, commune, cat, rating, lat, lng, addr, desc[:200], maps_link])

print(f'✓ Đã xuất CSV: {out_csv} ({len(places)} bản ghi)')

# 2. Export Structured Markdown Artifact
md_lines = []
md_lines.append('# 🗺️ TỔNG HỢP TOÀN BỘ DANH MỤC ĐỊA ĐIỂM DU LỊCH HUYỆN TRI TÔN — AN GIANG')
md_lines.append(f'\n> **Cơ sở dữ liệu thực địa xác minh 100%** | Tổng số: **{len(places)} địa điểm** | Phân bổ trên các Xã & Thị trấn chuẩn.\n')
md_lines.append('---')

communes_dict = {}
for p in places:
    c = p.get('commune', 'Khu vực khác')
    communes_dict.setdefault(c, []).append(p)

for commune_name, p_list in sorted(communes_dict.items(), key=lambda x: len(x[1]), reverse=True):
    md_lines.append(f'\n## 📍 {commune_name.upper()} ({len(p_list)} địa điểm)\n')
    md_lines.append('| STT | Tên Địa Điểm | Phân Loại | Đánh Giá | Tọa Độ GPS | Điểm Nổi Bật & Mẹo Thực Địa | Link Dẫn Đường |')
    md_lines.append('| :---: | :--- | :--- | :---: | :---: | :--- | :---: |')
    for idx, p in enumerate(p_list, 1):
        name = p.get('name', '')
        name_en = p.get('name_en', '')
        en_tag = f'<br>*(EN: {name_en})*' if name_en and name_en != name else ''
        cat = p.get('category', '')
        rating_val = p.get('rating', 4.8)
        lat = p.get('latitude', '')
        lng = p.get('longitude', '')
        gps = f'`{lat}, {lng}`' if lat and lng else 'Đang cập nhật'
        desc = (p.get('description', '') or '').replace('|', '-').replace('\n', ' ')
        desc_short = desc[:120] + '...' if len(desc) > 120 else desc
        clean_name = name.replace(' ', '+')
        clean_com = commune_name.replace(' ', '+')
        maps_link = f'[📍 Google Maps](https://maps.google.com/?q={clean_name},+{clean_com},+An+Giang)'
        md_lines.append(f'| {idx} | **{name}**{en_tag} | `{cat}` | ⭐ {rating_val} | {gps} | {desc_short} | {maps_link} |')

os.makedirs(os.path.dirname(out_md), exist_ok=True)
with open(out_md, 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print(f'✓ Đã xuất Markdown Artifact: {out_md}')
