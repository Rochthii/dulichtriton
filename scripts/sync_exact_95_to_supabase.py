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
    print("=== EXACT 95 CANONICAL PLACES SYNC TO SUPABASE LIVE ===")
    env = get_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("ERROR: Supabase URL or Service Role Key missing in .env")
        return

    # Load master json
    master_json_path = "data/tri_ton_master_cleaned.json"
    with open(master_json_path, "r", encoding="utf-8") as f:
        places = json.load(f)

    clean_ids = set(p["id"] for p in places)
    print(f"Clean Canonical Local Dataset: {len(clean_ids)} places.")

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json"
    }

    # 1. Fetch current IDs in Supabase DB
    get_url = f"{supabase_url}/rest/v1/places?select=id"
    req_get = urllib.request.Request(get_url, headers=headers, method="GET")
    
    with urllib.request.urlopen(req_get) as resp:
        db_records = json.loads(resp.read().decode("utf-8"))
        db_ids = set(r["id"] for r in db_records)

    print(f"Current DB Total Records: {len(db_ids)}")

    # Obsolete IDs to purge from DB
    obsolete_ids = list(db_ids - clean_ids)
    if obsolete_ids:
        print(f"Purging {len(obsolete_ids)} obsolete/duplicate records from DB...")
        # Chunk delete requests if necessary
        chunk_size = 30
        for i in range(0, len(obsolete_ids), chunk_size):
            chunk = obsolete_ids[i:i+chunk_size]
            del_url = f"{supabase_url}/rest/v1/places?id=in.({','.join(chunk)})"
            req_del = urllib.request.Request(del_url, headers=headers, method="DELETE")
            with urllib.request.urlopen(req_del) as resp_del:
                pass
        print("Obsolete records purged cleanly.")

    # 2. Upsert 95 clean places payload
    rest_url = f"{supabase_url}/rest/v1/places?on_conflict=id"
    payload = []
    for p in places:
        rec_id = p.get("id")
        name = p.get("name", "")
        base_slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-")
        slug = f"{base_slug}-{rec_id.lower()}"
        category = p.get("category", "Attractions & Nature")
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
            "image_url": p.get("image_url", ""),
            "video_url": p.get("video_url", ""),
            "photos": p.get("photos", []),
            "aliases": p.get("aliases", []),
            "data_flags": p.get("data_flags", []),
            "is_hot": p.get("is_hot", False),
            "hot_rank": p.get("hot_rank", 99),
            "golden_time_windows": p.get("golden_time_windows", []),
            "hot_score": p.get("hot_score", 0),
            "is_active": True
        }
        payload.append(record)

    req_data = json.dumps(payload).encode("utf-8")
    headers["Prefer"] = "resolution=merge-duplicates"
    req_post = urllib.request.Request(rest_url, data=req_data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req_post) as resp_post:
            print(f"UPSERT SUCCESS! HTTP Status: {resp_post.status}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        print("Details:", e.read().decode("utf-8"))

    print("=== EXACT SYNC FINISHED ===")

if __name__ == "__main__":
    main()
