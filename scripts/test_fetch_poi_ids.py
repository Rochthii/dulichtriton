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

test_ids = ["PL001", "CK002", "FD006", "CK010", "CK001", "PL004", "HG005", "PL010", "FD009", "FD016", "FD017", "CF012", "PL009", "PL014", "PL020", "HG002", "HG001", "PL021"]
ids_str = ",".join(test_ids)
req_url = f"{url}/rest/v1/places?select=id,name,commune,category&id=in.({ids_str})"
req = urllib.request.Request(req_url, headers={"apikey": key, "Authorization": f"Bearer {key}"})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Successfully fetched {len(data)} / {len(test_ids)} target POIs from Supabase:")
        found_ids = [p["id"] for p in data]
        print("Found IDs:", found_ids)
        missing = set(test_ids) - set(found_ids)
        if missing:
            print("Missing IDs:", missing)
except Exception as e:
    print(e)
