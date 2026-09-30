# QUY CHUẨN CẤU TRÚC CANONICAL SCHEMA & TRƯỜNG VERIFICATION_STATUS (P03-011)

> **Mã quy chuẩn:** `CANONICAL-POI-SCHEMA-V1`  
> **Áp dụng cho:** Toàn bộ dữ liệu thực thể POI chính thức của Hệ thống Du Lịch Tri Tôn  
> **Căn cứ nghiệp vụ:** [RULE 01 (Production Real, No Mock)](../.agents/rules/01_production_real_no_mock.md) · [RULE 02 (Địa giới 15 Xã)](../.agents/rules/02_vietnamese_geography_boundary.md) · [Quy chuẩn Thẩm định POI](../technical-spec/POI_VERIFICATION_REVIEW_TEMPLATE.md)  
> **Phiên bản:** `1.0.0` · **Ngày ban hành:** `2026-09-28`  

---

## 1. Mục Đích Cốt Lõi Của Task P03-011

Trong các giai đoạn trước, hệ thống chỉ lưu trường cờ nhị phân `is_verified: boolean` (dễ bị nạp lén giá trị `true` mà không có căn cứ chứng minh).  
Task **P03-011** thiết lập trường trạng thái quản trị dữ liệu cấp cao: **`verification_status`** trong **Canonical POI Schema**.

### 5 Trạng Thái Vòng Đời Của Một POI:
1. **`UNVERIFIED` (Mặc định):** Dữ liệu mới thu thập từ nguồn ngoài hoặc người dùng đóng góp; chưa qua quy trình thẩm định; **chặn không cho xuất hiện trên public RAG hoặc bộ lọc điểm đến chính thức**.
2. **`IN_REVIEW`:** Đang có ticket thẩm định mở trong Review Queue; đang xác minh thực địa hoặc đối chiếu văn bản pháp lý.
3. **`VERIFIED`:** Đã hoàn tất hồ sơ thẩm định nguyên tử (`review_id`), có bằng chứng pháp lý và người duyệt chuyên môn bản địa ký nhận. Được phép xuất bản lên Production, đưa vào Canonical Dataset và nạp vào vector cache.
4. **`REJECTED`:** Bị từ chối vĩnh viễn (nằm ngoài Bounding Box Tri Tôn, trùng lặp giả mạo, hoặc cơ sở đã giải thể).
5. **`EXPIRED`:** Hồ sơ thẩm định đã quá hạn `expires_at` (vượt quá chu kỳ 180 hoặc 365 ngày), cần kích hoạt quy trình tái thẩm định.

---

## 2. Ràng Buộc Bất Biến (Integrity Invariants)

- **INV-01 (Review Audit Backlink):** Nếu một POI có `verification_status === 'VERIFIED'`, bắt buộc phải tồn tại trường `review_id` trỏ tới file hồ sơ thẩm định thực tế hợp lệ tại `docs/technical-spec/poi-reviews/{review_id}.json`.
- **INV-02 (Coherence With is_verified):** Khi `verification_status === 'VERIFIED'`, trường `is_verified` bắt buộc là `true`. Đối với mọi trạng thái khác (`UNVERIFIED`, `REJECTED`, `EXPIRED`), trường `is_verified` bắt buộc là `false` để fail-closed trên tầng truy vấn RLS.
- **INV-03 (Commune & Boundary Strictness):** Xã/thị trấn bắt buộc thuộc 15 đơn vị hành chính Tri Tôn theo RULE 02; tọa độ GPS WGS84 nằm trọn trong BBOX Tri Tôn [10.30 - 10.55, 104.80 - 105.15].
- **INV-04 (Provenance Timestamp Invariant - P03-012):** Khi `verification_status === 'VERIFIED'`, trường `verified_at` bắt buộc phải có, định dạng ISO 8601 kèm timezone offset, và phải khớp 100% byte-for-byte với timestamp ký duyệt trong hồ sơ thẩm định nguyên tử (`lifecycle.verified_at`). Ngoài ra bắt buộc tuân thủ tính nhất quán trình tự thời gian (`verified_at < expires_at`). Mọi trạng thái phi-verified (`UNVERIFIED`, `REJECTED`) cấm gán `verified_at` để ngăn chặn giả mạo nhãn kiểm toán.
- **INV-05 (Authoritative Source URL Invariant - P03-013):** Khi `verification_status === 'VERIFIED'`, trường `source_url` bắt buộc phải có, bắt buộc giao thức HTTPS an toàn, trỏ đến nguồn chính thống nhà nước hoặc di tích (UBND Huyện Tri Tôn, Bộ VHTT&DL, cổng thông tin di sản), và phải khớp chính xác với `source.source_url` trong hồ sơ thẩm định nguyên tử. Nghiêm cấm tuyệt đối URL scheme không an toàn (`http:`, `file:`, `javascript:`), cấm IP nội bộ/loopback/cloud metadata (`127.0.0.1`, `169.254.169.254`, `localhost`), và cấm các đường link mock/placeholder. Mọi trạng thái phi-verified cấm gắn nhãn `source_url` đã xác minh.

---

## 3. Bản Ghi Canonical Đầu Tiên: Chùa Xà Tón (`chua-xa-ton.json`)

Vị trí lưu trữ: `data/canonical/places/chua-xa-ton.json`.  
Bản ghi được gán chính thức:
- **`verification_status`**: `"VERIFIED"`
- **`is_verified`**: `true`
- **`review_id`**: `"PVR-CHUA-XA-TON-2026"` (liên kết với hồ sơ P03-010)
- **`verified_at`**: `"2026-09-28T22:00:00+07:00"`
- **`expires_at`**: `"2027-09-28T22:00:00+07:00"`
- **`source_url`**: `"https://triton.angiang.gov.vn"`
