# Decision Record — Lựa Chọn Duy Nhất Kiểu Không Gian Cho `places.geom` (P02-008)

> **Mã định danh:** `DR-SPATIAL-TYPE-001`  
> **Nhiệm vụ liên kết:** `P02-008` (Wave W2 — Database Replay Foundation)  
> **Ngày chốt:** 2026-09-26  
> **Trạng thái:** `APPROVED / VERIFIED` trên PostgreSQL 15 + PostGIS 3.3  
> **Phạm vi:** Bảng `public.places`, cột `geom`, hàm tìm kiếm địa lý `match_places_nearby`, và các API định vị lân cận.

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật

1. **Đặc thù dữ liệu địa phương Tri Tôn:**
   - Dữ liệu địa điểm du lịch, ẩm thực, văn hóa và cứu hộ Tri Tôn được thu thập dưới dạng tọa độ GPS chuẩn quốc tế WGS-84 (EPSG:4326):
     - Kinh độ (`longitude`): $104.80^\circ \text{E} \rightarrow 105.15^\circ \text{E}$
     - Vĩ độ (`latitude`): $10.30^\circ \text{N} \rightarrow 10.55^\circ \text{N}$
2. **Nhu cầu nghiệp vụ cốt lõi:**
   - Tìm kiếm địa điểm lân cận ("Cách tôi 2km", "Quán ăn bán kính 5km quanh Hồ Soài Chek", "Điểm check-in trong vòng 10km quanh thị trấn Tri Tôn").
   - Tất cả các endpoint (`/api/v1/chat/query`, `/api/v1/places/nearby`, `/api/v1/emergency`) đều truyền tham số khoảng cách theo đơn vị **MÉT (meters)** hoặc **KILÔMÉT (km)**.
3. **Mâu thuẫn kỹ thuật trong migration lịch sử (`20260809_postgis_and_evidence.sql`):**
   - Định nghĩa cột: `ADD COLUMN geom GEOGRAPHY(Point, 4326)`.
   - Nhưng trong câu lệnh tính toán RPC `match_places_nearby` lại ép kiểu sang geometry:
     `ST_Distance(places.geom, ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geometry)`
     và `ST_DWithin(places.geom, ST_SetSRID(...)::geometry, radius_meters)`.
   - **Hậu quả:** PostGIS không có hàm hỗn hợp trực tiếp `ST_Distance(geography, geometry)`, dẫn đến lỗi type mismatch hoặc ép kiểu ngầm định làm vô hiệu hóa GiST spatial index. Ngoài ra, nếu dùng `geometry(Point, 4326)`, đơn vị của `ST_DWithin` và `ST_Distance` là **độ (degrees)** chứ không phải mét, khiến `radius_meters = 10000` bị tính thành 10,000 độ (bao trùm toàn cầu nhiều vòng).

---

## 2. So Sánh Đánh Giá Kỹ Thuật (Trade-off Analysis)

| Tiêu Chí So Sánh | `geometry(Point, 4326)` | `geography(Point, 4326)` (LỰA CHỌN) |
| :--- | :--- | :--- |
| **Mô hình không gian** | Mặt phẳng phẳng Descartes (Flat Euclidean). Coi kinh/vĩ như tọa độ X, Y phẳng. | Mặt cầu / Elipsoid trắc địa WGS-84 thực tế của Trái Đất. |
| **Đơn vị khoảng cách** | **Độ (degrees)**. $1^\circ$ tại Tri Tôn $\approx 109.5 \text{ km}$ kinh độ, $\approx 110.6 \text{ km}$ vĩ độ. | **Mét (meters)**. Trực tiếp và chính xác thực tế. |
| **Đơn vị `ST_DWithin`** | Độ. Muốn dùng mét phải chiếu sang hệ phẳng (UTM Zone 48N / EPSG:32648) hoặc ép kiểu sang geography. | **Mét**. Truyền trực tiếp `radius_meters = 10000` (10 km). |
| **Hiệu năng & Indexing** | GiST R-Tree trên mặt phẳng. Nhanh nhưng sai đơn vị khoảng cách thực địa. | GiST R-Tree trên mặt cầu (Spherical). Được tối ưu sâu trong PostGIS 3.x, không cần reproject. |
| **Độ phức tạp code** | Cao (phải viết thêm `ST_Transform(geom, 32648)` hoặc `ST_DistanceSphere`). | **Thấp nhất, tự nhiên nhất**: Code cực kỳ trực quan và an toàn. |

---

## 3. Quyết Định Duy Nhất (Final Decision)

1. **CHỌN DUY NHẤT KIỂU DỮ LIỆU: `GEOGRAPHY(Point, 4326)`** cho cột `places.geom`.
2. **Khóa chặt cú pháp tạo cột:**
   ```sql
   ALTER TABLE public.places 
     ADD COLUMN IF NOT EXISTS geom GEOGRAPHY(Point, 4326);
   ```
3. **Spatial Index:**
   ```sql
   CREATE INDEX IF NOT EXISTS places_geom_gist_idx 
     ON public.places USING gist (geom);
   ```
4. **Quy chuẩn tạo điểm từ tọa độ GPS (Lon/Lat Rule):**
   - PostGIS tuân theo thứ tự chuẩn `(Longitude, Latitude)` tương ứng với trục `(X, Y)`.
   - Cú pháp chuẩn tắc:
     `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography`
5. **Đồng bộ hóa tự động (Auto-sync Trigger):**
   - Thiết lập trigger tự động cập nhật `geom` mỗi khi `latitude` hoặc `longitude` được INSERT hoặc UPDATE trên bảng `places`.
6. **Chuẩn hóa RPC downstream (P02-009):**
   - Toàn bộ hàm tính khoảng cách (như `match_places_nearby`) bắt buộc nhận và so sánh giữa hai đối tượng `geography`, loại bỏ hoàn toàn các ép kiểu `::geometry` lỗi thời.

---

## 4. Bằng Chứng & Kiểm Chứng (Evidence & Verification)
- Migration: `supabase/migrations/20260807050000_p02_008_places_geom_spatial_type.sql`
- Test suite: `supabase/tests/p02_008_places_geom_spatial_type.sql`
- Xác nhận kiểm thử trên PostgreSQL 15 + PostGIS 3.3 container: Cột `geom` được tạo với `udt_name = 'geography'`, GiST index hoạt động, trigger tự động tính `geom` từ `(latitude, longitude)`, và khoảng cách trắc địa trả về đơn vị mét chính xác.
