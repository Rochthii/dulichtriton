import sys
import json
import re
import unicodedata
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

def vietnamese_slugify(text):
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = text.replace('đ', 'd').replace('Đ', 'd')
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-').lower()

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

# Ensure 100% unique slugs
used_slugs = {}
for p in pois:
    name = p.get('name', '')
    raw_slug = p.get('slug', '')
    
    if not raw_slug or any(ord(c) > 127 for c in raw_slug) or '&' in raw_slug or '%' in raw_slug:
        base_slug = vietnamese_slugify(name)
    else:
        base_slug = raw_slug
    
    # Ensure uniqueness
    if base_slug in used_slugs:
        used_slugs[base_slug] += 1
        unique_slug = f"{base_slug}-{used_slugs[base_slug]}"
    else:
        used_slugs[base_slug] = 1
        unique_slug = base_slug
        
    p['slug'] = unique_slug

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

# Sync unique slugs to Supabase
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

success_count = 0
for p in pois:
    pid = p['id']
    slug = p.get('slug')
    encoded_id = urllib.parse.quote(pid)
    payload = json.dumps({"slug": slug}).encode('utf-8')
    
    req = urllib.request.Request(
        f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}",
        data=payload,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        method='PATCH'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            success_count += 1
    except Exception as e:
        print(f"⚠️ Slug patch error {pid} ({slug}): {e}")

print(f"\n🎉 Hoàn tất đồng bộ {success_count}/{len(pois)} Unique Slugs lên Supabase!")
