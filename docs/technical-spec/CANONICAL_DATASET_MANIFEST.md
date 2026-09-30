# QUY CHUẨN TẬP DỮ LIỆU CANONICAL DATASET MANIFEST V1.0 (P03-014)

> **Mã quy chuẩn:** `CANONICAL-MANIFEST-V1`  
> **Áp dụng cho:** Toàn bộ bản phát hành tập dữ liệu chuẩn Canonical POI của Hệ thống Du Lịch Tri Tôn  
> **Căn cứ nghiệp vụ:** [RULE 01 (Production Real, No Mock)](../.agents/rules/01_production_real_no_mock.md) · [RULE 02 (Địa giới 15 Xã)](../.agents/rules/02_vietnamese_geography_boundary.md) · [CANONICAL_POI_SCHEMA](../technical-spec/CANONICAL_POI_SCHEMA.md)  
> **Phiên bản:** `1.0.0` · **Ngày ban hành:** `2026-09-28`  
> **Chủ quản dữ liệu:** Hội đồng Quản trị Dữ liệu Du Lịch Tri Tôn (Lead Auditor: `Chăm Rốch Thi`)  

---

## 1. Mục Đích & Nguyên Tắc Hoạt Động

Để đảm bảo tính bất biến, minh bạch và khả năng kiểm toán mã hóa (Cryptographic Auditability) cho dữ liệu du lịch chính thức, hệ thống ban hành tệp **Canonical Dataset Manifest** tại:
`data/canonical/canonical_manifest.json`

### Các Nguyên Tắc Cốt Lõi:
1. **Một Nguồn Sự Thật Duy Nhất (Single Source of Truth):** Chỉ những POI đã đạt trạng thái `verification_status: "VERIFIED"`, có `review_id` hợp lệ và vượt qua toàn bộ 5 bất biến (`INV-01` đến `INV-05`) mới được đưa vào Manifest.
2. **Kiểm Toán Mã Hóa Toàn Vẹn (Cryptographic Integrity):** Mỗi tệp dữ liệu POI canonical độc lập được băm bằng thuật toán SHA-256 (`sha256`). Toàn bộ dataset được niêm phong bằng mã băm tổng thể `overall_sha256` tính toán từ chuỗi danh mục sắp xếp tất định (deterministic sorted order).
3. **Đếm Số Lượng Minh Bạch (Strict Count Accounting):** Trường `total_verified_count` phải bằng chính xác số lượng thực thể POI thực tế trong mảng `places`, tuyệt đối không có số ảo hoặc placeholder.

---

## 2. Cấu Trúc Manifest Chuẩn

```json
{
  "manifest_name": "Tri Ton Tourism Official Canonical Dataset Manifest",
  "manifest_version": "1.0.0",
  "schema_version": "CANONICAL-POI-SCHEMA-V1",
  "generated_at": "2026-09-28T22:20:00+07:00",
  "authority": "Hội đồng Quản trị Dữ liệu Du Lịch Tri Tôn",
  "lead_auditor": "Chăm Rốch Thi",
  "dataset_scope": {
    "geographic_boundary": "Tri Ton District, An Giang Province",
    "commune_count": 15,
    "bounding_box": {
      "latitude": [10.30, 10.55],
      "longitude": [104.80, 105.15]
    }
  },
  "total_verified_count": 1,
  "overall_sha256": "f65d568ab075eb7d4a0689e6d35a45420e6a27739064c4e755ff1a83ba2b3cfb",
  "places": [
    {
      "canonical_id": "chua-xa-ton",
      "name": "Chùa Xà Tón (Wat Xvayton)",
      "commune": "Thị trấn Tri Tôn",
      "category": "culture",
      "verification_status": "VERIFIED",
      "review_id": "PVR-CHUA-XA-TON-2026",
      "verified_at": "2026-09-28T22:00:00+07:00",
      "source_url": "https://triton.angiang.gov.vn",
      "file_name": "chua-xa-ton.json",
      "sha256": "5398587c7e5c2e4e300e8460af8253e5ea433af1026558bced647d5c4b186e7f",
      "size_bytes": 1544
    }
  ]
}
```

---

## 3. Quy Trình Xác Minh Độc Lập (Independent Verification Protocol)

Để xác minh tính toàn vẹn của Manifest trên bất kỳ môi trường CI/CD hay máy chủ độc lập:
1. Tính SHA-256 của từng file `data/canonical/places/{file_name}`. So sánh với trường `sha256` trong manifest.
2. Ghép chuỗi `${canonical_id}:${sha256}` theo thứ tự tăng dần của `canonical_id`, phân tách bằng dấu xuống dòng `\n`.
3. Băm chuỗi trên bằng SHA-256. Giá trị thu được phải trùng khớp 100% với `overall_sha256`.
