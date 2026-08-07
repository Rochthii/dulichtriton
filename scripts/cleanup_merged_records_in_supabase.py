import os
import json
import urllib.request
import urllib.error
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_env():
    env_vars = {}
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

def main():
    print("=== CLEANING UP MERGED DUPLICATES IN SUPABASE LIVE ===")
    env = get_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("ERROR: Supabase URL or Service Role Key missing in .env")
        return

    merged_ids = ["TT_095", "TT_096", "TT_097", "TT_098", "TT_099", "TT_092", "TT_093", "TT_094", "TT_084", "TT_102", "TT_106"]
    ids_param = ",".join(merged_ids)
    
    delete_url = f"{supabase_url}/rest/v1/places?id=in.({ids_param})"
    
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json"
    }

    req = urllib.request.Request(delete_url, headers=headers, method="DELETE")

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"DELETED MERGED RECORDS SUCCESS! HTTP Status: {resp.status}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {e.reason}")
        print(f"Details: {err_body}")

if __name__ == "__main__":
    main()
