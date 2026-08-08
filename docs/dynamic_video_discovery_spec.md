# Dynamic TikTok Video Discovery & AI Relevance Engine (v3.0 Spec)

## 📌 Tổng Quan Hệ Thống

Hệ thống **Dynamic TikTok Video Discovery via Search-Indexed Public Content** là giải pháp tự động phát hiện, trích xuất metadata, phân loại thực thể (POI Entity Matching), chấm điểm độ tương quan (Relevance Scoring) và cung cấp video review TikTok du lịch Tri Tôn, An Giang thông qua dữ liệu web công khai mà **KHÔNG cần nhập cứng URL thủ công** vào cơ sở dữ liệu Master.

---

## 🏗️ Kiến Trúc Phân Tầng 5 Lớp (5-Layer Architecture)

```text
 ┌──────────────────────────────────────────────────────────────────────────┐
 │ 1. DISCOVERY LAYER      : Google CSE / Bing Search (site:tiktok.com)     │
 ├──────────────────────────────────────────────────────────────────────────┤
 │ 2. METADATA ENRICHMENT  : Official TikTok OEmbed API (/oembed?url=...)   │
 ├──────────────────────────────────────────────────────────────────────────┤
 │ 3. AI ENTITY & RELEVANCE: Multi-tier Taxonomy Matcher + Score Breakdown  │
 ├──────────────────────────────────────────────────────────────────────────┤
 │ 4. CACHE & INDEX LAYER  : PostgreSQL Supabase (table: video_discoveries) │
 ├──────────────────────────────────────────────────────────────────────────┤
 │ 5. PRESENTATION LAYER   : Next.js API Proxy + Official TikTok Embed UI   │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Luồng Vận Hành 6 Tầng Trạng Thái (6-Step Lifecycle)

```text
  DISCOVERED ────────► ENRICHED ────────► SCORED ────────► MATCHED ────────► EVIDENCE_CHECKED
 (Tìm thấy URL)      (OEmbed Metadata)  (Tính toán Score) (Khớp POI ID)     (Kiểm toán Bằng chứng)
                                                                                  │
                                                                                  ▼
  TRẠNG THÁI PHÊ DUYỆT (verification_status):                           PENDING / RELEVANT / VERIFIED
                                                                            / REVIEW / REJECT
```

---

## 📊 Ma Trận Trọng Số Relevance Score & Quy Tắc Khử Nhiễu Cứng

$$\text{Relevance Score} = (\text{POI} \times 0.40) + (\text{LOC} \times 0.25) + (\text{SEM} \times 0.20) + (\text{TAG} \times 0.10) + (\text{SRC} \times 0.05)$$

### Quy tắc phạt cứng (Hard-Negative Penalty)
- Trừ **-1.00 điểm (REJECT)** nếu tiêu đề/metadata chứa các địa danh An Giang ngoài Tri Tôn (*Châu Đốc, Long Xuyên, Núi Sam, Rừng tràm Trà Sư, Chợ Mới*) mà **KHÔNG CHỨA** bất kỳ tín hiệu địa danh nào thuộc Tri Tôn hoặc 95 POI Master.

---

## 🗄️ Cấu Trúc Bảng CSDL PostgreSQL (`video_discoveries`)

```sql
CREATE TABLE public.video_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(30) DEFAULT 'tiktok',
    external_video_id VARCHAR(100) NOT NULL,
    video_url TEXT NOT NULL,
    embed_url TEXT,
    thumbnail_url TEXT,
    title TEXT,
    author_name VARCHAR(100),
    
    -- Metrics dạng NULLable (OEmbed không cấp metrics -> Không dùng Default 0)
    view_count BIGINT NULL,
    like_count BIGINT NULL,
    comment_count BIGINT NULL,
    share_count BIGINT NULL,
    
    -- POI Matching & Evidence Audit
    matched_poi_id VARCHAR(50) REFERENCES public.places(id) ON DELETE SET NULL,
    matched_alias TEXT,
    matched_keywords TEXT[],
    matched_location TEXT,
    query_source TEXT,
    
    -- Detailed Score Breakdown (Explainable AI)
    relevance_score NUMERIC(3,2) NOT NULL,
    score_breakdown JSONB NOT NULL,
    
    -- Processing Lifecycle & Verification Status
    processing_stage VARCHAR(30) DEFAULT 'DISCOVERED',
    verification_status VARCHAR(30) DEFAULT 'PENDING',
    verification_reason TEXT,
    evidence_urls TEXT[],
    
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    
    CONSTRAINT unq_platform_video UNIQUE(platform, external_video_id)
);

CREATE INDEX idx_vid_disc_poi ON public.video_discoveries(matched_poi_id);
CREATE INDEX idx_vid_disc_status ON public.video_discoveries(verification_status);
CREATE INDEX idx_vid_disc_score ON public.video_discoveries(relevance_score DESC);
```

---

## 🚀 Lộ Trình Triển Khai Thực Tế

1. **STEP 1**: Audit toàn bộ 95 POI Master Data (`tri_ton_master_cleaned.csv`) — ✅ Complete
2. **STEP 2**: Xây dựng Taxonomy & Phân loại 6 Nhóm (`data/tri_ton_poi_taxonomy.json`) — ✅ Complete
3. **STEP 3**: Strict Aliases & Dictionary Mapping — ✅ Complete
4. **STEP 4**: Dynamic Query Generation Strategy — ✅ Complete
5. **STEP 5**: Đóng gói Tài liệu Quy chuẩn Kiến trúc (`docs/dynamic_video_discovery_spec.md`) — ✅ Complete
6. **STEP 6**: Database Schema Migration (`video_discoveries` table SQL)
7. **STEP 7**: Discovery Engine Pipeline (`scripts/discover_tiktok_videos.py`)
