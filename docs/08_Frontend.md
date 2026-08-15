# 08. GIAO DIỆN WEB PORTAL (FRONTEND PORTAL)
## PHONG CÁCH THIẾT KẾ: "FOLK-MODERN BẢY NÚI"

---

## 1. Triết Lý & Định Hướng Giao Diện
* **Triết lý cốt lõi**: *"Folk-Modern Bảy Núi"* — Chất liệu dân dã miền núi Khmer (thốt nốt, lúa, chùa, nắng) kết hợp ngôn ngữ ứng dụng du lịch hiện đại (card, chip, metro-line, ticket-stub, motion).
* **Nền tảng màu sắc**:
  * Nền cát sương ấm `--bg: #FAF3E7` (tránh nền trắng tinh `#FFF` và đen thuần `#000`).
  * Chữ đất núi `--ink: #26221B`, chữ phụ `--ink-soft: #6B6355`.
  * Màu chủ đạo ngọc Tà Pạ `--jade: #0E8C7F` & Nút CTA chính vàng thốt nốt `--palm: #F0A32F`.
  * Chế độ "Đêm Tri Tôn" `--night-bg: #151B34` & Đom đóm `--firefly: #FFD37A`.
* **Bộ 3 Font chữ**:
  * Heading / Display: `Bricolage Grotesque` (700–800).
  * Body / UI: `Be Vietnam Pro` (400–700).
  * Mẹo thực địa / Con dấu: `Patrick Hand` (Viết tay mộc mạc).
* **Không dùng Emoji**: 100% sử dụng icon SVG Lucide.

---

## 2. Công Nghệ & Tech Stack
* **Framework**: Next.js 14 / React 19 (App Router, Server & Client Components).
* **Styling**: TailwindCSS với Design Tokens Folk-Modern Bảy Núi.
* **Bản đồ**: Interactive Leaflet GIS Map + WGS84 Bounding Box Tri Tôn `[10.25-10.55 Lat, 104.85-105.15 Lng]`.
* **Dữ liệu**: Nạp động 100% từ Supabase Database (PostgreSQL + pgvector).

---

## 3. Cấu Trúc Các Trang Web Portal
1. **Trang chủ (`/`)**:
   - Hero full-bleed Hồ Tà Pạ / hoàng hôn tuyến tránh zoom chậm.
   - Tìm kiếm giải quyết nỗi đau du khách dạng chip.
   - Dải Reels TikTok thực tế, cụm điểm đến 4 xã, đặc sản ẩm thực và section "Đêm Tri Tôn".
2. **Trang khám phá (`/places`)**:
   - Thẻ POI Card bo góc 26px, ảnh 4:3 scrim 40%, chip category riêng biệt, nút Chỉ đường `--palm` & Xem TikTok.
   - Bộ lọc theo Xã/Thị trấn và Danh mục màu sắc.
3. **Trang chi tiết (`/places/[id]`)**:
   - Hình ảnh chất lượng cao, cảnh báo thời điểm thực địa, trình phát TikTok Shorts, nút định vị Maps.
4. **Trang ẩm thực (`/food`)**:
   - Danh sách món ăn bản địa (Gà đốt Ô Thum, Cháo bò trái chúc, Đu đủ đâm, Bánh bò thốt nốt) kèm lưu ý đặt trước.
5. **Trang lưu trú (`/stay`)**:
   - Homestay, nhà nghỉ bản địa kèm thông tin bãi đỗ xe ô tô 7-16 chỗ.
6. **Trang văn hóa (`/culture`)**:
   - Chùa Khmer, lễ hội Đua bò Bảy Núi, Kinh lá buông, quy tắc trang phục tâm linh.
7. **Trang lịch trình (`/itinerary`) & AI Trip Planner**:
   - Sơ đồ Metro-line tự vẽ theo bước chân du khách và thẻ Ticket-stub lịch trình độc đáo.
8. **Trang cẩm nang & Di chuyển (`/guide`)**:
   - Bách khoa toàn thư 7 chuyên đề về Tri Tôn và 3 hotline SOS cứu hộ 24/7.
9. **Trang bản đồ GIS (`/map`)**:
   - Bản đồ số toàn diện 82 điểm master.
10. **Trợ lý AI Chatbot (`/chatbot` & `ChatbotWidget`)**:
    - Streaming AI RAG tức thì, hỗ trợ gợi ý lịch trình, xem video và giải đáp điểm đến.
