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

### 🍜 RULE-22: Tri Ton Cultural & Culinary Accuracy Standard
* **Thuật ngữ Ẩm thực**: Tri Tôn TUYỆT ĐỐI KHÔNG CÓ BÚN NƯỚC LÈO, KHÔNG NẤU MẮM — tên gọi ẩm thực chuẩn bản địa phải luôn là **"Bún Cá Củ Ngải" (Bún cá Khmer / Bún cá Tri Tôn nấu cá lóc đồng, nghệ tươi và củ ngải bún thanh ngọt, không để mắm)**.
* **Địa danh hành chính**: Tuyệt đối KHÔNG dùng cụm từ "Huyện Tri Tôn" — luôn luôn dùng tên Xã hoặc Thị trấn cụ thể.

---

## 🗺️ 2. AI Travel Planning Engine & Spatial Intelligence v27.0.0

 Kiến trúc lập lịch trình du lịch hiện đại **Rich Travel Engine** bao gồm 4 khối công cụ xử lý song song:
1. **PostGIS Route & Travel Time Engine (`@/lib/routeEngine`)**:
   - Sử dụng công thức Haversine/PostGIS `ST_Distance` tính toán ma trận khoảng cách $d_i$ (km) thực tế giữa các mốc địa điểm.
   - Ước tính thời gian di chuyển bằng xe máy $t_i$ (phút) dựa trên vận tốc trung bình 30km/h ở khu vực miền Tây.
   - Tính toán chỉ số tổng hành trình: Total Distance, Motorbike Travel Time, Total Visit Time & Total Trip Time.
2. **Deterministic 2-Link Evidence & Hashtag Generator (`@/lib/evidenceGenerator`)**:
   - Tự động sinh link **Google Maps 1-click**: `https://www.google.com/maps/search/?api=1&query={encode(name + ' ' + commune + ' An Giang')}`.
   - Tự động sinh link **TikTok Search Review**: `https://www.tiktok.com/search?q={encode(name + ' Tri Tôn')}`.
   - Tự động phát sinh bộ Hashtag chuẩn địa phương: `#HoTaPa #TriTon #AnGiang #DuLichTriTon`.
3. **Cost Engine & Multi-Category Estimator (`@/lib/costCalculator`)**:
   - Bóc tách ngân sách chi tiết 5 hạng mục: Ăn sáng (30k), Ăn trưa Gà đốt (120k), Ăn tối Bò nướng (90k), Thuê xe máy & Xăng (200k/ngày), Vé tham quan (60k) và Homestay (350k).
4. **Rich Travel Itinerary Cards Format**:
   - Định dạng từng mốc thời gian gồm: Giờ $\rightarrow$ Tên điểm $\rightarrow$ Địa chỉ xã $\rightarrow$ Khoảng cách km $\rightarrow$ Phút di chuyển $\rightarrow$ 2 Links kiểm chứng $\rightarrow$ Hashtags $\rightarrow$ Khối 📊 TỔNG HÀNH TRÌNH ở cuối câu trả lời.

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

### 📐 Design Tokens & Palette ("Folk-Modern Bảy Núi")
* **Background Warm Sand (`--bg`)**: `#FAF3E7` (Nắng đồng lúa & cát sương — tránh trắng tinh).
* **Surface Card (`--surface`)**: `#FFFDF7` (Bề mặt thẻ bưu thiếp).
* **Primary Ink Text (`--ink`)**: `#26221B` (Đất đá núi — độ tương phản cao).
* **Primary Jade (`--jade`)**: `#0E8C7F` (Nước hồ Tà Pạ — màu chủ đạo, link, active, nature).
* **Primary CTA Palm (`--palm`)**: `#F0A32F` (Vàng thốt nốt chín — nút CTA chính: Chỉ đường, Xem lịch trình).
* **Sunset Accent (`--sunset`)**: `#F26B3A` (Cam hoàng hôn — badge hot, culinary).
* **Commune / Category Colors**: Terracotta `#A6503A` (Lịch sử), Saffron `#D9822B` (Chùa Khmer), Festival Purple `#7C5CBF`, Homestay `#8A5A33`.
* **Dark Mode "Đêm Tri Tôn"**: Background `#151B34`, Surface `#1E2647`, Firefly `#FFD37A`.
* **Typography Trio**: `Bricolage Grotesque` (Heading/Logo), `Be Vietnam Pro` (Body/UI), `Patrick Hand` (Ghi chú mẹo phượt/Stamp).

### 📺 TikTok Media & Hashtag Redirect Protocol
* **Pop-up Modal TikTok Reels**: Hiển thị Pop-up xem trực tiếp thông tin review video TikTok trên Trang chủ.
* **Hashtag Redirect Button**: Nút "Xem TikTok" ở Trang Khám phá (`/places`) tự động sinh đường dẫn TikTok Search mở tab mới chính xác từng địa điểm.

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
* Tất cả dữ liệu hiển thị trên các màn hình (`/`, `/places`, `/places/[id]`, `/food`, `/stay`) phải được nạp động từ Supabase CSDL qua Service `@/lib/places` (`getFeaturedPlaces()`, `getPlacesByCommune()`, `getPlaceById()`).

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

---

## ⚡ 6. Next.js Enterprise Cache Architecture (RULE-23)

### 🎯 Nguyên Tắc Single Master Key (Zero Cache Dilution)
* Mỗi nhóm danh mục (`places`, `food`, `stays`, `culture`, `videos`) chỉ lưu trữ **ĐÚNG 1 MASTER CACHE KEY DUY NHẤT** trên Next.js Data Cache (`master-places-all-v3`, `master-food-places-v3`...).
* **Tuyệt đối KHÔNG phân mảnh cache theo query params** (`?commune=...&night=...`). Toàn bộ việc lọc xã, tìm kiếm, lọc đêm được xử lý **100% Client-Side / In-Memory (`useMemo`)**.

### 🛡️ Van An Toàn 24h & Invalidation On-Demand
* Cấu hình `revalidate: 86400` (24h) làm van an toàn phòng trường hợp Vercel evict cache.
* Khi Admin thực hiện thêm/sửa/xóa điểm du lịch, kích hoạt ngay:
  ```typescript
  bumpDataVersion();
  (revalidateTag as any)('places', { expire: 0 });
  revalidatePath('/', 'layout');
  ```

### 🔄 Reactive Client SWR Sync
* Sử dụng `fastCache.ts` với callback `onRevalidated` để khi dữ liệu mới tải ngầm từ server về, React State tự động cập nhật lại màn hình người dùng ngay lập tức mà không cần F5.
* **Tách biệt dữ liệu cá nhân**: Lịch sử chat, danh sách yêu thích, phiên chatbot là dữ liệu riêng biệt của từng User, tuyệt đối không gắn tag `'places'` hay lưu vào public shared cache.

---

## 🤖 7. Google Search Grounding & Multi-LLM Resilience Protocol (RULE-24)

### 🌐 Google Search Grounding (Live Web Discovery)
* Kích hoạt Native Search Grounding trong Gemini API v1beta:
  ```typescript
  body: JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    tools: [{ google_search: {} }],
  })
  ```
* Cho phép AI tự động tra cứu Google Search theo thời gian thực để trả lời các sự kiện, giá vé, quán mới nổi trên internet tại Tri Tôn.

### 🔄 Multi-Key Round-Robin & Multi-Tier Failover (100% Free)
1. **Tier 1: Google Gemini 2.0 Flash + Search Grounding**: Xoay vòng 4 API Keys liên tục (6,000 lượt hỏi/ngày miễn phí).
2. **Tier 2: Groq Llama-3.3-70B-Versatile**: Tự động chuyển vùng khi Gemini quá tải (tốc độ 100+ tokens/giây).
3. **Tier 3: OpenRouter Free Models**: Dự phòng phân tán nhiều nhà cung cấp.
4. **Tier 4: Smart Local RAG**: Đảm bảo 100% uptime không bao giờ làm gián đoạn trải nghiệm của du khách.
