---
name: triton-workflow-execution-standard
description: Complete production-real engineering workflow, dynamic environment security protocol (RULE-20), mandatory 360-degree self-critique protocol (RULE-21), Supabase PostgreSQL+pgvector architecture, Cloudinary image auto-optimization, and 13-screen Next.js 14 Web Portal standards for Tri Ton Tourism system.
---

# DU LỊCH TRI TÔN — COMPLETE WORKFLOW EXECUTION & PRODUCTION STANDARD SKILL

Tài liệu này đóng gói trọn vẹn quy trình kỹ thuật chuẩn Enterprise, quy tắc phản biện 360 độ và chuẩn mực phát triển hệ thống cho dự án **Du Lịch Tri Tôn AI System**.

---

## 🛡️ 1. Bộ Quy Tắc An Toàn & Phản Biện Bắt Buộc (Mandatory Security & Critique Protocol)

### 🔑 RULE-20: Environment Variable Security Standard (0% Hardcoded Credentials)
* **Tuyệt đối KHÔNG hardcode API Keys, Passwords, DB Connection strings hoặc Secret Tokens** vào bất kỳ tệp mã nguồn Python, TSX, SQL hay Markdown nào.
* **100% Credentials phải được nạp động** từ tệp `.env.local` / `.env` (được bảo vệ qua `.gitignore`).
* **Sử dụng Helper Function**: Luôn sử dụng `load_env()` trong Python hoặc `process.env.NEXT_PUBLIC_*` trong Next.js.

### 🧠 RULE-21: Mandatory 360-Degree Self-Critique & Cross-Verification Standard
* Trước mọi hành động thiết kế kiến trúc, nâng cấp CSDL hoặc viết code, AI **BẮT BUỘC phải thực hiện tự phản biện 360 độ** trên các khía cạnh:
  1. *Bảo mật & RLS (Row Level Security)*.
  2. *Ràng buộc dữ liệu DB-Level (Check constraints, Null safety)*.
  3. *Hiệu năng truy vấn (Partial Indexes, Unaccent GIN Trigram, HNSW Tuning)*.
  4. *Trạng thái Edge-cases (Ngoại lệ dữ liệu, Rate limit, Timeout)*.
* **Chỉ tiến hành thi công khi đã thông nhất phương án tối ưu nhất**.

---

## 🗄️ 2. Quy Trình Thi Công & Tối Ưu CSDL Supabase Cloud PostgreSQL

### 📊 DDL Schema Standards (`tourism_crawler/database/schema.sql`)
1. **Extensions**: `"uuid-ossp"`, `"vector"`, `"postgis"`, `"unaccent"`, `"pg_trgm"`.
2. **5 Bảng Core Production**: `public.places`, `public.videos`, `public.chat_sessions`, `public.chat_messages`, `public.audit_logs`.
3. **Hard DB Constraints**:
   - Tọa độ Bounding Box Tri Tôn: `CHECK (latitude BETWEEN 10.25 AND 10.55 AND longitude BETWEEN 104.85 AND 105.15)`.
   - Rating & Confidence: `CHECK (rating BETWEEN 0.0 AND 5.0)` & `CHECK (confidence_score BETWEEN 0.0 AND 100.0)`.
4. **Hệ Thống Chỉ Mục Tốc Độ High Concurrency**:
   - `idx_places_embedding_hnsw`: HNSW Vector Index `(m = 16, ef_construction = 64)` cho RAG AI.
   - `idx_places_geom`: PostGIS Spatial GiST Index.
   - `idx_places_name_trgm` & `idx_places_address_trgm`: GIN Trigram Index với hàm `public.f_unaccent(text)` IMMUTABLE wrapper cho phép tìm kiếm tiếng Việt không dấu siêu tốc.
   - `idx_places_commune`: Partial B-Tree Index với điều kiện `WHERE is_active = true`.
5. **Row Level Security (RLS)**: Bật RLS 100% trên cả 5 bảng kèm chính sách `Public Read-Only` công khai cho địa điểm/video.

---

## 🖼️ 3. Quy Trình Thu Thập Ảnh Thực Tế & Tối Ưu Hóa Cloudinary Media API

### 📸 Cấu Trúc Data Ảnh Có Nguồn Nguồn Minh Bạch (Photos Metadata Schema)
Mỗi địa điểm lưu trữ mảng JSONB `photos` trên PostgreSQL với đầy đủ trích dẫn nguồn:
```json
[
  {
    "url": "https://images.unsplash.com/photo-...",
    "caption": "Mặt hồ Tà Pạ xanh ngọc bích soi bóng vách đá nghiêng kỳ vĩ",
    "source": "Cổng thông tin Du lịch An Giang (angiangtourism.vn)",
    "license": "Public Domain Tourism Collection"
  }
]
```

### ⚡ Cloudinary Auto-Optimization Protocol (`tourism_crawler/services/cloudinary_uploader.py`)
* Tự động resize kích thước tối đa 1200px (`w_1200,c_limit`).
* Tự động nén và chuyển đổi định dạng **WebP** (`f_auto,q_auto`) giảm 75% dung lượng ảnh.

---

## 🎨 4. Chuẩn Mực Phát Triển Frontend Web Portal Next.js 14

### 📐 Design Tokens & Palette
* **Primary Emerald Green**: `#1B4D3E` (Xanh đại ngàn Bảy Núi — dùng cho Header, Button chính, CTA).
* **Secondary Golden Palm**: `#D99B26` (Vàng thốt nốt & Khmer — dùng cho Badges, Rating Stars, Highlight).
* **Neutral Dark Slate**: `#0F172A` (Text chính & Dark Mode).
* **Surface Background**: `#F8F9FA` (Nền sáng ngà ấm áp).

### 🚫 Quy Chuẩn 0% Emoji & SVG Icons Only
* **TUYỆT ĐỐI KHÔNG DÙNG EMOJI** trong mã nguồn hay giao diện UI.
* **100% SVG Icons**: Sử dụng thư viện `lucide-react` (`Compass`, `MapPin`, `Sparkles`, `Utensils`, `Calendar`, `Navigation`, `Camera`, `ShieldCheck`).

### 🗺️ Dynamic Google Maps Search Navigation Helper
* **KHÔNG hardcode URL Google Maps tĩnh**.
* Sử dụng Helper Function:
  ```typescript
  export function getGoogleMapsUrl(name: string, commune: string): string {
    const query = `${name}, ${commune}, Tri Tôn, An Giang`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  ```

### 🔄 Dynamic Data Fetching Standard (0% Hardcoded Code)
* Tất cả dữ liệu hiển thị trên các màn hình (`/`, `/places`, `/places/[id]`) phải được nạp động từ Supabase CSDL qua Service `@/lib/places` (`getFeaturedPlaces()`, `getPlacesByCommune()`, `getPlaceById()`).

---

## 📂 5. Bộ 13 Màn Hình Prototype Standard Scaffolding

Dự án duy trì bộ 13 màn hình chuẩn theo [docs/ui_prototype_showcase.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/ui_prototype_showcase.md):
1. `/` (Trang chủ Web Portal & AI Search Entrance)
2. `/places` (Khám phá 106 Địa điểm & Bộ lọc Xã/Thị trấn)
3. `/places/[id]` (Chi tiết Địa điểm & Nhúng TikTok Shorts Embed)
4. `/food` (Đặc sản Ẩm thực Gà Đốt Ô Thum & Gọi Đặt Món)
5. `ChatbotWidget.tsx` (Khung AI Chatbot Floating Widget RAG Stream)
6. `/itinerary` (Trợ lý Lập Lịch trình AI Tour 2D1N)
7. `/stay` (Lưu trú Homestay & Badge đỗ xe)
8. `/culture` (Văn hóa Khmer & Lễ hội Đua bò)
9. `/map` (Bản đồ GIS Tương tác Bounding Box)
10. `/guide` (Cẩm nang Di chuyển xe khách/xe máy)
11. `ItineraryExportModal` (Modal Xuất QR Code / PDF)
12. `/partner` (Cổng Đăng ký Dịch vụ Đối tác)
13. `/admin` (Admin Control Center & Audit Logs Dashboard)
