# TECHNICAL SPEC — EVIDENCE SYSTEM

Các tài liệu trong thư mục này biến audit thành claim có ranh giới, test và evidence. Chúng ưu tiên quan sát hiện tại hơn narrative lịch sử.

## Thứ bậc nguồn sự thật

1. Runtime/migration hiện hành và test tái lập được.
2. Canonical data manifest đã qua G2.
3. Nguồn hành chính/văn hóa chính thức có ngày kiểm tra.
4. Decision Record đã được owner phê duyệt.
5. Tài liệu kiến trúc/roadmap/changelog.

Nếu hai nguồn mâu thuẫn, không tự chọn nguồn thuận tiện: gắn `DISPUTED`, tạo task và đưa về Decision Gate.

## Nhãn trạng thái

| Nhãn | Nghĩa |
|---|---|
| `DESIGNED` | Có thiết kế, chưa có implementation evidence |
| `PLANNED` | Đã có task/dependency, chưa triển khai |
| `IMPLEMENTED` | Code/migration tồn tại, chưa có đủ evidence môi trường/test |
| `VERIFIED` | Có evidence tái lập được tại boundary tuyên bố |
| `DISPUTED` | Sources hoặc behavior mâu thuẫn |
| `RETIRED` | Không còn là implementation/claim hiện hành |

## Tài liệu authority

- [Current State Audit](CURRENT_STATE_AUDIT.md) — facts, claims và khoảng trống đang quan sát.
- [Evaluation Matrix](EVALUATION_MATRIX.md) — claim → enforcement boundary → test/evidence.
- [Threat Model](THREAT_MODEL.md) — assets, trust boundary, multi-step bypass.
- [Security Invariants](SECURITY_INVARIANTS.md) — điều bắt buộc phải đúng trước GO.
- [Model Routing](MODEL_ROUTING.md) — chọn Luna/Sol/Astra theo task, risk và evidence; completion record bắt buộc ghi model thực dùng.
- [Admin Mutation Inventory](ADMIN_MUTATION_INVENTORY.md) — route/method/resource inventory và auth exceptions cho P01-A.
- [Admin Session Contract](ADMIN_SESSION_CONTRACT.md) — session, cookie, role và revoke semantics cho P01-003 đến P01-009.
- [Decision Record G0](DECISION_RECORD_G0.md) — môi trường public/local, Supabase identifier, owner declarations và giới hạn xác minh.
- [Production Route Data Inventory](PRODUCTION_ROUTE_DATA_INVENTORY.md) — source-level map từ API route/method tới Supabase table/RPC và các page/component query trực tiếp.
- [Migration Table Inventory](MIGRATION_TABLE_INVENTORY.md) — khai báo `CREATE TABLE` trong migration chain hiện có; không xác nhận replay hoặc schema live.
- [Execution Board](../13_TWO_STREAM_EXECUTION_BOARD.md) — thứ tự và WIP mỗi ngày.
- [Atomic Control Ledger](../12_PRODUCTION_REMEDIATION_PLAN.md) — task ID, acceptance và rollback.
