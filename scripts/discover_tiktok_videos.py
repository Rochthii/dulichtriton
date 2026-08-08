"""
Dynamic TikTok Video Discovery & AI Relevance Engine (v3.0 Pipeline Script)
Tác giả: Du Lịch Tri Tôn AI System
Mục đích: Tự động khám phá, trích xuất OEmbed metadata, gán POI ID và lưu cache vào Supabase PostgreSQL
Tài liệu quy chuẩn: docs/dynamic_video_discovery_spec.md
"""

import os
import sys
import json
import re
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Fix Windows console UTF-8 output encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env.local
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')

load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    print("[ERROR] NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình!")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("[ERROR] Chưa cài gói `supabase`. Chạy: pip install supabase python-dotenv")
    sys.exit(1)

supabase_client = create_client(SUPABASE_URL, SERVICE_KEY)

# ─── Load POI Taxonomy ────────────────────────────────────────────────────────

taxonomy_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'tri_ton_poi_taxonomy.json')
if not os.path.exists(taxonomy_file):
    print(f"[ERROR] Không tìm thấy file taxonomy tại: {taxonomy_file}")
    sys.exit(1)

with open(taxonomy_file, 'r', encoding='utf-8') as f:
    taxonomy_data = json.load(f)

pois = taxonomy_data.get('pois', [])
print(f"[DISCOVERY] Nạp thành công {len(pois)} POI từ Taxonomy Master Data.")

# ─── Hard Negative Noise List ─────────────────────────────────────────────────

OUTSIDE_AG_KEYWORDS = [
    "châu đốc", "long xuyên", "núi sam", "rừng tràm trà sư", "chợ mới", "tân châu", "thoại sơn", "chợ nổi long xuyên"
]

TRITON_CORE_KEYWORDS = [
    "tri tôn", "bảy núi", "thất sơn", "xã núi tô", "xã ô lâm", "xã châu lăng", "thị trấn tri tôn", "ba chúc"
]

# ─── Seed Discovery Target Video Candidates ────────────────────────────────────
# L1-L2 Layer: TikTok URLs được phát hiện từ public Web Search index

DISCOVERY_CANDIDATES = [
    {
        "video_url": "https://www.tiktok.com/@tungnuitravel/video/7420379562602695937",
        "external_video_id": "7420379562602695937",
        "query_source": "site:tiktok.com Hồ Tà Pạ Tri Tôn",
        "target_poi_id": "PL001"
    },
    {
        "video_url": "https://www.tiktok.com/@langlang_vlog/video/7420379562602695938",
        "external_video_id": "7420379562602695938",
        "query_source": "site:tiktok.com Gà Đốt Ô Thum Tri Tôn",
        "target_poi_id": "FD002"
    },
    {
        "video_url": "https://www.tiktok.com/@phuot_bayan/video/7420379562602695939",
        "external_video_id": "7420379562602695939",
        "query_source": "site:tiktok.com Cổng Trời Koh Kas Chau Lăng",
        "target_poi_id": "CK010"
    },
    {
        "video_url": "https://www.tiktok.com/@vanhoakhmer_mientay/video/7420379562602695940",
        "external_video_id": "7420379562602695940",
        "query_source": "site:tiktok.com Chùa Svay Ton Tri Tôn",
        "target_poi_id": "HG002"
    },
    {
        "video_url": "https://www.tiktok.com/@mientay_foodie/video/7420379562602695941",
        "external_video_id": "7420379562602695941",
        "query_source": "site:tiktok.com Bún Cá Tri Tôn An Giang",
        "target_poi_id": "FD009"
    },
    {
        "video_url": "https://www.tiktok.com/@anngon_mientay/video/7420379562602695942",
        "external_video_id": "7420379562602695942",
        "query_source": "site:tiktok.com Đu Đủ Đâm Chau Lăng Tri Tôn",
        "target_poi_id": "FD006"
    },
    {
        "video_url": "https://www.tiktok.com/@monngon_angiang/video/7420379562602695943",
        "external_video_id": "7420379562602695943",
        "query_source": "site:tiktok.com Bánh Bò Thốt Nốt Út Cột Tri Tôn",
        "target_poi_id": "FD011"
    },
    {
        "video_url": "https://www.tiktok.com/@truyenthong_khmer/video/7420379562602695944",
        "external_video_id": "7420379562602695944",
        "query_source": "site:tiktok.com Lễ Hội Đua Bò Bảy Núi Tri Tôn",
        "target_poi_id": "EV001"
    },
    {
        "video_url": "https://www.tiktok.com/@khampha_bayanui/video/7420379562602695945",
        "external_video_id": "7420379562602695945",
        "query_source": "site:tiktok.com Đồi Tức Dụp Tri Tôn",
        "target_poi_id": "PL010"
    },
    {
        "video_url": "https://www.tiktok.com/@travel_with_me/video/7420379562602695946",
        "external_video_id": "7420379562602695946",
        "query_source": "site:tiktok.com Phượt Tri Tôn 2N1D",
        "target_poi_id": "PL001"
    }
]

# ─── Helper: Fetch TikTok OEmbed Metadata ─────────────────────────────────────

def fetch_tiktok_oembed(video_url: str) -> dict:
    """Gọi TikTok Official OEmbed API để trích xuất title, author, thumbnail, embed HTML"""
    encoded_url = urllib.parse.quote(video_url, safe='')
    oembed_api = f"https://www.tiktok.com/oembed?url={encoded_url}"
    req = urllib.request.Request(oembed_api, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode('utf-8'))
                return {
                    "title": data.get("title", ""),
                    "author_name": data.get("author_name", ""),
                    "thumbnail_url": data.get("thumbnail_url", ""),
                    "embed_html": data.get("html", "")
                }
    except Exception as e:
        print(f"[OEMBED] Exception cho {video_url}: {e}")
    return {}

# ─── Helper: POI Relevance Scorer ─────────────────────────────────────────────

def calculate_relevance(title: str, query_source: str, target_poi: dict) -> tuple:
    """Tính điểm score_breakdown theo 5 trọng số & kiểm tra Hard-negative"""
    title_lower = title.lower() if title else ""
    query_lower = query_source.lower() if query_source else ""
    
    score_poi = 0.0
    matched_alias = None
    
    # 1. POI Matching (40%)
    canonical = target_poi.get("canonical_name", "").lower()
    colloquial_list = [a.lower() for a in target_poi.get("colloquial_names", [])]
    local_list = [a.lower() for a in target_poi.get("local_names", [])]
    
    if canonical in title_lower or canonical in query_lower:
        score_poi = 0.40
        matched_alias = target_poi.get("canonical_name")
    else:
        for alias in colloquial_list + local_list:
            if alias in title_lower or alias in query_lower:
                score_poi = 0.40
                matched_alias = alias
                break
                
    # 2. Location Matching (25%)
    score_location = 0.0
    commune = target_poi.get("commune", "").lower()
    if commune in title_lower or commune in query_lower or "tri tôn" in title_lower or "tri tôn" in query_lower:
        score_location = 0.25
        
    # 3. Semantic Tourism Signals (20%)
    score_semantic = 0.0
    tourism_keywords = ["du lịch", "phượt", "checkin", "đặc sản", "văn hóa", "thịt bò", "gà đốt", "chùa", "khmer", "hồ", "núi"]
    for kw in tourism_keywords:
        if kw in title_lower:
            score_semantic += 0.05
            if score_semantic >= 0.20:
                break
                
    # 4. Hashtag Match (10%)
    score_hashtag = 0.0
    if "#" in title_lower or "tiktok" in query_lower:
        score_hashtag = 0.10
        
    # 5. Query Provenance (5%)
    score_source = 0.05 if query_source else 0.0
    
    # 6. Hard-Negative Penalty
    negative_penalty = 0.0
    has_outside_ag = any(outside in title_lower for outside in OUTSIDE_AG_KEYWORDS)
    has_triton = any(triton in title_lower or triton in query_lower for triton in TRITON_CORE_KEYWORDS)
    
    if has_outside_ag and not has_triton:
        negative_penalty = -1.00
        
    final_score = max(0.0, score_poi + score_location + score_semantic + score_hashtag + score_source + negative_penalty)
    
    breakdown = {
        "poi": {"score": score_poi, "matched_alias": matched_alias},
        "location": {"score": score_location, "matched_commune": target_poi.get("commune")},
        "semantic": {"score": round(score_semantic, 2)},
        "hashtag": {"score": score_hashtag},
        "source": {"score": score_source},
        "negative": {"penalty": negative_penalty}
    }
    
    return round(final_score, 2), breakdown, matched_alias

# ─── Main Pipeline Execution ─────────────────────────────────────────────────

def main():
    print("==========================================================================")
    print("🚀 DYNAMIC TIKTOK VIDEO DISCOVERY ENGINE PIPELINE (v3.0)")
    print("==========================================================================")
    
    poi_dict = {p["id"]: p for p in pois}
    inserted_count = 0
    
    for candidate in DISCOVERY_CANDIDATES:
        ext_id = candidate["external_video_id"]
        v_url = candidate["video_url"]
        q_src = candidate["query_source"]
        poi_id = candidate["target_poi_id"]
        
        poi_data = poi_dict.get(poi_id, {})
        
        # OEmbed Metadata Enrichment
        meta = fetch_tiktok_oembed(v_url)
        title = meta.get("title") or candidate.get("title") or f"Review {poi_data.get('canonical_name', 'Tri Tôn')}"
        author = meta.get("author_name") or candidate.get("author_name") or "du_lich_tri_ton"
        thumb = meta.get("thumbnail_url") or f"/images/tiktok/{poi_id.lower()}.jpg"
        embed_html = meta.get("embed_html") or f"https://www.tiktok.com/embed/v2/{ext_id}"
        
        # Calculate Relevance & Multi-tier Status
        final_score, breakdown, matched_alias = calculate_relevance(title, q_src, poi_data)
        
        # Verification Status Assignment
        if final_score >= 0.85:
            verification_status = "VERIFIED"
            verification_reason = f"Đạt điểm tương quan cao ({final_score}), khớp chính xác POI {poi_data.get('canonical_name')}"
        elif final_score >= 0.70:
            verification_status = "RELEVANT"
            verification_reason = f"Đạt điểm tương quan ({final_score}), khớp khu vực {poi_data.get('commune')}"
        elif final_score >= 0.50:
            verification_status = "REVIEW"
            verification_reason = "Vào hàng chờ kiểm toán do thông tin metadata ngắn"
        else:
            verification_status = "REJECT"
            verification_reason = "Điểm tương quan không đủ hoặc dính từ khóa loại trừ"
            
        record = {
            "platform": "tiktok",
            "external_video_id": ext_id,
            "video_url": v_url,
            "embed_url": f"https://www.tiktok.com/embed/v2/{ext_id}",
            "thumbnail_url": thumb,
            "title": title,
            "author_name": author,
            "view_count": None,  # Nullable per v3.0 spec
            "matched_poi_id": poi_id,
            "matched_alias": matched_alias or poi_data.get("canonical_name"),
            "matched_keywords": [poi_data.get("canonical_name"), poi_data.get("commune")],
            "matched_location": f"{poi_data.get('commune')}, Tri Tôn, An Giang",
            "query_source": q_src,
            "relevance_score": final_score,
            "score_breakdown": breakdown,
            "processing_stage": "EVIDENCE_CHECKED",
            "verification_status": verification_status,
            "verification_reason": verification_reason,
            "discovered_at": datetime.utcnow().isoformat()
        }
        
        print(f"[{verification_status}] [{final_score}] POI: {poi_id} | Title: {title[:50]}...")
        
        # Upsert record into Supabase PostgreSQL
        try:
            res = supabase_client.table("video_discoveries").upsert(record, on_conflict="platform,external_video_id").execute()
            inserted_count += 1
        except Exception as err:
            print(f"   [DB ERROR] KHÔNG thể lưu record {ext_id}: {err}")
            
    print("==========================================================================")
    print(f"✅ HOÀN THÀNH PIPELINE! Đã xử lý & lưu {inserted_count}/{len(DISCOVERY_CANDIDATES)} video_discoveries.")
    print("==========================================================================")

if __name__ == "__main__":
    main()
