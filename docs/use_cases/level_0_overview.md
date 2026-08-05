# LEVEL 0 — USE CASE TỔNG QUÁT (SYSTEM BOUNDARIES & ACTORS)

```text
                         HỆ THỐNG CHATBOT DU LỊCH TRI TÔN AI
                         
                                      Actor
                                        │
      ┌─────────────────────────────────┼─────────────────────────────────┐
      ▼                                 ▼                                 ▼
   Visitor                           Partner                            Admin
 (Du khách / Người dùng)     (Đối tác / Chủ cơ sở)              (Quản trị hệ thống)
      │                                 │                                 │
      ├── UC01 Khám phá du lịch         └── UC07 Quản lý thông tin        ├── UC08 Quản trị toàn bộ
      ├── UC02 AI Assistant                    doanh nghiệp dịch vụ       ├── Quản lý Knowledge Base
      ├── UC03 AI Trip Planner                                          ├── Kiểm duyệt thông tin
      ├── UC04 Bản đồ GIS & Đường đi                                    └── Giám sát mô hình AI
      ├── UC05 Xem Video TikTok/YouTube
      └── UC06 Quản lý tài khoản
```

---

## 👥 ĐỊNH NGHĨA ACTORS TRONG HỆ THỐNG

### 1. Visitor (Du khách / Người dùng cuối)
- Khám phá các danh mục thiên nhiên, chùa Khmer, ẩm thực, lưu trú và điểm check-in.
- Đặt câu hỏi tự nhiên với AI Assistant nhận câu trả lời kèm thẻ địa điểm, bản đồ và video TikTok.
- Tạo và tùy biến lịch trình tự động theo số ngày, ngân sách và phương tiện.
- Tra cứu vị trí trên bản đồ tương tác GIS và tìm tuyến đường ngắn nhất.

### 2. Partner (Đối tác kinh doanh local: Quán ăn, Homestay, Nông trại)
- Đăng ký và quản lý hồ sơ cơ sở kinh doanh dịch vụ tại Tri Tôn.
- Cập nhật danh sách món ăn, phòng nghỉ, bảng giá và hotline.
- Tải lên hình ảnh quảng bá và video clip TikTok/YouTube giới thiệu.

### 3. Admin (Quản trị viên hệ thống)
- Kiểm duyệt và phê duyệt thông tin bài đăng từ Partner.
- Quản lý bộ dữ liệu Master 82 địa điểm chuẩn hóa Tri Tôn.
- Cấu hình Prompt System, RAG Vector DB và kho video tuyển chọn.
- Giám sát nhật ký truy vấn, thống kê lỗi AI và hiệu năng hệ thống.
