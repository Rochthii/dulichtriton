import os
import json
import urllib.request
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_env():
    env_vars = {}
    for f in [".env", ".env.local"]:
        if os.path.exists(f):
            with open(f, "r", encoding="utf-8") as file:
                for line in file:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip()
    return env_vars

env = get_env()
url = env.get("NEXT_PUBLIC_SUPABASE_URL")
key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Test phrase search for Tà Pạ
query_term = urllib.parse.quote("%Tà Pạ%")
req_url = f"{url}/rest/v1/places?select=id,name,commune,category&name=ilike.{query_term}&limit=5"
req = urllib.request.Request(req_url, headers={"apikey": key, "Authorization": f"Bearer {key}"})

try:
    with urllib.request.urlopen(req) as resp:
        print("=== MATCHES FOR Tà Pạ ===")
        print(resp.read().decode('utf-8'))
except Exception as e:
    print(e)
