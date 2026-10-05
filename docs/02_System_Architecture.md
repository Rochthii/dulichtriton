# 02. KIẾN TRÚC HỆ THỐNG THỰC TẾ (PRODUCTION RUNTIME ARCHITECTURE)

> **Căn cứ xác thực:** [Deployment Path Inventory](technical-spec/DEPLOYMENT_PATH_INVENTORY.md) (P00-003 / P06-010) · [Decision Record G0](technical-spec/DECISION_RECORD_G0.md) · [Current State Audit](technical-spec/CURRENT_STATE_AUDIT.md).  
> **Nguyên tắc bất biến:** Hệ thống hoạt động theo mô hình Production-Real, 0% Mock/Demo. Mọi thành phần đều có đường build và deploy được kiểm chứng.

---

## 1. Sơ Đồ Kiến Trúc Runtime Thực Tế (Production Architecture)

Khác với các tài liệu sơ khai từng giả định một dịch vụ FastAPI Python làm gateway trung gian, kiến trúc vận hành thực tế tại môi trường production (`https://dulichtriton.vercel.app`) được hợp nhất vào **Next.js 16 (React 19) App Router** trên nền tảng **Vercel Edge/Serverless Network**, giao tiếp trực tiếp với **Supabase Cloud PostgreSQL** và các nhà cung cấp **Multi-LLM APIs**:

```
[ NGƯỜI DÙNG DU LỊCH & QUẢN TRỊ VIÊN ]
        │ HTTPS Requests
        ▼
[ FRONTEND WEB PORTAL & SERVERLESS API GATEWAY ] (Next.js 16.3.0 App Router - Vercel)
        │ Đường build: cd frontend && npm install && npm run build
        │ Deploy Target: Vercel Production (https://dulichtriton.vercel.app)
        │
        ├──► [ PUBLIC WEB PORTAL ] (18 Static/SSR Routes)
        │       ├── Trang chủ (/), Khám phá (/places), Chi tiết (/places/[id])
        │       ├── Ẩm thực (/food), Lưu trú (/stay), Văn hóa (/culture)
        │       └── Bản đồ GIS Leaflet (/map), Lập lịch trình (/itinerary, /planner)
        │
        ├──► [ ADMIN CMS PORTAL ] (11 Protected Routes)
        │       ├── Server-Side Guard Session Verification (Cookie __Host-triton_admin_session)
        │       └── Quản trị địa điểm (/admin/places), Video (/admin/videos), Tri thức (/admin/knowledge-base)
        │
        ├──► [ SERVERLESS API GATEWAY & AI ORCHESTRATION ] (36 Route Handlers)
        │       ├── Chat Streaming SSE (/api/v1/chat/stream) ──► Groq Llama-3.3-70b-versatile
        │       ├── Factual RAG & PostGIS RPCs (/api/v1/chat/query) ──► Gemini 2.5 Flash / OpenRouter
        │       ├── Data API (/api/v1/food, /api/v1/stays, /api/v1/culture, /api/v1/search)
        │       └── Admin Mutations với Server-side CSRF/SSRF Protection (/api/v1/admin/*)
        │
        ├──► [ MEDIA STORAGE SERVICE ] (Cloudinary SaaS)
        │       └── Upload ảnh thực địa 1200px WebP (/api/v1/admin/upload)
        │
        └──► [ DATABASE & PERSISTENCE LAYER ] (Supabase PostgreSQL 15)
                ├── Project Ref: knmlbwsmfljlabhvqfid (Deploy qua supabase/migrations/*.sql)
                ├── PostGIS Spatial Engine: ST_DistanceSphere, ST_DWithin cho định vị Bảy Núi
                ├── pgvector Extension: Vector Embeddings cho tìm kiếm tri thức
                └── Row Level Security (RLS) Lockdown: 100% Client Roles bị hạn chế, Service Role chỉ chạy server-side

═════════════════════════════════════════════════════════════════════════════════════════════════════════════
[ OFFLINE RESEARCH & LOCAL DATA GOVERNANCE ] (KHÔNG DEPLOY PRODUCTION)
Runtime: Python 3.11/3.12 (venv) · CLI Scripts & Pytest Suites
├── backend/: Khảo sát dữ liệu thô, crawler thực nghiệm, legacy prototypes
└── scripts/: Bộ công cụ CI/CD, migration replay test, RLS matrix test, data validation, smart delta sync
═════════════════════════════════════════════════════════════════════════════════════════════════════════════
```

---

## 2. Liên Kết Tuyến Đường Thực Tế (Production Route & Build Links)

Mọi tuyến đường được liệt kê dưới đây đều tương ứng với file mã nguồn vật lý tồn tại thực tế và đã được kiểm chứng qua lệnh build sản phẩm:

### 2.1. Cấu Hình Build & Triển Khai (Deployment Configuration)
* **Cấu hình Vercel**: [`vercel.json`](../vercel.json)
  * Lệnh build thực tế: `cd frontend && npm install && npm run build`
  * Thư mục output: `frontend/.next` (Next.js 16.3.0 App Router)
* **Cấu hình Package Frontend**: [`frontend/package.json`](../frontend/package.json)
  * Script prebuild: `node ../scripts/generate_static_frontend_places.mjs` (Sinh 149 static POI pages)
  * Script build: `next build`
  * Script test tổng thể: `node --test scripts/*.test.mjs`
* **Đặc tả chi tiết 65 Routes**: [Deployment Path Inventory](technical-spec/DEPLOYMENT_PATH_INVENTORY.md)

### 2.2. Các Tuyến Giao Diện Tiêu Biểu (Representative UI Routes)
* **Trang chủ**: [`frontend/src/app/page.tsx`](../frontend/src/app/page.tsx) — Tuyến `/`
* **Danh sách Điểm đến**: [`frontend/src/app/places/page.tsx`](../frontend/src/app/places/page.tsx) — Tuyến `/places`
* **Chi tiết Điểm đến**: [`frontend/src/app/places/[id]/page.tsx`](../frontend/src/app/places/[id]/page.tsx) — Tuyến `/places/[id]`
* **Đặc sản Ẩm thực**: [`frontend/src/app/food/page.tsx`](../frontend/src/app/food/page.tsx) — Tuyến `/food`
* **Lưu trú Homestay**: [`frontend/src/app/stay/page.tsx`](../frontend/src/app/stay/page.tsx) — Tuyến `/stay`
* **Bản đồ GIS Leaflet**: [`frontend/src/app/map/page.tsx`](../frontend/src/app/map/page.tsx) — Tuyến `/map`
* **Trợ lý AI Trực tuyến**: [`frontend/src/app/chatbot/page.tsx`](../frontend/src/app/chatbot/page.tsx) — Tuyến `/chatbot`
* **Quản trị Địa điểm**: [`frontend/src/app/admin/places/page.tsx`](../frontend/src/app/admin/places/page.tsx) — Tuyến `/admin/places`
* **Quản trị Video**: [`frontend/src/app/admin/videos/page.tsx`](../frontend/src/app/admin/videos/page.tsx) — Tuyến `/admin/videos`

### 2.3. Các Handler API Tiêu Biểu (Representative API Handlers)
* **Streaming AI Chat**: [`frontend/src/app/api/v1/chat/stream/route.ts`](../frontend/src/app/api/v1/chat/stream/route.ts) — SSE streaming kết nối Groq/Gemini
* **RAG PostGIS Query**: [`frontend/src/app/api/v1/chat/query/route.ts`](../frontend/src/app/api/v1/chat/query/route.ts) — Kết hợp pgvector và PostGIS RPCs
* **Admin Mutation Guard**: [`frontend/src/app/api/v1/admin/places/route.ts`](../frontend/src/app/api/v1/admin/places/route.ts) — Bọc server-side session guard và audit log
* **Media Upload Guard**: [`frontend/src/app/api/v1/admin/upload/route.ts`](../frontend/src/app/api/v1/admin/upload/route.ts) — Giới hạn body-size và MIME allowlist ảnh

---

## 3. Luồng Xử Lý AI & Dữ Liệu Chuẩn Tắc (Factual AI & Data Flow)
* **Quy trình AI 9 bước**: Chi tiết luồng xử lý truy vấn du khách tại [docs/ai_workflow.md](ai_workflow.md).
* **Nguồn dữ liệu chuẩn tắc (Canonical Data)**: Tham chiếu [Decision Gate G2](technical-spec/CANONICAL_DATASET_MANIFEST.md) với Canonical Manifest `v1.0.0` tại `data/canonical/canonical_manifest.json`. AI chatbot chỉ được phép khẳng định dữ liệu đã qua xác thực 100%.
