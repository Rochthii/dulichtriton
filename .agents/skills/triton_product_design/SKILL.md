---
name: triton-product-design-and-stack
description: Full Design System Tokens (Folk-Modern Bảy Núi, 10-Color Palette, 3-Font Typography, Lucide SVG Icons, Signature Elements, 16-Screen System, Component Specs), Tech Stack rules (Next.js/React on Vercel, Supabase DB), and User-Centric UI/UX design philosophy for Tri Ton Tourism project.
---

# DU LỊCH TRI TÔN — DESIGN SYSTEM, PRODUCT DESIGN & TECH STACK SKILL
## Triết lý Thiết kế: "Folk-Modern Bảy Núi"
*Chất liệu dân dã miền núi Khmer (thốt nốt, lúa, chùa, nắng) kết hợp ngôn ngữ ứng dụng du lịch hiện đại (card, chip, metro-line, motion). Tuyệt đối không dùng gradient neon tím/hồng kiểu city-app, không thuần "blog báo chí" cũ kỹ.*

---

## 1. Bảng Màu Thống Nhất 1:1 (Lấy Cảm Hứng Thực Địa)

| Token CSS | Hex Code | Nguồn cảm hứng thực địa | Vai trò sử dụng |
|---|---|---|---|
| `--bg` | `#FAF3E7` | Nắng đồng lúa & cát sương | **Nền chính** (sáng ấm, tránh trắng tinh `#FFF`) |
| `--surface` | `#FFFDF7` | Màu ngà giấy bưu thiếp | Mặt card, container, bề mặt nổi |
| `--ink` | `#26221B` | Đất đá núi Thất Sơn | **Màu chữ chính**, heading, độ tương phản cao |
| `--ink-soft` | `#6B6355` | Đất phù sa khô | Chữ phụ, địa chỉ, subtitle, metadata |
| `--jade` | `#0E8C7F` | Nước xanh hồ Tà Pạ | **Màu chủ đạo**: link, active, category nature |
| `--jade-deep` | `#0B6B60` | Đáy hồ Tà Pạ | Hover state của jade, viền nhấn |
| `--palm` | `#F0A32F` | Mật trái thốt nốt chín | **Nút CTA chính** (Chỉ đường, Xem lịch trình, Đặt bàn) |
| `--palm-deep` | `#C97F1B` | Đường thốt nốt cô đặc | Hover state của CTA palm |
| `--sunset` | `#F26B3A` | Hoàng hôn tuyến tránh Tri Tôn | Accent, badge "hot", category food & culinary |
| `--terracotta` | `#A6503A` | Gạch chùa cổ & đất nung | Category history / di tích lịch sử |
| `--saffron` | `#D9822B` | Áo cà sa sư Khmer | Category culture / chùa Khmer & di sản |
| `--festival` | `#7C5CBF` | Khăn lụa Lễ hội Dolta / Đua bò | Category festival / sự kiện văn hóa |
| `--cat-stay` | `#8A5A33` | Vách gỗ nhà sàn homestay | Category homestay & nghỉ dưỡng |
| `--night-bg` | `#151B34` | Bầu trời đêm Bảy Núi | **Dark mode "Đêm Tri Tôn"** |
| `--night-surface` | `#1E2647` | Màn đêm sương núi | Bề mặt card trong Dark Mode |
| `--firefly` | `#FFD37A` | Đom đóm & đèn chợ đêm | Accent, điểm sáng trên Dark Mode |

### Nguyên tắc màu danh mục (Category Color Rule)
* **1 Category = 1 Màu riêng biệt**: Giúp du khách quét mắt nhận diện ngay loại điểm đến trong vòng 1 giây.
* Radius Tokens: `--r-s: 12px; --r-m: 18px; --r-l: 26px;`
* Shadow Tokens: `--shadow-1: 0 2px 10px rgba(38,34,27,.08); --shadow-2: 0 10px 30px rgba(38,34,27,.14);`

---

## 2. Hệ Thống Typography — Bộ 3 Font Chuẩn Tiếng Việt

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">
```

| Vai trò | Font Family | Trọng số (Weight) | Lý do & Mục đích sử dụng |
|---|---|---|---|
| **Display / Heading / Logo** | `Bricolage Grotesque` | 700–800 | Hiện đại, sắc nét, có cá tính riêng, không mang cảm giác template có sẵn. |
| **Body / UI Components** | `Be Vietnam Pro` | 400–700 | Tối ưu hóa hoàn hảo cho dấu tiếng Việt, đọc êm mắt, thanh lịch. |
| **Ghi chú "Mẹo thực địa" / Stamp** | `Patrick Hand` | Regular | Nét viết tay mang cảm giác **sổ tay phượt**, dùng cho tip, chú thích, con dấu xác minh. |

### Quy tắc Typography (Typography Rules)
1. Tuyệt đối tối đa 3 font trong toàn bộ hệ thống.
2. **Không dùng font viết tay** cho Heading hoặc Body. Font viết tay chỉ xuất hiện ở *ghi chú nhỏ / mẹo thực địa* để giữ trọn giá trị "đắt giá".

---

## 3. 5 Phần Tử Nhận Diện Đặc Trưng (Signature Elements)

1. **Metro-line (Sơ đồ nối dây du lịch)**:
   * Tuyến line bo tròn 4px màu ngọc `--jade`, mỗi điểm là "trạm" chấm tròn viền cát sương `--bg`.
   * Badge thời gian di chuyển là viên thuốc nhỏ (pill) nằm chính giữa dây nối.
   * Khi người dùng cuộn tới, line **tự vẽ mượt mà** (`stroke-dashoffset` animation).
2. **Ticket-stub (Thẻ lịch trình dạng Vé xe/Vé máy bay)**:
   * Card lịch trình thiết kế dạng vé perforated với cạnh răng cưa/đường cắt đứt đoạn.
   * Thể hiện mã tuyến (vd: `TTN→TPA→OTU`), mã tour (vd: `TT-2N1Đ`).
3. **Stamp "ĐÃ XÁC MINH THỰC ĐỊA"**:
   * Con dấu tròn xoay nhẹ 12° (dùng Bricolage / Patrick Hand), đóng dấu lên card có dữ liệu thực địa sạch và review thật, giải quyết triệt để nỗi đau "like ảo / ảnh mạng".
4. **Texture hoa văn nền bản địa**:
   * Họa tiết Kbach Khmer hoặc silhouette hàng thốt nốt mờ với opacity 3–5% tại các section divider.
5. **Logo & Nút Lưu Trái Tim Thốt Nốt**:
   * Biểu tượng trái tim thốt nốt (lấy cảm hứng từ *Hàng thốt nốt trái tim*) ghép silhouette 2 ngọn núi Cô Tô & Tà Pạ → đồng thời là icon nút "Lưu điểm đến" (thay cho trái tim thông thường).

---

## 4. Quy Chuẩn Linh Kiện UI Chính (Component Specifications)

### 4.1. Thẻ POI Card (Chuẩn 1 Giây Quét Mắt)
* Bo góc `--r-l` (26px), tỷ lệ ảnh 4:3, scrim gradient đen 40% phía dưới ảnh.
* Góc trên bên trái: Chip category mang màu chuyên biệt của danh mục đó.
* Góc trên bên phải: Chip rating ⭐ nền sáng ấm.
* Tên điểm: `Bricolage Grotesque` 700; Địa chỉ: `Be Vietnam Pro` 13px `--ink-soft`.
* Hàng nút hành động:
  * `[🎵 TikTok]`: Nút viền outline (`border-slate-300`).
  * `[🗺️ Chỉ đường]`: Nút solid màu vàng thốt nốt `--palm` chữ `--ink` (chỉ duy nhất 1 nút solid chính để hướng mắt người dùng).
* Hiệu ứng hover: Nâng bóng `--shadow-2` + ảnh phóng to chậm `scale-105` (zoom êm).

### 4.2. Nút Bấm & Chip Lọc
* Tất cả nút và chip sử dụng kiểu dáng **Pill** (bo tròn toàn phần `rounded-full`).
* **CTA chính**: Solid `--palm` (`#F0A32F`) chữ `--ink` (`#26221B`).
* **Secondary / Filter active**: Outline viền `--jade` (`#0E8C7F`) hoặc solid ngọc Tà Pạ.

### 4.3. Hero Section
* Ảnh nền full-bleed Hồ Tà Pạ hoặc hoàng hôn tuyến tránh Tri Tôn với hiệu ứng zoom chậm.
* Tiêu đề `Bricolage Grotesque` cỡ lớn.
* Ô tìm kiếm giải quyết nỗi đau dạng chip bấm nhanh: *"Sợ hết giờ"*, *"Đi với người già"*, *"Muốn ăn gà đốt"*.

### 4.4. Section "Đêm Tri Tôn"
* Tự động chuyển tông nền dark mode `--night-bg` (`#151B34`).
* Hiệu ứng đom đóm lơ lửng `--firefly` (`#FFD37A`), viền card chợ đêm/cafe đêm màu hổ phách amber.

---

## 5. Chuyển Động & Vi Tương Tác (Motion & Micro-interactions)
* Metro-line tự động vẽ khi cuộn vào viewport.
* Stamp "Đã xác minh" đóng hiệu ứng nảy nhẹ (*bụp*) khi xuất hiện.
* Nút Lưu: Icon trái tim thốt nốt hiệu ứng nở (bloom) khi kích hoạt.
* Carousel cụm điểm: Hỗ trợ chạm vuốt scroll-snap ngang, thẻ nghiêng nhẹ 2° kiểu bưu thiếp lưu niệm.
* Luôn hỗ trợ `prefers-reduced-motion` cho người dùng nhạy cảm chuyển động.

---

## 6. Bảng Quy Tắc DO / DON'T

| ✅ DO (BẮT BUỘC THỰC HIỆN) | ❌ DON'T (TUYỆT ĐỐI KHÔNG LÀM) |
|---|---|
| Sử dụng ảnh **thật** của Tri Tôn (Tà Pạ, Ô Thum, Chùa Xà Tón, Soài So). | Không dùng ảnh stock chung chung, ảnh biển, ảnh Sa Pa. |
| Dùng nền cát sương ấm `#FAF3E7`, tránh dùng nền trắng tinh `#FFFFFF` hoặc đen thuần `#000000`. | Không dùng gradient neon tím-hồng kiểu city-app. |
| Đồng bộ 1 hệ corner radius (`--r-s: 12px`, `--r-m: 18px`, `--r-l: 26px`) và spacing 8pt. | Không lạm dụng Glassmorphism và hiệu ứng blur đục ngầu tràn lan. |
| Màu sắc danh mục nhất quán 100% giữa card, map pin, filter và timeline. | Không đổi màu danh mục tùy tiện giữa các trang. |
| Font viết tay `Patrick Hand` chỉ dùng cho ghi chú ngắn, mẹo phượt, con dấu. | Không dùng font viết tay cho Heading hoặc nội dung Body. |
| 100% SVG Icons (Lucide Icons). | Tuyệt đối không dùng Emoji trên UI. |

---

## 7. Tech Stack & Deployment Rules
* **Database**: Supabase (PostgreSQL + pgvector + Supabase Auth).
* **Frontend**: Next.js 14 / React 19 (App Router, TailwindCSS Custom Tokens, Mobile-First).
* **Deployment**: Vercel (Edge Config, Auto CI/CD).
* **Mapping**: WGS84 Bounding Box Tri Tôn `[10.25-10.55 Lat, 104.85-105.15 Lng]`.
