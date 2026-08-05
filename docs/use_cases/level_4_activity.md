# LEVEL 4 — SƠ ĐỒ LUỒNG HOẠT ĐỘNG NGHIỆP VỤ (ACTIVITY FLOWS)

## 1. Sơ Đồ Luồng "Lập Lịch Trình Chuyến Đi AI (AI Trip Planner)"

```text
   [Bắt đầu]
       │
       ▼
 [Người dùng nhập yêu cầu chuyến đi]
 (Số ngày, ngân sách, phương tiện, sở thích)
       │
       ▼
 [AI Assistant kiểm tra & hỏi bổ sung nếu thiếu thông tin]
       │
       ▼
 [Phân tích & Lọc danh sách 82 địa điểm Tri Tôn phù hợp]
       │
       ▼
 [Chạy thuật toán Tối ưu hóa Lộ trình (UC03.08)]
 (Tính khoảng cách WGS84, gom nhóm xã/thị trấn, loại đường vòng)
       │
       ▼
 [Tự động ghép Quán ăn đặc sản (Gà đốt, bún nước lèo) & Homestay phù hợp]
       │
       ▼
 [Gọi TikTok Video Service nhúng video clip trải nghiệm cho mỗi điểm]
       │
       ▼
 [Hiển thị Lịch trình hoàn chỉnh trên Giao diện Interactive]
       │
       ▼
 ┌────────── KHÁCH HÀNG CÓ YÊU CẦU CHỈNH SỬA KHÔNG? ──────────┐
 │                                                            │
 ▼ Có                                                         ▼ Không
[Tùy chỉnh & Sinh lại]                                [Lưu Lịch trình / Xuất PDF / QR]
 │                                                            │
 └─────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                           [Kết thúc]
```

---

## 2. Sơ Đồ Luồng "Hỏi Đáp Chatbot AI + Nhúng Video TikTok (AI Chat & Video Match)"

```text
   [Người dùng gửi câu hỏi trên Chatbox]
       │
       ▼
 [Chuẩn hóa tiếng Việt NFC & Phân tích Intent / Entity]
       │
       ▼
 [Truy vấn Master Database 82 Thực thể Tri Tôn]
       │
       ├──────────────────────────────────────────┐
       ▼                                          ▼
 [Lấy thông tin Địa điểm, Địa chỉ, GPS]     [Gọi TikTokVideoService]
       │                                          │
       │                                          ▼
       │                                [Tạo TikTok Search & Embed URLs]
       │                                          │
       └────────────────────┬─────────────────────┘
                            │
                            ▼
           [Sinh Cấu Trúc JSON Response]
                            │
                            ▼
     [Render Giao Diện Khung Chat Responsive]:
     - Câu trả lời tự nhiên của AI Assistant
     - Thẻ địa điểm chi tiết (Ảnh, Địa chỉ, Giá vé, Bản đồ)
     - Carousel Video TikTok Viral liên quan
     - Nút gợi ý câu hỏi tiếp theo
                            │
                            ▼
                 [Lưu Chat History & Kết thúc]
```
