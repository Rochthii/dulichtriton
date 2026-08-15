import sys
import csv
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/google_sheets_v3_export.csv', mode='r', encoding='utf-8-sig') as f:
    gs_rows = [r for r in csv.DictReader(f) if r.get('Tên địa điểm', '').strip()]

with open('data/triton_pois_full.json', mode='r', encoding='utf-8') as f:
    master_pois = json.load(f)

print("=== KIỂM TRA ĐỐI CHIẾU CỘT [Tên địa điểm] VÀ [Mô tả chi tiết] ===")
matched_count = 0
new_count = 0

for i, gr in enumerate(gs_rows):
    name = gr.get('Tên địa điểm', '').strip()
    slug = gr.get('Slug (Routing)', '').strip()
    desc = gr.get('Mô tả chi tiết (Nội dung Website)', '').strip()
    status = gr.get('Cần xác minh (⚠️)', '').strip()
    notes = gr.get('Ghi chú / Trải nghiệm', '').strip()
    
    # Matching logic
    matched_poi = None
    for p in master_pois:
        p_slug = (p.get('slug') or p.get('id', '')).lower()
        p_name = p.get('name', '').lower()
        
        # Exact/slug match
        if slug and (slug == p_slug or slug in p_slug or p_slug in slug):
            matched_poi = p
            break
        # Name submatch
        clean_g_name = name.split('(')[0].strip().lower()
        clean_p_name = p_name.split('(')[0].strip().lower()
        if len(clean_g_name) > 3 and (clean_g_name in clean_p_name or clean_p_name in clean_g_name):
            matched_poi = p
            break
            
    if matched_poi:
        matched_count += 1
        m_name = matched_poi.get('name')
        m_id = matched_poi.get('id')
        print(f"{i+1:02d}. [Google Sheet] '{name}' ({len(desc)} ký tự) -> Khớp POI CSDL: [{m_id}] {m_name}")
    else:
        new_count += 1
        print(f"{i+1:02d}. [Google Sheet] '{name}' ({len(desc)} ký tự) -> Điểm mới cần bổ sung vào CSDL")

print(f"\nTổng kết: Khớp cập nhật {matched_count} điểm | Bổ sung mới {new_count} điểm.")
