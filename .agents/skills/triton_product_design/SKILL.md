---
name: triton-product-design-and-stack
description: Full Design System Tokens (Color, Typography, Lucide SVG Icons, 16-Screen System, Component Specs), Tech Stack rules (Next.js/React on Vercel, Supabase DB), and User-Centric UI/UX design philosophy for Tri Ton Tourism project.
---

# DU LỊCH TRI TÔN — DESIGN SYSTEM, PRODUCT DESIGN & TECH STACK SKILL

## 1. Design System Tokens (Bảng màu & Đồng bộ 100%)
* **Primary Emerald**: `#1B4D3E` / `#0F5132` (Xanh đại ngàn Bảy Núi — dùng cho Header, Primary CTA, Accent).
* **Secondary Golden Palm**: `#D99B26` / `#E5A93C` (Vàng thốt nốt & Khmer — dùng cho Badges, Ratings, Action Buttons).
* **Theme 1 (Deep Emerald & Warm Gold)**: Tone màu chuẩn dùng làm thiết kế gốc đồng bộ 100% giữa Trang chủ và các trang con.
* **Neutral Dark Slate**: `#0F172A` (Slate 900 — dùng cho Văn bản tiêu đề & High contrast text trên nền sáng).
* **Background Light**: `#F4F9F5` / `#F8F9FA` (Warm Off-White — nền trang sáng ngà thanh lịch).
* **Text Contrast Standard**: Tiêu đề và mô tả trên nền thẻ trắng `bg-white` bắt buộc dùng `text-slate-900` và `text-slate-600` tương phản cao 100% (không dùng text mờ).

## 2. UI Icon Standard (NO EMOJI POLICY & SVG Mapping)
* **STRICT RULE**: ABSOLUTELY NO EMOJIS anywhere in the UI, text buttons, headings, or components.
* **SVG ONLY**: Use clean, standard SVG icons ONLY (`Lucide Icons` / `Heroicons`).
* **Lucide Icon Mappings**:
  * Search AI: `<Search />` | MapPin / Navigation: `<MapPin />` | Interactive Map: `<Map />`
  * Time / Hours: `<Clock />` | Rating: `<Star />` | Call / Booking: `<Phone />`
  * Video Play: `<Play />` | Vehicle / Parking: `<Car />` | Date / Tour: `<Calendar />`
  * Share / QR: `<Share2 />` / `<QrCode />` | Download PDF: `<Download />`
  * Heritage / Pagoda: `<Landmark />` | Food: `<Utensils />` | Homestay: `<Home />` | AI Chat: `<Bot />`

## 3. TikTok Media Redirect & Pop-up Modal Standard
* **Interactive TikTok Pop-up Modal**: Click 6 video TikTok Reels trên Trang chủ hiển thị Pop-up review chi tiết, tác giả, lượt xem và nút xem tiếp.
* **Dynamic Hashtag Redirect**: Nút "Xem TikTok" ở Trang Khám phá (`/places`) tự động sinh URL tìm kiếm chuẩn `https://www.tiktok.com/search?q=...` mở tab mới chính xác từng địa điểm.

## 4. Tech Stack & Deployment Rules
* **Database**: Supabase (PostgreSQL + pgvector + Supabase Auth / Client).
* **Frontend**: Next.js 16 / React 19 (App Router, TailwindCSS, SSR/SSG/ISR).
* **Deployment**: Vercel (Auto CI/CD, Edge Functions, Preview Deployments).

## 5. Full 16-Screen System Coverage
1. `01_homepage`: Trang chủ Web Portal & Storytelling Landing Page 7 Section.
2. `02_places_discovery`: Trang Khám phá 106 Địa điểm Supabase DB & Nút TikTok Search.
3. `03_place_detail`: Trang Chi tiết Hồ Tà Pạ & Kho ảnh HD trích nguồn.
4. `04_food_gastronomy`: Trang Đặc sản Ẩm thực Live DB (Cháo bò, Gà đốt Ô Thum).
5. `05_ai_chatbot`: Khung Chatbot AI RAG nhúng Thẻ Địa điểm & Video Stream.
6. `06_ai_trip_planner`: Trợ lý Lập Lịch trình AI Tour 1-Tap & Phượt 2N1Đ.
7. `07_stay_homestay`: Trang Lưu trú Homestay Live DB (Soài Chek, Cô Tô View).
8. `08_culture_events`: Trang Văn hóa Khmer 1:1, Lễ hội Đua bò & Chùa Xvayton.
9. `09_interactive_gis_map`: Trang Bản đồ GIS Tương tác Bounding Box Tri Tôn.
10. `10_travel_info_guide`: Trang Cẩm nang Di chuyển & Hotline Cứu hộ 24/7.
11. `11_itinerary_export_modal`: Modal Xuất QR Code & Tải PDF Offline.
12. `12_partner_portal`: Trang Cổng Đăng ký Dịch vụ Đối tác địa phương.
13. `13_admin_dashboard`: Admin Control Center, Duyệt Video & Audit Logs.
14. `14_empty_state_404`: Trạng thái Trống & Lỗi 404 với gợi ý điểm hot.
15. `15_dark_mode_visual_spec`: Giao diện Chế độ Tối toàn hệ thống.
16. `16_auth_login_modal`: Modal Đăng nhập & Phân quyền Supabase Auth.

## 6. Strict Mandatory Prototype Alignment
* **MANDATORY SPECIFICATION**: All Frontend developments MUST strictly align with the prototype layouts specified in [docs/ui_prototype_showcase.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/ui_prototype_showcase.md).
* **DIRECTORY SCAFFOLDING**: The frontend MUST maintain complete directory scaffolding for all 13 core screens (`places`, `food`, `itinerary`, `stay`, `culture`, `map`, `guide`, `partner`, `admin`) before building full UI components.


