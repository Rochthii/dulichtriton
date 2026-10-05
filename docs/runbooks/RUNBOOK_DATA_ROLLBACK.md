# RUNBOOK — VẬN HÀNH KHÔI PHỤC DỮ LIỆU SẢN XUẤT (PRODUCTION DATA ROLLBACK)

> **Mã quy chuẩn:** `RB-DB-DATA-ROLLBACK-001`  
> **Hệ thống:** Du Lịch Tri Tôn AI Assistant System  
> **Nhiệm vụ liên kết:** `P05-025` (Wave W5 — Privacy, User Data & Extended Observability)  
> **Phê duyệt bởi:** Chăm Rốch Thi (Lead Technical Architect & Data Governance Owner)  
> **Trạng thái:** `ACTIVE / PRODUCTION-REAL`  
> **Phạm vi áp dụng:** Bảng dữ liệu địa điểm `public.places`, lịch trình `public.preset_itineraries`, kho sao lưu `data/backups/`, và bộ điều phối `scripts/sync/`.

---

## 1. TỔNG QUAN VÀ NGUYÊN TẮC BẤT BIẾN (OVERVIEW & INVARIANTS)

Dữ liệu địa điểm và tri thức du lịch Tri Tôn là tài sản cốt lõi của hệ thống, đòi hỏi tính toàn vẹn 100% theo các quy chuẩn thực địa và văn hóa bản địa. Runbook này cung cấp quy trình vận hành chuẩn mực (SRE Runbook) khi xảy ra sự cố sai lệch, mất mát hoặc ngộ độc dữ liệu sản xuất, bảo đảm đáp ứng **2 bằng chứng nghiệm thu bắt buộc**:
1. **Snapshot Versioning:** Mỗi bản sao lưu phải có mã phiên bản, mốc thời gian ISO 8601, chữ ký băm mật mã SHA-256, và liên kết phê duyệt Gate G2.
2. **Restore Verification:** Mọi quá trình khôi phục dữ liệu bắt buộc phải vượt qua 5 bước kiểm chứng định lượng trước khi đưa hệ thống trở lại phục vụ.

---

## 2. KIẾN TRÚC PHIÊN BẢN SNAPSHOT (SNAPSHOT VERSIONING ARCHITECTURE)

### 2.1. Quy chuẩn đặt tên và định dạng file (Naming Convention):
Mỗi lần tạo snapshot trước khi đồng bộ (Pre-sync Snapshot) hoặc sao lưu định kỳ, hệ thống phát sinh bộ 3 tệp tin tại thư mục `data/backups/`:
1. `snapshot_manifest_<ISO_TIMESTAMP>.json`: Tệp kê khai định danh phiên bản và chữ ký mật mã toàn vẹn.
2. `snapshot_places_<ISO_TIMESTAMP>.json`: Bản ghi dữ liệu thô toàn bộ bảng `public.places`.
3. `snapshot_itineraries_<ISO_TIMESTAMP>.json`: Bản ghi dữ liệu thô toàn bộ bảng `public.preset_itineraries`.

*Ví dụ:* `snapshot_manifest_2026-09-29T07-23-14-982Z.json`

### 2.2. Cấu trúc Schema của Snapshot Manifest:
```json
{
  "backup_type": "PRE_SYNC_SNAPSHOT",
  "gate_approval": "GATE_G2",
  "lead_auditor": "Chăm Rốch Thi",
  "timestamp": "2026-09-29T07:23:14.982Z",
  "canonical_manifest_sha256": "f65d568ab075eb7d4a0689e6d35a45420e6a27739064c4e755ff1a83ba2b3cfb",
  "places": {
    "count": 149,
    "sha256": "<SHA256_HEX_OF_PLACES_JSON>",
    "file": "data/backups/snapshot_places_2026-09-29T07-23-14-982Z.json"
  },
  "itineraries": {
    "count": 6,
    "sha256": "<SHA256_HEX_OF_ITINERARIES_JSON>",
    "file": "data/backups/snapshot_itineraries_2026-09-29T07-23-14-982Z.json"
  }
}
```

### 2.3. Lệnh tạo Snapshot thủ công (Manual Snapshot Command):
Trước mọi thay đổi dữ liệu hoặc chạy migration tác động đến bảng `places`, kỹ sư vận hành BẮT BUỘC phải chạy lệnh tạo snapshot:
```bash
node scripts/sync/create_production_snapshot.js
```
Lệnh này tự động kiểm tra thẩm định phê duyệt Gate G2, tải dữ liệu hiện tại từ Supabase qua API an toàn, tính toán chữ ký SHA-256 và sinh manifest sao lưu.

---

## 3. ĐIỀU KIỆN KÍCH HOẠT KHÔI PHỤC (ROLLBACK TRIGGERS)

Quy trình Rollback được kích hoạt ngay lập tức khi phát hiện một trong các dấu hiệu sau:
1. **Mất mát bản ghi (Record Loss):** Tổng số địa điểm xác minh bị giảm đột ngột hoặc các POI canonical cốt lõi (như Chùa Xà Tón, Núi Cô Tô, Hồ Tà Pạ) bị mất khỏi cơ sở dữ liệu.
2. **Sai lệch địa giới hành chính (Geographic Boundary Violation):** Có bản ghi địa điểm có tọa độ nằm ngoài bounding box Tri Tôn (`latitude < 10.3` hoặc `> 10.55`; `longitude < 104.8` hoặc `> 105.15`).
3. **Ngộ độc dữ liệu hàng loạt (Mass Data Corruption / Poisoning):** Xuất hiện cập nhật sai lệch hàng loạt trường `commune` ngoài danh mục 15 xã/thị trấn chuẩn, hoặc trường `is_verified` bị chuyển sang `false` ngoài ý muốn.
4. **Lỗi Migration DDL hỏng cấu trúc (Faulty Schema Migration):** Migration mới gây lỗi khóa ngoại, hỏng index PostGIS hoặc làm tê liệt RLS.

---

## 4. QUY TRÌNH THỰC THI KHÔI PHỤC (DATA RESTORE PROCEDURES)

Quy trình khôi phục được phân cấp theo 2 phương thức:

### Phương thức A: Khôi phục đồng bộ vi sai (Smart Delta Restore — Khuyến nghị)
Khi dữ liệu trên database bị sai lệch nhưng Master Cleaned CSV (`data/tri_ton_master_cleaned.csv`) vẫn toàn vẹn:
```bash
node scripts/sync/smart_delta_sync.js
```
- **Cơ chế:** Script chỉ gửi bản vá `PATCH` các trường/bản ghi bị sai lệch, giữ nguyên các bản ghi đã khớp, bảo đảm không gây downtime hoặc khóa bảng diện rộng.

### Phương thức B: Khôi phục trực tiếp từ Snapshot JSON được chỉ định (Snapshot Restore)
Khi cần đưa cơ sở dữ liệu về chính xác thời điểm một snapshot cụ thể:
1. Xác định file snapshot mục tiêu từ `data/backups/snapshot_manifest_<TIMESTAMP>.json`.
2. Kiểm tra tính toàn vẹn chữ ký hash SHA-256 của file snapshot trước khi nạp:
   ```bash
   node -e "const fs = require('fs'), crypto = require('crypto'); const manifest = JSON.parse(fs.readFileSync('data/backups/snapshot_manifest_<TIMESTAMP>.json')); const data = fs.readFileSync(manifest.places.file); const hash = crypto.createHash('sha256').update(data).digest('hex'); console.log('Hash match:', hash === manifest.places.sha256);"
   ```
3. Nạp lại dữ liệu snapshot vào PostgreSQL qua `service_role` client hoặc REST API.

---

## 5. TIÊU CHUẨN KIỂM CHỨNG SAU KHÔI PHỤC (RESTORE VERIFICATION CRITERIA)

Sau khi hoàn tất thao tác khôi phục, Kỹ sư vận hành BẮT BUỘC phải thực hiện đủ **5 tiêu chí kiểm chứng** sau đây để nghiệm thu (Restore Verification Proof):

### Tiêu chí 1: Hash Checksum Verification
- Chữ ký băm SHA-256 của dữ liệu xuất ra từ database sau khôi phục phải khớp với `places.sha256` trong snapshot manifest.

### Tiêu chí 2: Record Count Invariant
- Tổng số bản ghi trên bảng `public.places` phải đạt chính xác số lượng bản ghi đã được bảo toàn trong snapshot (tối thiểu 149 bản ghi).
```sql
SELECT count(*) FROM public.places;
```

### Tiêu chí 3: Geographic Boundary Invariant
- 100% bản ghi địa điểm phải có tọa độ hợp lệ nằm gọn bên trong ranh giới hành chính huyện Tri Tôn:
```sql
SELECT count(*) 
FROM public.places
WHERE latitude NOT BETWEEN 10.3 AND 10.55
   OR longitude NOT BETWEEN 104.8 AND 105.15;
-- Kết quả BẮT BUỘC phải bằng 0.
```

### Tiêu chí 4: Row Level Security Invariant
- Khóa phân quyền Row Level Security (RLS) trên các bảng được khôi phục phải ở trạng thái kích hoạt (`ENABLE ROW LEVEL SECURITY`).
- Vai trò `anon` và `authenticated` chỉ có quyền `SELECT`, không có quyền xóa hoặc sửa đổi trực tiếp.

### Tiêu chí 5: Ký duyệt Biên bản Nghiệm thu (Verification Sign-Off)
- Biên bản nghiệm thu khôi phục dữ liệu phải được lập và ký duyệt bởi:
  - **Người phê duyệt:** Chăm Rốch Thi *(Lead Technical Architect & Data Governance Owner)*.
  - **Nội dung ghi nhận:** Mốc thời gian rollback, mã snapshot version đã dùng, hash đối chiếu, kết quả kiểm tra 5 tiêu chí.
