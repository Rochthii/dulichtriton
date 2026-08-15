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

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

# Fetch all places in Supabase
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/places?select=id,name,slug",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}"
    }
)

with urllib.request.urlopen(req) as response:
    sb_places = json.loads(response.read().decode('utf-8'))
    print(f"Total Supabase places: {len(sb_places)}")

name_to_sb = {p['name'].strip().lower(): p['id'] for p in sb_places if p.get('name')}
slug_to_sb = {p['slug'].strip().lower(): p['id'] for p in sb_places if p.get('slug')}

patched_count = 0
for p in pois:
    story = p.get('detailed_story')
    if not story or len(story) < 200:
        continue
        
    p_id = p.get('id')
    p_slug = (p.get('slug') or '').strip().lower()
    p_name = p.get('name', '').strip().lower()
    
    target_id = None
    if p_id in [x['id'] for x in sb_places]:
        target_id = p_id
    elif p_slug in slug_to_sb:
        target_id = slug_to_sb[p_slug]
    elif p_name in name_to_sb:
        target_id = name_to_sb[p_name]
    else:
        # Fuzzy match
        for sbn, sbid in name_to_sb.items():
            if (p_name in sbn or sbn in p_name) and len(p_name) > 5:
                target_id = sbid
                break
                
    if target_id:
        update_payload = {
            "detailed_story": story,
            "opening_hours": p.get('opening_hours') or "06:00 - 18:00",
            "is_hot": True,
            "is_verified": True
        }
        
        encoded_id = urllib.parse.quote(target_id)
        patch_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}",
            data=json.dumps(update_payload).encode('utf-8'),
            headers={
                "apikey": service_key,
                "Authorization": f"Bearer {service_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            method='PATCH'
        )
        try:
            with urllib.request.urlopen(patch_req) as resp:
                patched_count += 1
                print(f"✅ [{patched_count}] Synced to Supabase: [{target_id}] {p.get('name')}")
        except Exception as err:
            print(f"❌ Error patching {p.get('name')} [{target_id}]: {err}")

print(f"\n🎉 Successfully patched {patched_count} rich detailed stories into Supabase PostgreSQL!")
