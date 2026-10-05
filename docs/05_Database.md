# 05. CƠ SỞ DỮ LIỆU & QUẢN TRỊ DỮ LIỆU (DATABASE DESIGN & DATA GOVERNANCE)

> **Mã quy chuẩn tài liệu:** `DOC-DB-SPEC-001`  
> **Căn cứ quyết định:** [Decision Gate G1 (Glossary Địa Giới 15 Xã)](../docs/technical-spec/COMMUNE_LABELS_INVENTORY.md) · [Decision Gate G2 (Canonical Dataset Manifest)](../docs/technical-spec/CANONICAL_DATASET_MANIFEST.md) · [RLS Lockdown Matrix (P02-024)](../docs/technical-spec/SECURITY_INVARIANTS.md) · [RUNBOOK_DATA_ROLLBACK](../docs/runbooks/RUNBOOK_DATA_ROLLBACK.md)  
> **Chủ quản dữ liệu:** Lead Technical Architect & Data Governance Owner `Chăm Rốch Thi`  
> **Hạ tầng cơ sở dữ liệu:** Supabase Cloud PostgreSQL 15/16 (Project Reference: `knmlbwsmfljlabhvqfid`)  

---

## 1. Phân Tầng Dữ Liệu & Chuẩn Tắc Quản Trị (Decision Gate G2)

Hệ thống Du Lịch Tri Tôn AI áp dụng mô hình phân tầng dữ liệu nghiêm ngặt theo **Decision Gate G2**, phân định rành mạch giữa hai lớp dữ liệu để bảo đảm nguyên tắc "Không nói nhiều hơn dữ liệu có thể chứng minh":

```
┌────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: CANONICAL DATASET (Sự Thật Xác Thực Tuyệt Đối - Factual RAG)   │
│ - Quản lý bởi: data/canonical/canonical_manifest.json (v1.0.0)         │
│ - Schema: CANONICAL-POI-SCHEMA-V1                                      │
│ - Trạng thái: verification_status = 'VERIFIED' (1 POI canonical)       │
│ - Bảo đảm: 100% Cryptographic Hash SHA-256                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Thẩm định tuần tự (Review Queue)
┌───────────────────────────────────┴────────────────────────────────────┐
│ TẦNG 2: RAW CANDIDATES DATASET (Khảo Sát Địa Lý Đang Thẩm Định)        │
│ - Tập tin nguồn: data/tri_ton_master_cleaned.csv                       │
│ - Quy mô: 1,592 bản ghi khảo sát thô (Format UTF-8-SIG)                │
│ - Hàng đợi: docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md           │
│ - Mẫu biên bản: POI_VERIFICATION_REVIEW_TEMPLATE.md                    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Tầng 1: Canonical Dataset Manifest (v1.0.0)
* **Tập tin nguồn thẩm quyền (Single Source of Truth):** `data/canonical/canonical_manifest.json`
* **Phiên bản Manifest:** `v1.0.0` (Ban hành ngày 28/09/2026, phê chuẩn tại Decision Gate G2).
* **Phiên bản Schema:** `CANONICAL-POI-SCHEMA-V1` (tuân thủ 5 bất biến `INV-01` đến `INV-05`).
* **Tổng số lượng xác minh (Total Verified Count):** `total_verified_count = 1` (1 địa điểm canonical verified: `Chùa Xà Tón` / `chua-xa-ton`).
* **Mã băm toàn vẹn (Cryptographic Integrity):**
  - Tệp POI `chua-xa-ton.json`: SHA-256 `5398587c7e5c2e4e300e8460af8253e5ea433af1026558bced647d5c4b186e7f`
  - Mã băm tổng thể Manifest: SHA-256 `f65d568ab075eb7d4a0689e6d35a45420e6a27739064c4e755ff1a83ba2b3cfb`
* **Nguyên tắc nạp vào AI (Factual Retrieval Gate):** Chỉ duy nhất các bản ghi nằm trong Canonical Manifest với `verification_status = 'VERIFIED'` mới được nạp vào vector database và phục vụ truy vấn Factual RAG. Tuyệt đối không cho phép dữ liệu chưa thẩm định làm ô nhiễm tri thức chatbot.

### 1.2. Tầng 2: Raw Candidate Survey Dataset (1,592 Bản ghi)
* **Tập tin nguồn:** `data/tri_ton_master_cleaned.csv`
* **Số lượng bản ghi:** `1,592` bản ghi khảo sát thô đã chuẩn hóa kỹ thuật ký tự tiếng Việt (UTF-8-SIG).
* **Quy chế quản trị:** Toàn bộ 1,592 bản ghi ứng viên này đang được xếp trong **Hàng đợi thẩm định (Review Queue)** theo quy trình tại `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md` và biên bản thẩm định `POI_VERIFICATION_REVIEW_TEMPLATE.md`.
* **Loại trừ tuyên bố lỗi thời:** Bãi bỏ hoàn toàn các tuyên bố cũ không nguồn gốc (như giả định 82 địa điểm cũ hoặc các số liệu suy diễn thời kỳ khảo sát ban đầu). Toàn bộ số liệu ứng viên phải được thẩm định thực địa trước khi được thăng cấp lên Canonical Manifest.

---

## 2. Chuẩn Tắc Địa Giới Hành Chính & Bounding Box (Decision Gate G1 & RULE 02)

### 2.1. Ràng Buộc Không Gian (Geographic Bounding Box)
Mọi tọa độ địa lý của các thực thể du lịch phải nằm trọn vẹn bên trong ranh giới tự nhiên của Huyện Tri Tôn, Tỉnh An Giang:
* **Vĩ độ (Latitude):** $10.30 \le \text{latitude} \le 10.55$
* **Kinh độ (Longitude):** $104.80 \le \text{longitude} \le 105.15$
* **Hệ quy chiếu:** WGS-84 (EPSG:4326). Các tọa độ nằm ngoài bounding box này đều bị kích hoạt cơ chế fail-closed và cảnh báo vi phạm an toàn địa lý.

### 2.2. Danh Mục 15 Đơn Vị Hành Chính Chuẩn Tắc (Glossary G1)
Theo quy định tại **RULE 02** và chuẩn tắc danh từ địa danh **Decision Gate G1**, Huyện Tri Tôn có đúng **15 đơn vị hành chính cấp xã/thị trấn**:

#### 2 Thị Trấn (Towns):
1. `Thị trấn Tri Tôn` (Trung tâm huyện lỵ)
2. `Thị trấn Ba Chúc` (Đô thị vùng di tích lịch sử)

#### 13 Xã (Communes):
3. `Xã An Tức`
4. `Xã Châu Lăng`
5. `Xã Cô Tô`
6. `Xã Lạc Quới`
7. `Xã Lê Trì`
8. `Xã Lương An Trà`
9. `Xã Lương Phi`
10. `Xã Núi Tô`
11. `Xã Ô Lâm`
12. `Xã Tà Đảnh`
13. `Xã Tân Tuyến`
14. `Xã Vĩnh Gia`
15. `Xã Vĩnh Phước`

* **Quy chuẩn lưu trữ và hiển thị nhãn:** Bắt buộc ghi đầy đủ tiền tố hành chính "Thị trấn" hoặc "Xã". Tuyệt đối nghiêm cấm việc lược bỏ hoặc viết tắt tiền tố (như dùng ký tự viết tắt thay cho "Thị trấn" hoặc "Xã") trên cả cơ sở dữ liệu lẫn giao diện người dùng. Mọi nhãn đơn vị hành chính phải thuộc danh mục 15 đơn vị chính thức nêu trên.

---

## 3. Kiến Trúc Hạ Tầng CSDL (Production Infrastructure)

* **Hệ quản trị CSDL:** Supabase Cloud PostgreSQL 15/16 (Project Reference: `knmlbwsmfljlabhvqfid`).
* **Không gian địa lý (Spatial Extension):** Extension `postgis` — lưu trữ tọa độ dưới dạng `GEOMETRY(Point, 4326)`, hỗ trợ lập chỉ mục không gian `GIST` (`places_location_gist_idx`) để tối ưu hóa truy vấn bán kính lân cận (`ST_DWithin`) và khoảng cách (`ST_Distance`).
* **Vector Embeddings (AI Retrieval):** Extension `pgvector` — lưu trữ vector embedding 768 chiều (`vector(768)`) của các thực thể canonical verified, lập chỉ mục `HNSW` (`places_embedding_idx`) với khoảng cách Cosine Distance (`<=>`) phục vụ semantic search.
* **Định dạng Export:** UTF-8-SIG cho CSV, UTF-8 chuẩn cho JSON, và WGS-84 (EPSG:4326) cho GeoJSON.

---

## 4. Các Bảng Dữ Liệu Chính & Lược Đồ Schema

### 4.1. Bảng `places` (Địa Điểm Du Lịch & Di Sản)
* **Khóa chính:** `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
* **Trường dữ liệu:** `canonical_id TEXT UNIQUE`, `name TEXT NOT NULL`, `category TEXT NOT NULL`, `description TEXT`, `address TEXT`, `commune TEXT NOT NULL`, `latitude DOUBLE PRECISION NOT NULL`, `longitude DOUBLE PRECISION NOT NULL`, `location GEOMETRY(Point, 4326)`, `opening_hours TEXT`, `ticket_price TEXT`, `images JSONB DEFAULT '[]'::jsonb`, `map_url TEXT`, `tags TEXT[]`, `verification_status TEXT DEFAULT 'DRAFT'`, `review_id TEXT`, `is_active BOOLEAN DEFAULT true`, `embedding vector(768)`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`.

### 4.2. Bảng `videos` (Video Trải Nghiệm Khám Phá)
* **Khóa chính:** `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
* **Trường dữ liệu:** `place_id UUID REFERENCES places(id) ON DELETE CASCADE`, `title TEXT NOT NULL`, `platform TEXT CHECK (platform IN ('tiktok', 'youtube'))`, `video_url TEXT NOT NULL`, `embed_url TEXT`, `thumbnail TEXT`, `keywords TEXT[]`, `is_approved BOOLEAN DEFAULT false`, `created_at TIMESTAMPTZ DEFAULT NOW()`.

### 4.3. Bảng `foods` & `restaurants` (Đặc Sản Ẩm Thực & Quán Ăn)
* **Bảng `foods`:** `id UUID PRIMARY KEY`, `name TEXT NOT NULL`, `category TEXT`, `description TEXT`, `price_range TEXT`, `images JSONB DEFAULT '[]'::jsonb`, `tags TEXT[]`.
* **Bảng `restaurants`:** `id UUID PRIMARY KEY`, `name TEXT NOT NULL`, `address TEXT`, `commune TEXT NOT NULL`, `price_range TEXT`, `food_ids UUID[]`, `latitude DOUBLE PRECISION`, `longitude DOUBLE PRECISION`, `location GEOMETRY(Point, 4326)`, `images JSONB`, `map_url TEXT`, `is_active BOOLEAN DEFAULT true`.

### 4.4. Bảng `itineraries` & `itinerary_items` (Lịch Trình Du Lịch Khám Phá)
* **Bảng `itineraries`:** `id UUID PRIMARY KEY`, `title TEXT NOT NULL`, `days INT NOT NULL`, `budget_range TEXT`, `travel_style TEXT`, `commune_coverage TEXT[]`, `is_published BOOLEAN DEFAULT true`.
* **Bảng `itinerary_items`:** `id UUID PRIMARY KEY`, `itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE`, `day INT NOT NULL`, `time_slot TEXT NOT NULL`, `place_id UUID REFERENCES places(id)`, `note TEXT`, `display_order INT`.

### 4.5. Bảng Hội Thoại & Nhật Ký Kiểm Toán AI (`chat_sessions` & `chat_logs`)
* **Bảng `chat_sessions`:** `session_id TEXT PRIMARY KEY` (UUID v4), `ownership_hash TEXT NOT NULL` (HMAC-SHA256), `user_agent TEXT`, `client_ip_hash TEXT`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`.
* **Bảng `chat_logs`:** `id UUID PRIMARY KEY`, `session_id TEXT REFERENCES chat_sessions(session_id) ON DELETE SET NULL`, `user_query TEXT NOT NULL`, `bot_response TEXT NOT NULL`, `model_used TEXT NOT NULL`, `latency_ms INT NOT NULL`, `is_fallback BOOLEAN DEFAULT false`, `retrieval_zero_result BOOLEAN`, `sources_cited JSONB DEFAULT '[]'::jsonb`, `client_ip TEXT`, `created_at TIMESTAMPTZ DEFAULT NOW()`.

### 4.6. Bảng Quản Trị & Kiểm Toán Hệ Thống (`admin_users` & `audit_logs`)
* **Bảng `admin_users`:** `id UUID PRIMARY KEY`, `username TEXT UNIQUE NOT NULL`, `password_hash TEXT NOT NULL`, `role TEXT NOT NULL DEFAULT 'viewer'`, `is_active BOOLEAN DEFAULT true`, `created_at TIMESTAMPTZ DEFAULT NOW()`.
* **Bảng `audit_logs`:** `id UUID PRIMARY KEY`, `user_id UUID REFERENCES admin_users(id)`, `action TEXT NOT NULL`, `target_resource TEXT NOT NULL`, `payload_before JSONB`, `payload_after JSONB`, `ip_address TEXT`, `created_at TIMESTAMPTZ DEFAULT NOW()` (Bất biến, cấm sửa xóa).

---

## 5. Ma Trận Phân Quyền Row Level Security (RLS Matrix Lockdown P02-024)

Theo quy định an ninh **RLS Matrix Lockdown P02-024** (`20260924_p02_024_rls_lockdown_client_roles_matrix.sql`), toàn bộ 16 bảng dữ liệu đều được kích hoạt `ROW LEVEL SECURITY`:

| Bảng dữ liệu | Quyền `anon` | Quyền `authenticated` | Quyền `service_role` | Ghi chú an ninh |
|---|---|---|---|---|
| `admin_users` | **REVOKE ALL** (0%) | **REVOKE ALL** (0%) | FULL ACCESS | Bảng nhạy cảm tuyệt mật |
| `audit_logs` | **REVOKE ALL** (0%) | **REVOKE ALL** (0%) | FULL ACCESS | Bảng nhật ký kiểm toán bất biến |
| `chat_sessions` | **REVOKE ALL** (0%) | **REVOKE ALL** (0%) | FULL ACCESS | Phải qua Server API Gateway kiểm HMAC |
| `chat_logs` | **REVOKE ALL** (0%) | **REVOKE ALL** (0%) | FULL ACCESS | Nhật ký AI chỉ do Server ghi |
| `eval_cases`, `eval_runs` | **REVOKE ALL** (0%) | **REVOKE ALL** (0%) | FULL ACCESS | Bảng đánh giá chất lượng AI |
| `places`, `videos` | **SELECT** | **SELECT** | FULL ACCESS | Chỉ đọc công khai, 0% mutation phía client |
| `foods`, `restaurants` | **SELECT** | **SELECT** | FULL ACCESS | Chỉ đọc công khai, 0% mutation phía client |
| `itineraries`, `itinerary_items` | **SELECT** | **SELECT** | FULL ACCESS | Chỉ đọc công khai, 0% mutation phía client |

* **Nguyên tắc bất biến:** Tuyệt đối không cho phép PostgREST client từ trình duyệt thực hiện các lệnh thêm, sửa, xóa (`INSERT`, `UPDATE`, `DELETE`) trực tiếp vào cơ sở dữ liệu. Mọi thay đổi dữ liệu phải qua Server-side API Routes có phân quyền quản trị và ghi vết `audit_logs`.

---

## 6. Chính Sách Sao Lưu & Phục Hồi Dữ Liệu (Data Rollback Runbook)

* **Quy chuẩn vận hành:** Áp dụng theo `RUNBOOK_DATA_ROLLBACK.md` (Mã quy chuẩn `RB-DB-DATA-ROLLBACK-001`).
* **Định danh bản sao lưu (Snapshot Versioning):** Các tệp sao lưu đặt tên theo cấu trúc `snapshot_places_<ISO_TIMESTAMP>.json`, lưu trữ trong `data/backups/`, lưu kèm mã băm SHA-256 để chống can thiệp trái phép.
* **5 Tiêu chuẩn kiểm chứng sau phục hồi (Restore Verification Criteria):**
  1. Trùng khớp 100% mã băm mật mã SHA-256 với manifest sao lưu.
  2. Số lượng bản ghi phục hồi bảo đảm tính đầy đủ (`count` hợp lệ).
  3. 100% bản ghi địa điểm có tọa độ nằm gọn trong Bounding Box Tri Tôn ($[10.30, 10.55] \times [104.80, 105.15]$).
  4. Trạng thái Row Level Security (RLS) duy trì `ENABLED` trên toàn bộ các bảng.
  5. Biên bản phục hồi có chữ ký số xác nhận của Data Governance Owner `Chăm Rốch Thi`.
