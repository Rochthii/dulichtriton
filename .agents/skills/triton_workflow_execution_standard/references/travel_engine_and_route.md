# TECHNICAL REFERENCE: TRAVEL PLANNING ENGINE & SPATIAL INTELLIGENCE

## 1. PostGIS Route & Travel Time Engine:
- Công thức Haversine/PostGIS `ST_Distance` tính khoảng cách thực tế $d_i$ (km).
- Thời gian di chuyển xe máy: $t_i = \frac{d_i}{30} \times 60$ (phút) dựa trên vận tốc 30km/h địa hình bán sơn địa.

## 2. Deterministic 2-Link Evidence Generator:
- Google Maps: `https://www.google.com/maps/search/?api=1&query={encode(name + ' ' + commune + ' An Giang')}`.
- TikTok Search: `https://www.tiktok.com/search?q={encode(name + ' Tri Tôn')}`.

## 3. Cost Calculator Standards:
- Ăn sáng: 35.000đ (Cháo bò / Bún cá củ ngải).
- Ăn trưa: 120.000đ (Gà đốt lá chúc Ô Thum).
- Ăn tối: 90.000đ (Bò 7 món / Bánh bò thốt nốt).
- Thuê xe máy: 100.000đ – 150.000đ/ngày (thuê trực tiếp tại Homestay/Khách sạn lưu trú).
- Xăng xe máy: 40.000đ – 50.000đ/ngày (đổ đầy bình chạy quanh các xã).
- Lưu trú: 250.000đ – 450.000đ/đêm (Homestay view núi / Khách sạn trung tâm).
