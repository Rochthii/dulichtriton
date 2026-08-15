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

# 1. Fetch all places from Supabase
url = f"{supabase_url}/rest/v1/places?select=id,slug,name,detailed_story"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    supabase_places = json.loads(resp.read().decode('utf-8'))

print(f"Total Supabase places: {len(supabase_places)}")

# 2. Load Google Sheets V3 data
with open('data/google_sheets_v3_export.csv', mode='r', encoding='utf-8-sig') as f:
    import csv
    gs_rows = [r for r in csv.DictReader(f) if r.get('Tên địa điểm', '').strip()]

print(f"Total Google Sheets rows: {len(gs_rows)}")

updated = 0
for gr in gs_rows:
    g_name = gr.get('Tên địa điểm', '').strip()
    g_desc = gr.get('Mô tả chi tiết (Nội dung Website)', '').strip()
    g_hours = gr.get('Giờ hoạt động', '').strip()
    g_tips = gr.get('Ghi chú / Trải nghiệm', '').strip()
    
    if not g_desc:
        continue
        
    clean_g = re.sub(r'\(.*?\)', '', g_name).strip().lower()
    
    # Match with Supabase place
    matched_sp = None
    for sp in supabase_places:
        sp_name = sp.get('name', '').lower()
        clean_sp = re.sub(r'\(.*?\)', '', sp_name).strip().lower()
        
        if clean_g and clean_sp and (clean_g in clean_sp or clean_sp in clean_g or clean_g == clean_sp):
            matched_sp = sp
            break
            
    if matched_sp:
        sp_id = matched_sp.get('id')
        patch_payload = {
            'detailed_story': g_desc,
        }
        if g_hours:
            patch_payload['opening_hours'] = g_hours
            
        patch_url = f"{supabase_url}/rest/v1/places?id=eq.{sp_id}"
        req_patch = urllib.request.Request(patch_url, data=json.dumps(patch_payload).encode('utf-8'), headers=headers, method='PATCH')
        try:
            with urllib.request.urlopen(req_patch, timeout=10) as patch_resp:
                res_data = patch_resp.read().decode('utf-8')
                updated += 1
                print(f"✅ [{updated}] Cập nhật Supabase thành công: [{sp_id}] {matched_sp.get('name')}")
        except Exception as err:
            print(f"❌ Lỗi cập nhật [{sp_id}]: {err}")
    else:
        print(f"⚠️ Chưa tìm thấy khớp trong Supabase cho: '{g_name}'")

print(f"\n🎉 TỔNG KẾT: Đã cập nhật thành công {updated} bài viết chi tiết trực tiếp vào cơ sở dữ liệu Supabase!")
