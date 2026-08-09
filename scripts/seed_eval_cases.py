import os
import json
import urllib.request
import urllib.error
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_env():
    env_vars = {}
    for env_file in [".env", ".env.local"]:
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip()
    return env_vars

def main():
    print("=== SEED GOLDEN EVAL CASES TO SUPABASE ===")
    env = get_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("ERROR: Supabase URL or Service Role Key missing in .env / .env.local")
        sys.exit(1)

    jsonl_path = "tests/eval/golden_dataset.jsonl"
    if not os.path.exists(jsonl_path):
        print(f"ERROR: {jsonl_path} not found")
        sys.exit(1)

    records = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                item = json.loads(line.strip())
                records.append({
                    "id": item["id"],
                    "query": item["q"],
                    "intent": item["intent"],
                    "target_pois": item.get("pois", []),
                    "mandatory_facts": item.get("facts", []),
                    "forbidden_phrases": item.get("forbid", []),
                    "difficulty": item.get("diff", "medium"),
                    "test_type": item["type"]
                })

    print(f"Loaded {len(records)} test cases to seed.")

    rest_url = f"{supabase_url}/rest/v1/eval_cases?on_conflict=id"
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    req_data = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(rest_url, data=req_data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"✅ EVAL CASES SEEDED SUCCESSFULLY! HTTP Status: {resp.status}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"❌ HTTP Error {e.code}: {e.reason} - {err_body}")
        sys.exit(1)

if __name__ == "__main__":
    main()
