# PHẠM VI & DANH MỤC CẦN HOÀN THIỆN CHO BẢN MVP (DU LỊCH TRI TÔN)

---

## 🎯 1. Mục tiêu Bản MVP (Minimum Viable Product)

Bản MVP của **Du Lịch Tri Tôn** tập trung hoàn thiện bộ khung **Web Portal + AI Chatbot Widget** hoạt động thực tế 100% (Production-Real Data), giúp du khách tra cứu nhanh 82 địa điểm master, xem video TikTok trải nghiệm và hỏi đáp tự nhiên với AI.

---

## 🛠️ 2. Danh mục Chức năng MVP Cần Hoàn Thiện

### 2.1. Frontend Web Portal (Next.js 14 + TailwindCSS + Lucide SVG Icons)
* [ ] **Trang chủ (`/`)**:
  * Hero Banner xanh Bảy Núi ấn tượng.
  * Ô tìm kiếm hỏi AI Chatbot nổi bật (*"Hỏi AI Du Lịch Tri Tôn..."*).
  * 4 Nút danh mục nhanh (Thiên nhiên, Văn hóa Khmer, Ẩm thực, Check-in).
  * Grid 6 Địa điểm Hot nhất (Hồ Tà Pạ, Đồi Tức Dụp, Chùa Xvayton, Gà đốt Ô Thum, Hồ Soài So, Cực thốt nốt trái tim).
  * Carousel Video TikTok trải nghiệm thực tế.
  * Widget AI Chatbot góc dưới bên phải màn hình.
* [ ] **Trang Danh sách Địa điểm (`/places`)**:
  * Bộ lọc theo Xã/Thị trấn (Xã Núi Tô, Châu Lăng, Ba Chúc, Ô Lâm...).
  * Thẻ địa điểm chứa ảnh chất lượng cao, Badge chỗ đậu ô tô, tọa độ WGS84, Nút chỉ đường bản đồ & Nút phát video TikTok.
* [ ] **Trang Chi tiết Địa điểm (`/places/[id]`)**:
  * Thông tin chi tiết, giờ mở cửa, giá vé, cấp Xã/Thị trấn.
  * Khung phát video TikTok Shorts trực quan.
  * Thẻ cảnh báo mùa nước nổi / quy tắc văn hóa Chùa Khmer.
  * Nút chỉ đường Google Maps & *"Thêm vào lịch trình"*.
* [ ] **Trang Đặc sản & Quán ăn (`/food`)**:
  * Highlight Gà Đốt Ô Thum, Bún Nước Lèo, Bánh Bò Thốt Nốt.
  * Cảnh báo thời gian chờ SVG Clock (*"Chế biến 35-45 phút"*).
  * Nút gọi trực tiếp *"Gọi đặt món trước"*.
* [ ] **Khung AI Chatbot Widget (Tích hợp góc màn hình)**:
  * Bong bóng chat nổi cố định góc phải.
  * Tiếp nhận câu hỏi tiếng Việt, trả về câu trả lời tự nhiên nhúng kèm **Thẻ địa điểm** & **Video TikTok Shorts** trực tiếp trong stream.

### 2.2. Backend & Database (Supabase PostgreSQL + FastAPI)
* [ ] **Cơ sở dữ liệu Supabase**:
  * Bảng `places`: Nạp 82 địa điểm master từ `data/tri_ton_master_cleaned.csv`.
  * Bảng `videos`: Nạp dữ liệu video TikTok/Shorts đã duyệt từ `data/tri_ton_videos.json`.
  * Bảng `foods`: Nạp dữ liệu đặc sản & quán ăn từ `data/tri_ton_restaurants_deep.json`.
* [ ] **FastAPI Core APIs**:
  * `GET /api/v1/places`: Trả về danh sách địa điểm + hỗ trợ filter Xã/Thị trấn.
  * `GET /api/v1/places/{id}`: Trả về chi tiết địa điểm + video nhúng liên quan.
  * `POST /api/v1/chat/query`: Xử lý câu hỏi tự nhiên bằng RAG, trả về JSON structured response (Văn bản + Thẻ UI + Video embed).

### 2.3. Hạ tầng Deploy Vercel
* [ ] Triển khai ứng dụng Frontend Next.js 14 lên Vercel.
* [ ] Cấu hình biến môi trường Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

## 📈 3. Tiêu chí Đánh giá Hoàn thành MVP

1. **Tốc độ phản hồi**: Tải trang Web < 2 giây, AI Chatbot phản hồi < 3 giây.
2. **Đồng bộ UI/UX**: 100% sử dụng icon SVG Lucide, **0% Emoji**, chuẩn màu `#1B4D3E` & `#D99B26`.
3. **Chính xác dữ liệu**: Không bịa dữ liệu ngoài 82 địa điểm master đã qua kiểm duyệt.
