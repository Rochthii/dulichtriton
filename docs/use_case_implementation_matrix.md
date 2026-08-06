# MA TRẬN KHỚP USE CASE CHUẨN VÀ THIẾT KẾ KIẾN TRÚC HỆ THỐNG
## DU LỊCH TRI TÔN AI (TRI TON TOURISM AI SYSTEM)

---

## 🎯 1. Nguyên Tắc Thiết Kế Bám Sát Use Case (Use Case-Driven Design)

Toàn bộ các linh kiện UI, API Endpoint, Cơ sở dữ liệu và Thuật toán AI trong hệ thống **Du Lịch Tri Tôn** được thiết kế khớp 1:1 với 8 Use Case chuẩn nghiệp vụ (UC01 - UC08).

---

## 📋 2. Ma Trận Khớp Khép Kín (End-to-End Mapping Matrix)

| Mã UC | Tên Use Case Nghiệp Vụ | Màn Hình Frontend (Next.js 14) | API Backend (FastAPI / Next.js Routes) | Bảng CSDL & Chỉ Mục Supabase | Xử Lý Lõi AI & Security |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC01** | **Khám phá Du lịch (Tourism Discovery)** | • Trang chủ (`/`)<br>• Danh sách địa điểm (`/places`)<br>• Trang đặc sản (`/food`) | `GET /api/v1/places`<br>`GET /api/v1/places/{id}` | • Table `places`<br>• Index B-Tree (`commune`, `category`) | Phân trang SWR Edge Cache, tốc độ tải `< 50ms`. |
| **UC02** | **AI Assistant (Hỏi Đáp RAG)** | • Floating Chatbot Widget nổi góc dưới màn hình | `POST /api/v1/chat/query` | • Table `places` (Field `embedding`)<br>• Index `HNSW vector` | • `AIOrchestrator` 14 bước<br>• BM25 + Vector Hybrid Search<br>• Dynamic Guardrails (0% Emoji) |
| **UC03** | **AI Trip Planner (Lập Lịch Trình Tour)** | • Trang Lập Tour (`/itinerary`)<br>• Export QR Modal | `POST /api/v1/itineraries/generate` | • Table `places`<br>• Table `itineraries` | • Thuật toán `AITripPlanner`<br>• Tối ưu ma trận thời gian di chuyển |
| **UC04** | **Bản đồ GIS & Dẫn đường** | • Leaflet / MapLibre Map Component trên `/places` | `GET /api/v1/places/nearby` | • Table `places` (Field `geom`)<br>• Index `PostGIS GiST` | • Tính bán kính Haversine `< 5km`<br>• Dynamic Google Maps Search URL |
| **UC05** | **Video Engine (TikTok Shorts Embed)** | • Carousel TikTok Shorts trên Trang chủ & Chi tiết | `GET /api/v1/places/{id}/videos` | • Table `videos`<br>• Index `idx_videos_place_id` | • Dịch vụ `VideoCacheService`<br>• Chống Rate-limit IP 100% |
| **UC06** | **Quản lý Yêu thích & QR Code** | • Trang Yêu thích (`/wishlist`) | `POST /api/v1/wishlist` | • Table `chat_sessions`<br>• Table `user_wishlists` | • LocalStorage / Cookie Session |
| **UC07** | **Partner Portal (Tích Xanh Doanh nghiệp)** | • Trang Đối tác (`/partner`) | `POST /api/v1/partner/places` | • Table `places`<br>• Table `partners` | • Row Level Security (RLS) Supabase<br>• Server-side RBAC verification |
| **UC08** | **Admin Control Center & Audit Trail** | • Dashboard Quản trị (`/admin`)<br>• Nhật ký Audit (`/admin/audit-logs`) | `GET /api/v1/admin/audit-logs`<br>`PUT /api/v1/admin/places/{id}` | • Table `audit_logs`<br>• Trigger `trg_update_place_geom` | • Ghi log bất biến: {WHO, WHAT, WHEN, FROM_WHERE} |

---

## 🛠️ 3. Chi Tiết Khung Luồng Hoạt Động (Use Case Activity Flows)

### UC02 - AI Assistant Query Processing Flow
$$\text{User Ask} \rightarrow \text{Chat Widget} \rightarrow \text{API /chat/query} \rightarrow \text{AIOrchestrator} \rightarrow \text{HybridSearch (BM25 + HNSW Vector)} \rightarrow \text{Guardrails (0% Emoji)} \rightarrow \text{Structured JSON (Answer + PlaceCard + TikTok Embed)}$$

### UC04 - GIS Proximity Search Flow
$$\text{User Location (Lat, Lng)} \rightarrow \text{API /places/nearby} \rightarrow \text{PostGIS GiST Index Query} \rightarrow \text{Return Places within 5km} \rightarrow \text{Render Leaflet Map Markers}$$

---

## 📌 4. Tiêu Chí Nghiệm Thu Theo Use Case (Acceptance Criteria)

1. **Khám phá (UC01 & UC04)**: Mọi địa điểm khi bấm vào phải mở đúng thông tin, bản đồ cắm ghim đúng tọa độ Bounding Box $[10.25-10.55, 104.85-105.15]$.
2. **Hỏi đáp AI (UC02)**: Trả về câu trả lời tự nhiên tiếng Việt, nhúng kèm thẻ địa điểm + video TikTok Shorts thực tế, **0% Emoji**.
3. **Quản trị (UC08)**: Mọi thao tác thêm/sửa/xóa của Admin đều sinh 1 bản ghi bất biến trong `audit_logs`.
