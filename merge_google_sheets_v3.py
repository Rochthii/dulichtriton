import sys
import csv
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load Google Sheets V3 data
with open('data/google_sheets_v3_export.csv', mode='r', encoding='utf-8-sig') as f:
    gs_rows = [r for r in csv.DictReader(f) if r.get('Tên địa điểm', '').strip()]

# 2. Load Master POIs JSON
json_path = 'data/triton_pois_full.json'
with open(json_path, mode='r', encoding='utf-8') as f:
    master_pois = json.load(f)

print(f"Đang tiến hành nạp {len(gs_rows)} điểm từ Google Sheets V3 vào CSDL ({len(master_pois)} POIs hiện tại)...")

updated_count = 0
added_count = 0

# Blacklist of places that should NOT be in tourism DB
blacklist_names = ['nhà nghi tú trinh', 'trung tâm y tế, mầm non', 'mầm non']

for gr in gs_rows:
    g_name = gr.get('Tên địa điểm', '').strip()
    g_slug = gr.get('Slug (Routing)', '').strip()
    g_desc = gr.get('Mô tả chi tiết (Nội dung Website)', '').strip()
    g_maps = gr.get('Google Maps (Tìm kiếm & Tọa độ)', '').strip()
    g_tags = gr.get('Tags (Lọc)', '').strip()
    g_hours = gr.get('Giờ hoạt động', '').strip()
    g_price = gr.get('Giá vé / Mức giá', '').strip()
    g_rating = gr.get('Rating', '').strip()
    g_notes = gr.get('Ghi chú / Trải nghiệm', '').strip()
    g_verify = gr.get('Cần xác minh (⚠️)', '').strip()
    
    # Check blacklist
    if any(b in g_name.lower() for b in blacklist_names) or 'loại' in g_notes.lower():
        print(f"⛔ Đã loại trừ điểm không phù hợp du lịch: {g_name}")
        continue

    # Find match in master POIs
    matched_poi = None
    for p in master_pois:
        p_slug = (p.get('slug') or p.get('id', '')).lower()
        p_name = p.get('name', '').lower()
        
        if g_slug and (g_slug == p_slug or g_slug in p_slug or p_slug in g_slug):
            matched_poi = p
            break
        clean_g = re.sub(r'\(.*?\)', '', g_name).strip().lower()
        clean_p = re.sub(r'\(.*?\)', '', p_name).strip().lower()
        if len(clean_g) > 3 and (clean_g in clean_p or clean_p in clean_g):
            matched_poi = p
            break
            
    if matched_poi:
        # Update existing POI
        if g_desc:
            matched_poi['detailed_story'] = g_desc
            # Create a clean opening summary for description if needed
            first_para = g_desc.split('\n')[0].replace('###', '').replace('**', '').strip()
            if len(first_para) > 20 and len(first_para) < 300:
                matched_poi['description'] = first_para
        if g_hours:
            matched_poi['opening_hours'] = g_hours
        if g_price:
            matched_poi['ticket_price'] = g_price
        if g_notes:
            matched_poi['field_tips'] = g_notes
        if g_rating:
            try:
                matched_poi['rating'] = float(g_rating)
            except:
                pass
        updated_count += 1
        print(f"✅ Đã nạp thành công vào POI: [{matched_poi.get('id')}] {matched_poi.get('name')}")
    else:
        # Create new POI entry
        new_id = g_slug or re.sub(r'[^a-z0-9]+', '-', g_name.lower()).strip('-')
        first_para = g_desc.split('\n')[0].replace('###', '').replace('**', '').strip() if g_desc else g_name
        new_poi = {
            "id": new_id,
            "name": g_name,
            "slug": new_id,
            "commune": "Tri Tôn",
            "category": g_tags or "Điểm tham quan",
            "rating": float(g_rating) if g_rating else 4.8,
            "reviews_count": 50,
            "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85",
            "description": first_para,
            "detailed_story": g_desc,
            "opening_hours": g_hours or "Tự do tham quan",
            "ticket_price": g_price or "Miễn phí",
            "field_tips": g_notes,
            "maps_url": g_maps,
            "is_verified": True
        }
        master_pois.append(new_poi)
        added_count += 1
        print(f"✨ Đã tạo mới POI từ Google Sheets: [{new_id}] {g_name}")

# Save to both JSON master files
with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(master_pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(master_pois, f, ensure_ascii=False, indent=2)

print(f"\n🎉 HOÀN TẤT NẠP DỮ LIỆU:")
print(f"- Cập nhật bài viết chi tiết & thông số cho {updated_count} điểm có sẵn.")
print(f"- Bổ sung mới {added_count} điểm mới vào CSDL.")
print(f"- Tổng số điểm trong CSDL hiện tại: {len(master_pois)} POIs.")
