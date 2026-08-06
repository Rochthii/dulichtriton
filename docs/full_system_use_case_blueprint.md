# TÀI LIỆU BẢN THIẾT KẾ TOÀN DIỆN BÁM SÁT 67 SUB-USECASES (LEVEL 0 - LEVEL 4)
## HỆ THỐNG DU LỊCH TRI TÔN AI (TRI TON TOURISM AI SYSTEM)

> **Cập nhật lần cuối:** 2026-08-06 | **Phiên bản:** 10.8.0-USECASE-BLUEPRINT  
> **Nguồn tài liệu:** Phân rã 4 cấp độ tại [docs/use_cases/](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/) (`level_0_overview.md` đến `level_4_activity.md`).

---

## 🎯 1. TỔNG QUAN KHUNG BÁM SÁT USE CASE 4 CẤP ĐỘ

Toàn bộ hệ thống **Du Lịch Tri Tôn** được thiết kế bám sát 100% theo đúng tài liệu chuẩn UML tại thư mục `docs/use_cases/`:

```text
Level 0: Overview (3 Actors: Visitor, Partner, Admin & 8 Modules UC01 - UC08)
   │
   ▼
Level 1: Phân Rã Module (67 Sub-usecases từ UC01.01 đến UC08.10)
   │
   ▼
Level 2: Chi Tiết Nghiệp Vụ (Business Logic cho Routing UC03.08, Place Details UC01.03, Partner Listing UC07.02)
   │
   ▼
Level 3: Phân Rã Luồng AI 16 Bước (RAG Hybrid Search + TikTok Matcher UC02.01)
   │
   ▼
Level 4: Activity Flow Diagrams (Sơ đồ luồng hoạt động lập tour & AI Chat)
```

---

## 📊 2. BẢNG BÁM SÁT KHẾP KÍN 67 SUB-USECASES VỚI KIẾN TRÚC KỸ THUẬT

### 🔵 UC01: Module Khám Phá Du Lịch (10 Sub-usecases)
* **Phân rã Use Case**: UC01.01 (Search), UC01.02 (Browse Categories), UC01.03 (Place Details), UC01.04 (Trending), UC01.05 (Nearby), UC01.06 (Seasonal), UC01.07 (Preferences), UC01.08 (Reviews), UC01.09 (Share & QR), UC01.10 (Bookmark Favorites).
* **Màn hình Frontend**: Trang chủ (`/`), Danh sách (`/places`), Chi tiết (`/places/[id]`), Đặc sản (`/food`).
* **API Route**: `GET /api/v1/places`, `GET /api/v1/places/{id}`.
* **Tối ưu DB**: B-Tree Index trên `commune`, `tourism_category` & `category`.

### 🟢 UC02: Module AI Assistant & Chatbot RAG (11 Sub-usecases)
* **Phân rã Use Case**: UC02.01 (Ask Natural Lang), UC02.02 (Intent), UC02.03 (NER), UC02.04 (RAG Vector Search), UC02.05 (LLM Response), UC02.06 (Suggest Spots), UC02.07 (Suggest Foods), UC02.08 (Suggest Homestays), UC02.09 (TikTok Video Matcher), UC02.10 (Follow-up Suggestions), UC02.11 (Chat History).
* **Màn hình Frontend**: Floating AI Chatbot Widget nổi góc dưới màn hình.
* **API Route**: `POST /api/v1/chat/query`.
* **Engine Lõi AI**: `tourism_ai_core/orchestrator/ai_orchestrator.py` (14-16 bước end-to-end), RAG Hybrid Search (BM25 + HNSW Vector), Dynamic Guardrails (**0% Emoji**).

### 🟡 UC03: Module AI Trip Planner (14 Sub-usecases)
* **Phân rã Use Case**: UC03.01 (Init Trip), UC03.02 (Preferences), UC03.03 (Budget), UC03.04 (Timing), UC03.05 (Transport), UC03.06 (Style), UC03.07 (Filter Places), UC03.08 (Optimize Route), UC03.09 (Select Meal), UC03.10 (Select Lodging), UC03.11 (Generate Schedule), UC03.12 (Custom Edit), UC03.13 (Export PDF/Offline), UC03.14 (Share Itinerary).
* **Màn hình Frontend**: Trang Lập Tour (`/itinerary`) & Export Modal.
* **API Route**: `POST /api/v1/itineraries/generate`.
* **Thuật toán Lõi**: `AITripPlanner` tối ưu hóa ma trận thời gian & khoảng cách Haversine WGS84.

### 🔴 UC04: Module Bản Đồ GIS & Điều Hướng (6 Sub-usecases)
* **Phân rã Use Case**: UC04.01 (Interactive Map), UC04.02 (Directions), UC04.03 (WGS84 Distance), UC04.04 (GPS Current Loc), UC04.05 (Nearby Amenities), UC04.06 (Layer Filtering).
* **Màn hình Frontend**: Map Component (Leaflet / MapLibre) tích hợp Nút mở Google Maps theo tên thực tế.
* **API Route**: `GET /api/v1/places/nearby`.
* **Tối ưu DB**: PostGIS `GiST` Index trên trường `geom` (`GEOMETRY(Point, 4326)`).

### 🟣 UC05: Module Multi-Platform Video Engine (6 Sub-usecases)
* **Phân rã Use Case**: UC05.01 (Play Review Videos), UC05.02 (Fetch by Spot), UC05.03 (Fetch by Itinerary), UC05.04 (Trending TikTok), UC05.05 (Share Link), UC05.06 (Report Broken Video).
* **Màn hình Frontend**: Carousel TikTok Shorts trên Trang chủ & Modal Embed Video.
* **API Route**: `GET /api/v1/places/{id}/videos`.
* **Backend Service**: `VideoCacheService` phòng tránh 100% Rate-limit IP.

### 🟤 UC06 - UC08: Account, Partner Portal & Admin Control (20 Sub-usecases)
* **UC06 (Tài khoản)**: Sign Up/In, Wishlist, Saved Trips.
* **UC07 (Partner Portal)**: Đăng ký Tích Xanh, quản lý món ăn/phòng nghỉ, duyệt đăng bài.
* **UC08 (Admin Portal)**: Quản trị 106 địa điểm Master, Re-indexing Vector DB, **Audit Log bất biến `{WHO, WHAT, WHEN, FROM_WHERE}`**.

---

## 📌 3. THIẾT KẾ CƠ SỞ DỮ LIỆU ĐÁP ỨNG CHUẨN USE CASES

Tệp SQL Schema [tourism_crawler/database/schema.sql](file:///e:/Projects/Project_ca_nhan/dulichtriton/tourism_crawler/database/schema.sql) đã được đồng bộ hoàn toàn:

```sql
-- HNSW Vector Index cho UC02.04 (RAG Vector Search < 10ms)
CREATE INDEX IF NOT EXISTS idx_places_embedding_hnsw ON public.places USING hnsw (embedding vector_cosine_ops);

-- PostGIS GiST Index cho UC04 (Bản đồ GIS & Tính bán kính 5km)
CREATE INDEX IF NOT EXISTS idx_places_geom ON public.places USING GIST(geom);

-- B-Tree Indexes cho UC01 (Khám phá & Lọc địa điểm)
CREATE INDEX IF NOT EXISTS idx_places_commune ON public.places(commune);
CREATE INDEX IF NOT EXISTS idx_places_tourism_category ON public.places(tourism_category);

-- Table Videos cho UC05 (TikTok Video Engine)
CREATE TABLE IF NOT EXISTS public.videos (...);

-- Table Audit Logs cho UC08 (System Admin Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (...);
```

---

## 💡 4. KẾT LUẬN & CAM KẾT SẢN XUẤT REAL

Hệ thống **Du Lịch Tri Tôn** cam kết:
1. **0% Mock / Fake / Placeholder**: Mọi nút bấm UI đều gọi API thực tế.
2. **0% Emoji Policy**: 100% biểu tượng sử dụng SVG Lucide Icons chuẩn.
3. **Bám sát 67 Sub-usecases**: Toàn bộ luồng dữ liệu đều có tài liệu kiểm tra nghiệm thu rõ ràng.
