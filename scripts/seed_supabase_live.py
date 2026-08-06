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
    print("=== LIVE SUPABASE DATA SEEDER (DU LỊCH TRI TÔN) ===")
    env = get_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("ERROR: Supabase URL or Service Role Key missing in .env")
        return

    # Load master json
    master_json_path = "data/tri_ton_master_cleaned.json"
    if not os.path.exists(master_json_path):
        print(f"ERROR: {master_json_path} not found")
        return

    with open(master_json_path, "r", encoding="utf-8") as f:
        places = json.load(f)

    print(f"Loaded {len(places)} master places to seed into Supabase.")

    # Prepare payload for Supabase REST API: POST /rest/v1/places
    rest_url = f"{supabase_url}/rest/v1/places"
    
    payload = []
    for p in places:
        rec_id = p.get("id")
        name = p.get("name", "")
        slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "")
        category = p.get("category", "attractions_nature")
        address = p.get("address", "")
        commune = p.get("commune", "")
        lat = float(p.get("latitude", 0))
        lng = float(p.get("longitude", 0))
        opening_hours = p.get("opening_hours", "07:00 - 18:00")
        ticket_price = p.get("ticket_price", "Miễn phí")
        rating = float(p.get("rating", 4.5))
        review_count = int(p.get("review_count", 100))
        confidence = float(p.get("confidence_score", 95.0))
        desc = p.get("description", "")

        record = {
            "id": rec_id,
            "place_id": p.get("place_id", rec_id),
            "name": name,
            "slug": slug,
            "category": category,
            "tourism_category": category,
            "description": desc,
            "address": address,
            "commune": commune,
            "latitude": lat,
            "longitude": lng,
            "opening_hours": opening_hours,
            "price_level": ticket_price,
            "rating": rating,
            "review_count": review_count,
            "confidence_score": confidence,
            "is_active": True
        }
        payload.append(record)

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(rest_url, data=req_data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"SUPABASE SEED SUCCESS! HTTP Status: {resp.status}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {e.reason}")
        print(f"Details: {err_body}")
        print("\nNOTE: Make sure to execute tourism_crawler/database/schema.sql in Supabase SQL Editor first to create the 'places' table!")

if __name__ == "__main__":
    main()
