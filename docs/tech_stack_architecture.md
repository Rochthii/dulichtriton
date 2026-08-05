# BỘ CÔNG NGHỆ TOÀN CẢNH & TỐI ƯU NHẤT (DU LỊCH TRI TÔN AI PLATFORM)

---

## 🚀 1. TỔNG QUAN LỰA CHỌN CÔNG NGHỆ (TECH STACK SUMMARY)

Hệ thống **Du Lịch Tri Tôn** được thiết kế theo kiến trúc hiện đại, tập trung vào **Tốc độ tải cực nhanh (< 2s)**, **Chuẩn SEO Google Số 1**, **Bảo mật chuẩn Production** và **Đồng bộ UI/UX 100% (No Emoji)**.

```
[ Frontend: Next.js 14 (Vercel) ] ──(REST API/RAG)──> [ Backend: FastAPI Python 3.11 ]
                 │                                                │
                 └───(Direct Query / Auth)───────> [ Database: Supabase PostgreSQL + pgvector ]
```

---

## 🛠️ 2. LỰA CHỌN CHI TIẾT THEO 6 LỚP KỸ THUẬT

### 2.1. Lớp Frontend & Giao Diện Người Dùng (Client Layer)
* **Khung ứng dụng chính**: **Next.js 14 (App Router & React 18)**
  * *Lý do chọn*: Hỗ trợ Server Components, Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR) giúp tối ưu SEO Top 1 Google cho các địa điểm du lịch.
* **Tối ưu Giao diện (Styling)**: **TailwindCSS**
  * *Lý do chọn*: Tối ưu dung lượng CSS bundle nhỏ nhẹ, cấu hình sẵn hệ màu Design Tokens (`#1B4D3E` Xanh Bảy Núi, `#D99B26` Vàng thốt nốt, `#0F172A` Đen đá).
* **Bộ Icon đồ họa**: **Lucide React SVG Icons**
  * *Lý do chọn*: Đảm bảo quy tắc **0% Emoji**, 100% biểu tượng SVG sắc nét, đồng bộ chuẩn chuyên nghiệp.
* **Triển khai Frontend (Deployment)**: **Vercel**
  * *Lý do chọn*: Hạ tầng Edge Network toàn cầu, tự động tối ưu hóa hình ảnh WebP và tích hợp CI/CD với GitHub.

### 2.2. Lớp Cơ Sở Dữ Liệu & Tìm Kiếm Vector (Database & RAG Layer)
* **Hệ quản trị CSDL**: **Supabase (PostgreSQL 15)**
  * *Lý do chọn*: PostgreSQL chuẩn công nghiệp, hỗ trợ RLS (Row Level Security), giao dịch nguyên tử (Atomic Transactions) và Supabase Auth tích hợp.
* **Công nghệ Tìm kiếm Vector (RAG)**: **Extension `pgvector`**
  * *Lý do chọn*: Tích hợp trực tiếp trong PostgreSQL, lưu trữ Vector Embedding 1536 chiều, cho phép tìm kiếm ngữ nghĩa (Semantic Search) đồng thời với truy vấn dữ liệu quan hệ mà không cần duy trì thêm server vector độc lập (như Pinecone/Weaviate).
* **Bảo mật & Phân quyền**: **Supabase Auth & RLS**
  * *Lý do chọn*: Phân quyền người dùng, Chủ gian hàng (Partner) và Quản trị viên (Admin) trực tiếp từ phía Server.

### 2.3. Lớp Backend Core & Dịch Vụ AI Chatbot (Backend Layer)
* **Khung dịch vụ API**: **FastAPI (Python 3.11)**
  * *Lý do chọn*: Tốc độ thực thi cực nhanh (Async I/O dựa trên Starlette/Pydantic), tự động tạo tài liệu OpenAPI/Swagger.
* **Chuẩn hóa & Kiểm duyệt Dữ liệu**: **Pydantic v2 & Unicode NFC**
  * *Lý do chọn*: Validate dữ liệu đầu vào/đầu ra, chuẩn hóa tiếng Việt Unicode NFC tự động trước khi ghi CSDL.
* **Mô hình AI Core (LLM Engine)**: **Google Gemini API (Gemini 1.5 Flash / Pro)**
  * *Lý do chọn*: Phản hồi tiếng Việt tự nhiên, tốc độ siêu nhanh (< 1.5s), hỗ trợ sinh định dạng Structured JSON để nhúng Thẻ UI & Video TikTok.

### 2.4. Lớp Bản Đồ Số GIS (GIS & Mapping Layer)
* **Thư viện Bản đồ**: **Leaflet.js / MapLibre GL**
  * *Lý do chọn*: Nhẹ, mượt trên thiết bị di động, **0% chi phí API** (so với Google Maps API đắt đỏ), dễ tùy biến Custom SVG Marker cho 105 địa điểm Tri Tôn.
* **Định dạng Tọa độ**: **WGS84 GeoJSON Standard**

### 2.5. Lớp Nhúng Media & Video Thực Tế (Media Layer)
* **Nhúng Video Review**: **TikTok Embed API & YouTube Shorts iFrame**
  * *Lý do chọn*: Cho phép du khách xem video thực tế 15-30s của phượt thủ/tiktoker mà không làm nặng server.
* **Lưu trữ Hình ảnh**: **Cloudinary / Supabase Storage**
  * *Lý do chọn*: Tự động nén ảnh WebP, resize linh hoạt theo màn hình di động.

### 2.6. Lớp DevOps & Quản Lý Mã Nguồn (DevOps & CI/CD)
* **Quản lý mã nguồn**: **Git & GitHub (`https://github.com/Rochthii/dulichtriton.git`)**
* **Nhật ký Hệ thống (Audit Log)**: **Immutable Audit Trail Logger**
  * *Lý do chọn*: Lưu vết tác vụ admin (Ai, Làm gì, Khi nào, Từ đâu) đúng quy tắc Production-Real.
