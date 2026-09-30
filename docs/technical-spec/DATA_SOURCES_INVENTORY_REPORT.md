# BÁO CÁO KIỂM KÊ VÀ ĐỐI SOÁT CÁC NGUỒN DỮ LIỆU POI TRI TÔN (P03-001)

> **Mã quy chuẩn:** `DATA-SOURCES-INVENTORY-001`  
> **Phiên bản:** `1.0.0` · **Ngày thực hiện:** `2026-09-28`  
> **Trạng thái:** `VERIFIED (Empirical Data & Cryptographic Checksum)`  
> **Nhiệm vụ thuộc:** [Production Remediation Plan (P03-001)](../12_PRODUCTION_REMEDIATION_PLAN.md) · [Active Task](../../ACTIVE_TASK.md) · [Execution Board](../13_TWO_STREAM_EXECUTION_BOARD.md)  
> **Căn cứ bắt buộc:** RULE 01 (Production Real, No Mock / No Fake / No Placeholder), Claim Guardrail (Không suy diễn số lượng POI từ tài liệu cũ).

---

## 1. Mục Đích & Bối Cảnh

Trước đợt kiểm kê thực tế này, hệ thống tồn tại nhiều tuyên bố mâu thuẫn về số lượng địa điểm (POI) của Huyện Tri Tôn (lúc thì ghi "149 bản ghi đã xác minh 100%", lúc thì "147", "141", hoặc "132").

Để thiết lập **"Một master data, một sự thật công khai" (Phase P03)**, báo cáo này tiến hành kiểm kê thực địa, tính toán mã băm SHA-256, kiểm tra tính toàn vẹn tọa độ không gian (Bounding Box) và đối soát trực tiếp các tập hợp ID trên toàn bộ các tệp dữ liệu lưu trữ trong kho mã nguồn cùng cơ sở dữ liệu Supabase Production Live.

---

## 2. Bảng Tổng Hợp Kiểm Kê Toàn Diện Các Nguồn Dữ Liệu

| Tên nguồn / Tệp dữ liệu | Phân loại | Kích thước (bytes) | Mã băm SHA-256 | Số bản ghi (Count) | Trường ID chính | Unique IDs | Bounding Box [Lat Min-Max / Lon Min-Max] | Trạng thái biên độ Tri Tôn |
|---|---|---|---|---|---|---|---|---|
| `data/tri_ton_master_cleaned.csv` | Master CSV | 709,216 | `dcbe791914475c68369ff051cd3b288dc9e47685bc9eb55a1b7dac2420fa60b6` | **132** | `id` | 132 | `[10.3083 -> 10.5270]` / `[104.8866 -> 105.0751]` | ✅ 100% nằm trong biên [10.30, 10.55] & [104.80, 105.15] |
| `frontend/src/data/triton_pois_full.json` | Web Client Data | 960,611 | `b6bb124500f545dbfb6f6b18084101172ecfcc0a7a6b52a387ff9cde7eece808` | **141** | `id` | 141 | `[10.3083 -> 10.5270]` / `[104.8061 -> 105.1208]` | ✅ 100% nằm trong biên [10.30, 10.55] & [104.80, 105.15] |
| `data/triton_pois_full.json` | Core Data JSON | 960,611 | `b6bb124500f545dbfb6f6b18084101172ecfcc0a7a6b52a387ff9cde7eece808` | **141** | `id` | 141 | `[10.3083 -> 10.5270]` / `[104.8061 -> 105.1208]` | ✅ Trùng khớp 100% byte-for-byte với frontend JSON |
| `Supabase Live (public.places)` | Production DB | Snapshot REST | Truy vấn live qua REST API (`Prefer: count=exact`) | **137** | `id` | 137 | Đang phân bổ 112 clean slug + 25 UUID-prefixed | Cần đồng bộ dứt điểm tại P03-028 |
| `data/triton_pois_table.csv` | Bảng phụ trợ v2 | 54,497 | `fcebbbfa3d620275ffbf37c44c933b09b04a616a405b13b2e158bb32c1791958` | **147** | `id` | 147 | `[10.3083 -> 10.5568]` / `[104.8061 -> 105.1208]` | ⚠️ Lat max `10.5568` vượt nhẹ ranh giới 10.55 |
| `data/triton_pois_map.geojson` | Bản đồ GIS v2 | 107,628 | `91a1c2a76c1c8797b5af5be9781f9fde3e3648b44e212bc94fcd578eb8bf12a1` | **147** | `id` | 147 | `[10.3083 -> 10.5568]` / `[104.8061 -> 105.1208]` | ⚠️ Lat max `10.5568` vượt nhẹ ranh giới 10.55 |
| `data/database_du_lich_tri_ton_v3.csv` | Google Sheets Export cũ | 137,511 | `0a71920bcee0a19bf8e7f7b50f9434eb5877506e54524a092cef56611abf6bac` | **46** | Không có | 0 | Không chuẩn hóa ID | Dữ liệu cũ (Legacy pilot) |
| `data/google_sheets_v3_export.csv` | Raw Export cũ | 137,846 | `2eb34090093bbd59d331f65bd033ef74c6bfc7b94c554247a9b7277f896b44f4` | **46** | Không có | 0 | Không chuẩn hóa ID | Dữ liệu cũ (Legacy pilot) |
| `output_pilot/data/*.json` | Hồ sơ Pilot xác minh | 38,061 (tổng) | 11 file JSON riêng biệt | **11** | `id`/file stem | 11 | Điểm nhấn du lịch trọng điểm | Dùng để đối soát chất lượng đa phương tiện |

---

## 3. Phân Tích Độ Lệch & Đối Soát Tập Hợp Mã Định Danh (ID Sets)

### 3.1. So sánh Master CSV (132 IDs) vs Frontend JSON (141 IDs)

- **Số ID trùng khớp (Intersection):** `129` địa điểm.
- **Số ID chỉ có trong Master CSV (`data/tri_ton_master_cleaned.csv`):** `3` địa điểm:
  1. `ca-phe-thuy-moc-tri-ton` (Cà Phê Thủy Mộc Tri Tôn)
  2. `chu-tri-ton-nui-co-to` (Chữ Tri Tôn Núi Cô Tô)
  3. `ny-coffee-tea-tri-ton` (Ny Coffee & Tea Tri Tôn)
- **Số ID chỉ có trong Frontend JSON (`frontend/src/data/triton_pois_full.json`):** `12` địa điểm:
  - `ca-phe-suoi-da-o-ta-soc`
  - `ca-phe-thot-not-ta-pa-view`
  - `cong-troi-chua-koh-kas-tual-prasat`
  - `drink-hammock-chill`
  - `ho-soai-so`
  - `khu-di-tich-doi-tuc-dup-hang-c6`
  - `28310684-khu-di-tích-căn-cứ-ô` (Chứa tiền tố UUID/hash)
  - `39c60a82-rừng-tầm-vông-ô-tà-s` (Chứa tiền tố UUID/hash)
  - `3ef4f129-quán-cà-phê-&-điểm-c` (Chứa tiền tố UUID/hash)
  - `6fd80811-chợ-trung-tâm-tri-tô` (Chứa tiền tố UUID/hash)
  - `b49161b0-chùa-phi-lai-ba-chúc` (Chứa tiền tố UUID/hash)
  - `e563b663-chùa-tam-bửu-ba-chúc` (Chứa tiền tố UUID/hash)

> **Nhận định kỹ thuật:** Có 6 bản ghi trong Frontend JSON đang mang định dạng mã định danh lai kiểu cũ (UUID 8 ký tự kèm slug tiếng Việt có dấu), trong khi Master CSV đã được chuẩn hóa slug thuần ASCII (`khu-di-tich-o-ta-soc`, `chua-phi-lai`, `chua-tam-buu`). Đây là nguyên nhân trực tiếp làm phân mảnh ID giữa các tầng của hệ thống.

---

### 3.2. So sánh Master CSV (132 IDs) vs Live Database Supabase (137 records)

- **Số ID trùng khớp chính xác:** `112` địa điểm.
- **Số ID chỉ có trong Live DB (25 bản ghi):**
  - Chứa các mã UUID-prefixed xuất phát từ đợt nạp sơ khai ban đầu trước khi có quy trình `smart_delta_sync.js`, ví dụ:
    - `0c1d5e83-chùa-xà-tón-(wat-xva`
    - `118f63fc-quán-siêu-gà-đốt-ô-t`
    - `1370b402-nhà-hàng-gà-đốt-ô-th`
    - `159c4012-quán-đu-đủ-đâm-rina-`
    - `1c3216be-căn-nhà-gỗ-vintage-n`
- **Số ID chỉ có trong Master CSV chưa có trên Live DB (20 bản ghi):**
  - Bản ghi trong Master CSV dùng slug chuẩn (`chua-xa-ton`, `quan-sieu-ga-dot-o-thum`, `ga-dot-thao-nguyen`) nhưng trên DB vẫn đang tồn tại dưới tên ID UUID-prefixed chưa được hợp nhất (merge/harmonize).

---

### 3.3. So sánh Pilot Verified JSON (11 files) vs Master CSV

- **11 địa điểm pilot xác minh thực địa:**
  - `bun-ca-y-dom-tri-ton`
  - `chua-xa-ton-tri-ton`
  - `cong-troi-tri-ton-an-giang`
  - `ga-dot-thao-nguyen`
  - `hang-thot-not-khmer-trai-tim`
  - `ho-o-thum`
  - `ho-ta-pa-nui-to-tri-ton-an-giang`
  - `ho-ta-pa-tri-ton-an-giang`
  - `khu-giai-tri-ban-sung-doi-tuc-dup`
  - `nha-mo-ba-chuc`
  - `វតតភនតប-chua-ta-pa`
- **Nhận định:** Pilot data dùng tên file slug mô tả dài (có thêm hậu tố `-tri-ton-an-giang` hoặc tiếng Khmer `វតតភនតប-chua-ta-pa`), chỉ có 2 file khớp trực tiếp (`ho-o-thum`, `nha-mo-ba-chuc`). Cần lập bảng concordance ở task `P03-002` để map chính xác từng file pilot vào slug canonical tương ứng.

---

## 4. Kết Luận & Đề Xuất Cho Task Tiếp Theo (P03-002)

1. **Khẳng định số lượng thực tế:**
   - Hoàn toàn **loại bỏ claim không có căn cứ "149 bản ghi đã xác minh 100%"**.
   - Con số chính xác hiện tại là:
     - Master CSV có **132** bản ghi.
     - Frontend JSON có **141** bản ghi.
     - Live DB Supabase có **137** bản ghi.
2. **Kế hoạch hành động tại Task `P03-002`:**
   - Xây dựng bảng đối soát (Concordance Table) đa chiều: ánh xạ 1-1 giữa ID của Master CSV, Frontend JSON, Live DB và Pilot data.
   - Gán trạng thái cho từng ID: `MATCH`, `SLUG_ALIAS`, `MISSING_IN_MASTER`, hoặc `UUID_CONFLICT`.
   - Chuẩn bị review queue cho `P03-003` để dứt điểm loại bỏ mọi ID rác và hợp nhất thành một bộ dữ liệu Canonical duy nhất.
