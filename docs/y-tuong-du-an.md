# CHATBOT DU LỊCH TRI TÔN AI

> **Hệ thống website du lịch thông minh kết hợp chatbot AI và video trải nghiệm thực tế.**

---

## 1. Tên dự án

**CHATBOT DU LỊCH TRI TÔN AI**  
Hệ thống website du lịch thông minh kết hợp chatbot AI và video trải nghiệm thực tế.

---

## 2. Bối cảnh và vấn đề

Tri Tôn là huyện miền núi của tỉnh An Giang, thuộc vùng Bảy Núi, có nhiều tiềm năng du lịch về thiên nhiên, văn hóa Khmer, ẩm thực địa phương và các điểm check-in hấp dẫn. Tuy nhiên, thông tin du lịch hiện nay có thể còn phân tán trên nhiều nền tảng như Facebook, TikTok, YouTube, Google Maps, blog cá nhân...

Du khách thường gặp các vấn đề:
- Không biết Tri Tôn có gì chơi.
- Khó tìm thông tin tổng hợp về địa điểm, đường đi, món ăn, nơi ở.
- Muốn xem video thực tế nhưng phải tự tìm trên TikTok/YouTube.
- Không biết sắp xếp lịch trình hợp lý trong 1 ngày, 2 ngày hoặc cuối tuần.

Vì vậy, một website kết hợp chatbot AI sẽ giúp du khách **hỏi nhanh - xem nhanh - lên lịch trình nhanh**.

---

## 3. Mục tiêu dự án

### Mục tiêu chung
Xây dựng một nền tảng du lịch thông minh dành cho huyện Tri Tôn, hỗ trợ du khách tra cứu thông tin, xem video trải nghiệm và tạo lịch trình tham quan cá nhân hóa.

### Mục tiêu cụ thể
- Quảng bá hình ảnh du lịch Tri Tôn.
- Cung cấp thông tin tập trung về địa điểm, ẩm thực, lưu trú, lễ hội, phương tiện.
- Cho phép người dùng hỏi đáp bằng ngôn ngữ tự nhiên.
- Gợi ý lịch trình theo số ngày, ngân sách và sở thích.
- Hiển thị video liên quan ngay trong câu trả lời của chatbot.
- Tăng trải nghiệm trực quan so với website du lịch truyền thống.

---

## 4. Đối tượng sử dụng

### 4.1. Du khách
Người muốn tìm hiểu Tri Tôn trước chuyến đi hoặc đang ở Tri Tôn và cần tra cứu nhanh.

Ví dụ câu hỏi:
- "Tri Tôn có gì chơi?"
- "Hồ Tà Pạ ở đâu?"
- "Ăn gì ở Tri Tôn?"
- "Lịch trình 2 ngày 1 đêm ở Tri Tôn?"
- "Từ Long Xuyên đi Tri Tôn như thế nào?"

### 4.2. Người dân địa phương, chủ quán, homestay
Có thể được cập nhật thông tin dịch vụ nếu hệ thống có phần quản lý dành cho đối tác.

### 4.3. Quản trị viên website
Người quản lý nội dung, duyệt địa điểm, cập nhật video, chỉnh sửa thông tin.

---

## 5. Phạm vi chức năng

### 5.1. Các trang website đề xuất

**Trang chủ**: Banner hình ảnh/video, ô chatbot nổi bật, gợi ý nhanh, video trải nghiệm nổi bật.

**Trang địa điểm du lịch**: Thiên nhiên (hồ, núi, đồi), Văn hóa-tâm linh (chùa, lễ hội), Check-in, Gia đình, Khám phá.

**Trang ẩm thực**: Gà đốt, bún nước lèo, bánh xèo, bánh bò thốt nốt, nước thốt nốt, món Khmer.

**Trang lưu trú**: Homestay, nhà nghỉ, khách sạn với thông tin liên hệ và bản đồ.

**Trang văn hóa - lễ hội**: Lễ hội đua bò Bảy Núi, văn hóa Khmer, các hoạt động theo mùa.

**Trang lịch trình gợi ý**: 1 ngày, 2 ngày 1 đêm, check-in, thiên nhiên, ẩm thực, gia đình, nhóm bạn.

**Trang bản đồ**: Google Maps Embed / Leaflet + OpenStreetMap.

**Trang thông tin cần biết**: Di chuyển, phương tiện, thời điểm nên đi, lưu ý, FAQ.

---

### 5.2. Chatbot AI - Chức năng chính

- Trả lời câu hỏi về địa điểm (mô tả, địa chỉ, bản đồ, video).
- Trả lời câu hỏi về ẩm thực (món ngon, quán gợi ý, giá cả).
- Trả lời câu hỏi về lưu trú (nơi ở, khoảng giá, liên hệ).
- Gợi ý lịch trình (hỏi thêm về sở thích, ngân sách, phương tiện).
- Trả lời câu hỏi về di chuyển (khoảng cách, phương tiện, tuyến đường).

---

### 5.3. Hiển thị video tự động trong khung chat ⭐

**Nguyên tắc hoạt động**:
1. Chatbot phân tích ý định câu hỏi.
2. Hệ thống truy xuất dữ liệu địa điểm liên quan.
3. Tìm video phù hợp với địa điểm.
4. Trả về: văn bản + ảnh + video + bản đồ + nút hành động.

**Dạng video**: YouTube Shorts, TikTok, YouTube thông thường, video admin tuyển chọn.

**Cách hiển thị**: Thẻ video, embed trực tiếp, carousel vuốt ngang, danh sách video.

---

## 6. Luồng hoạt động hệ thống

```
Người dùng → Website/Chat → API Backend → AI Orchestrator
                                              ├── CSDL địa điểm
                                              ├── Video Service
                                              ├── Map Service
                                              └── Lịch trình Generator
```

---

## 7. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|---|---|
| Hiệu năng | Tải nhanh trên di động; chatbot phản hồi 2-5 giây; video load thumbnail trước |
| Giao diện | Responsive mobile-first; thiết kế hiện đại; chatbox nổi bật; nút gợi ý nhanh |
| Độ chính xác | Thông tin kiểm duyệt; không bịa dữ liệu; thông báo rõ khi thiếu thông tin |
| Bảo mật | Không thu thập dữ liệu quá mức; bảo mật tài khoản; nhúng video đúng cách |
| Bản quyền | Nguồn rõ ràng; nhúng đúng chính sách; ưu tiên video được cấp quyền |

---

## 8. Kiến trúc hệ thống đề xuất

### Frontend
- **Đơn giản**: HTML/CSS/JavaScript thuần
- **Hiện đại**: ReactJS hoặc NextJS + TailwindCSS/Bootstrap

### Backend
- Node.js + Express
- Python + FastAPI (khuyến nghị nếu dùng AI)
- PHP + Laravel

### AI Chatbot
**Mức cơ bản (Rule-based)**: Nhận diện câu hỏi bằng từ khóa. Phù hợp đồ án, không cần API trả phí.

**Mức nâng cao (LLM + RAG)**:
1. Câu hỏi → embedding → tìm kiếm CSDL tri thức
2. Ngữ cảnh → LLM → câu trả lời tự nhiên
3. Gắn video, bản đồ, thẻ địa điểm

### Cơ sở dữ liệu
- Relational: PostgreSQL / MySQL
- NoSQL: Firebase / MongoDB
- Vector DB (RAG): pgvector, ChromaDB, Qdrant

### Dịch vụ video
**Ưu tiên**: Video admin tuyển chọn (chính xác, dễ kiểm duyệt).
**Fallback**: YouTube Data API theo từ khóa.

---

## 9. Thiết kế cơ sở dữ liệu mẫu

### Bảng `places`
| Trường | Mô tả |
|---|---|
| id | Mã địa điểm |
| name | Tên địa điểm |
| category | Loại: thiên nhiên, văn hóa, ẩm thực, lưu trú |
| description | Mô tả |
| address | Địa chỉ |
| commune | Xã/thị trấn |
| latitude | Vĩ độ |
| longitude | Kinh độ |
| opening_hours | Giờ mở cửa |
| ticket_price | Giá vé |
| images | Danh sách ảnh |
| map_url | Link Google Maps |
| tags | Từ khóa |
| is_active | Trạng thái hiển thị |

### Bảng `videos`
| Trường | Mô tả |
|---|---|
| id | Mã video |
| place_id | Mã địa điểm liên quan |
| title | Tiêu đề |
| platform | youtube, tiktok, other |
| video_url | Link gốc |
| embed_url | Link nhúng |
| thumbnail | Ảnh thumbnail |
| keywords | Từ khóa |
| is_approved | Đã duyệt hay chưa |

### Bảng `foods`
| id | name | description | images | tags |

### Bảng `restaurants`
| id | name | address | price_range | opening_hours | food_ids | images | videos | map_url |

### Bảng `homestays`
| id | name | address | price_range | phone | images | videos | map_url |

### Bảng `itineraries`
| id | title | days | budget | style | content | place_ids |

### Bảng `itinerary_items`
| id | itinerary_id | day | time | place_id | note |

---

## 10. Cấu trúc JSON câu trả lời chatbot

```json
{
  "answer": "Hồ Tà Pạ là điểm đến nổi tiếng ở Tri Tôn.",
  "intent": "place_info",
  "places": [
    {
      "name": "Hồ Tà Pạ",
      "description": "Hồ nước đẹp, không khí thoáng đãng, phù hợp check-in.",
      "map_url": "https://maps.google.com/...",
      "images": ["image1.jpg"]
    }
  ],
  "videos": [
    {
      "title": "Trải nghiệm Hồ Tà Pạ",
      "platform": "youtube",
      "thumbnail": "thumb.jpg",
      "embed_url": "https://www.youtube.com/embed/..."
    }
  ],
  "follow_up_questions": [
    "Bạn có muốn xem lịch trình 1 ngày không?",
    "Bạn muốn tìm quán ăn gần đây không?"
  ]
}
```

---

## 11. Kịch bản hội thoại mẫu

**Kịch bản 1 - Hỏi địa điểm**  
User: "Hồ Tà Pạ ở đâu?"  
Bot: Mô tả + thẻ địa điểm + nút Google Maps + video + gợi ý lịch trình.

**Kịch bản 2 - Hỏi tổng quát**  
User: "Tri Tôn có gì chơi?"  
Bot: Danh sách điểm nổi bật + ảnh/video + nút "Xem chi tiết" + nút "Tạo lịch trình".

**Kịch bản 3 - Hỏi lịch trình**  
User: "Lịch trình 2 ngày ở Tri Tôn?"  
Bot: Hỏi thêm sở thích/phương tiện → Ngày 1: sáng-trưa-chiều-tối + Ngày 2 + video mỗi điểm + nút chỉ đường.

**Kịch bản 4 - Hỏi ẩm thực**  
User: "Tri Tôn có món gì ngon?"  
Bot: Danh sách món đặc sản + quán gợi ý + ảnh + video.

**Kịch bản 5 - Hỏi lưu trú**  
User: "Ở Tri Tôn có chỗ nào ngủ lại không?"  
Bot: Danh sách nơi ở + khoảng giá + ảnh + nút gọi điện/chỉ đường.

---

## 12. Chức năng mở rộng

| STT | Tính năng | Mô tả |
|---|---|---|
| 1 | Lưu lịch trình cá nhân | Tạo, lưu, xuất link chia sẻ, QR code |
| 2 | Gợi ý theo sở thích | Thiên nhiên, ẩm thực, check-in, văn hóa, gia đình, cặp đôi |
| 3 | Gợi ý theo thời tiết/mùa | Mùa nước nổi, trời nắng, buổi chiều lý tưởng |
| 4 | Đa ngôn ngữ | Tiếng Việt, tiếng Anh, tiếng Khmer |
| 5 | Bản đồ tương tác | Tuyến trung tâm, hồ-núi, ẩm thực, văn hóa |
| 6 | Đánh giá và bình luận | Chấm sao, bình luận, đăng ảnh |
| 7 | Kênh dành cho chủ quán | Đăng thông tin → admin duyệt → hiển thị |

---

## 13. Lộ trình triển khai MVP

**Giai đoạn 1 - Khảo sát & thu thập dữ liệu**
- Liệt kê 10-20 địa điểm nổi bật, thu thập ảnh/mô tả/địa chỉ.
- Thu thập video TikTok/YouTube, quán ăn, homestay.
- Xác minh thông tin cơ bản.

**Giai đoạn 2 - Xây dựng website cơ bản**
- Thiết kế giao diện mobile-first.
- Trang chủ, địa điểm, ẩm thực, bản đồ, lịch trình.
- Đưa dữ liệu mẫu vào.

**Giai đoạn 3 - Tích hợp chatbot cơ bản**
- Xây dựng khung chat.
- Nhận diện câu hỏi đơn giản (rule-based).
- Hiển thị video theo địa điểm trong chat.

**Giai đoạn 4 - Nâng cấp chatbot AI**
- Kết nối LLM + RAG.
- Câu trả lời có cấu trúc JSON.
- Gợi ý lịch trình thông minh.

**Giai đoạn 5 - Hoàn thiện & thử nghiệm**
- Kiểm thử câu hỏi thực tế.
- Tối ưu tốc độ, sửa lỗi.
- Thu thập phản hồi người dùng.
- Bản demo hoàn chỉnh.

---

## 14. Rủi ro và giải pháp

| Rủi ro | Giải pháp |
|---|---|
| Thiếu dữ liệu địa điểm | Bắt đầu với 10-20 điểm nổi bật, cập nhật dần |
| Video không liên quan | Ưu tiên video admin gắn thủ công, có nút báo cáo |
| Bản quyền video | Nhúng đúng cách, xin phép tác giả khi cần |
| Chatbot trả lời sai | Dùng RAG với dữ liệu đã duyệt, giới hạn phạm vi |
| Phụ thuộc API bên ngoài | Lưu video tuyển chọn trong CSDL, có phương án dự phòng |

---

## 15. Bộ dữ liệu ban đầu đề xuất

**Địa điểm nổi bật**: Hồ Tà Pạ, Núi Cô Tô, Hồ Soài So, Hồ Ô Thum, Đồi Tức Dụp, Chùa Tà Pạ, các chùa Khmer tiêu biểu, điểm check-in theo mùa.

**Ẩm thực**: Gà đốt, bún nước lèo, bánh xèo, bánh bò thốt nốt, nước thốt nốt, món ăn Khmer.

**Văn hóa - lễ hội**: Lễ hội đua bò Bảy Núi, văn hóa Khmer, ẩm thực truyền thống, làng nghề địa phương.

---

## 16. Giao diện khung chat - Các loại tin nhắn

| Loại | Nội dung |
|---|---|
| Văn bản đơn giản | Trả lời ngắn, hướng dẫn |
| Thẻ địa điểm | Ảnh, tên, mô tả ngắn, nút Xem bản đồ/video |
| Danh sách video | Thumbnail, tiêu đề, nền tảng, nút phát |
| Lịch trình | Ngày, buổi, địa điểm, ảnh/video, nút chỉ đường |
| Gợi ý nhanh | Nút: "Tri Tôn có gì?", "Ăn gì?", "Lịch trình 1/2 ngày", "Xem bản đồ" |

---

## 17. Tiêu chí đánh giá

### Chức năng
- Website đầy đủ thông tin, chatbot trả lời tốt, video đúng địa điểm, lịch trình hợp lý.

### Trải nghiệm người dùng
- Giao diện đẹp/mobile-friendly, phản hồi nhanh, video mượt, nội dung dễ hiểu.

### Công nghệ
- Kiến trúc rõ ràng, dữ liệu tổ chức hợp lý, có thể mở rộng, ứng dụng AI thực tế.

### Nội dung
- Thông tin chính xác, hình ảnh/video hấp dẫn, thể hiện bản sắc Tri Tôn.

---

## 18. Kết luận

Dự án **Chatbot Du Lịch Tri Tôn AI** có điểm mạnh đặc biệt là kết hợp **"hỏi - đáp du lịch bằng AI"** với **video trực quan ngay trong khung chat**, giúp người dùng không chỉ đọc thông tin mà còn "xem thử trải nghiệm" trước khi quyết định đi.

Hệ thống hướng đến mục tiêu trở thành **trợ lý du lịch thông minh** giúp du khách biết đi đâu - ăn gì - ở đâu - đi như thế nào - xem trải nghiệm thực tế - tạo lịch trình cá nhân.

---

## 19. Hướng phát triển tiếp theo

1. Viết tài liệu báo cáo đồ án hoàn chỉnh.
2. Thiết kế CSDL chi tiết kèm sơ đồ ERD.
3. Viết kịch bản chatbot mẫu theo từng loại câu hỏi.
4. Gợi ý công nghệ và kiến trúc triển khai cụ thể.
5. Viết nội dung website theo từng trang.
6. Tạo bản demo giao diện khung chat bằng HTML/CSS/JS.
7. Thiết kế prompt AI để chatbot trả lời đúng dữ liệu Tri Tôn.


---

## 20. Sơ đồ và Mô tả Use Case Hệ thống (Phân rã 4 cấp: Level 0 đến Level 4)

Tài liệu chi tiết về Kiến trúc Use Case phân rã 4 cấp đã được đối chuẩn và đưa vào hệ thống tại [docs/use_cases_architecture.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases_architecture.md).

### Tóm tắt các cấp độ phân rã Use Case:

- **Level 0 (Tổng quát)**: Sơ đồ ranh giới hệ thống với 3 Actors: **Visitor** (Du khách), **Partner** (Đối tác kinh doanh), và **Admin** (Quản trị viên).
- **Level 1 (Module)**: Phân rã 8 Module chức năng chính (UC01 Khám phá du lịch, UC02 AI Assistant, UC03 AI Trip Planner, UC04 Bản đồ GIS, UC05 Video Engine, UC06 Tài khoản, UC07 Partner Portal, UC08 Admin Control Center).
- **Level 2 (Chi tiết)**: Quy định chi tiết các tác vụ nghiệp vụ như UC03.08 Tối ưu hóa lộ trình di chuyển (Optimize Route) sử dụng khoảng cách WGS84 và phân cụm xã/thị trấn.
- **Level 3 (Low-level AI Execution)**: Chi tiết luồng xử lý 16 bước từ tiếp nhận câu hỏi tự nhiên -> Chuẩn hóa tiếng Việt NFC -> Phân tích Intent/Entity -> Query CSDL Master 82 địa điểm & RAG Vector DB -> Gọi TikTokVideoService nhúng video -> Sinh JSON structured response -> Render UI Cards/Carousel.
- **Level 4 (Activity Flow)**: 4 sơ đồ luồng hoạt động nghiệp vụ thực tế cho Lập lịch trình AI, Hỏi đáp nhúng video TikTok, và Kiểm duyệt nội dung Admin.

### Thư mục Kiến trúc Use Case Modular (Dễ quản lý & Đọc cho AI):
- 📁 **[docs/use_cases/README.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/README.md)**: Bản đồ tổng quan tài liệu Use Case.
- 📄 [docs/use_cases/level_0_overview.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/level_0_overview.md): Level 0 - Sơ đồ Use Case tổng quát & Actors.
- 📄 [docs/use_cases/level_1_modules.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/level_1_modules.md): Level 1 - Phân rã 8 Module chức năng (72 Use Cases).
- 📄 [docs/use_cases/level_2_detailed.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/level_2_detailed.md): Level 2 - Detailed Business Use Cases.
- 📄 [docs/use_cases/level_3_ai_flow.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/level_3_ai_flow.md): Level 3 - Low-level AI RAG & TikTok Matcher Flow.
- 📄 [docs/use_cases/level_4_activity.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases/level_4_activity.md): Level 4 - Sơ đồ Activity Flows.
