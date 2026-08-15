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

headers = {
    'apikey': service_key,
    'Authorization': f'Bearer {service_key}',
    'Content-Type': 'application/json'
}

url = f"{supabase_url}/rest/v1/places?select=id,slug,name&limit=20"
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Total returned: {len(data)}")
        for r in data[:10]:
            print(f"[{r.get('id')}] slug='{r.get('slug')}' | name='{r.get('name')}'")
except Exception as e:
    print("Error:", e)
