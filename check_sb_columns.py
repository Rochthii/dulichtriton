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

# 1. Fetch 1 row
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/places?limit=1",
    headers={'apikey': service_key, 'Authorization': f'Bearer {service_key}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Supabase columns:", list(data[0].keys()))

# 2. Test update 1 row
target = data[0]
print(f"Testing patch on [{target['id']}] {target.get('name')}")
encoded_id = urllib.parse.quote(target['id'])
patch_req = urllib.request.Request(
    f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}",
    data=json.dumps({"detailed_story": "Test story", "opening_hours": "07:00 - 18:00"}).encode('utf-8'),
    headers={
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    method='PATCH'
)
try:
    with urllib.request.urlopen(patch_req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Success! Updated:", len(res))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
