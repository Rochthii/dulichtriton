---
name: triton-product-design-and-stack
description: Full Design System Tokens (Color, Typography, Lucide SVG Icons, 16-Screen System, Component Specs), Tech Stack rules (Next.js/React on Vercel, Supabase DB), and User-Centric UI/UX design philosophy for Tri Ton Tourism project.
---

# DU LỊCH TRI TÔN — DESIGN SYSTEM, PRODUCT DESIGN & TECH STACK SKILL

## 1. Design System Tokens (Bảng màu & Đồng bộ 100%)
* **Primary Emerald**: `#1B4D3E` (Xanh đại ngàn Bảy Núi — dùng cho Header, Primary CTA, Accent).
* **Secondary Golden Palm**: `#D99B26` / `#E5A93C` (Vàng thốt nốt & Khmer — dùng cho Badges, Ratings, Action Buttons).
* **Neutral Dark Slate**: `#0F172A` (Slate 900 — dùng cho Văn bản tiêu đề & High contrast text).
* **Background Light**: `#F8F9FA` (Warm Off-White — nền trang sáng ngà thanh lịch).
* **Dark Mode Surface**: `#1E293B` (Slate 800 — nền Card & Chat Stream khi bật Dark mode).

## 2. UI Icon Standard (NO EMOJI POLICY & SVG Mapping)
* **STRICT RULE**: ABSOLUTELY NO EMOJIS anywhere in the UI, text buttons, headings, or components.
* **SVG ONLY**: Use clean, standard SVG icons ONLY (`Lucide Icons` / `Heroicons`).
* **Lucide Icon Mappings**:
  * Search AI: `<Search />` | MapPin / Navigation: `<MapPin />` | Interactive Map: `<Map />`
  * Time / Hours: `<Clock />` | Rating: `<Star />` | Call / Booking: `<Phone />`
  * Video Play: `<Play />` | Vehicle / Parking: `<Car />` | Date / Tour: `<Calendar />`
  * Share / QR: `<Share2 />` / `<QrCode />` | Download PDF: `<Download />`
  * Heritage / Pagoda: `<Landmark />` | Food: `<Utensils />` | Homestay: `<Home />` | AI Chat: `<Bot />`

## 3. Tech Stack & Deployment Rules
* **Database**: Supabase (PostgreSQL + pgvector + Supabase Auth / Client).
* **Frontend**: Next.js / React (App Router, TailwindCSS, SSR/SSG/ISR).
* **Deployment**: Vercel (Auto CI/CD, Edge Functions, Preview Deployments).

## 4. Full 16-Screen System Coverage
1. `01_homepage`: Trang chủ Web Portal & AI Search Entrance.
2. `02_places_discovery`: Trang Khám phá Địa điểm & Bộ lọc Xã/Thị trấn.
3. `03_place_detail`: Trang Chi tiết Hồ Tà Pạ & Nhúng TikTok Shorts Video.
4. `04_food_gastronomy`: Trang Đặc sản Ẩm thực (Gà Đốt Ô Thum + Nút Gọi đặt trước).
5. `05_ai_chatbot`: Khung Chatbot AI RAG nhúng Thẻ Địa điểm & Video Stream.
6. `06_ai_trip_planner`: Trợ lý Lập Lịch trình AI Tour 2D1N (Khoảng cách WGS84).
7. `07_stay_homestay`: Trang Lưu trú Homestay (Lọc giá 200k-800k + Badge ô tô).
8. `08_culture_events`: Trang Văn hóa Khmer, Lễ hội Đua bò & Quy tắc Chùa cổ.
9. `09_interactive_gis_map`: Trang Bản đồ GIS Tương tác Bounding Box Tri Tôn.
10. `10_travel_info_guide`: Trang Cẩm nang Di chuyển (Xe khách, Xe máy, FAQ).
11. `11_itinerary_export_modal`: Modal Xuất QR Code & Tải PDF Offline.
12. `12_partner_portal`: Trang Cổng Đăng ký Dịch vụ Đối tác địa phương.
13. `13_admin_dashboard`: Admin Control Center, Duyệt Video & Audit Logs.
14. `14_empty_state_404`: Trạng thái Trống & Lỗi 404 với gợi ý điểm hot.
15. `15_dark_mode_visual_spec`: Giao diện Chế độ Tối toàn hệ thống.
16. `16_auth_login_modal`: Modal Đăng nhập & Phân quyền Supabase Auth.

## 5. UI/UX & Product Design Philosophy (User-Centric First)
* **Empathy & Perspective**: Always put yourself directly in the user's shoes.
* **User Pain Points**: Solve confusion about what to do in Tri Ton, lack of exact coordinates, long food waiting times (Ga Dot 40m), and travel scams.
* **User Personas**: Gen Z Check-in Hunter, Weekend Family Escape, Khmer Heritage & Spiritual Pilgrims, Local Foodies.
* **User Blind Spots**: Proactively inform users about seasonal water changes (Ho Ta Pa), food prep times (Ga Dot 35-45m), narrow roads for 7-seat cars, and Khmer temple etiquette.
* **Behavioral Focus & Retention**: Instant load (<2s), offline QR export, nearby WGS84 recommendations to build long-term retention.
