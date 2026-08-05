# 05. CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

## 1. Dữ liệu Master
* **Master Source**: `data/tri_ton_master_cleaned.csv` (82 bản ghi v10.0.0).
* **Định dạng Export**: UTF-8-SIG cho CSV, UTF-8 cho JSON, WGS84 cho GeoJSON.
* **Ràng buộc địa lý**: Latitude $\in$ [10.25, 10.55], Longitude $\in$ [104.85, 105.15].
* **Quy tắc địa chỉ**: Không dùng từ "Huyện Tri Tôn" — chỉ ghi cấp Xã/Thị trấn.

## 2. Các Bảng dữ liệu chính

### Bảng `places` (Địa điểm)
`id`, `name`, `category`, `description`, `address`, `commune`, `latitude`, `longitude`, `opening_hours`, `ticket_price`, `images`, `map_url`, `tags`, `is_active`

### Bảng `videos` (Video trải nghiệm)
`id`, `place_id`, `title`, `platform` (tiktok/youtube), `video_url`, `embed_url`, `thumbnail`, `keywords`, `is_approved`

### Bảng `foods` & `restaurants` (Ẩm thực & Quán ăn)
* `foods`: `id`, `name`, `description`, `images`, `tags`
* `restaurants`: `id`, `name`, `address`, `commune`, `price_range`, `food_ids`, `latitude`, `longitude`, `images`, `map_url`

### Bảng `itineraries` & `itinerary_items` (Lịch trình)
* `itineraries`: `id`, `title`, `days`, `budget`, `style`, `place_ids`
* `itinerary_items`: `id`, `itinerary_id`, `day`, `time_slot`, `place_id`, `note`
