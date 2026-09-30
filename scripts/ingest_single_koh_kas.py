import os
import sys
import json
import asyncio
from pathlib import Path
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

TOOL_GGMAP_PATH = Path("E:/Projects/Project_ca_nhan/tool_ggmap")
if str(TOOL_GGMAP_PATH) not in sys.path:
    sys.path.insert(0, str(TOOL_GGMAP_PATH))

from gmaps_crawler.models import CrawlConfig, PhotoCategory
from gmaps_crawler.scraper import crawl_place
import cloudinary
import cloudinary.uploader

ENV_PATH = Path("E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local")
supabase_url = None
service_key = None
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                supabase_url = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                service_key = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("CLOUDINARY_URL="):
                os.environ["CLOUDINARY_URL"] = line.split("=", 1)[1].strip().strip('"').strip("'")

cloudinary.reset_config()

async def fix_koh_kas():
    target_id = "cong-troi-chua-koh-kas"
    slug = "cong-troi-chua-koh-kas"
    name = "Cổng Trời Chùa Koh Kas (Cổng Thời Gian)"
    query = "Cổng Trời Tri Tôn"
    
    config = CrawlConfig(
        limit=3,
        category=PhotoCategory.ALL,
        min_width=800,
        min_height=600,
        output_format="webp",
        quality=85,
        output_dir="E:/Projects/Project_ca_nhan/dulichtriton/output_pilot",
    )
    
    print(f"Crawling {name} with query '{query}'...")
    crawl_res = await crawl_place(query_or_url=query, config=config)
    valid_photos = [ph for ph in crawl_res.place.photos if ph.local_path and Path(ph.local_path).exists()]
    print(f"Found {len(valid_photos)} photos.")
    
    if not valid_photos:
        return
        
    uploaded_photos = []
    for p_idx, ph in enumerate(valid_photos, 1):
        public_id = f"tri_ton_places/{slug}/{slug}_{p_idx:02d}"
        res = cloudinary.uploader.upload(
            str(Path(ph.local_path).resolve()),
            public_id=public_id,
            overwrite=True,
            resource_type="image",
            format="webp"
        )
        c_url = res.get("secure_url")
        uploaded_photos.append({
            "url": c_url,
            "caption": f"Ảnh thực tế {name} (Nguồn: Google Maps)",
            "source": "Google Maps Contributor",
            "width": ph.width,
            "height": ph.height,
        })
        print(f"Uploaded: {c_url}")
        
    hero_url = uploaded_photos[0]["url"]
    
    # Update JSON
    json_path = Path("E:/Projects/Project_ca_nhan/dulichtriton/data/triton_pois_full.json")
    with open(json_path, "r", encoding="utf-8") as f:
        pois = json.load(f)
    for p in pois:
        if p.get("id") == target_id or p.get("slug") == slug:
            p["image_url"] = hero_url
            p["photos"] = [ph["url"] for ph in uploaded_photos]
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)
    print("Updated triton_pois_full.json")
    
    # Update Supabase
    if supabase_url and service_key:
        encoded_id = urllib.parse.quote(target_id)
        url = f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}"
        req = urllib.request.Request(
            url,
            data=json.dumps({"image_url": hero_url, "photos": uploaded_photos}).encode("utf-8"),
            headers={
                "apikey": service_key,
                "Authorization": f"Bearer {service_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            method="PATCH",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("Updated Supabase!")

if __name__ == "__main__":
    import os
    asyncio.run(fix_koh_kas())
