# EVALUATION MATRIX

> Một claim chỉ được gắn `VERIFIED` khi test chứng minh đúng business effect tại enforcement boundary, không chỉ xác nhận status code hay UI.

| ID | Claim | Enforcement boundary | Negative scenario | Required evidence | State |
|---|---|---|---|---|---|
| EV-01 | Anonymous không thể thay đổi POI/itinerary/video | Server admin guard + RLS | Gọi mutation trực tiếp, cookie giả, session hết hạn | 401/403 **và** row/storage/audit state không đổi | `IMPLEMENTED` — kill-switch trả 503 khi disabled; còn chờ auth/RLS evidence |
| EV-02 | Anonymous không đọc/ghi chat, config, KB, cache, audit | RLS policies/grants | Anon select/insert/update/delete | RLS matrix theo role/table/action | `PLANNED` |
| EV-03 | Scraper không truy cập mạng nội bộ | Shared fetch validator | loopback, RFC1918, metadata IP, redirect host | Request bị chặn trước fetch; test không có outbound call | `PLANNED` |
| EV-04 | Sync chỉ báo success khi persistent write success | Smart Delta Sync response handling | API 4xx/5xx, partial failure | Counter/report khớp DB snapshot | `PLANNED` |
| EV-05 | AI không gọi fact chưa verified là verified | Canonical ingest + retrieval filter + output validator | Context unverified/poisoned/missing status | Fixture không xuất hiện hoặc bị gắn trạng thái thiếu xác minh | `PLANNED` |
| EV-06 | Một chat session không bị đọc bởi session khác | Server-issued session + ownership/RLS | đoán/đổi `session_id` | Không có row/message lộ ra ngoài owner | `PLANNED` |
| EV-07 | SOS có nguồn và độ mới | Source metadata + SOS renderer | Contact thiếu/hết hạn source | Safe fallback; không xuất hotline không verified | `PLANNED` |
| EV-08 | Public POI count/claim nhất quán | Canonical manifest → UI/DB/RAG/sitemap | dataset mismatch hoặc stale build | Version/checksum/count report khớp | `PLANNED` |
| EV-09 | Schema admin session có identity ổn định và trạng thái phiên nhất quán | Migration `20260924_admin_credential_session_fields.sql` | Thiếu baseline, thiếu session field, hash sai/trùng, ID null | PostgreSQL 15 fixture: lỗi fail closed, row session không đổi; revocation xóa được phiên | `IMPLEMENTED` cục bộ; RLS/grants đã khóa nhưng live deploy vẫn chờ backup, account cutover và auth rollout |
| EV-10 | Anonymous không đọc/ghi admin credential/session | `admin_users` RLS + grants | Anon SELECT `password` hoặc INSERT account | PostgreSQL role-negative fixture; live policy/grant check, anon REST GET 401 với public `places` control 200, row count trước/sau | `VERIFIED` tại DB boundary 2026-09-24: anon/authenticated deny, service_role allow, row count 1→1; chưa xác minh login production |
| EV-11 | Admin login chỉ xác minh `password_hash` từ DB, không dùng plaintext/env fallback | `/admin/auth/login` | Password sai, env password đúng, input quá 72 byte, thiếu service role | Route test với Supabase HTTP fixture: đúng 200; sai/fallback/quá dài 401; thiếu key 503; negative cases không có cookie, plaintext không vào log/payload | `IMPLEMENTED` local (P01-005); chưa deploy, account thật chưa migrate; P01-030 UI trim còn thiếu trước cutover |
| EV-12 | Login chỉ phát opaque token sau khi lưu SHA-256 session hash đúng account | `/admin/auth/login` + `admin_users` write | Token sửa, login lại, DB write lỗi/không khớp row/thiếu ID | Route test với Supabase HTTP fixture: 32-byte token, hash/expiry 8h, phiên cũ bị thay; lỗi ghi không cấp cookie và persisted session không đổi; success audit chỉ sau write | `IMPLEMENTED` local tại issuance/storage (P01-006); P01-007 cookie và P01-008 `/me` có proof local, chưa deploy hoặc guard toàn admin |
| EV-13 | Login đặt cookie admin có flags production và chỉ giảm `Secure` khi local HTTP được bật rõ | `/admin/auth/login` cookie response | Thiếu flag, Domain, downgrade do `NODE_ENV` hoặc cờ riêng lẻ, cookie legacy còn sống | Route test kiểm production/default development/local explicit flag; cookie mới HttpOnly/Strict/Path/8h, production Secure + `__Host-`, local tên riêng, legacy Max-Age=0 | `IMPLEMENTED` local (P01-007); `/auth/me` đã chuyển ở P01-008 local, logout còn dùng cookie cũ, chưa deploy |
| EV-14 | `/auth/me` chỉ trả admin identity từ phiên DB còn hiệu lực | `/admin/auth/me` | Cookie cũ/giả/sửa/hết hạn; inactive, role lạ, row xóa, DB lỗi | Route test với Supabase HTTP fixture: hợp lệ 200 từ DB, các negative 401; query theo SHA-256, chỉ GET và account state không đổi | `IMPLEMENTED` local (P01-008); logout/guard admin API chưa xong, chưa deploy |

## Evidence bổ sung UI/UX — 2026-10-20

> **Follow-up 2026-10-23:** phần build của EV-UX-03 đã có evidence local mới: 36 targeted tests, tsc, lint 0 errors, webpack và Turbopack 181/181 pass sau tạo lại `.next`. Không thay verdict readiness: consent/SOS/data trust chưa đóng; browser recheck bị tool URL policy chặn. Xem phần bổ sung trong [báo cáo](UI_UX_READINESS_AUDIT_2026_10_20.md). Các kết quả fail ngày 2026-10-20 dưới đây giữ làm lịch sử, không còn là kết quả build mới nhất.

| ID | Claim/boundary | Evidence | State / giới hạn |
|---|---|---|---|
| EV-UX-01 | Nhãn verified của POI detail không suy từ tên/rating hoặc cờ legacy | `getCanonicalPlaceVerification`, 2 tests mới trong `poi-ui-claim-canonical.test.mjs`; thiếu flags/provenance, sai identity/source, trước ngày review/hết hạn đều trả null | `IMPLEMENTED`; test tại display resolver. Không đổi trạng thái canonical dataset hoặc các claim UI còn lại |
| EV-UX-02 | Search, favorite, tour URL và dialog có feedback/focus đúng ở mẫu local | Browser local: q giữ từ khóa; favorite không điều hướng; food-tour đúng slug; Tab loop/Escape/return focus ở report/chat/export | `VERIFIED` cho đúng các UI behavior local đã ghi trong [báo cáo](UI_UX_READINESS_AUDIT_2026_10_20.md); không phải WCAG/user-testing hoặc production verification |
| EV-UX-03 | Bản sửa có thể nghiệm thu readiness tổng thể | Final tsc fail 3 route exports; Turbopack CSS panic; webpack `node:crypto` error; consent/SOS/data mapping còn cần task riêng | `DISPUTED` đối với claim readiness hiện hành; không ghi đè quyết định G4 của owner |

## Evidence consent bổ sung — 2026-10-23

| ID | Claim/boundary | Evidence | State / giới hạn |
|---|---|---|---|
| EV-UX-04 | Unset/denied không replay/persist hội thoại qua query/stream/fallback | 12 boundary tests thực thi POST source với DB recorder, shared request, hook harness và controls SSR; trong 58 tests pass | Code `IMPLEMENTED`; các ca fixture đã kiểm. Không là DB/provider live, browser hoặc distributed-revocation proof; [evidence](CHAT_CONSENT_BOUNDARY_EVIDENCE_2026_10_23.md) |

Lỗi mặc định unset/fallback của audit 2026-10-20 đã có sửa local; EV-UX-03 readiness tổng thể vẫn `DISPUTED` vì data trust/SOS và staging acceptance còn mở. Không nâng claim RLS/auth/privacy production hoặc sửa quyết định G3/G4 của owner.

## Evidence data trust UI — 2026-10-23

| ID | Claim/boundary | Evidence | State / giới hạn |
|---|---|---|---|
| EV-UX-05 | Các UI entry được sửa không công bố local SOS tranh chấp hoặc tự biến dữ liệu thiếu thành fact | 8 tests mới public-data-trust: source SSR /food, /emergency, helper negatives, public/export source check; nằm trong 91 combined tests pass | UI `IMPLEMENTED`, test đúng phạm vi local. G2/source accuracy, AI/offline và browser/staging vẫn mở; [evidence](PUBLIC_DATA_TRUST_EVIDENCE_2026_10_23.md) |

EV-UX-03 readiness tổng thể vẫn `DISPUTED`; metadata/contract tests cũ pass không đủ chứng minh số SOS đang hoạt động hay mọi POI chính xác. Không sửa source authority/canonical hoặc G2/G4 decision.

## Evidence lưu điểm — 2026-10-23

| ID | Claim/boundary | Evidence | State / giới hạn |
|---|---|---|---|
| EV-UX-06 | Card/detail và danh sách đã lưu dùng chung trạng thái, không ghi đè storage hỏng hoặc storage lịch trình | 10 tests helper/hook/SSR/source, trong 42 combined tests pass; tsc/lint 0 errors/build 181/181 pass | Code `IMPLEMENTED` local. Không browser/đa tab thật/WCAG/usability proof; last-writer-wins vẫn có thể xảy ra khi ghi đồng thời. [Evidence](SAVED_PLACES_UI_EVIDENCE_2026_10_23.md) |

EV-UX-03 readiness vẫn `DISPUTED`; component convergence còn phạm vi khác và G2/source approval chưa đóng.

## Quy tắc benchmark

Không trộn kết quả benchmark của data validator, DB/RLS, HTTP auth, provider latency hay UI build thành một con số “performance”. Mỗi benchmark phải ghi rõ boundary, fixture, môi trường và giới hạn kết luận.
