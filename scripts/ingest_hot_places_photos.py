"""
Ingestion Pipeline: Crawl Real Master Photos from Google Maps -> Cloudinary -> Supabase & JSON
Exclusively for Top HOT Landmarks of Tri Tôn, An Giang.
"""

import os
import sys
import json
import asyncio
import urllib.request
import urllib.parse
from pathlib import Path
from typing import List, Dict, Any

# Line buffering for real-time console streaming
sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)

# Add tool_ggmap directory to sys.path
TOOL_GGMAP_PATH = Path("E:/Projects/Project_ca_nhan/tool_ggmap")
if str(TOOL_GGMAP_PATH) not in sys.path:
    sys.path.insert(0, str(TOOL_GGMAP_PATH))

from gmaps_crawler.models import CrawlConfig, PhotoCategory
from gmaps_crawler.scraper import crawl_place

import cloudinary
import cloudinary.uploader

# Load Environment Variables from frontend/.env.local
ENV_PATH = Path("E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local")
supabase_url = None
service_key = None
cloudinary_url = None

if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                supabase_url = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
                service_key = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("CLOUDINARY_URL="):
                cloudinary_url = line.split("=", 1)[1].strip().strip('"').strip("'")

# Configure Cloudinary
if cloudinary_url:
    os.environ["CLOUDINARY_URL"] = cloudinary_url
    cloudinary.reset_config()
else:
    cloudinary.config(
        cloud_name="dhjesnejt",
        api_key="712885848517628",
        api_secret="6SU_LhoSAwD0x_LU8R9QCd-HPVI",
        secure=True,
    )

# Top 10 HOT Pilot Landmarks of Tri Tôn
PILOT_PLACES = [
    {
        "id": "ho-ta-pa",
        "slug": "ho-ta-pa",
        "name": "Hồ Tà Pạ (Tuyệt Tình Cốc Bảy Núi)",
        "query": "Hồ Tà Pạ Tri Tôn An Giang",
    },
    {
        "id": "ho-o-thum",
        "slug": "ho-o-thum",
        "name": "Hồ Ô Thum",
        "query": "Hồ Ô Thum Tri Tôn An Giang",
    },
    {
        "id": "ga-dot-thao-nguyen-ho-o-thum",
        "slug": "ga-dot-thao-nguyen-ho-o-thum",
        "name": "Gà đốt Thảo Nguyên Hồ Ô Thum",
        "query": "Gà Đốt Thảo Nguyên Ô Thum",
    },
    {
        "id": "2f0b8880-quán-bún-nước-lèo-tr",
        "slug": "quan-bun-ca-cu-ngai-di-dom",
        "name": "Quán Bún Cá Củ Ngải Dì Dom (Y Dom)",
        "query": "Bún Cá Y Dom Tri Tôn",
    },
    {
        "id": "chua-xa-ton-chua-svayton",
        "slug": "chua-xa-ton-chua-svayton",
        "name": "Chùa Xà Tón (Chùa Svayton)",
        "query": "Chùa Xà Tón Tri Tôn",
    },
    {
        "id": "chua-ta-pa",
        "slug": "chua-ta-pa",
        "name": "Chùa Tà Pạ (Chùa Chưn-Kôm Núi Tô)",
        "query": "Chùa Tà Pạ Núi Tô Tri Tôn",
    },
    {
        "id": "cong-troi-chua-koh-kas",
        "slug": "cong-troi-chua-koh-kas",
        "name": "Cổng Trời Chùa Koh Kas (Cổng Thời Gian)",
        "query": "Cổng Trời Chùa Koh Kas",
    },
    {
        "id": "cay-thot-not-trai-tim",
        "slug": "cay-thot-not-trai-tim",
        "name": "Hàng Thốt Nốt Trái Tim Ô Lâm",
        "query": "Cây thốt nốt trái tim Ô Lâm",
    },
    {
        "id": "doi-tuc-dup",
        "slug": "doi-tuc-dup",
        "name": "Khu Di Tích Lịch Sử Đồi Tức Dụp",
        "query": "Khu Du Lịch Đồi Tức Dụp",
    },
    {
        "id": "nha-mo-ba-chuc",
        "slug": "nha-mo-ba-chuc",
        "name": "Khu Chứng Tích Lịch Sử Nhà Mồ Ba Chúc",
        "query": "Khu Chứng Tích Nhà Mồ Ba Chúc",
    },
]


def upload_image_to_cloudinary(local_path: str, slug: str, photo_index: int) -> str:
    """Upload một file ảnh WebP lên Cloudinary và trả về URL tối ưu."""
    resolved_path = str(Path(local_path).resolve())
    public_id = f"tri_ton_places/{slug}/{slug}_{photo_index:02d}"
    res = cloudinary.uploader.upload(
        resolved_path,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
        format="webp",
    )
    sec_url = res.get("secure_url")
    return sec_url


def update_supabase_place(place_id: str, hero_url: str, photos: List[Dict[str, Any]]) -> bool:
    """Cập nhật image_url và photos lên bảng places trên Supabase."""
    if not supabase_url or not service_key:
        print("  ⚠️ Không tìm thấy Supabase credentials để cập nhật bảng places.", flush=True)
        return False
        
    encoded_id = urllib.parse.quote(place_id)
    url = f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}"
    
    payload = {
        "image_url": hero_url,
        "photos": photos,
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        method="PATCH",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return len(data) > 0
    except Exception as e:
        print(f"  ❌ Lỗi cập nhật Supabase cho [{place_id}]: {e}", flush=True)
        return False


async def run_pilot_ingestion():
    print("=" * 80, flush=True)
    print("🚀 BẮT ĐẦU INGESTION: CÀO ẢNH MASTER GG MAPS -> CLOUDINARY -> DULICHTRITON", flush=True)
    print(f"📌 Tổng số địa điểm thử nghiệm: {len(PILOT_PLACES)} địa điểm HOT", flush=True)
    print("=" * 80 + "\n", flush=True)

    # Load master JSON
    json_path = Path("E:/Projects/Project_ca_nhan/dulichtriton/data/triton_pois_full.json")
    with open(json_path, "r", encoding="utf-8") as f:
        pois = json.load(f)
    pois_by_id = {p.get("id"): p for p in pois}
    pois_by_slug = {p.get("slug"): p for p in pois if p.get("slug")}

    # Cấu hình crawler
    output_dir = Path("E:/Projects/Project_ca_nhan/dulichtriton/output_pilot")
    config = CrawlConfig(
        limit=3,  # Lấy 3 ảnh Master xuất sắc nhất mỗi điểm
        category=PhotoCategory.ALL,
        min_width=800,
        min_height=600,
        min_aspect_ratio=0.55,
        max_aspect_ratio=2.50,
        min_sharpness_score=35.0,
        deduplicate=True,
        output_format="webp",
        quality=85,
        output_dir=str(output_dir),
        timeout=15.0,
    )

    results_summary = []

    for idx, item in enumerate(PILOT_PLACES, 1):
        target_id = item["id"]
        slug = item["slug"]
        name = item["name"]
        query = item["query"]

        print(f"\n[{idx}/{len(PILOT_PLACES)}] Đang xử lý: {name}", flush=True)
        print(f"  • Từ khóa Maps: '{query}'", flush=True)

        try:
            # 1. Cào ảnh thực tế từ Google Maps
            crawl_res = await crawl_place(
                query_or_url=query,
                config=config,
                progress_callback=lambda msg: print(f"    - {msg}", flush=True),
            )

            valid_photos = [ph for ph in crawl_res.place.photos if ph.local_path and Path(ph.local_path).exists()]
            print(f"  ✔ Đã cào & lọc thành công: {len(valid_photos)} ảnh WebP Master.", flush=True)

            if not valid_photos:
                print(f"  ⚠️ Không có ảnh nào đạt chuẩn cho {name}, bỏ qua.", flush=True)
                continue

            # 2. Upload các ảnh lên Cloudinary
            print("  ☁ Đang upload ảnh lên Cloudinary...", flush=True)
            uploaded_photos = []
            for p_idx, ph in enumerate(valid_photos, 1):
                try:
                    c_url = upload_image_to_cloudinary(ph.local_path, slug, p_idx)
                    uploaded_photos.append({
                        "url": c_url,
                        "caption": f"Ảnh thực tế {name} (Nguồn: Google Maps)",
                        "source": "Google Maps Contributor",
                        "width": ph.width,
                        "height": ph.height,
                        "sharpness": ph.sharpness_score,
                    })
                    print(f"    + Ảnh #{p_idx}: {c_url}", flush=True)
                except Exception as ex:
                    print(f"    ❌ Lỗi upload Cloudinary ảnh #{p_idx}: {ex}", flush=True)

            if not uploaded_photos:
                continue

            hero_image_url = uploaded_photos[0]["url"]

            # 3. Cập nhật vào Master JSON triton_pois_full.json
            matched_poi = pois_by_id.get(target_id) or pois_by_slug.get(slug)
            if matched_poi:
                matched_poi["image_url"] = hero_image_url
                matched_poi["photos"] = [p["url"] for p in uploaded_photos]
                print(f"  ✔ Đã cập nhật triton_pois_full.json (Hero + {len(uploaded_photos)} photos).", flush=True)

            # 4. Cập nhật trực tiếp lên Supabase
            sb_success = update_supabase_place(target_id, hero_image_url, uploaded_photos)
            if sb_success:
                print(f"  ✔ Đã đồng bộ thành công lên Supabase 'places'!", flush=True)
            else:
                print(f"  ⚠️ Cập nhật Supabase thất bại hoặc ID không khớp.", flush=True)

            results_summary.append({
                "name": name,
                "id": target_id,
                "hero_url": hero_image_url,
                "photo_count": len(uploaded_photos),
                "supabase_updated": sb_success,
            })

        except Exception as e:
            print(f"  ❌ Lỗi xử lý địa điểm {name}: {e}", flush=True)

    # Lưu lại file Master JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(pois, f, ensure_ascii=False, indent=2)
        
    print("\n" + "=" * 80, flush=True)
    print("🎉 HOÀN TẤT ĐỢT THÍ NGHIỆM INGESTION 10 ĐỊA ĐIỂM HOT TRI TÔN!", flush=True)
    print(f"✔ Đã ghi đè dữ liệu mới vào: {json_path}")
    print("=" * 80 + "\n", flush=True)


if __name__ == "__main__":
    asyncio.run(run_pilot_ingestion())
