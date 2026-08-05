# QUY CHUẨN NÂNG CẤP PWA & BẢN ĐỒ OFFLINE (BẢY NÚI TRI TÔN)

---

## 🎯 1. MỤC TIÊU PWA & OFFLINE CACHE

Do địa hình Bảy Núi Tri Tôn (các khu vực Hồ Ô Thum, Đồi Tức Dụp, Hồ Ô Tà Thố, Rừng Tầm Vông) có sóng di động chập chờn, ứng dụng **Du Lịch Tri Tôn** được tích hợp **Progressive Web App (PWA)** và **Service Worker**. Du khách quét QR code lần đầu sẽ tự động tải cứng Lịch trình + Bản đồ offline, cho phép tra cứu ngay cả khi mất kết nối mạng.

---

## 🛠️ 2. CẤU HÌNH NEXT.JS 14 PWA (`next-pwa`)

### 2.1. File `next.config.js`
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days Cache
        },
      },
    },
    {
      urlPattern: /\/api\/v1\/places/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-places-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    }
  ]
});

module.exports = withPWA({
  reactStrictMode: true,
});
```

### 2.2. Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Du Lịch Tri Tôn AI Portal",
  "short_name": "DuLichTriTon",
  "description": "Hỏi nhanh, Xem thật, Lên tour gọn tại Tri Tôn, An Giang",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1B4D3E",
  "theme_color": "#1B4D3E",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🗺️ 3. LƯU TRỮ VÀ XỬ LÝ OFFLINE TRÊN THIẾT BỊ DU KHÁCH

1. **Bản đồ Offline (Map Tile Caching)**: Lưu trữ các ô bản đồ Leaflet / OpenStreetMap khu vực Bảy Núi.
2. **Offline Itinerary**: Lưu trữ mã QR và Thẻ lịch trình tour 2D1N trong `IndexedDB` / `LocalStorage`.
3. **Status Indicator Banner**: Hiển thị Thanh thông báo nhẹ nhàng khi mất sóng: *"Bạn đang ở chế độ Ngoại tuyến. Bản đồ & Lịch trình đã được lưu an toàn!"*.
