# SECURITY INVARIANTS

> Đây là target bắt buộc trước GO, không phải claim đã đạt. Mọi invariant hiện là `PLANNED` cho đến khi Evaluation Matrix có evidence `VERIFIED`.

| ID | Invariant | Enforcement point ưu tiên | Evidence tối thiểu |
|---|---|---|---|
| SI-01 | Request không có admin authorization hợp lệ không tạo persistent mutation | Shared server guard + RLS | Negative request không đổi DB/storage/cache/audit effect |
| SI-02 | Không có anonymous role nào đọc/ghi dữ liệu riêng tư hoặc dữ liệu điều khiển AI ngoài public contract đã duyệt | RLS/grants | RLS matrix pass |
| SI-03 | Server-side fetch không tới host/IP/scheme/redirect không được duyệt | Shared URL fetch validator | SSRF test suite pass trước outbound fetch |
| SI-04 | Không có secret/service role fallback sang anonymous behavior | Server config loader | Missing credential fail closed test |
| SI-05 | Chỉ canonical record được phê duyệt mới được public hoặc ingest cho RAG | Canonical manifest + ingest gate | Provenance/version/checksum test |
| SI-06 | Thiếu source hoặc hết hạn xác minh thì không được hiển thị như fact/SOS đã xác nhận | Source metadata + response validator | Missing/expired fixture safe-fails |
| SI-07 | Sync report phản ánh đúng persistent result, không success ảo | Sync response/error handling | Partial/failed fixture khớp snapshot |
| SI-08 | Privacy notice mô tả đúng collection, access, retention và deletion behavior | Data inventory + implementation | Contract test + reviewed notice |

## Quy tắc trạng thái

- Không dùng từ “được bảo vệ”, “immutable”, “verified”, “production-ready” chỉ vì một invariant có code.
- Một invariant chỉ đổi sang `VERIFIED` sau khi evidence ở [Evaluation Matrix](EVALUATION_MATRIX.md) được chạy tại boundary phù hợp.
- Regression làm mất evidence sẽ đưa invariant về `IMPLEMENTED` hoặc `DISPUTED`, không giữ nhãn cũ.
