# LEVEL 3 — PHÂN RÃ LUỒNG XỬ LÝ AI CHATBOT & RAG ENGINE

## 📌 UC02.01 — Người dùng hỏi AI Assistant (`Ask AI Assistant`)

```text
UC02.01 Ask AI Assistant
 ├── 1. Nhập câu hỏi (Text input / Voice input)
 ├── 2. Kiểm tra ngôn ngữ & lọc từ ngữ độc hại (Safety check)
 ├── 3. Chuẩn hóa câu hỏi tiếng Việt (Unicode NFC, hạ chữ hoa, xóa ký tự thừa)
 ├── 4. Phân tích Intent (Hỏi địa điểm, Ẩm thực, Nơi ở, Lịch trình, Phương tiện, Lễ hội)
 ├── 5. Trích xuất Entity (Tên núi, hồ, chùa, quán ăn, món ngon, tên xã/thị trấn)
 ├── 6. Truy vấn CSDL Master 82 thực thể (Strict SQL/JSON Search)
 ├── 7. Truy vấn Vector DB / RAG Context nếu cần mở rộng thông tin
 ├── 8. Kiểm tra chống Bịạ dữ liệu (Anti-Hallucination Guardrail against Master DB)
 ├── 9. Gọi Service TikTok Video (`TikTokVideoService`) lấy video review liên quan
 ├── 10. Gọi Service Bản đồ GIS lấy tọa độ WGS84 & link Google Maps
 ├── 11. Sinh cấu trúc JSON Response (Văn bản trả lời, Thẻ địa điểm, Danh sách video, Bản đồ)
 ├── 12. Render UI Card Địa điểm (Tên, Ảnh, Giá vé, Giờ mở cửa, Hotline)
 ├── 13. Render Carousel Video TikTok (Title, Author, Hashtags, Direct Search URL)
 ├── 14. Render Khung Bản Đồ Tương Tác / Nút Chỉ Đường
 ├── 15. Render Gợi Ý Câu Hỏi Tiếp Theo (Follow-up Questions)
 └── 16. Lưu Lịch Sử Hội Thoại vào Session/Database
```
