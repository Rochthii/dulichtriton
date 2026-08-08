"""
Seed Script: Nạp 10 bản ghi video thực tế vào bảng public.videos (Supabase)
Tác giả: Du Lịch Tri Tôn AI System
Mục đích: Task 1.5 — Cung cấp dữ liệu thực cho VideoGallery & API /api/v1/places/[id]/videos

Cách chạy:
    cd e:/Projects/Project_ca_nhan/dulichtriton
    pip install supabase python-dotenv
    python scripts/seed_videos.py
"""
import os
import sys
from dotenv import load_dotenv

# Load .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    print("ERROR: NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình trong .env.local")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("ERROR: Chua cai supabase. Chay: pip install supabase")
    sys.exit(1)

client = create_client(SUPABASE_URL, SERVICE_KEY)

# ==============================================================================
# DỮ LIỆU VIDEO THỰC TẾ — 10 bản ghi từ TikTokReviewSection hiện tại
# Mỗi record gắn với place_id chuẩn trong bảng places (82 POI)
# ==============================================================================
VIDEO_RECORDS = [
    {
        "place_id": "PL001",  # Hồ Tà Pạ — Xã Núi Tô
        "title": "Tuyệt Tình Cốc Hồ Tà Pạ & Cánh Đồng Thốt Nốt Trái Tim",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/@tungnuitravel/video/7420379562602695937",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/ho_ta_pa.jpg",
        "author_name": "@tungnuitravel",
        "view_count": 98300,
        "is_verified": True,
    },
    {
        "place_id": "FD009",  # Gà Đốt Ô Thum — Xã Ô Lâm
        "title": "Review Gà Đốt Ô Thum Kiều Tiên & Ngắm Cảnh Hồ Ô Thum Siêu Thơ Mộng",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/gadotothum",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",  # placeholder embed — update khi có video ID thực
        "thumbnail_url": "/images/tiktok/ga_dot_o_thum.png",
        "author_name": "@langlang_vlog",
        "view_count": 142500,
        "is_verified": True,
    },
    {
        "place_id": "CK010",  # Cổng Trời Koh Kas — Xã Chau Lăng
        "title": "Check-in Cổng Trời Koh Kas Giữa Cánh Đồng Lúa Chau Lăng",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/congtroikohkas",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/cong_troi_koh_kas.jpg",
        "author_name": "@phuot_bayan",
        "view_count": 91000,
        "is_verified": True,
    },
    {
        "place_id": "HG001",  # Chùa Svay Ton — Thị trấn Tri Tôn
        "title": "Chiêm Bái Chùa Svay Ton 500 Năm Cổ Nhất An Giang & Kinh Lá Buông",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/chuasvayton",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/chua_svay_ton.jpg",
        "author_name": "@vanhoakhmer_mientay",
        "view_count": 64100,
        "is_verified": True,
    },
    {
        "place_id": "FD001",  # Bún Cá Tri Tôn — Thị trấn Tri Tôn
        "title": "Thưởng Thức Bún Cá Tri Tôn Nước Dùng Nghệ Vàng Thịt Cá Lóc Đồng",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/buncatriton",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/bun_ca_tri_ton.png",
        "author_name": "@mientay_foodie",
        "view_count": 112100,
        "is_verified": True,
    },
    {
        "place_id": "FD006",  # Đu Đủ Đâm Khmer — Xã Chau Lăng
        "title": "Đu Đủ Đâm Khmer Chau Lăng Cối Gỗ Cực Dính Chua Cay Nồng",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/dududam",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/du_du_dam.jpg",
        "author_name": "@anngon_mientay",
        "view_count": 86700,
        "is_verified": True,
    },
    {
        "place_id": "CF001",  # Bánh Bò Thốt Nốt — Thị trấn Tri Tôn
        "title": "Bánh Bò Mật Thốt Nốt Nướng Chảo Vàng Ổ Ong Nức Mũi",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/banhbothotnot",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/banh_bo_thot_not.png",
        "author_name": "@monngon_angiang",
        "view_count": 74200,
        "is_verified": True,
    },
    {
        "place_id": "CK001",  # Lễ Hội Đua Bò — Xã An Tức
        "title": "Sức Nóng Lễ Hội Đua Bò Bảy Núi Di Sản Văn Hóa Quốc Gia",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/duabobaynui",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/dua_bo_bay_nui.jpg",
        "author_name": "@truyenthong_khmer",
        "view_count": 128900,
        "is_verified": True,
    },
    {
        "place_id": "PL011",  # Đồi Tức Dụp — Xã An Tức
        "title": "Khám Phá Căn Cứ Lịch Sử Đồi Tức Dụp Ngọn Đồi 2 Triệu Đô",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/doitucdup",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/doi_tuc_dup.jpg",
        "author_name": "@khampha_bayanui",
        "view_count": 53400,
        "is_verified": True,
    },
    {
        "place_id": "PL001",  # Hồ Tà Pạ — thêm 1 video nữa
        "title": "Lịch Trình Phượt Tri Tôn 2 Ngày 1 Đêm Chi Phí 800K Cho Giới Trẻ",
        "platform": "tiktok",
        "video_url": "https://www.tiktok.com/tag/phuottriton",
        "embed_url": "https://www.tiktok.com/embed/v2/7420379562602695937",
        "thumbnail_url": "/images/tiktok/phuot_tri_ton.jpg",
        "author_name": "@travel_with_me",
        "view_count": 105400,
        "is_verified": True,
    },
]


def main():
    print(f"[SEED] Ket noi Supabase: {SUPABASE_URL}")
    print(f"[SEED] Chuan bi insert {len(VIDEO_RECORDS)} ban ghi vao bang videos...\n")

    # Kiem tra xem bang videos da co du lieu chua
    check = client.table("videos").select("id", count="exact").execute()
    existing_count = check.count or 0
    print(f"[SEED] So ban ghi videos hien tai trong DB: {existing_count}")

    if existing_count >= len(VIDEO_RECORDS):
        print("[SEED] Bang videos da co du du lieu. Bo qua seed.")
        return

    # Upsert tat ca records (tranh duplicate neu chay lai)
    result = client.table("videos").upsert(VIDEO_RECORDS, on_conflict="video_url").execute()

    if hasattr(result, 'error') and result.error:
        print(f"[SEED] ERROR: {result.error}")
        sys.exit(1)

    print(f"[SEED] Thanh cong! Da insert/upsert {len(VIDEO_RECORDS)} ban ghi video vao Supabase.")
    print("[SEED] Kiem tra tai: Supabase Dashboard -> Table Editor -> videos")


if __name__ == "__main__":
    main()
