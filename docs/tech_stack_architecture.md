# BỘ CÔNG NGHỆ TOÀN CẢNH & KIẾN TRÚC TỐI ƯU HÓA (DU LỊCH TRI TÔN AI)

> **Căn cứ xác thực:** [Deployment Path Inventory](technical-spec/DEPLOYMENT_PATH_INVENTORY.md) (P00-003 / P06-010) · [Kiến Trúc Hệ Thống](02_System_Architecture.md) · [Decision Record G0](technical-spec/DECISION_RECORD_G0.md).  
> **Nguyên tắc cốt lõi:** Production-Real, 0% Mock/Demo. Mọi thành phần đều có đường build và deploy thực tế.

---

## 🎯 1. ĐÁNH GIÁ KIẾN TRÚC & ĐIỀU CHỈNH CHUYÊN GIA

Nền tảng **Du Lịch Tri Tôn** được thiết kế theo tiêu chuẩn kiến trúc hiện đại Jamstack / Serverless Portal, tối ưu hóa tốc độ tải trang, độ trễ phản hồi AI và khả năng mở rộng không giới hạn:

```
[ Frontend & API Gateway: Next.js 16 App Router (Vercel Production) ]
                 │
                 ├──► [ AI Multi-LLM Layer: Groq Llama 3.3 + Gemini 2.5 + OpenRouter ]
                 ├──► [ GIS & Spatial Queries: Supabase PostGIS Engine ]
                 ├──► [ Vector & Knowledge Retrieval: pgvector + Hybrid Matching ]
                 └──► [ Media Storage & Optimization: Cloudinary Media CDN ]
```

---

## 🛠️ 2. LỰA CHỌN CÔNG NGHỆ THEO LỚP KỸ THUẬT

### 2.1. Lớp Frontend & Serverless API Gateway
* **Next.js 16 (App Router & React 19)**: Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR) với 181 routes tĩnh và động.
* **TailwindCSS v4**: Design tokens Folk-Modern Bảy Núi (`#1B4D3E` Emerald Green, `#D99B26` Golden Palm).
* **Lucide React Icons**: Đảm bảo quy tắc **0% Emoji**, 100% SVG icons.

### 2.2. Lớp AI Orchestration & Multi-LLM Layer
* **Adaptive Multi-LLM Engine (`src/lib/aiProvider.ts`)**: Quản lý caching, streaming SSE, tự động circuit breaker và fallback linh hoạt:
  * **Primary LLM**: Groq Llama-3.3-70b-versatile (Tốc độ phản hồi cực nhanh dưới 500ms).
  * **Fallback LLM**: Google Gemini 2.5 Flash / Gemini 1.5 Flash (Tổng hợp ngữ cảnh lớn và phân tích sâu).
  * **Redundancy Fallback**: OpenRouter (Dự phòng thảm họa).

### 2.3. Lớp CSDL & Không Gian Địa Lý (Database & GIS Layer)
* **Supabase Cloud PostgreSQL 15**:
  * **Extension `PostGIS`**: Xử lý truy vấn không gian WGS84 Tri Tôn, tìm điểm tham quan và quán ăn lân cận qua hàm `match_places_nearby`.
  * **Extension `pgvector`**: Lưu trữ và tìm kiếm vector embedding tri thức du lịch Tri Tôn.
  * **Row Level Security (RLS)**: Khóa chặt 100% quyền truy cập bảng nhạy cảm đối với client roles (`anon`, `authenticated`), chỉ cho phép thực thi qua server-side service role key.

### 2.4. Lớp Lưu Trữ & Tối Ưu Hóa Hình Ảnh Cloudinary Media Service
* **Cloudinary Media API Integration**: Quản lý và lưu trữ kho ảnh thực địa địa điểm và ẩm thực Tri Tôn.
* **Tự Động Nén & Tối Ưu Hóa Ảnh**:
  * Tự động resize kích thước tối đa 1200px (`w_1200,c_limit`).
  * Tự động chuyển đổi sang định dạng **WebP** thế hệ mới (`f_auto,q_auto`) giúp giảm dung lượng ảnh mà vẫn giữ nguyên độ nét.
  * Tải lên qua API bảo mật `frontend/src/app/api/v1/admin/upload/route.ts` với giới hạn 10MB và MIME type allowlist.

### 2.5. Phân Định Công Cụ Nghiên Cứu Python (Offline Tooling)
* **Python 3.11/3.12 (`backend/`, `scripts/`)**: Phục vụ khảo sát dữ liệu thô, kiểm thử hồi quy pytest, kiểm tra fresh migration replay và xác thực ma trận RLS. **Không triển khai endpoint công khai nào lên môi trường production**.

---

## 🚀 3. QUY TRÌNH VẬN HÀNH & TRIỂN KHAI PRODUCTION

1. **Build Frontend**: `cd frontend && npm install && npm run build` (tạo 181 static/dynamic routes).
2. **Triển khai Vercel**: Tự động qua git push lên nhánh `main` dựa trên cấu hình `vercel.json`.
3. **Triển khai CSDL**: Migration replay pass trên Supabase PostgreSQL qua `supabase/migrations/*.sql`.
4. **Giám sát**: Nhật ký kiểm toán bất biến `public.audit_logs` và đo lường hiệu năng tại `/admin/ai-metrics`.
