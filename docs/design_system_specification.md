# CHUẨN THIẾT KẾ ĐỒNG BỘ UI/UX & QUY CÁCH LINH KIỆN
## PHONG CÁCH: "FOLK-MODERN BẢY NÚI" (DESIGN SYSTEM & COMPONENT SPECIFICATION)

---

## 🎨 1. Hệ thống Bảng màu Đồng bộ 1:1 (Color Palette Tokens)

Tất cả giao diện Web Portal, AI Chatbot và Mobile View tuân thủ 100% các biến màu lấy cảm hứng từ chính dữ liệu thực địa Tri Tôn:

```css
:root {
  /* Canvas & Nền tảng */
  --bg: #FAF3E7;            /* Nắng đồng lúa / Cát sương - Nền chính (sáng ấm, tránh trắng tinh) */
  --surface: #FFFDF7;       /* Bề mặt thẻ bưu thiếp / Container nổi */
  --ink: #26221B;           /* Đất đá núi Thất Sơn - Chữ chính tương phản cao */
  --ink-soft: #6B6355;      /* Đất phù sa khô - Chữ phụ, địa chỉ, chú thích */

  /* Màu Chủ Đạo & Hành Động */
  --jade: #0E8C7F;          /* Nước hồ Tà Pạ - Màu chủ đạo: link, active, nature */
  --jade-deep: #0B6B60;     /* Đáy hồ Tà Pạ - Hover state của jade */
  --palm: #F0A32F;          /* Mật trái thốt nốt chín - Nút CTA chính (Chỉ đường, Xem lịch trình) */
  --palm-deep: #C97F1B;     /* Đường thốt nốt cô đặc - Hover state của CTA palm */
  --sunset: #F26B3A;        /* Hoàng hôn tuyến tránh Tri Tôn - Accent, badge hot, ẩm thực */

  /* Màu Phân Loại Danh Mục (Category Colors - 1 Category = 1 Màu) */
  --cat-nature: #0E8C7F;    /* Ngọc Tà Pạ - Thiên nhiên & danh thắng */
  --cat-culture: #D9822B;   /* Áo cà sa sư Khmer - Văn hóa & Chùa Khmer */
  --cat-history: #A6503A;   /* Gạch chùa cổ / Đất nung - Di tích lịch sử (Ba Chúc, Tức Dụp) */
  --cat-food: #F26B3A;      /* Cam hoàng hôn / Gà đốt - Ẩm thực & Nhà hàng */
  --cat-festival: #7C5CBF;  /* Tím khăn lụa Dolta - Lễ hội & Sự kiện */
  --cat-stay: #8A5A33;      /* Gỗ nhà sàn - Homestay & Nghỉ dưỡng */

  /* Chế Độ "Đêm Tri Tôn" (Night Mode Tokens) */
  --night-bg: #151B34;      /* Bầu trời đêm Bảy Núi - Nền Dark Mode */
  --night-surface: #1E2647; /* Mặt thẻ Dark Mode */
  --firefly: #FFD37A;       /* Đom đóm & Đèn chợ đêm - Điểm sáng Accent Dark Mode */

  /* Bo Góc & Đổ Bóng */
  --r-s: 12px;              /* Bo góc nhỏ (chip, badge) */
  --r-m: 18px;              /* Bo góc vừa (input, button) */
  --r-l: 26px;              /* Bo góc lớn (card POI, modal) */
  --r-pill: 9999px;         /* Bo tròn toàn phần (pill buttons) */
  --shadow-1: 0 2px 10px rgba(38, 34, 27, 0.08);
  --shadow-2: 0 10px 30px rgba(38, 34, 27, 0.14);
}
```

---

## 📐 2. Hệ thống Kiểu chữ Đồng bộ — Bộ 3 Font (Typography System)

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">
```

| Vai trò | Font Family | Trọng số (Weight) | Mục đích sử dụng |
|---|---|---|---|
| **Display / Heading / Logo** | `Bricolage Grotesque` | Bold (`700`), ExtraBold (`800`) | Tiêu đề chính H1/H2, tên địa điểm nổi bật, logo thương hiệu |
| **Body / UI Components** | `Be Vietnam Pro` | Regular (`400`), Medium (`500`), SemiBold (`600`) | Nội dung đọc, mô tả địa điểm, địa chỉ, nút bấm, form |
| **Ghi chú Mẹo Phượt & Con Dấu** | `Patrick Hand` | Regular (`400`) | Ghi chú thực địa ("Nên đi trước 9h sáng"), tem xác minh, lời dặn của dân bản địa |

*Quy tắc*: Tối đa 3 font; heading và body không bao giờ dùng font viết tay; chữ viết tay chỉ xuất hiện ở *ghi chú nhỏ* để giữ sự đắt giá.

---

## 🌟 3. 5 Phần Tử Nhận Diện Đặc Trưng (Signature Elements)

1. **Metro-line (Sơ đồ nối dây du lịch)**:
   - Line bo tròn 4px màu `--jade` (`#0E8C7F`), trạm dừng là chấm tròn viền cát `--bg`.
   - Badge thời gian di chuyển dạng viên thuốc nhỏ (pill) nằm giữa đoạn nối.
   - Hiệu ứng tự vẽ (`stroke-dashoffset`) mượt mà khi cuộn tới.
2. **Ticket-stub (Card lịch trình dạng vé perforated)**:
   - Card lịch trình làm kiểu vé xe/vé máy bay với cạnh răng cưa, mã tuyến `TTN→TPA→OTU`, mã tour `TT-2N1Đ`.
3. **Stamp "ĐÃ XÁC MINH THỰC ĐỊA"**:
   - Con dấu tròn xoay nhẹ 12° (kết hợp Bricolage & Patrick Hand), đóng dấu lên card đã xác thực tọa độ và review thật.
4. **Texture hoa văn nền bản địa**:
   - Họa tiết Kbach Khmer hoặc silhouette hàng thốt nốt với độ mờ 3–5% tại các dải phân cách section.
5. **Logo & Nút Lưu Trái Tim Thốt Nốt**:
   - Biểu tượng trái tim thốt nốt kết hợp silhouette núi Cô Tô & Tà Pạ làm logo và icon nút bookmark yêu thích (hiệu ứng nở khi bấm).

---

## 🧱 4. Quy Chuẩn Linh Kiện UI (Component Specifications)

### 4.1. Thẻ Địa Điểm & Món Ăn (POI Card)
- **Container**: Bo góc `--r-l` (26px), bề mặt `--surface` (`#FFFDF7`), đổ bóng `--shadow-1`, hover nâng `--shadow-2` và dịch chuyển `-4px`.
- **Hình ảnh**: Tỷ lệ 4:3 thực địa, lớp phủ gradient đen 40% ở đáy ảnh, hiệu ứng zoom chậm 1.05 khi hover.
- **Top Badges**:
  - Góc trái: Chip danh mục theo đúng màu token danh mục.
  - Góc phải: Chip đánh giá sao ⭐ nền sáng ấm.
- **Nội dung**: Tên địa điểm bằng `Bricolage Grotesque` 700; Địa chỉ bằng `Be Vietnam Pro` 13px `--ink-soft`.
- **Hàng nút hành động**:
  - `[🎵 TikTok]`: Nút outline viền nhẹ.
  - `[🗺️ Chỉ đường]`: Nút solid màu vàng thốt nốt `--palm` (`#F0A32F`) chữ `--ink` (`#26221B`) — nút solid duy nhất thu hút ánh nhìn.

### 4.2. Nút Bấm & Chip Lọc
- Tất cả nút và chip sử dụng dáng **Pill** (`rounded-full`).
- Nút CTA chính: Nền `--palm` (`#F0A32F`), chữ `--ink` (`#26221B`), hover `--palm-deep`.
- Nút phụ / Lọc: Nền trong suốt hoặc ngọc Tà Pạ, viền `--jade` (`#0E8C7F`).

### 4.3. Hero Section
- Ảnh/video full-bleed Hồ Tà Pạ hoặc hoàng hôn tuyến tránh Tri Tôn với chuyển động zoom chậm.
- Tiêu đề `Bricolage Grotesque` cỡ lớn.
- Thanh tìm kiếm theo nỗi đau du khách dạng chip bấm nhanh: *"Sợ hết giờ"*, *"Đi với người già"*, *"Muốn ăn gà đốt"*.

### 4.4. Section "Đêm Tri Tôn"
- Khung nền chuyển sang Dark Mode `--night-bg` (`#151B34`).
- Hiệu ứng đom đóm lơ lửng `--firefly` (`#FFD37A`), viền card ẩm thực/chợ đêm màu hổ phách ấm áp.

---

## 🚫 5. Quy Chuẩn Biểu Tượng SVG (NO EMOJI POLICY)

* **Tuyệt đối không dùng Emoji** trên giao diện, nút bấm, tiêu đề hay thẻ UI.
* **100% SVG Icons**: `lucide-react` (`Search`, `MapPin`, `Map`, `Clock`, `Star`, `Phone`, `Play`, `Car`, `Calendar`, `Share2`, `Download`, `Landmark`, `Utensils`, `Home`, `Bot`).

---

## 📋 6. Bảng Quy Tắc DO / DON'T

| ✅ DO | ❌ DON'T |
|---|---|
| Sử dụng ảnh **thật** của Tri Tôn (Tà Pạ, Ô Thum, Chùa Xà Tón, Soài So) | Tuyệt đối không dùng ảnh stock generic, ảnh biển, ảnh Sa Pa |
| Sử dụng nền cát sương ấm `#FAF3E7`, tránh dùng nền trắng tinh | Không dùng gradient neon tím-hồng kiểu city-app |
| Đồng bộ 1 hệ corner radius (`--r-s: 12px`, `--r-m: 18px`, `--r-l: 26px`) và spacing 8pt | Không dùng glassmorphism và blur tràn lan đục ngầu |
| Màu sắc danh mục nhất quán 100% khắp hệ thống | Không đổi màu danh mục tùy tiện |
| Font viết tay `Patrick Hand` chỉ dùng cho ghi chú nhỏ / stamp | Không dùng font viết tay cho Heading hoặc nội dung Body |
