# CHUẨN THIẾT KẾ ĐỒNG BỘ UI/UX & QUY CÁCH LINH KIỆN (DESIGN SYSTEM & COMPONENT SPECIFICATION)

---

## 🎨 1. Hệ thống Bảng màu Đồng bộ (Color Palette Tokens)

Tất cả giao diện Web Portal, AI Chatbot và Mobile View tuân thủ 100% các biến màu chuẩn dưới đây:

```css
:root {
  /* Primary Colors - Xanh Bảy Núi */
  --color-primary: #1B4D3E;          /* Primary Emerald */
  --color-primary-hover: #143B2F;    /* Emerald Dark Hover */
  --color-primary-light: #E6F0EC;    /* Emerald Subtitle Background */

  /* Secondary Colors - Vàng Thốt Nốt & Văn hóa Khmer */
  --color-secondary: #D99B26;        /* Golden Palm Accent */
  --color-secondary-hover: #B8801C;  /* Golden Hover */
  --color-secondary-light: #FFF8E7;  /* Badge Background */

  /* Neutrals - Text & Surfaces */
  --color-text-main: #0F172A;        /* Slate 900 - High Contrast Header/Body */
  --color-text-muted: #64748B;       /* Slate 500 - Subtitle & Caption */
  --color-bg-light: #F8F9FA;         /* Warm Off-White Surface */
  --color-bg-white: #FFFFFF;         /* Pure White Card Background */
  --color-border: #E2E8F0;           /* Slate 200 Border Line */

  /* Dark Mode Tokens */
  --color-dark-bg: #0F172A;          /* Slate 900 Dark Background */
  --color-dark-surface: #1E293B;     /* Slate 800 Card Surface */
  --color-dark-text: #F8FAFC;        /* Slate 50 Dark Text */

  /* Status Colors */
  --color-success: #16A34A;         /* Green - Đang mở cửa / Đã xác minh */
  --color-warning: #EA580C;         /* Orange - Cảnh báo thời gian chờ / Đường hẹp */
  --color-error: #DC2626;           /* Red - Đã đóng cửa / Lỗi */
}
```

---

## 📐 2. Hệ thống Kiểu chữ Đồng bộ (Typography System)

* **Font Family**: `Inter`, `Outfit`, sans-serif.

| Cấp kiểu chữ | Kích thước (Desktop) | Kích thước (Mobile) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1 (H1)** | `32px` (`2rem`) | `24px` (`1.5rem`) | Bold (`700`) | 1.2 |
| **Heading 2 (H2)** | `24px` (`1.5rem`) | `20px` (`1.25rem`) | SemiBold (`600`) | 1.3 |
| **Heading 3 (H3)** | `18px` (`1.125rem`) | `16px` (`1rem`) | Medium (`500`) | 1.4 |
| **Body Large** | `16px` (`1rem`) | `15px` (`0.9375rem`) | Regular (`400`) | 1.5 |
| **Body Main** | `15px` (`0.9375rem`) | `14px` (`0.875rem`) | Regular (`400`) | 1.5 |
| **Caption / Small** | `13px` (`0.8125rem`) | `12px` (`0.75rem`) | Medium (`500`) | 1.4 |

---

## 🚫 3. Quy chuẩn Biểu tượng SVG (NO EMOJI POLICY)

* **Quy tắc tuyệt đối**: **KHÔNG DÙNG EMOJI** trên giao diện, nút bấm, tiêu đề hay thẻ UI.
* **Thư viện Icon chuẩn**: `Lucide Icons` / `Heroicons` dạng SVG thuần.

### Bảng Mapping Icon SVG chuẩn cho hệ thống:

| Chức năng / Thành phần | Lucide SVG Icon Component | Mã ký hiệu |
| :--- | :--- | :--- |
| **Tìm kiếm AI** | `<Search className="w-5 h-5" />` | Search |
| **Địa điểm / Vị trí** | `<MapPin className="w-4 h-4 text-emerald-700" />` | MapPin |
| **Bản đồ GIS** | `<Map className="w-5 h-5" />` | Map |
| **Thời gian / Giờ mở cửa** | `<Clock className="w-4 h-4 text-amber-600" />` | Clock |
| **Đánh giá / Rating** | `<Star className="w-4 h-4 fill-amber-400" />` | Star |
| **Điện thoại / Đặt trước** | `<Phone className="w-4 h-4 text-white" />` | Phone |
| **Phát Video TikTok** | `<Play className="w-5 h-5 fill-current" />` | Play |
| **Phương tiện ô tô** | `<Car className="w-4 h-4" />` | Car |
| **Lịch trình / Ngày đi** | `<Calendar className="w-4 h-4" />` | Calendar |
| **Chia sẻ / QR Code** | `<Share2 className="w-4 h-4" />` / `<QrCode />` | Share2 / QrCode |
| **Tải về PDF** | `<Download className="w-4 h-4" />` | Download |
| **Văn hóa / Chùa Khmer** | `<Landmark className="w-4 h-4" />` | Landmark |
| **Ẩm thực / Quán ăn** | `<Utensils className="w-4 h-4" />` | Utensils |
| **Lưu trú / Homestay** | `<Home className="w-4 h-4" />` | Home |
| **AI Chatbot Icon** | `<Bot className="w-6 h-6 text-white" />` | Bot |

---

## 🧱 4. Quy chuẩn Linh kiện UI (Component Specifications)

### 4.1. Nút Bấm (Button Components)
1. **Primary Button (Nút chính)**:
   * Background: `var(--color-primary)` (`#1B4D3E`), Hover: `#143B2F`.
   * Text: Màu trắng (`#FFFFFF`), Font Weight: `SemiBold (600)`.
   * Border Radius: `8px` (`rounded-lg`), Padding: `10px 20px`.
   * Icon: Gắn SVG icon bên trái văn bản.

2. **Secondary Golden Button (Nút phụ / Action trọng tâm)**:
   * Background: `var(--color-secondary)` (`#D99B26`), Hover: `#B8801C`.
   * Text: Màu trắng (`#FFFFFF`). Dùng cho nút *"Gọi đặt món trước"*, *"Xuất QR Code"*.

3. **Outline Button (Nút viền)**:
   * Background: Transparent, Border: `1px solid var(--color-primary)`, Text: `var(--color-primary)`.

4. **Floating AI Chatbot Button**:
   * Cố định góc dưới bên phải màn hình (`bottom: 24px`, `right: 24px`).
   * Hình tròn `56px x 56px`, Nền `#1B4D3E`, Shadow lớn (`shadow-2xl`), chứa SVG Bot Icon.

---

### 4.2. Thẻ Địa điểm & Món ăn (Card Components)
* **Structure**:
  * Ảnh bao phủ (`aspect-video`, `object-cover`, `rounded-t-xl`).
  * Top Badge: Gắn trên góc ảnh (vd: Badge xanh `"Có chỗ đậu ô tô 7 chỗ"`, Badge cam `"Thời điểm vàng: T9-T11"`).
  * Card Body: Tên địa điểm (H3 Bold), Địa chỉ Cấp Xã/Thị trấn (Muted Caption kèm SVG MapPin).
  * Card Footer: Giá vé / Khoảng giá + Nút chỉ đường bản đồ (SVG Map) & Nút TikTok Video (SVG Play).
* **Hover Effect**: Transfrom Y `-4px`, Shadow tăng từ `shadow-md` lên `shadow-xl`, Transition `200ms ease-in-out`.

---

### 4.3. Thẻ Cảnh báo & Khuyên dùng (Alert / Advisory Cards)
* **Cảnh báo Mùa & Văn hóa**:
  * Nền: `#FFF8E7` (Golden Light), Viền trái: `4px solid #D99B26`.
  * Tiêu đề: SVG Info / Warning Icon + Text SemiBold.
  * Nội dung: Chuẩn hóa tiếng Việt NFC, cung cấp đúng điểm mù người dùng.

---

### 4.4. Khung Chatbot AI Stream (Chat Message Component)
* **User Message**: Căn phải, Nền `#1B4D3E`, Text trắng, `rounded-2xl rounded-tr-none`.
* **AI Message**: Căn trái, Nền `#FFFFFF` (Dark mode `#1E293B`), Viền `#E2E8F0`, `rounded-2xl rounded-tl-none`.
* **Inline Card / Video Container**: Nhúng thẻ Place Card thu nhỏ và Video TikTok Player (AspectRatio 9:16) trực tiếp bên trong bong bóng chat AI.

---

## 📱 5. Quy chuẩn Tương thích Màn hình (Responsive Grid Specs)

| Breakpoint | Chiều rộng Viewport | Số cột Grid | Layout Điều chỉnh |
| :--- | :--- | :--- | :--- |
| **Mobile** | `< 640px` | 1 Cột (`grid-cols-1`) | Sidebar ẩn thành Drawer, Header thu gọn Hamburger Menu, Chatbot full width. |
| **Tablet** | `640px - 1024px` | 2 Cột (`grid-cols-2`) | Grid địa điểm 2 cột, Timeline dạng mỏng, Bản đồ chia tỷ lệ 40/60. |
| **Desktop** | `> 1024px` | 3 - 4 Cột (`grid-cols-3` / `4`) | Grid 3-4 cột rộng rãi, Chat Widget cố định góc phải, Bản đồ GIS toàn màn hình. |

---

## 📑 6. Bảng Tóm tắt 16 Màn hình & Trạng thái Đồng bộ Hệ thống

1. **Màn hình 01: Trang chủ (Homepage)** — Emerald Green Header + Search Bar AI + Hot Spots Grid + TikTok Carousel + Floating Chat Widget.
2. **Màn hình 02: Khám phá Địa điểm (Places Filter)** — Thanh lọc Xã/Thị trấn + Badge Phương tiện + Tọa độ WGS84.
3. **Màn hình 03: Chi tiết Địa điểm (Place Detail)** — Hero Cover Hồ Tà Pạ + TikTok Shorts Player + Cảnh báo Mùa + Google Maps.
4. **Màn hình 04: Đặc sản Ẩm thực (Food Booking)** — Gà Đốt Ô Thum + Alert SVG Clock 40p + Nút Gọi đặt món + Lò đường thốt nốt.
5. **Màn hình 05: Khung Chatbot AI (AI Chat Interface)** — Glassmorphism Chat + Response Card + TikTok Player Stream + Quick Action Chips.
6. **Màn hình 06: Trợ lý Lập Lịch trình (AI Trip Planner)** — Filter tham số + Vertical Timeline 2D1N + Khoảng cách WGS84.
7. **Màn hình 07: Trang Lưu trú (Homestay Discovery)** — Filter giá 200k-800k + Badge Tiện ích + Nút Gọi phòng.
8. **Màn hình 08: Văn hóa Khmer & Lễ hội (Culture & Heritage)** — Đua bò Bảy Núi đếm ngược + Chùa Khmer cổ + Quy tắc tâm linh.
9. **Màn hình 09: Bản đồ GIS Tương tác (GIS Map Portal)** — Full-width Bounding Box Map + Ghim 82 điểm master + Popup preview.
10. **Màn hình 10: Cẩm nang & Di chuyển (Travel Guide)** — Tuyến xe khách/xe máy + Cảnh báo mùa nước nổi + FAQ Accordion.
11. **Màn hình 11: Modal Xuất QR Code (QR Export Modal)** — Scannable QR Code + Link chia sẻ + Nút Tải PDF Offline.
12. **Màn hình 12: Cổng Đăng ký Đối tác (Partner Portal)** — Form khai báo gian hàng quán ăn/homestay địa phương.
13. **Màn hình 13: Admin Control Center (Admin Dashboard)** — Metrics 82 điểm + Duyệt Video TikTok + Audit Logs (Who/What/When/IP).
14. **Màn hình 14: Trạng thái Trống & Lỗi 404 (Empty State & 404)** — SVG Search Muted Icon + Gợi ý điểm hot lân cận + Nút Về Trang chủ.
15. **Màn hình 15: Chế độ Tối (Dark Mode Visual Spec)** — Surface Slate `#1E293B` + Dark Slate `#0F172A` + Emerald Glow.
16. **Màn hình 16: Đăng nhập & Xác thực (Auth Login Modal)** — Supabase Auth Modal (Google / Phone OTP / Email) + Phân quyền User/Partner.
