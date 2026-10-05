# P00-003 / P06-010 — Deployment Path Inventory & Runtime Architecture

> **Trạng thái:** `VERIFIED` — Phản ánh chính xác 100% mã nguồn checkout, cấu hình `vercel.json`, build manifest Next.js 16 và các API routes thực tế.  
> **Căn cứ pháp lý & kỹ thuật:** [Decision Record G0](DECISION_RECORD_G0.md) · [Current State Audit](CURRENT_STATE_AUDIT.md) · [Production Route Data Inventory](PRODUCTION_ROUTE_DATA_INVENTORY.md).  
> **Machine-Readable Spec:** [`DEPLOYMENT_PATH_INVENTORY.json`](DEPLOYMENT_PATH_INVENTORY.json).

---

## 1. Sơ Đồ Kiến Trúc Runtime Thực Tế (Production Runtime Architecture)

Khác với các tài liệu sơ khai ban đầu từng giả định có một dịch vụ FastAPI Python đóng vai trò Gateway trung gian trên production, kiến trúc vận hành thực tế đã được kiểm chứng của hệ thống là kiến trúc **Jamstack / Serverless Portal** hiệu năng cao, nơi Next.js 16 (React 19) App Router trên Vercel đảm nhiệm toàn bộ giao diện người dùng và API Gateway, giao tiếp trực tiếp với Supabase PostgreSQL và các nhà cung cấp Multi-LLM Cloud:

```
                                      ┌─────────────────────────────────────────────────────────────┐
                                      │              NGƯỜI DÙNG DU LỊCH & QUẢN TRỊ VIÊN            │
                                      └──────────────────────────────┬──────────────────────────────┘
                                                                     │ HTTPS Requests
                                                                     ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ FRONTEND WEB PORTAL & SERVERLESS API GATEWAY ]                                                                                  │
│ Host: Vercel Edge/Serverless Network (https://dulichtriton.vercel.app)                                                            │
│ Runtime: Next.js 16.3.0 (React 19.2.8) · Node.js 20+ Runtime                                                                      │
│                                                                                                                                   │
│ ├── 18 Public Pages (/places, /food, /stay, /culture, /guide, /map, /chatbot, /emergency, ...)                                    │
│ ├── 11 Admin CMS Pages (/admin/places, /admin/videos, /admin/knowledge-base, /admin/audit-logs, ...)                             │
│ └── 36 Serverless API Route Handlers (Edge & Node.js Serverless Functions):                                                       │
│       ├── Chat & AI: /api/v1/chat/stream (SSE), /api/v1/chat/query (RAG), /api/v1/chat/session, ...                              │
│       ├── Public Data: /api/v1/food, /api/v1/stays, /api/v1/culture, /api/v1/search, /api/v1/videos, ...                         │
│       ├── Admin Mutation: /api/v1/admin/places, /api/v1/admin/videos, /api/v1/admin/upload, ...                                  │
│       └── Scheduled Cron: /api/v1/cron/cleanup-chat-logs, /api/v1/cron/cleanup-chat-sessions                                     │
└────────────────────────────────────┬───────────────────────────────────────┬──────────────────────────────────┬───────────────────┘
                                     │                                       │                                  │
       Direct Server-Side / Client   │               Direct Serverless REST  │              Media Delivery      │ Multi-LLM API
       PostGIS & Vector Queries      │               Upload & Optimization   │                                  │ Streaming & RAG
                                     ▼                                       ▼                                  │
┌──────────────────────────────────────────────┐        ┌────────────────────────────┐                          │
│ [ DATABASE & STORAGE LAYER ]                 │        │ [ MEDIA CDN STORAGE ]      │                          │
│ Supabase Cloud Managed PostgreSQL 15         │        │ Cloudinary Media Service   │                          │
│ Ref: knmlbwsmfljlabhvqfid                    │        │ (w_1200, WebP Auto Opt)    │                          │
│                                              │        └────────────────────────────┘                          │
│ ├── PostGIS Spatial Engine (Geo-distance)    │                                                                │
│ ├── pgvector Extension (Knowledge & Places)  │                                                                │
│ ├── Row Level Security (RLS) Lockdown        │                                                                │
│ └── Server-Side Service Role Key for Admin   │                                                                │
└──────────────────────────────────────────────┘                                                                │
                                                                                                                │
                                                                                                                ▼
                                                        ┌─────────────────────────────────────────────────────────────┐
                                                        │ [ MULTI-LLM INFERENCE CLOUD ENGINES ]                       │
                                                        │ Adaptive Circuit Breaker (src/lib/aiProvider.ts)            │
                                                        │                                                             │
                                                        │ ├── Tier 1 (Primary Stream): Groq Llama-3.3-70b-versatile    │
                                                        │ ├── Tier 2 (Synthesis/Complex): Google Gemini 2.5 Flash     │
                                                        │ └── Tier 3 (Redundancy): OpenRouter Fallback                │
                                                        └─────────────────────────────────────────────────────────────┘

═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
[ LOCAL / OFFLINE RESEARCH & GOVERNANCE TOOLING ] (Tách biệt hoàn toàn, KHÔNG DEPLOY PRODUCTION)
Runtime: Python 3.11 / 3.12 (venv) · CLI Scripts & Pytest Suites
├── backend/: Khảo sát dữ liệu thô, crawler thực nghiệm, legacy prototypes
└── scripts/: Bộ công cụ CI/CD, migration replay test, RLS matrix test, data validation, smart delta sync
═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
```

---

## 2. Inventory Đường Build & Deploy Từng Thành Phần (Build & Deploy Paths)

| Thành phần | Runtime / Target | Config & Source Path | Lệnh Build / Run Thực Tế | Trạng thái Production |
|---|---|---|---|---|
| **Frontend Web & API** | Next.js 16.3.0 / React 19.2.8 trên Vercel | [vercel.json](../../vercel.json), [package.json](../../frontend/package.json) | `cd frontend ; npm install ; npm run build` (Prebuild: `node ../scripts/generate_static_frontend_places.mjs` ; Build: `next build`) | **ACTIVE PRODUCTION** (`https://dulichtriton.vercel.app`) |
| **CSDL & PostGIS** | Supabase PostgreSQL 15 | [supabase/migrations/](../../supabase/migrations) | `supabase db push` hoặc SQL Replay qua `scripts/ci_migration_replay.py` | **ACTIVE PRODUCTION** (Project ref `knmlbwsmfljlabhvqfid`) |
| **Media CDN** | Cloudinary SaaS | [upload route](../../frontend/src/app/api/v1/admin/upload/route.ts) | Server-side API multipart upload qua `CLOUDINARY_URL` | **ACTIVE PRODUCTION** |
| **AI Inference** | Groq / Gemini / OpenRouter | [aiProvider.ts](../../frontend/src/lib/aiProvider.ts) | Dynamic HTTP Fetch / SSE streaming | **ACTIVE PRODUCTION** |
| **Python Tooling** | Python 3.11/3.12 Local | `backend/`, `scripts/` | `.\venv\Scripts\activate ; pytest` | **OFFLINE / LOCAL TOOLING** (Không deploy endpoint public) |

---

## 3. Danh Mục Đầy Đủ 65 Tuyến Đường (Route Files Inventory)

Hệ thống Next.js 16 bao gồm 65 route files vật lý trong thư mục `frontend/src/app`, biên dịch thành 181 static và serverless routes trong `frontend/.next`:

### 3.1. Trang Giao Diện Công Khai (Public Pages - 18 Routes)

| Tuyến Đường (Path) | File Mã Nguồn | Chức Năng Chính |
|---|---|---|
| `/` | [frontend/src/app/page.tsx](../../frontend/src/app/page.tsx) | Trang chủ Du Lịch Tri Tôn, Hero section, Reels, Persona Chips, Danh mục ẩm thực |
| `/places` | [frontend/src/app/places/page.tsx](../../frontend/src/app/places/page.tsx) | Khám phá danh sách địa điểm theo danh mục và 15 xã/thị trấn Tri Tôn |
| `/places/[id]` | [frontend/src/app/places/[id]/page.tsx](../../frontend/src/app/places/[id]/page.tsx) | Chi tiết điểm tham quan, hình ảnh thực địa, video trải nghiệm và tọa độ WGS84 |
| `/food` | [frontend/src/app/food/page.tsx](../../frontend/src/app/food/page.tsx) | Ẩm thực đặc sản bản địa (Gà đốt Ô Thum, Cháo bò trái chúc, Đu đủ đâm, Bánh bò thốt nốt) |
| `/stay` | [frontend/src/app/stay/page.tsx](../../frontend/src/app/stay/page.tsx) | Khách sạn, nhà nghỉ, homestay bản địa và bãi đỗ xe |
| `/culture` | [frontend/src/app/culture/page.tsx](../../frontend/src/app/culture/page.tsx) | Di sản văn hóa Khmer, Chùa Tháp, Lễ hội Đua bò Bảy Núi |
| `/itinerary` | [frontend/src/app/itinerary/page.tsx](../../frontend/src/app/itinerary/page.tsx) | Lịch trình mẫu 1 ngày / 2 ngày 1 đêm tối ưu |
| `/planner` | [frontend/src/app/planner/page.tsx](../../frontend/src/app/planner/page.tsx) | Công cụ lập kế hoạch du lịch cá nhân hóa |
| `/guide` | [frontend/src/app/guide/page.tsx](../../frontend/src/app/guide/page.tsx) | Cẩm nang du lịch và số điện thoại đường dây nóng SOS |
| `/map` | [frontend/src/app/map/page.tsx](../../frontend/src/app/map/page.tsx) | Bản đồ số GIS Leaflet tương tác |
| `/chat` | [frontend/src/app/chat/page.tsx](../../frontend/src/app/chat/page.tsx) | Giao diện trò chuyện AI toàn màn hình |
| `/chatbot` | [frontend/src/app/chatbot/page.tsx](../../frontend/src/app/chatbot/page.tsx) | Trang Trợ lý AI du lịch Tri Tôn chuyên sâu |
| `/emergency` | [frontend/src/app/emergency/page.tsx](../../frontend/src/app/emergency/page.tsx) | Cổng thông tin cứu hộ khẩn cấp và y tế |
| `/partner` | [frontend/src/app/partner/page.tsx](../../frontend/src/app/partner/page.tsx) | Kênh kết nối đối tác nhà hàng, homestay bản địa |
| `/pitch-deck` | [frontend/src/app/pitch-deck/page.tsx](../../frontend/src/app/pitch-deck/page.tsx) | Hồ sơ dự án giới thiệu giải pháp công nghệ |
| `/privacy` | [frontend/src/app/privacy/page.tsx](../../frontend/src/app/privacy/page.tsx) | Chính sách quyền riêng tư và cam kết bảo vệ dữ liệu |
| `/terms` | [frontend/src/app/terms/page.tsx](../../frontend/src/app/terms/page.tsx) | Điều khoản sử dụng hệ thống |
| `/auth` | [frontend/src/app/auth/page.tsx](../../frontend/src/app/auth/page.tsx) | Giao diện đăng nhập / ủy quyền tài khoản |

### 3.2. Trang Quản Trị Hệ Thống (Admin CMS Pages - 11 Routes)

| Tuyến Đường (Path) | File Mã Nguồn | Chức Năng Chính |
|---|---|---|
| `/admin` | [frontend/src/app/admin/page.tsx](../../frontend/src/app/admin/page.tsx) | Bảng điều khiển quản trị tổng quan |
| `/admin/login` | [frontend/src/app/admin/login/page.tsx](../../frontend/src/app/admin/login/page.tsx) | Cổng đăng nhập quản trị viên (Bảo toàn byte mật khẩu) |
| `/admin/places` | [frontend/src/app/admin/places/page.tsx](../../frontend/src/app/admin/places/page.tsx) | Quản lý danh mục và thông tin POI địa điểm |
| `/admin/videos` | [frontend/src/app/admin/videos/page.tsx](../../frontend/src/app/admin/videos/page.tsx) | Quản lý video TikTok / YouTube trải nghiệm |
| `/admin/itineraries` | [frontend/src/app/admin/itineraries/page.tsx](../../frontend/src/app/admin/itineraries/page.tsx) | Quản lý các gói lịch trình gợi ý |
| `/admin/stories` | [frontend/src/app/admin/stories/page.tsx](../../frontend/src/app/admin/stories/page.tsx) | Quản lý bài viết văn hóa và câu chuyện lịch sử |
| `/admin/feedback` | [frontend/src/app/admin/feedback/page.tsx](../../frontend/src/app/admin/feedback/page.tsx) | Quản lý hàng đợi chỉnh sửa (Correction Log) |
| `/admin/feedbacks` | [frontend/src/app/admin/feedbacks/page.tsx](../../frontend/src/app/admin/feedbacks/page.tsx) | Quản lý đánh giá và phản hồi của người dùng |
| `/admin/chat-logs` | [frontend/src/app/admin/chat-logs/page.tsx](../../frontend/src/app/admin/chat-logs/page.tsx) | Giám sát nhật ký hội thoại AI |
| `/admin/ai-metrics` | [frontend/src/app/admin/ai-metrics/page.tsx](../../frontend/src/app/admin/ai-metrics/page.tsx) | Theo dõi latency, token count và cache hit rate |
| `/admin/knowledge-base` | [frontend/src/app/admin/knowledge-base/page.tsx](../../frontend/src/app/admin/knowledge-base/page.tsx) | Quản lý cơ sở tri thức tùy chỉnh (Custom Knowledge Base) |

### 3.3. API Xử Lý Dữ Liệu Công Khai & Hội Thoại AI (Public & Chat APIs - 16 Routes)

| Endpoint | File Mã Nguồn | Phương Thức | Mô Tả & Tương Tác Dữ Liệu |
|---|---|---|---|
| `/api/v1/food` | [frontend/src/app/api/v1/food/route.ts](../../frontend/src/app/api/v1/food/route.ts) | GET | Lấy danh sách ẩm thực (Cache / Supabase `places`) |
| `/api/v1/stays` | [frontend/src/app/api/v1/stays/route.ts](../../frontend/src/app/api/v1/stays/route.ts) | GET | Lấy danh sách lưu trú (Cache / Supabase `places`) |
| `/api/v1/culture` | [frontend/src/app/api/v1/culture/route.ts](../../frontend/src/app/api/v1/culture/route.ts) | GET | Lấy danh sách văn hóa (Cache / Supabase `places`) |
| `/api/v1/search` | [frontend/src/app/api/v1/search/route.ts](../../frontend/src/app/api/v1/search/route.ts) | GET | Tìm kiếm toàn văn bản (FTS / Supabase `places`) |
| `/api/v1/feedback` | [frontend/src/app/api/v1/feedback/route.ts](../../frontend/src/app/api/v1/feedback/route.ts) | GET, POST | Tiếp nhận phản hồi người dùng (`feedbacks`, `audit_logs`) |
| `/api/v1/chat/stream` | [frontend/src/app/api/v1/chat/stream/route.ts](../../frontend/src/app/api/v1/chat/stream/route.ts) | POST | Streaming câu trả lời AI qua SSE từ Groq/Gemini |
| `/api/v1/chat/query` | [frontend/src/app/api/v1/chat/query/route.ts](../../frontend/src/app/api/v1/chat/query/route.ts) | GET, POST | RAG kết hợp PostGIS RPCs và LLM context |
| `/api/v1/chat/session` | [frontend/src/app/api/v1/chat/session/route.ts](../../frontend/src/app/api/v1/chat/session/route.ts) | POST, GET, DELETE | Quản lý phiên chat ẩn danh |
| `/api/v1/chat/itinerary` | [frontend/src/app/api/v1/chat/itinerary/route.ts](../../frontend/src/app/api/v1/chat/itinerary/route.ts) | GET, POST | Sinh lịch trình du lịch dựa trên tham số chuyến đi |
| `/api/v1/chat/ping` | [frontend/src/app/api/v1/chat/ping/route.ts](../../frontend/src/app/api/v1/chat/ping/route.ts) | POST | Làm ấm (prewarm) kết nối tới Groq / Gemini |
| `/api/v1/videos` | [frontend/src/app/api/v1/videos/route.ts](../../frontend/src/app/api/v1/videos/route.ts) | GET | Lấy danh sách video (`video_discoveries`) |
| `/api/v1/videos/trending` | [frontend/src/app/api/v1/videos/trending/route.ts](../../frontend/src/app/api/v1/videos/trending/route.ts) | GET | Lấy video thịnh hành (`videos`) |
| `/api/v1/videos/triton` | [frontend/src/app/api/v1/videos/triton/route.ts](../../frontend/src/app/api/v1/videos/triton/route.ts) | GET | Lấy video đặc thù địa phương |
| `/api/v1/videos/oembed` | [frontend/src/app/api/v1/videos/oembed/route.ts](../../frontend/src/app/api/v1/videos/oembed/route.ts) | GET | Truy vấn thông tin nhúng oEmbed từ TikTok/YouTube |
| `/api/v1/places/[id]/videos` | [frontend/src/app/api/v1/places/[id]/videos/route.ts](../../frontend/src/app/api/v1/places/[id]/videos/route.ts) | GET | Lấy danh sách video gắn với một POI cụ thể |
| `/api/v1/llms-context` | [frontend/src/app/api/v1/llms-context/route.ts](../../frontend/src/app/api/v1/llms-context/route.ts) | GET | Cung cấp tài liệu ngữ cảnh rút gọn cho LLM agents |

### 3.4. API Quản Trị Hệ Thống (Admin APIs - 18 Routes)

| Endpoint | File Mã Nguồn | Phương Thức | Kiểm Soát Quyền & Nghiệp Vụ |
|---|---|---|---|
| `/api/v1/admin/auth/login` | [frontend/src/app/api/v1/admin/auth/login/route.ts](../../frontend/src/app/api/v1/admin/auth/login/route.ts) | POST | Xác thực bcrypt, cấp cookie bảo mật `__Host-triton_admin_session` |
| `/api/v1/admin/auth/logout` | [frontend/src/app/api/v1/admin/auth/logout/route.ts](../../frontend/src/app/api/v1/admin/auth/logout/route.ts) | POST | Thu hồi session và hủy cookie quản trị |
| `/api/v1/admin/auth/me` | [frontend/src/app/api/v1/admin/auth/me/route.ts](../../frontend/src/app/api/v1/admin/auth/me/route.ts) | GET | Kiểm tra thông tin phiên và trạng thái tài khoản admin |
| `/api/v1/admin/places` | [frontend/src/app/api/v1/admin/places/route.ts](../../frontend/src/app/api/v1/admin/places/route.ts) | GET, POST, PATCH, DELETE | Thêm/sửa/xóa điểm đến (`places`, `audit_logs`) với guard server-side |
| `/api/v1/admin/videos` | [frontend/src/app/api/v1/admin/videos/route.ts](../../frontend/src/app/api/v1/admin/videos/route.ts) | GET, POST, PATCH, DELETE | Quản lý video (`video_discoveries`, `audit_logs`) |
| `/api/v1/admin/videos/ai-scan` | [frontend/src/app/api/v1/admin/videos/ai-scan/route.ts](../../frontend/src/app/api/v1/admin/videos/ai-scan/route.ts) | POST | AI tự động trích xuất thông tin video |
| `/api/v1/admin/itineraries` | [frontend/src/app/api/v1/admin/itineraries/route.ts](../../frontend/src/app/api/v1/admin/itineraries/route.ts) | GET, POST, PATCH, DELETE | Quản trị lịch trình mẫu (`preset_itineraries`) |
| `/api/v1/admin/knowledge-base` | [frontend/src/app/api/v1/admin/knowledge-base/route.ts](../../frontend/src/app/api/v1/admin/knowledge-base/route.ts) | GET, POST | Quản lý bài học tri thức (`custom_knowledge_base`) |
| `/api/v1/admin/knowledge-base/[id]` | [frontend/src/app/api/v1/admin/knowledge-base/[id]/route.ts](../../frontend/src/app/api/v1/admin/knowledge-base/[id]/route.ts) | PUT, DELETE | Cập nhật và xóa tri thức cụ thể |
| `/api/v1/admin/feedback` | [frontend/src/app/api/v1/admin/feedback/route.ts](../../frontend/src/app/api/v1/admin/feedback/route.ts) | GET, POST, PATCH | Xử lý correction tickets trong `audit_logs` |
| `/api/v1/admin/feedbacks` | [frontend/src/app/api/v1/admin/feedbacks/route.ts](../../frontend/src/app/api/v1/admin/feedbacks/route.ts) | GET, PATCH | Cập nhật trạng thái người dùng feedback (`feedbacks`) |
| `/api/v1/admin/audit-logs` | [frontend/src/app/api/v1/admin/audit-logs/route.ts](../../frontend/src/app/api/v1/admin/audit-logs/route.ts) | GET | Tra cứu nhật ký kiểm toán bất biến |
| `/api/v1/admin/stats` | [frontend/src/app/api/v1/admin/stats/route.ts](../../frontend/src/app/api/v1/admin/stats/route.ts) | GET | Báo cáo thống kê hoạt động tổng thể |
| `/api/v1/admin/ai-metrics` | [frontend/src/app/api/v1/admin/ai-metrics/route.ts](../../frontend/src/app/api/v1/admin/ai-metrics/route.ts) | GET | Chỉ số đo lường hiệu năng và tỷ lệ trúng cache |
| `/api/v1/admin/upload` | [frontend/src/app/api/v1/admin/upload/route.ts](../../frontend/src/app/api/v1/admin/upload/route.ts) | POST | Tải lên ảnh thực địa lên Cloudinary (giới hạn 10MB, MIME ảnh) |
| `/api/v1/admin/revalidate` | [frontend/src/app/api/v1/admin/revalidate/route.ts](../../frontend/src/app/api/v1/admin/revalidate/route.ts) | POST | Kích hoạt ISR on-demand revalidation cho static pages |
| `/api/v1/admin/scrape-images` | [frontend/src/app/api/v1/admin/scrape-images/route.ts](../../frontend/src/app/api/v1/admin/scrape-images/route.ts) | POST | Thu thập ảnh có URL validation guard chặn SSRF |
| `/api/v1/admin/gmaps-scraper` | [frontend/src/app/api/v1/admin/gmaps-scraper/route.ts](../../frontend/src/app/api/v1/admin/gmaps-scraper/route.ts) | POST | Đồng bộ dữ liệu Google Maps qua URL validation contract |

### 3.5. Tuyến Tác Vụ Định Kỳ (Scheduled Cron APIs - 2 Routes)

| Endpoint | File Mã Nguồn | Phương Thức | Tần Suất & Nghiệp Vụ |
|---|---|---|---|
| `/api/v1/cron/cleanup-chat-logs` | [frontend/src/app/api/v1/cron/cleanup-chat-logs/route.ts](../../frontend/src/app/api/v1/cron/cleanup-chat-logs/route.ts) | GET, POST | Dọn dẹp nhật ký trò chuyện vượt quá thời hạn retention (Decision Record G3) |
| `/api/v1/cron/cleanup-chat-sessions` | [frontend/src/app/api/v1/cron/cleanup-chat-sessions/route.ts](../../frontend/src/app/api/v1/cron/cleanup-chat-sessions/route.ts) | GET, POST | Hủy các phiên làm việc ẩn danh đã hết hạn |

---

## 4. Xác Nhận Kiểm Chứng & Giới Hạn

1. **Khớp 100% với file system**: Toàn bộ 65 routes trong tài liệu này đều tồn tại thực tế trên đĩa cứng dưới `frontend/src/app/`.
2. **Khớp 100% với Next.js Build**: Bản build sản phẩm tạo ra 181 static routes (bao gồm 149 routes tĩnh cho các điểm du lịch `/places/[id]` do script prebuild sinh ra) và các serverless endpoints.
3. **Phân định rạch ròi Python runtime**: Thư mục `backend/` và các scripts Python hoàn toàn là công cụ nội bộ khảo sát và kiểm thử offline, không bao giờ được coi là một API gateway chạy trên production.
