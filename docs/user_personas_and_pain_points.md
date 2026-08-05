# TÀI LIỆU PHÂN TÍCH USER PERSONAS, PAIN POINTS & TRIẾT LÝ UI/UX DU LỊCH TRI TÔN AI

---

## 1. Tổng quan & Triết lý Thiết kế (Design Philosophy)

Hệ thống **Web Portal & AI Chatbot Du Lịch Tri Tôn** tuân thủ 4 nguyên tắc cốt lõi:
1. **Lấy người dùng làm trung tâm (User-Centric First)**: Đặt mình vào vị trí du khách đang di chuyển thực tế tại vùng núi Tri Tôn.
2. **Giải quyết triệt để Nỗi đau (Pain Points)**: Xóa bỏ tình trạng mù thông tin, sập bẫy du lịch, chờ đợi lâu và thông tin rác.
3. **Khai phá Điểm mù người dùng (User Blind Spots)**: Cung cấp thông tin du khách *chưa biết là mình cần biết* (mùa du lịch, đường hẹp ô tô, đặt gà đốt trước).
4. **Không dùng Emoji — Sử dụng SVG Icons chuẩn (Lucide/Heroicons)**: Đảm bảo giao diện hiện đại, sang trọng, tương thích 100% các thiết bị và đạt chuẩn sản xuất (Production-Real System).

---

## 2. Chân dung Người dùng Chi tiết (User Personas)

### Persona 1: Nguyễn Phước (24 tuổi) — Phượt thủ / Gen Z Check-in Hunter

* **Chân dung**: Sinh viên / Nhân viên văn phòng trẻ từ TP.HCM, Cần Thơ, Long Xuyên. Đi xe máy theo nhóm 2-4 người vào cuối tuần.
* **Mục tiêu**:
  * Săn ảnh check-in độc lạ (Hồ Tà Pạ, Ô Thum, Cây thốt nốt trái tim, Cổng trời Tri Tôn).
  * Xem video TikTok thực tế trước khi đến.
  * Thưởng thức gà đốt Ô Thum, nước thốt nốt tươi.
* **Nỗi đau (Pain Points)**:
  * Đọc các bài review dài lê thê trên blog/Facebook nhưng không có tọa độ Google Maps chính xác.
  * Sợ ảnh mạng ảo, đến nơi thực tế bị khô nước hoặc đang sửa chữa.
  * Mất nhiều thời gian tự tra cứu video riêng lẻ trên TikTok/YouTube.
* **Điểm mù (Blind Spots)**:
  * Không biết mực nước Hồ Tà Pạ thay đổi theo mùa (mùa mưa nước xanh ngọc, mùa khô cạn bớt).
  * Không biết quán gà đốt Ô Thum gốc khác với các quán nhái theo phong trào dọc đường.
* **Giải pháp UI/UX**:
  * **Video Embed Carousel**: Xem trực tiếp video TikTok ngay trên thẻ địa điểm mà không cần thoát app.
  * **Thẻ địa điểm 1-Click Navigation**: Nút chỉ đường Google Maps / WGS84 mở trực tiếp app bản đồ.
  * **Cảnh báo trạng thái mùa thực tế**: Thẻ hiển thị "Thời điểm đẹp nhất: Tháng 9 - Tháng 11".

---

### Persona 2: Gia đình Chị Mai & Anh Nam (35 tuổi) — Weekend Family Escape

* **Chân dung**: Gia đình 4 người (2 vợ chồng + 2 con nhỏ hoặc bố mẹ già) đi ô tô 4-7 chỗ từ Cần Thơ / An Giang.
* **Mục tiêu**:
  * Nghỉ dưỡng nhẹ nhàng, không khí thoáng đãng (Hồ Soài So, Khu du lịch Tức Dụp).
  * Ăn uống sạch sẽ, hợp vệ sinh, không gian rộng rãi cho trẻ em.
  * Lưu trú Homestay / Nhà nghỉ chất lượng tốt, có chỗ đậu ô tô.
* **Nỗi đau (Pain Points)**:
  * Sợ đi vào đường hẹp ô tô không quay đầu được.
  * Quán ăn quá đông vào trưa cuối tuần, chờ món lâu làm trẻ em / người già mệt mỏi.
  * Lịch trình bị dồn dập khiến chuyến đi bị kiệt sức.
* **Điểm mù (Blind Spots)**:
  * Không biết món Gà đốt Ô Thum chế biến mất 35-45 phút, nếu không gọi đặt trước sẽ phải chờ rất lâu dưới nắng nóng.
  * Không biết một số homestay nằm trong hẻm sâu ô tô 7 chỗ không vào được.
* **Giải pháp UI/UX**:
  * **Bộ lọc tiện ích ô tô & chỗ đậu**: Thẻ lưu trú/nhà hàng có Badge SVG Icon "Có chỗ đậu ô tô 7-16 chỗ".
  * **Nút "Gọi đặt món trước" (Call to Action)**: Nút gọi điện trực tiếp quán ăn kèm ghi chú "Nên đặt trước 40 phút".
  * **Lịch trình AI tối ưu thời gian nghỉ**: Gợi ý lịch trình 2D1N nhịp độ vừa phải (có slot nghỉ trưa & ăn tối).

---

### Persona 3: Chú Sáu (52 tuổi) — Khách Hành hương & Văn hóa Tâm linh

* **Chân dung**: Du khách trung niên đi theo đoàn hành hương hoặc gia đình nhiều thế hệ.
* **Mục tiêu**:
  * Chiêm bái các ngôi chùa Khmer cổ kính (Chùa Xvayton 500 năm, Chùa Tà Pạ).
  * Tìm hiểu lịch sử cách mạng Đồi Tức Dụp, Khu di tích Ba Chúc.
  * Trải nghiệm văn hóa Khmer (Lễ hội Đôl Ta, Đua bò Bảy Núi).
* **Nỗi đau (Pain Points)**:
  * Thông tin lịch sử trên mạng bị sai lệch, thiếu độ tin cậy.
  * Ngại chữ quá nhỏ hoặc giao diện rườm rà khó thao tác trên điện thoại.
  * Lo ngại vi phạm quy tắc văn hóa / lễ nghi khi vào chùa Khmer địa phương.
* **Điểm mù (Blind Spots)**:
  * Không biết quy tắc ứng xử đặc thù ở chùa Khmer (trang phục lịch sự, cách chào chư tăng).
  * Không biết lịch lễ hội Đua bò Bảy Núi thay đổi theo Phật lịch Khmer hằng năm.
* **Giải pháp UI/UX**:
  * **Giao diện chữ to, tương phản cao, SVG rõ ràng**: Dễ đọc cho người trung niên.
  * **Thẻ "Lưu ý văn hóa Khmer"**: Tích hợp ngay dưới thông tin Chùa (Ví dụ: "Trang phục kín đáo, bỏ nón mũ trước khi vào chánh điện").
  * **Kiểm duyệt thông tin chuẩn 100%**: Dữ liệu lấy từ Master Dataset 82 địa điểm đã xác minh.

---

### Persona 4: Chị Lan (30 tuổi) — Tín đồ Ẩm thực Bảy Núi (Local Foodie)

* **Chân dung**: Người yêu ẩm thực vùng miền, muốn khám phá trọn vẹn đặc sản Khmer & An Giang.
* **Mục tiêu**:
  * Thưởng thức đúng vị: Gà đốt Ô Thum, Bún nước lèo Tri Tôn, Bánh bò thốt nốt tươi, Bánh xèo trứng đà điểu, Cơm nị - Cà ri.
  * Mua quà đặc sản chính gốc: Đường thốt nốt nguyên chất, Mắm bò hóc.
* **Nỗi đau (Pain Points)**:
  * Mua nhầm đường thốt nốt pha chế chế biến lại ở các sạp ven đường.
  * Không biết quán bún nước lèo nào bán buổi sáng, quán nào bán buổi chiều.
* **Điểm mù (Blind Spots)**:
  * Điểm mua đường thốt nốt nguyên chất tận lò sản xuất truyền thống Xã Châu Lăng / Ô Lâm.
  * Giá niêm yết chuẩn để không bị mua đắt.
* **Giải pháp UI/UX**:
  * **Trang danh mục Ẩm thực phân loại theo Buổi & Món**: (Sáng / Trưa / Tối / Quà biếu).
  * **Thẻ lò sản xuất truyền thống**: Gợi ý các điểm mua đường thốt nốt chính gốc có địa chỉ & số điện thoại trực tiếp.

---

## 3. Ma trận Điểm mù & Giải pháp Thiết kế UI/UX (User Blind Spots Matrix)

| Điểm mù du khách (User Blind Spot) | Tác động đến trải nghiệm | Giải pháp UI/UX trên Web Portal & Chatbot |
| :--- | :--- | :--- |
| **1. Thời gian chờ món Gà đốt (35-45p)** | Làm du khách sốt ruột, mỏi mệt dưới trời nắng. | Thẻ Nhà hàng hiện Cảnh báo SVG Clock + Nút "Gọi đặt món trước" trực tiếp. |
| **2. Đường nhỏ hẻm sâu ô tô không vào được** | Ô tô bị kẹt, gây ùn tắc và khó quay đầu. | Badge SVG Vehicle Warning ("Xe máy / Ô tô 4 chỗ / Đường nhỏ") trên từng thẻ địa điểm. |
| **3. Thay đổi cảnh quan theo mùa (Khô / Mưa)** | Thất vọng vì đến nơi cảnh quan không đúng ảnh mạng. | Widget "Thời điểm vàng" hiển thị thông tin mùa lúa chín / mùa nước nổi / mùa thốt nốt. |
| **4. Quy tắc văn hóa khi thăm Chùa Khmer** | E ngại hoặc vô tình vi phạm lễ nghi tâm linh. | Banner nhỏ "Văn hóa ứng xử Khmer" nhúng trong chi tiết các Chùa. |
| **5. Giờ mở cửa quán ăn đặc sản** | Đến nơi quán đã nghỉ bán (vd: bún nước lèo thường hết sớm). | Trạng thái Live Status "Đang mở cửa" / "Thường hết hàng sau 10:00 AM". |

---

## 4. Chiến lược Giữ chân Người dùng Lâu dài (Long-term Retention Strategy)

1. **Trải nghiệm siêu mượt & Không Emoji (Production SVG Clean UI)**:
   * 100% sử dụng icon SVG Lucide đồng nhất, chuẩn thiết kế cao cấp, load tức thì < 2 giây.
2. **Trợ lý AI Chatbot nhúng Video trực quan**:
   * Trả lời ngắn gọn, kèm thẻ thông tin địa điểm + video TikTok nhúng trực tiếp + nút hành động (Bản đồ, Gọi điện, Thêm vào lịch trình).
3. **Lập Lịch trình Cá nhân hóa & Xuất Lịch trình 1-Click**:
   * Người dùng dễ dàng tạo tour 1D/2D1N, xuất mã QR Code hoặc lưu link chia sẻ cho bạn bè.
   * Lưu offline dạng thẻ lịch trình để tra cứu khi di chuyển ở vùng sóng 4G yếu.
4. **Đề xuất cá nhân hóa theo Tọa độ WGS84**:
   * Gợi ý các địa điểm, quán ăn xung quanh vị trí du khách trong bán kính 2km - 5km.
