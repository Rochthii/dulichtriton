# CHIẾN LƯỢC MÔ HÌNH DOANH THU & HỆ THỐNG QUẢN LÝ ADMIN (DU LỊCH TRI TÔN)

---

## 💰 1. KÍCH HOẠT 5 DÒNG TIỀN DOANH THU (MONETIZATION MODEL)

Nền tảng **Du Lịch Tri Tôn** áp dụng mô hình doanh thu đa dòng (Multi-revenue Streams) kết hợp B2B & B2C Win-Win:

| Nguồn Doanh Thu | Mô Tả Kỹ Thuật & Nghiệp Vụ | Mức Thu Khuyến Nghị |
| :--- | :--- | :--- |
| **1. Gian Hàng Đào Tạo AI (Verified Partner Subscriptions)** | Các nhà hàng (Gà đốt Ô Thum, Bò 7 món), Homestay, Cafe trả phí tháng để được gắn nhãn **TÍCH XANH ĐÃ XÁC MINH**, ưu tiên hiển thị Top 1 trong câu trả lời Chatbot & Bản đồ. | **200k - 500k / tháng** / gian hàng (Tiềm năng 50 quán = 15-25 triệu/tháng) |
| **2. Quảng Cáo Đặt Chỗ (Featured Recommendation Ads)** | Nút đặt bàn/đặt phòng trực tiếp khi du khách lập tour: *"Bạn có muốn đặt bàn trước tại Quán Gà Đốt Ô Thum Út Bó để không chờ 40 phút?"* | **5% - 10% hoa hồng** / đơn hàng đặt trước |
| **3. Tài Trợ Quảng Bá Địa Phương (Sponsorship & Government Grants)** | Hợp tác cùng Phòng VHTTDL Tri Tôn / An Giang truyền thông du lịch số, số hóa 82 điểm di tích văn hóa Khmer & Bảy Núi. | Theo gói ngân sách truyền thông số hóa du lịch |
| **4. Affiliate Booking & Vé (Vé tham quan / Xe đưa đón)** | Gắn link mua vé KDL Tức Dụp, xe limousine đi Tri Tôn, tour trekking Núi Cấm - Núi Tô. | **5% - 12% hoa hồng** Affiliate |
| **5. Dịch Vụ Chụp Ảnh / KOC Tour Guide (Platform Fee)** | Kết nối du khách với HDV bản địa Khmer / Thợ chụp ảnh sống ảo tại Cổng Trời Koh Kas, Cánh đồng Tà Pạ. | **15% Phí kết nối nền tảng** |

---

## 🎛️ 2. HỆ THỐNG QUẢN LÝ DÀNH CHO ADMIN (PARTNER & ADMIN PORTAL)

Hệ thống bao gồm Trang Quản trị Admin Dashboard (`/admin`) & Partner Portal (`/partner`) phân quyền RBAC chặt chẽ:

```text
                                TRANG QUẢN TRỊ ADMIN PORTAL
                                             │
       ┌─────────────────────────────────────┼─────────────────────────────────────┐
       ▼                                     ▼                                     ▼
1. QUẢN LÝ ĐỊA ĐIỂM             2. QUẢN LÝ GIAN HÀNG B2B              3. THỐNG KÊ DOANH THU & AI
   • Duyệt địa điểm mới            • Xác minh gian hàng (Tích xanh)      • Báo cáo lượt hỏi Chatbot
   • Cập nhật giá vé/giờ mở        • Quản lý gói đăng ký tháng           • Thống kê Click vào Google Maps
   • Sửa đổi tọa độ GPS            • Phê duyệt hình ảnh/video            • Nhật ký Audit Log hệ thống
```

### 2.1. Dành cho Chủ Quán (Partner Portal - `/partner`)
* **Đăng nhập đơn giản**: Chủ quán ăn/Homestay đăng nhập bằng SĐT.
* **Quản lý gian hàng**: Tự cập nhật menu, giá món ăn, khung giờ mở cửa, hình ảnh/video đẹp.
* **Báo cáo thời gian thực**: Xem thống kê: *"Hôm nay có bao nhiêu du khách hỏi AI về quán của mình"*.

### 2.2. Dành cho Tổng Admin (Super Admin Portal - `/admin`)
* **Phê duyệt Partner**: Quyền duyệt/hủy gian hàng Partner.
* **Quản lý Doanh thu & Người dùng**: Quản lý gói đăng ký tháng, tài khoản, khóa/mở người dùng.
* **Nhật ký Audit Log bảo mật**: Lưu nhật ký Audit Log bất biến (`Who` / `Did What` / `When` / `From Where`) đáp ứng chuẩn Production Real.

---

## 📢 3. CHIẾN LƯỢC QUẢNG BÁ & PHÁT TRIỂN (MARKETING & GROWTH)

### 3.1. TikTok & YouTube Shorts Video-First
* Xây dựng kênh TikTok **"Chăm Rốch Thi — Con Tri Tôn"** / **"Du Lịch Tri Tôn AI"**.
* Đăng tải video ngắn 15-30s góc nhìn thực tế về các địa danh & món ăn độc đáo.
* Gắn Bio Link truy cập trực tiếp `dulichtriton.vn`.

### 3.2. SEO Top 1 Google
* Tên miền `dulichtriton.vn` chiếm lĩnh 100% từ khóa tìm kiếm: *"du lịch tri tôn"*, *"hồ tà pạ"*, *"gà đốt ô thum"*, *"lịch trình tri tôn 2 ngày 1 đêm"*.

### 3.3. Sticker QR Code Offline (O2O)
* In Sticker QR Code dán tại các trạm dừng chân, quán ăn hot, homestay, quán cà phê view đẹp và bến xe Tri Tôn.
