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

sb_ids = {p['id']: p for p in sb_places if p.get('id')}
sb_slugs = {p['slug']: p['id'] for p in sb_places if p.get('slug')}

patched_count = 0
inserted_count = 0

for p in pois:
    pid = p.get('id')
    slug = p.get('slug')
    name = p.get('name')
    story = p.get('detailed_story')
    
    if not story or len(story) < 200:
        continue
        
    target_id = None
    if pid in sb_ids:
        target_id = pid
    elif slug in sb_slugs:
        target_id = sb_slugs[slug]
        
    if target_id:
        # Update existing
        update_payload = {
            "name": name,
            "detailed_story": story,
            "opening_hours": p.get('opening_hours') or "08:00 - 18:30",
            "price_level": p.get('price_level') or p.get('ticket_price') or "250.000đ - 300.000đ",
            "commune": p.get('commune', 'Xã Ô Lâm'),
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
                print(f"✅ Updated: [{target_id}] {name}")
        except Exception as err:
            print(f"❌ Error patching {name} [{target_id}]: {err}")
    else:
        # Insert new place
        insert_payload = {
            "id": pid,
            "place_id": pid,
            "name": name,
            "slug": slug or pid,
            "category": p.get('category', 'food'),
            "subcategory": p.get('subcategory', 'Quán gà đốt Ô Thum'),
            "tourism_category": p.get('tourism_category', 'Ẩm thực Bảy Núi'),
            "description": p.get('description', ''),
            "short_description": p.get('short_description', ''),
            "address": p.get('address', 'Bờ Hồ Ô Thum, Xã Ô Lâm, Tri Tôn, An Giang'),
            "commune": p.get('commune', 'Xã Ô Lâm'),
            "district": "Tri Tôn",
            "province": "An Giang",
            "latitude": p.get('latitude', 10.385),
            "longitude": p.get('longitude', 104.975),
            "opening_hours": p.get('opening_hours', '08:00 - 18:30'),
            "price_level": p.get('price_level', '250.000đ - 300.000đ'),
            "rating": 4.8,
            "review_count": 80,
            "is_active": True,
            "is_hot": True,
            "is_verified": True,
            "detailed_story": story
        }
        post_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/places",
            data=json.dumps(insert_payload).encode('utf-8'),
            headers={
                "apikey": service_key,
                "Authorization": f"Bearer {service_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            method='POST'
        )
        try:
            with urllib.request.urlopen(post_req) as resp:
                inserted_count += 1
                print(f"➕ Inserted: [{pid}] {name}")
        except Exception as err:
            print(f"❌ Error inserting {name} [{pid}]: {err}")

print(f"\n🎉 Successfully synced to Supabase: {patched_count} updated, {inserted_count} newly inserted!")
