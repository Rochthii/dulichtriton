import os
import sys
import json
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

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

# IDs of junk, duplicate, fake, or non-existent places to purge
PURGE_IDS = [
    'tri-ton',
    'co-to',
    'ba-chuc',
    'my-truc',
    'tigon',
    'diem-du-lich-tri-ton-12',
    'nha-hang-an',
    'tinh-tam',
    'hanh-tam',
    'thien-duyan',
    'nha-tro-quoc-tien',
    'khmer-temple',
    'nha-thieu-nhi',
    'gia-ga-ot-o-thum',
    'ho-soai-chek-2',
    'b49161b0-chùa-phi-lai-ba-chú',
    'e563b663-chùa-tam-bửu-ba-chú',
    'lo-uong-thot-not-ut-hue',
    'con-uong-tuyen-tranh-t941t948',
    'cau-go-ong-lua',
    'cau-khi-ong-thot-not',
    'khu-trung-bay-toi-ac-pol-pot',
    '1370b402-nhà-hàng-gà-đốt-ô-th',
    'dac-san-ga-dot-o-thum-tri-ton'
]

# 1. Clean local JSON files
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

original_len = len(pois)
cleaned_pois = [p for p in pois if p.get('id') not in PURGE_IDS]

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_pois, f, ensure_ascii=False, indent=2)

print(f"🧹 Local JSON Cleaned: from {original_len} down to {len(cleaned_pois)} authentic POIs (Removed {original_len - len(cleaned_pois)} items)")

# 2. Purge from Supabase PostgreSQL
supabase_purged = 0
for pid in PURGE_IDS:
    encoded_id = urllib.parse.quote(pid)
    del_req = urllib.request.Request(
        f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Prefer": "return=representation"
        },
        method='DELETE'
    )
    try:
        with urllib.request.urlopen(del_req) as resp:
            deleted_items = json.loads(resp.read().decode('utf-8'))
            if deleted_items:
                supabase_purged += len(deleted_items)
                print(f"🗑️ Purged from Supabase: [{pid}] ({len(deleted_items)} records)")
    except Exception as e:
        print(f"⚠️ Error deleting {pid} from Supabase: {e}")

print(f"\n🎉 Successfully purged {supabase_purged} junk/duplicate records from Supabase PostgreSQL!")
