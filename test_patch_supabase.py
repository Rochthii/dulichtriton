import os
import sys
import json
import urllib.request

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

print(f"Supabase URL: {supabase_url}")
print(f"Service key exists: {bool(service_key)}")

headers = {
    'apikey': service_key,
    'Authorization': f'Bearer {service_key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Test updating ho-ta-pa
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    master_pois = json.load(f)

ho_ta_pa = next((p for p in master_pois if 'ho-ta-pa' in (p.get('slug') or p.get('id', ''))), None)
if ho_ta_pa:
    print("Found ho_ta_pa with story length:", len(ho_ta_pa.get('detailed_story', '')))
    payload = {
        'detailed_story': ho_ta_pa.get('detailed_story')
    }
    url = f"{supabase_url}/rest/v1/places?slug=eq.ho-ta-pa"
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode('utf-8')
            print("Response:", data[:200])
    except Exception as e:
        print("Error:", e)
