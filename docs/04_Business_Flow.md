# 04. LUỒNG NGHIỆP VỤ (BUSINESS FLOW)

## 1. Luồng Hỏi - Đáp AI & Nhúng Video
```
User gửi câu hỏi ("Hồ Tà Pạ có gì đẹp?")
  │
  ▼
FastAPI tiếp nhận ──► Standardize NFC Text & Parse Intent/Entity
  │
  ▼
Query CSDL Master / Vector Search (pgvector)
  │
  ▼
Match Video Service (TikTok / YouTube Embed Link)
  │
  ▼
Trả về JSON Structured Response (Text + Place Card + Video Embed + Quick Action Buttons)
```

## 2. Luồng Lập Lịch Trình Tự Động (AI Trip Planner)
1. Người dùng chọn: Số ngày (1D/2D1N), Ngân sách, Sở thích (Thiên nhiên / Check-in / Ẩm thực).
2. Backend thuật toán phán đoán phân cụm Xã/Thị trấn và tính khoảng cách Lat/Lng WGS84.
3. Sinh lịch trình từng buổi (Sáng - Trưa - Chiều - Tối) kèm địa điểm, quán ăn, nơi ở.
4. Trả về giao diệnTimeline + Bản đồ lộ trình + Xuất link/QR Code.

## 3. Luồng Quản trị Dữ liệu (Admin Workflow)
* Thêm/sửa địa điểm $\rightarrow$ Validate Bounding Box [10.25-10.55, 104.85-105.15] $\rightarrow$ Audit Log (Who/What/When) $\rightarrow$ Cập nhật Master DB.
