# TÀI LIỆU KIẾN TRÚC VÀ PHÂN RÃ USE CASE HỆ THỐNG
## CHATBOT DU LỊCH TRI TÔN AI (TRI TON TOURISM AI SYSTEM)

> **Tài liệu chuẩn UML phân rã Use Case 4 cấp (Level 0 đến Level 4)**
> **Áp dụng cho:** Đồ án tốt nghiệp / Dự án hệ thống sản xuất thực tế.
> **Cập nhật lần cuối:** 2026-08-05 | **Phiên bản:** 10.0.0-PRODUCTION

---

## 📌 TỔNG QUAN KIẾN TRÚC USE CASE

Hệ thống được thiết kế theo đúng tiêu chuẩn phân rã UML từ tổng quát đến chi tiết kỹ thuật:

```text
Business Vision & Scope
        │
        ▼
Level 0: Use Case Tổng Quát (System Boundaries & Actors)
        │
        ▼
Level 1: Phân Rã Module (8 Modules Chức Năng)
        │
        ▼
Level 2: Use Case Chi Tiết (Detailed Specifications)
        │
        ▼
Level 3: Low-Level Use Case Execution (Luồng xử lý dữ liệu AI/RAG/GIS/Video)
        │
        ▼
Level 4: Activity Flow Diagrams (Sơ đồ luồng hoạt động nghiệp vụ)
```

---

# LEVEL 0 — USE CASE TỔNG QUÁT (OVERVIEW & ACTORS)

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
      ├── UC02 AI Assistant Assistant            doanh nghiệp dịch vụ           ├── Quản lý Knowledge Base
      ├── UC03 AI Trip Planner                                          ├── Kiểm duyệt thông tin
      ├── UC04 Bản đồ GIS & Đường đi                                    └── Giám sát mô hình AI
      ├── UC05 Xem Video TikTok/YouTube
      └── UC06 Quản lý tài khoản
```

---

# LEVEL 1 — PHÂN RÃ CHỨC NĂNG THEO MODULE (MODULE DECOMPOSITION)

### UC01 Module Khám Phá Du Lịch (Tourism Discovery)
```text
UC01 Khám phá du lịch
 ├── UC01.01 Tìm kiếm địa điểm (Search Places)
 ├── UC01.02 Xem danh mục (Browse Categories: Thiên nhiên, Văn hóa, Ẩm thực, Lưu trú, Check-in)
 ├── UC01.03 Xem chi tiết địa điểm (Place Details & Media)
 ├── UC01.04 Xem địa điểm nổi bật / Trending
 ├── UC01.05 Xem địa điểm gần đây / Gợi ý vị trí
 ├── UC01.06 Xem địa điểm theo mùa (Mùa nước nổi, Mùa lúa chín, Mùa lễ hội)
 ├── UC01.07 Xem địa điểm theo sở thích cá nhân
 ├── UC01.08 Xem đánh giá & Bình luận (Reviews & Ratings)
 ├── UC01.09 Chia sẻ địa điểm (Share Links & QR Code)
 └── UC01.10 Lưu địa điểm yêu thích (Bookmark Favorites)
```

### UC02 Module AI Assistant & Chatbot RAG (AI Chatbot Engine)
```text
UC02 AI Assistant
 ├── UC02.01 Đặt câu hỏi tự nhiên (Ask Natural Language Question)
 ├── UC02.02 Phân tích ý định (Intent Recognition)
 ├── UC02.03 Nhận diện thực thể (Named Entity Recognition - NER)
 ├── UC02.04 Truy vấn CSDL Tri thức & Vector DB (RAG Search)
 ├── UC02.05 Sinh câu trả lời chuẩn xác (LLM Response Generation)
 ├── UC02.06 Gợi ý địa điểm tham quan (Suggest Spots)
 ├── UC02.07 Gợi ý món ngon & quán ăn đặc sản (Suggest Foods & Restaurants)
 ├── UC02.08 Gợi ý homestay & nơi lưu trú (Suggest Accommodations)
 ├── UC02.09 Gợi ý & Nhúng Video TikTok/YouTube (TikTok Video Matcher)
 ├── UC02.10 Gợi ý câu hỏi tiếp theo (Follow-up Suggestions)
 └── UC02.11 Lưu lịch sử hội thoại (Chat History Persistence)
```

### UC03 Module AI Trip Planner (Lập Lịch Trình Thông Minh)
```text
UC03 AI Trip Planner
 ├── UC03.01 Khởi tạo chuyến đi (Init Trip Request)
 ├── UC03.02 Thu thập yêu cầu (Collect Preferences)
 ├── UC03.03 Phân tích ngân sách (Budget Analysis)
 ├── UC03.04 Phân tích thời gian (Duration & Timing Analysis)
 ├── UC03.05 Phân tích phương tiện di chuyển (Transport Mode)
 ├── UC03.06 Phân tích sở thích (Style: Sống ảo, Khám phá, Ẩm thực, Tâm linh)
 ├── UC03.07 Lựa chọn tập hợp địa điểm (Filter Eligible Places)
 ├── UC03.08 Tối ưu hóa lộ trình di chuyển (Optimize Route Algorithm)
 ├── UC03.09 Lựa chọn quán ăn hợp lý (Select Meal Spots)
 ├── UC03.10 Lựa chọn nơi ở phù hợp (Select Lodging)
 ├── UC03.11 Sinh bản kế hoạch lịch trình chi tiết (Generate Itinerary Schedule)
 ├── UC03.12 Điều chỉnh & Tùy biến lịch trình (Custom Edit Itinerary)
 ├── UC03.13 Xuất file PDF / Lưu offline (Export PDF / Offline Mode)
 └── UC03.14 Chia sẻ lịch trình chuyến đi (Share Itinerary Link/QR)
```

### UC04 Module Bản Đồ GIS & Điều Hướng (GIS Map & Navigation)
```text
UC04 Bản đồ GIS
 ├── UC04.01 Hiển thị bản đồ số Tri Tôn (Interactive Leaflet/Google Maps)
 ├── UC04.02 Tìm tuyến đường & Chỉ đường (Get Navigation Directions)
 ├── UC04.03 Tính khoảng cách & Thời gian di chuyển WGS84
 ├── UC04.04 Định vị vị trí hiện tại (GPS Current Location)
 ├── UC04.05 Tìm kiếm tiện ích xung quanh tôi (Find Nearby Amenities)
 └── UC04.06 Lọc địa điểm trên bản đồ theo lớp dữ liệu (Layer Filtering)
```

### UC05 Module Multi-Platform Video Engine (Tích Hợp Video TikTok/YouTube)
```text
UC05 Video Engine
 ├── UC05.01 Xem video trải nghiệm thực tế (Play Review Videos)
 ├── UC05.02 Truy xuất video theo địa điểm cụ thể (Fetch Videos by Spot)
 ├── UC05.03 Truy xuất video theo lịch trình tham quan (Fetch Videos by Itinerary)
 ├── UC05.04 Hiển thị danh sách video TikTok Viral nổi bật (Trending TikTok List)
 ├── UC05.05 Chia sẻ video lên mạng xã hội (Share Video Link)
 └── UC05.06 Báo lỗi video không khả dụng / Nội dung sai lệch (Report Broken Video)
```

### UC06 Module Quản Lý Tài Khoản & Cá Nhân Hóa (User Account)
```text
UC06 Tài khoản
 ├── UC06.01 Đăng ký tài khoản (User Sign Up)
 ├── UC06.02 Đăng nhập (Sign In: Password / Google OAuth)
 ├── UC06.03 Quên mật khẩu & Khôi phục (Password Recovery)
 ├── UC06.04 Cập nhật thông tin cá nhân (Update Profile)
 ├── UC06.05 Quản lý danh sách địa điểm yêu thích (Manage Favorites)
 ├── UC06.06 Quản lý lịch trình đã lưu (Manage Saved Itineraries)
 └── UC06.07 Đăng xuất (Sign Out)
```

### UC07 Module Quản Lý Dành Cho Đối Tác (Partner Portal)
```text
UC07 Partner Portal
 ├── UC07.01 Đăng ký tài khoản đối tác (Partner Registration)
 ├── UC07.02 Thêm địa điểm dịch vụ mới (Create Service Listing)
 ├── UC07.03 Thêm/Cập nhật quán ăn & món ăn (Manage Food Listings)
 ├── UC07.04 Thêm/Cập nhật homestay & phòng nghỉ (Manage Room Listings)
 ├── UC07.05 Tải lên hình ảnh quảng bá (Upload Photos)
 ├── UC07.06 Tải lên link/video TikTok/YouTube giới thiệu (Upload Video Clips)
 ├── UC07.07 Chỉnh sửa thông tin liên hệ & Giá dịch vụ (Edit Details & Pricing)
 └── UC07.08 Xem báo cáo lượt tương tác & Đánh giá (Analytics Dashboard)
```

### UC08 Module Quản Trị Hệ Thống & Kiểm Duyệt AI (Admin Control Center)
```text
UC08 Admin Control Center
 ├── UC08.01 Báo cáo tổng quan Dashboard (System Metrics Dashboard)
 ├── UC08.02 Quản lý danh mục & 82 địa điểm Master (Manage Places DB)
 ├── UC08.03 Quản lý kho video TikTok/YouTube (Manage Video Library)
 ├── UC08.04 Quản lý cơ sở ẩm thực & đặc sản (Manage Food & Restaurants DB)
 ├── UC08.05 Quản lý cơ sở lưu trú & homestay (Manage Homestays DB)
 ├── UC08.06 Quản lý tài khoản người dùng & đối tác (Manage Users & Partners)
 ├── UC08.07 Phê duyệt bài đăng đối tác (Content Audit & Moderation)
 ├── UC08.08 Quản lý cấu hình AI Orchestrator & LLM Prompt (AI Prompt Config)
 ├── UC08.09 Quản lý CSDL Tri thức & Re-indexing Vector DB (Knowledge Base Management)
 └── UC08.10 Thống kê lượt truy vấn & Giám sát lỗi AI (System Audit & Logs)
```

---

# LEVEL 2 — CHI TIẾT CÁC USE CASE QUAN TRỌNG

### Ví Dụ: **UC03.08 — Tối ưu hóa lộ trình di chuyển (Optimize Route)**

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

# LEVEL 3 — PHÂN RÃ SÂU LUỒNG XỬ LÝ AI CHATBOT (ASK AI ASSISTANT)

### **UC02.01 — Người dùng đặt câu hỏi AI Assistant**

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

---

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

---

## 📊 THỐNG KÊ TỔNG QUAN HỆ THỐNG USE CASE

| Cấp Độ Phân Rã | Số Lượng Sơ Đồ / Use Cases | Mô Tả Phạm Vi |
| :--- | :---: | :--- |
| **Level 0 (Tổng quát)** | **1 Sơ đồ** | Định hình 3 Actors (Visitor, Partner, Admin) và 8 Khối chức năng chính. |
| **Level 1 (Module)** | **8 Modules (72 Use Cases)** | Phân rã chi tiết toàn bộ chức năng theo 8 phân hệ chuyên biệt. |
| **Level 2 (Chi tiết)** | **~60 Use Cases Chi tiết** | Quy định rõ từng tác vụ của hệ thống (Tính khoảng cách, Lọc địa điểm, Tối ưu lộ trình...). |
| **Level 3 (Low-level)** | **~180 Steps Execution** | Chi tiết hóa luồng xử lý dữ liệu RAG, Vector DB, Chống bịạ dữ liệu và TikTok Matcher. |
| **Level 4 (Activity Diagram)** | **4 Sơ đồ Luồng chính** | Mô tả luồng chạy thực tế từ giao diện người dùng đến xử lý backend và trả về dữ liệu. |
