# SMART DELTA SYNC PROTOCOL (CƠ CHẾ ĐỒNG BỘ GIA TĂNG DATABASE THÔNG MINH)

---

## 🎯 NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Immediate Database Persistence (Thay đổi là Push ngay)**:
   - Mọi thay đổi phát sinh trên Master Data (`data/tri_ton_master_cleaned.csv`, `data/lichtrinh.json`, `data/tri_ton_transportation.json`,...) phải được đồng bộ hóa ngay lập tức lên **Production Supabase PostgreSQL**.
   - Không được để tình trạng "code/file json đã sửa nhưng database cloud vẫn giữ dữ liệu cũ".

2. **Smart Delta Update Only (Chỉ Cập Nhật Chỗ Thay Đổi — 0% Ghi Đè Mù Quáng)**:
   - **Tuyệt đối cấm** gửi request ghi đè hàng loạt (`FULL OVERWRITE / TRUNCATE & RE-INSERT`) khi sửa đổi nhỏ.
   - Bắt buộc chạy qua bộ **Field-Level Diff Engine**:
     - **Match 100% (Không đổi)** $\rightarrow$ **SKIP (Bỏ qua hoàn toàn, 0 request API)**.
     - **Khác biệt trường dữ liệu** $\rightarrow$ **PATCH (Chỉ cập nhật đúng những trường thay đổi)**.
     - **Chưa tồn tại** $\rightarrow$ **POST / INSERT (Thêm mới bản ghi sạch)**.

3. **Bảo Vệ Tài Nguyên & Hạn Mức Quota**:
   - Tiết kiệm **>90% I/O và lượt gọi API Cloud**.
   - Ngăn chặn triệt để xung đột khóa ngoại (Foreign Keys) và deadlock database.

---

## 🛠️ CƠ CHẾ SO SÁNH VI SAI (DIFF SPECIFICATION)

### 1. Bảng `places` (Địa Điểm Xác Minh):
- **Trường so sánh**: `name`, `commune`, `category`, `subcategory`, `latitude`, `longitude`, `address`, `description`.
- **Dung sai GPS**: Sai lệch $\Delta \text{GPS} \le 0.0001^\circ$ (~10 mét) được coi là không đổi.

### 2. Bảng `preset_itineraries` (27 Lịch Trình Khép Vòng):
- **Trường so sánh**: `title`, `duration`, `tagline`, `for_whom`, `budget_range`, `stops` (so khớp chuỗi JSON stops).
- **Quy tắc ưu tiên**: Bữa trưa các tour 1 ngày phải giữ đúng **Gà Đốt Ô Thum (Xã Ô Lâm)** và có cự ly `travel_to_next_km` > 0.

---

## 💻 LỆNH THỰC THI CHUẨN:

```bash
# Chạy đồng bộ gia tăng Places & Itineraries lên Supabase
node scripts/sync/smart_delta_sync.js
```
