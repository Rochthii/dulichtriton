# 06. THIẾT KẾ HỆ THỐNG API (RESTFUL API)

## 1. Địa điểm (Places)
* `GET /api/v1/places` — Danh sách địa điểm (hỗ trợ filter category, commune, search).
* `GET /api/v1/places/{id}` — Chi tiết địa điểm + hình ảnh + video nhúng liên quan.
* `GET /api/v1/places/geojson` — Xuất GeoJSON phục vụ bản đồ Leaflet.

## 2. Ẩm thực & Lưu trú (Food & Stay)
* `GET /api/v1/foods` — Danh sách món ăn đặc sản Tri Tôn.
* `GET /api/v1/restaurants` — Quán ăn & nhà hàng gợi ý.
* `GET /api/v1/homestays` — Homestay, nhà nghỉ, chỗ ở.

## 3. AI Chatbot Engine
* `POST /api/v1/chat/query` — Gửi câu hỏi ngôn ngữ tự nhiên, trả về JSON structured answer (văn bản + cards địa điểm + video embeds + quick responses).

## 4. Lập lịch trình (Itinerary)
* `POST /api/v1/itinerary/generate` — Sinh lịch trình gợi ý (Đầu vào: days, budget, preferences).
* `GET /api/v1/itinerary/{id}` — Xem lịch trình đã lưu.
