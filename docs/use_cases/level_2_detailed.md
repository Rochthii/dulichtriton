# LEVEL 2 — CHI TIẾT USE CASE NGHIỆP VỤ (BUSINESS LOGIC)

## 📌 UC03.08 — Tối ưu hóa lộ trình di chuyển (Optimize Route)

```text
UC03.08 Optimize Route
 ├── Lấy vĩ độ/kinh độ GPS điểm xuất phát & các điểm đến
 ├── Tính khoảng cách địa lý theo thuật toán Haversine WGS84
 ├── Phân tích thời gian mở cửa & Thời gian lưu lại trung bình
 ├── Phân tích điều kiện địa hình (Đường bằng, Đường núi Cô Tô, Đường tránh)
 ├── Phân nhóm địa điểm theo cụm xã/thị trấn (Tri Tôn, Ba Chúc, Chau Lăng, Ô Lâm, Núi Tô)
 ├── Áp dụng thuật toán tối ưu hóa đường đi ngắn nhất (Greedy / TSP Heuristic)
 ├── Loại bỏ các đường vòng không cần thiết
 ├── Sắp xếp thứ tự tham quan theo dòng thời gian (Timeline: Sáng - Trưa - Chiều - Tối)
 ├── Ước tính chi phí di chuyển & Giá vé
 └── Lưu kết quả phân rã lộ trình vào CSDL Itinerary
```

---

## 📌 UC01.03 — Xem chi tiết địa điểm du lịch (Spot Details)

```text
UC01.03 Spot Details
 ├── Nhận Place ID hoặc Slug tên địa điểm từ UI
 ├── Query thông tin từ Master Database 82 thực thể (Name, Category, Address, Commune, Ticket, Hours, Phone)
 ├── Lấy tọa độ GPS WGS84 (Latitude, Longitude)
 ├── Gọi `TikTokVideoService` lấy danh sách 2-4 video review viral liên quan
 ├── Lấy danh sách hình ảnh & Đánh giá rating từ người dùng
 ├── Tạo link nhúng Google Maps / Leaflet
 └── Trả về cấu trúc Data Render UI Thẻ Địa điểm hoàn chỉnh
```

---

## 📌 UC07.02 — Thêm địa điểm dịch vụ đối tác (Partner Service Listing)

```text
UC07.02 Create Service Listing
 ├── Đối tác mở Form đăng ký địa điểm/dịch vụ
 ├── Nhập Tên, Địa chỉ, Xã/Thị trấn, Giá cả, Số điện thoại
 ├── Định vị vĩ độ & kinh độ trên bản đồ
 ├── Tải lên ảnh xem trước & Link video TikTok/YouTube
 ├── Gửi yêu cầu lên hệ thống (Trạng thái: Pending Moderation)
 ├── Admin kiểm tra & đối sánh với tiêu chuẩn dữ liệu Tri Tôn
 ├── Phê duyệt (Approved): Tự động nạp vào Database & Re-index Vector DB
 └── Thông báo kết quả cho Partner
```
