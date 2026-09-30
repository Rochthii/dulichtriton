# QUY CHUẨN BIỂU MẪU THẨM ĐỊNH ĐỊA ĐIỂM POI (P03-009)
## STANDARD POI VERIFICATION REVIEW TEMPLATE CONTRACT

> **Mã quy chuẩn:** `POI-VERIFY-TEMPLATE-V1`  
> **Áp dụng cho:** Toàn bộ thực thể POI trong hệ thống Master Data và Cơ sở dữ liệu Du Lịch Tri Tôn  
> **Căn cứ nghiệp vụ:** [RULE 01 (Production Real, No Mock)](../.agents/rules/01_production_real_no_mock.md) · [RULE 02 (Địa giới 15 Xã/Thị trấn)](../.agents/rules/02_vietnamese_geography_boundary.md) · [RULE 05 (Văn hóa & Ẩm thực)](../.agents/rules/05_culinary_cultural_accuracy.md)  
> **Phiên bản:** `1.0.0` · **Ngày ban hành:** `2026-09-28`  
> **Chủ quản thẩm định:** Hội đồng Quản trị Dữ liệu Tri Tôn (Lead: `Chăm Rốch Thi`)  

---

## 1. Mục Đích & Nguyên Tắc Vận Hành

Để xóa bỏ hoàn toàn tình trạng dữ liệu cào thô không rõ nguồn gốc, sai lệch tọa độ hoặc mang tiền tố UUID lịch sử, mọi POI trong hệ thống **bắt buộc phải có một hồ sơ thẩm định nguyên tử độc lập (Atomic POI Verification Record)** được lập theo đúng biểu mẫu chuẩn hóa này.

### Bốn Trụ Cột Bắt Buộc (The 4 Mandatory Pillars):
1. **`source` (Nguồn Gốc Dữ Liệu):** Phải truy nguyên được xuất xứ từ văn bản quy phạm pháp luật nhà nước, cổng thông tin chính phủ, khảo sát thực địa có biên bản hoặc không ảnh vệ tinh độ phân giải cao.
2. **`evidence` (Bằng Chứng Kiểm Toán):** Phải có số hiệu quyết định, xếp hạng di tích, biên bản kiểm tra ranh giới trắc địa (GPS Bounding Box), hoặc hình ảnh thực địa đã kiểm chứng.
3. **`reviewer` (Người Ký Duyệt Chuyên Môn):** Danh tính chuyên gia/kỹ sư bản địa chịu trách nhiệm cá nhân về tính chính xác của dữ liệu, kèm mã băm chữ ký kiểm toán SHA-256.
4. **`expiry` (Thời Hạn Hiệu Lực Dữ Liệu):** Tuyệt đối không có dữ liệu vĩnh cửu. Mọi bản ghi phải có ngày hết hạn (`expires_at`) và chu kỳ tái kiểm toán (`freshness_cycle_days`) để loại trừ địa điểm dừng hoạt động hoặc thay đổi hiện trạng.

---

## 2. Đặc Tả Chi Tiết Các Trường Dữ Liệu Trong Template

### A. Định Danh Hồ Sơ (`review_id`)
- **Định dạng:** `PVR-[CANONICAL-SLUG]-[YEAR]`.
- **Ví dụ:** `PVR-CHUA-XA-TON-2026`, `PVR-HO-TA-PA-2026`.

### B. Đối Tượng Thẩm Định (`target_poi`)
- `canonical_id`: Slug tiếng Việt không dấu sạch, không chứa UUID (`[0-9a-f]{8}-...`).
- `canonical_name`: Tên chính thức được nhà nước hoặc cộng đồng bản địa công nhận.
- `commune`: Bắt buộc là 1 trong **15 xã/thị trấn chuẩn** của Tri Tôn theo RULE 02:
  > *Thị trấn Tri Tôn, Thị trấn Ba Chúc, Xã Châu Lăng, Xã Lương Phi, Xã Vĩnh Phước, Xã Lương An Trà, Xã Lạc Quới, Xã Lê Trì, Xã Ô Lâm, Xã An Tức, Xã Cô Tô, Xã Tân Tuyến, Xã Tà Đảnh, Xã Vĩnh Gia, Xã Núi Tô.*
- `coordinates`: Tọa độ WGS84 nằm trọn trong Bounding Box Tri Tôn:
  > **Vĩ độ (Latitude):** `[10.30, 10.55]` · **Kinh độ (Longitude):** `[104.80, 105.15]`.
- `category`: Phân loại chính (`culture`, `nature`, `food`, `stay`, `experience`, `historical`).
- `cross_border_flag`: Cờ đánh dấu điểm tiếp giáp ranh giới huyện (ví dụ: `CROSS_BORDER_ATTRACTION` cho Hồ Đá Latina).

### C. Nguồn Chứng Thực (`source`)
- `type`: `GOVERNMENT_DECISION` | `FIELD_SURVEY` | `OFFICIAL_PORTAL` | `SATELLITE_GEO` | `HERITAGE_REGISTRY`.
- `title`: Tên tài liệu, văn bản hoặc cổng tra cứu.
- `issuing_authority`: Cơ quan chủ quản (Bộ VHTT&DL, UBND Tỉnh An Giang, UBND Huyện Tri Tôn,...).
- `source_url`: Đường dẫn HTTPS hoặc mã số lưu trữ hồ sơ công khai.

### D. Bằng Chứng Kiểm Toán (`evidence`)
- `reference_number`: Mã số quyết định hoặc mã phiếu kiểm tra thực địa.
- `legal_classification`: `SPECIAL_NATIONAL_HERITAGE` | `NATIONAL_HERITAGE` | `PROVINCIAL_HERITAGE` | `LOCAL_MUNICIPAL_RECORD` | `VERIFIED_COMMERCIAL_ESTABLISHMENT` | `NATURAL_LANDMARK`.
- `gps_audit_status`: `AUDITED_IN_BOUNDS` | `CROSS_BORDER_CONFIRMED`.
- `photos_evidence`: Danh mục ảnh chụp thực địa có vị trí và ghi chú xác thực.
- `field_notes`: Ghi chép chi tiết về hiện trạng hoạt động, hướng tiếp cận đường đi.

### E. Người Ký Duyệt Chuyên Môn (`reviewer`)
- `name`: Tên đầy đủ của chuyên gia hoặc kỹ sư kiểm toán.
- `role`: Chức danh chuyên môn (ví dụ: *Chuyên gia Văn hóa Bản địa*, *Kỹ sư GIS & Dữ liệu*).
- `organization`: Đơn vị quản lý dự án.
- `signature_hash`: Chuỗi SHA-256 đại diện cho cam kết kiểm toán không thoái thác.

### F. Vòng Đời & Thời Hạn Hiệu Lực (`lifecycle`)
- `verification_status`:
  - `UNVERIFIED`: Bản ghi thô chưa được kiểm toán.
  - `IN_REVIEW`: Đang trong quá trình khảo sát thực địa/đối chiếu văn bản.
  - `VERIFIED`: Đã thẩm định thành công, được cấp phép ingest vào Production & RAG.
  - `REJECTED`: Bị từ chối (ngoài vùng BBOX, thông tin sai sự thật, cơ sở giải thể).
  - `EXPIRED`: Đã quá hạn `expires_at`, cần kích hoạt chu trình tái thẩm định.
- `verified_at`: Timestamp phê duyệt (ISO 8601).
- `expires_at`: Timestamp hết hạn hiệu lực (ISO 8601).
- `freshness_cycle_days`: Chu kỳ kiểm toán định kỳ:
  - **365 ngày (1 năm):** Di tích lịch sử, chùa tháp Khmer, danh lam thắng cảnh tự nhiên.
  - **180 ngày (6 tháng):** Cơ sở ẩm thực, quán ăn đặc sản, homestay, điểm dịch vụ thương mại.

### G. Xác Nhận Cấp Trường (`field_level_provenance`)
- Boolean flags xác nhận tính xác thực của từng thuộc tính nhạy cảm: `name_verified`, `coordinates_verified`, `commune_verified`, `category_verified`, `phone_verified`, `cultural_claims_verified`.

---

## 3. Bản Mẫu Thẩm Định Điển Hình (Ground-Truth Instance)

```json
{
  "review_id": "PVR-CHUA-XA-TON-2026",
  "target_poi": {
    "canonical_id": "chua-xa-ton",
    "canonical_name": "Chùa Xà Tón (Wat Xvayton)",
    "commune": "Thị trấn Tri Tôn",
    "coordinates": {
      "latitude": 10.4287,
      "longitude": 104.9965
    },
    "category": "culture",
    "cross_border_flag": "NONE"
  },
  "source": {
    "type": "GOVERNMENT_DECISION",
    "title": "Quyết định xếp hạng Di tích Kiến trúc Nghệ thuật cấp Quốc gia",
    "issuing_authority": "Bộ Văn hóa Thông tin (nay là Bộ VHTT&DL)",
    "source_url": "https://triton.angiang.gov.vn"
  },
  "evidence": {
    "reference_number": "Quyết định số 224/QĐ-BVHTT ngày 12/12/1986",
    "legal_classification": "NATIONAL_HERITAGE",
    "gps_audit_status": "AUDITED_IN_BOUNDS",
    "photos_evidence": [
      {
        "url": "https://images.dulichtriton.vn/places/chua-xa-ton-chanh-dien.jpg",
        "caption": "Chánh điện cổ kính Chùa Xà Tón",
        "verified": true
      }
    ],
    "field_notes": "Ngôi chùa Khmer cổ nhất tỉnh An Giang (>300 năm tuổi), lưu giữ nhiều bộ Kinh lá buông Satra nhất Việt Nam (Kỷ lục VietKings 2006)."
  },
  "reviewer": {
    "name": "Chăm Rốch Thi",
    "role": "Nhà nghiên cứu Văn hóa & Kỹ sư Bản địa Tri Tôn",
    "organization": "Ban Quản trị Tri Thức Du Lịch Tri Tôn",
    "signature_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0"
  },
  "lifecycle": {
    "verification_status": "VERIFIED",
    "verified_at": "2026-09-28T21:40:00+07:00",
    "expires_at": "2027-09-28T21:40:00+07:00",
    "freshness_cycle_days": 365
  },
  "field_level_provenance": {
    "name_verified": true,
    "coordinates_verified": true,
    "commune_verified": true,
    "category_verified": true,
    "phone_verified": false,
    "cultural_claims_verified": true
  }
}
```

---

## 4. Tích Hợp Vào Chuỗi Task Tiếp Theo (Roadmap Roadmap Execution)

- **`P03-010`:** Áp dụng biểu mẫu P03-009 cho một POI hoàn chỉnh đầu tiên (Chùa Xà Tón).
- **`P03-011`:** Gán và lưu trữ trạng thái `verification_status` chính thức trong Canonical Schema.
- **`P03-012`:** Gán và lưu trữ timestamp `verified_at` có nguồn chứng minh.
- **`P03-013`:** Gán trường `source_url` cho từng field được xác minh.
- **`P03-014`:** Phát hành Canonical Dataset Version đầu tiên từ các POI đã có Review Record hợp lệ.
