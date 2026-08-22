# CHIẾN LƯỢC & QUY CHUẨN TÍCH HỢP HỆ SINH THÁI ZALO (DU LỊCH TRI TÔN AI)

Tài liệu quy chuẩn kỹ thuật và định hướng chiến lược tích hợp Hệ sinh thái Zalo cho Nền tảng Du Lịch Tri Tôn AI, tối ưu hóa cho mô hình **Cá nhân / Sinh viên phát triển độc lập và hợp tác chuyển đổi số địa phương**.

---

## 📌 1. TẠI SAO PHẢI TÍCH HỢP HỆ SINH THÁI ZALO?

1. **Hành vi du khách tại Tri Tôn**:
   - 95%+ du khách nội địa (Gia đình, GenZ, Phượt thủ, Đoàn tour) đều có Zalo cài sẵn trên điện thoại.
   - Du khách **rất ngại cài đặt ứng dụng mới** từ App Store / Google Play vì tốn dung lượng và sóng 4G ở vùng núi Bảy Núi (Cô Tô, Tà Pạ) có những đoạn chập chờn.
2. **Hành vi hộ kinh doanh bản địa**:
   - 100% các quán Gà Đốt Ô Thum (Thảo Nguyên, Kiều Tiên, Việt Nho...), quán Đu Đủ Đâm Châu Lăng, Homestay và Đội Xe Ôm Tri Tôn đều giao dịch, gửi ảnh món ăn và nhận đặt cọc qua Zalo.
3. **Mục tiêu**: **Zero-Friction Access** — Du khách chỉ cần quét mã QR tại hiện trường là mở ngay bản đồ, lịch trình và chatbot AI trong 1 giây mà không cần tạo tài khoản hay cài app.

---

## 🏛️ 2. MA TRẬN 4 CƠ CHẾ TÍCH HỢP DÀNH CHO CÁ NHÂN / SINH VIÊN

| Phân Loại Cơ Chế | Cơ Chế 1: Webview In-App Browser 🌐 | Cơ Chế 2: ZMA Sandbox Mode 🧪 | Cơ Chế 3: Deep-Link O2O 🔗 | Cơ Chế 4: Local OA Partnership 🏛️ |
| :--- | :--- | :--- | :--- | :--- |
| **Bản chất** | Tối ưu web Next.js khi mở qua link/QR trong Zalo | Ứng dụng Mini App chạy trên Zalo Dev Sandbox | Dùng URL Scheme zalo.me/... kết nối bản địa | Bắt tay Huyện đoàn / Homestay để lên Search Bar |
| **Tư cách cá nhân** | **Chủ động 100%** | **Chủ động 100%** | **Chủ động 100%** | Hợp tác cấp quyền OA |
| **Chi phí** | 0 VNĐ | 0 VNĐ | 0 VNĐ | 0 VNĐ |
| **Phạm vi phục vụ** | Toàn bộ du khách quét QR / mở link | 100 Testers (Bạn bè, Hội đồng chấm, Sinh viên) | 100% du khách và chủ quán tại Tri Tôn | Toàn bộ 75 triệu người dùng Zalo tìm kiếm |

---

## ⚙️ 3. THÔNG SỐ CẤU HÌNH & BẢO MẬT (ZALO APP CREDENTIALS)

- **Tên ứng dụng**: Du Lịch Tri Tôn AI
- **Mã định danh ứng dụng (App ID)**: 1338932952469801162
- **Khóa bí mật (App Secret)**: Lưu tại biến môi trường ZALO_APP_SECRET trong .env.local (Tuyệt đối không commit).
- **Mã xác thực tên miền**: zalo-platform-site-verification=GTM26R7vLqPN-FyGZjfH5KZtsX2aWG19CZ8s
- **Số điện thoại định danh**: +84 329 812 996
- **Zalo JS SDK Version**: 2.42.0 (https://zjs.zalo.me/zmp-sdk/2.42.0/zmp.min.js)

---

## 📱 4. THIẾT KẾ TRẢI NGHIỆM DU KHÁCH THỰC ĐỊA (USER FLOWS)

`
[ Du Khách Đến Tri Tôn ]
         │
         ├── 📍 1. QUÉT MÃ QR TẠI HIỆN TRƯỜNG (O2O)
         │       └── Dán bảng QR tại 149 điểm (Chùa Xvayton, Cổng Trời Koh Kas, Hồ Tà Pạ)
         │       └── Quét bằng Zalo ──► Mở ngay trang chi tiết, tọa độ GPS, Audio thuyết minh
         │
         ├── 🍗 2. ĐẶT BÀN / ĐẶT MÓN GÀ ĐỐT TRƯỚC 1-CHẠM
         │       └── Trên thẻ quán ăn (Gà đốt Thảo Nguyên, Quán Rina Đu đủ đâm...)
         │       └── Bấm [ Nhắn Zalo Đặt Bàn ] ──► Mở thẳng Zalo chủ quán với mẫu tin nhắn soạn sẵn
         │
         ├── 🧭 3. ĐỊNH VỊ GPS TÌM ĐIỂM GẦN NHẤT
         │       └── Du khách cấp quyền vị trí ──► PostGIS ST_DWithin tìm POIs bán kính < 3km
         │
         └── 👥 4. CHIA SẺ LỊCH TRÌNH VÀO NHÓM BẠN BÈ
                 └── Lập lịch trình 2N1D ──► Bấm [ Gửi Vào Nhóm Zalo ]
                 └── Bạn bè trong nhóm nhận ngay thẻ tóm tắt + link Google Maps điều hướng
`

---

## 🚀 5. LỘ TRÌNH THỰC THI 3 BƯỚC (ZERO-RISK BLUEPRINT)

### 🔹 Giai đoạn 1: Hoàn thiện Lõi Web-App tối ưu chuẩn Zalo (Độc lập 100%)
1. Tối ưu giao diện Mobile Responsive tràn viền (--zmp-safe-top, --zmp-safe-bottom).
2. Tích hợp bộ tiện ích rontend/src/lib/zalo.ts (GPS, Share, Chat với chủ quán).
3. Đảm bảo toàn bộ 149 POI, Chatbot AI và Lộ trình chạy mượt mà 60fps trên trình duyệt Zalo.

### 🔹 Giai đoạn 2: Thiết lập Zalo Mini App Sandbox (Demo & Đồ án)
1. Thêm số điện thoại của bạn, bạn bè và giảng viên/hội đồng vào danh sách **Tester** trên [mini.zalo.me](https://mini.zalo.me/).
2. Tạo mã QR trải nghiệm Mini App nội bộ để trình chiếu, quay video clip thực tế.

### 🔹 Giai đoạn 3: Hợp tác Liên kết Zalo OA Địa Phương (Xuất bản công khai)
1. Đem sản phẩm hoàn chỉnh đề xuất với **Huyện đoàn Tri Tôn / Phòng Văn hóa - Thông tin huyện Tri Tôn**.
2. Đề xuất cấp quyền liên kết Zalo OA Cơ quan Nhà nước (Công trình Chuyển đổi số Thanh niên).
3. Bấm Publish trên Zalo Developer Portal để đưa App lên thanh tìm kiếm toàn quốc.
