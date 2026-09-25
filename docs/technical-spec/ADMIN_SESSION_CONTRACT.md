# Admin session contract — P01-002

**State:** `DESIGNED` · **Scope:** Next.js admin API and Supabase `admin_users` · **Owner:** platform owner chưa gán tại G0

Contract này là đầu vào cho P01-003 đến P01-009. Chưa có control nào trong tài liệu này được coi là đang chạy production. [Inventory route](ADMIN_MUTATION_INVENTORY.md) xác định các route cần áp guard.

## Quyết định thiết kế

Sử dụng **opaque session lưu phía server**, tối đa một phiên hoạt động trên mỗi tài khoản admin. Token là 32 byte từ CSPRNG, mã hóa base64url. Browser chỉ giữ token; Supabase `admin_users` chỉ giữ SHA-256 của token dưới dạng hex chữ thường, thời điểm tạo và thời điểm hết hạn. Token không chứa email, role hoặc dữ liệu cá nhân. DB là nguồn quyết định hiệu lực phiên, vì vậy không cần JWT hay chữ ký HMAC: thay token hoặc tự tạo token mới sẽ không khớp hash trong DB.

Lựa chọn một phiên/tài khoản tránh tạo bảng/session service mới trong giai đoạn containment. Login mới vô hiệu hóa phiên trước của cùng tài khoản. Nếu có nhu cầu dùng đồng thời nhiều thiết bị, phải mở một Decision Record riêng trước khi đổi sang bảng session riêng.

## Account và credential

| Thuộc tính | Contract |
|---|---|
| Identity | `admin_users.id` ổn định, email chuẩn hóa chỉ dùng để tìm account; không dùng email làm session key |
| Password | Chỉ lưu `password_hash` bằng bcrypt cost 12 (chọn tại P01-004/P01-005); từ chối input vượt 72 byte UTF-8 để tránh bcrypt truncation; không so sánh plaintext hoặc `trim()` password |
| Legacy env fallback | `ADMIN_EMAIL`/`ADMIN_PASSWORD` không được dùng để đăng nhập sau cutover; account bootstrap đi qua migration/operational workflow có kiểm soát |
| Account state | `is_active=false`, account bị xóa, DB lỗi hoặc role không hợp lệ đều fail closed |
| Roles | Cho phép rõ `ADMIN`, `SUPER_ADMIN` theo hành vi admin hiện tại; không tự gán role mặc định khi DB thiếu. Quyền chi tiết theo resource sẽ có matrix riêng trước khi mở mutation |

## Vòng đời phiên

| Sự kiện | Hành vi server bắt buộc |
|---|---|
| Login đúng | Kiểm password hash; tạo token 256 bit mới; lưu `SHA-256(token)` và `session_expires_at=now+8h` cho đúng account; chỉ set cookie sau khi DB write thành công. Login mới thay hash cũ |
| Login sai hoặc DB lỗi | Không cấp cookie; phản hồi lỗi không tiết lộ account tồn tại; log không chứa password/token |
| Mỗi GET `/auth/me` và admin API | Hash cookie; tra `admin_users` theo hash; kiểm `is_active`, role allowlist, `session_expires_at > now`; lấy role từ DB, không từ request/cookie. Không cache kết quả authorization giữa request |
| Hết hạn hoặc role đổi | Hết hạn từ chối ngay; role đổi có hiệu lực ở request kế tiếp; account bị khóa từ chối ngay |
| Logout | Chỉ clear `session_hash` và expiry nếu chúng vẫn khớp token trình duyệt hiện tại; xóa cookie kể cả khi token sai/hết hạn. Không cho phiên cũ xóa phiên mới |
| Mật khẩu đổi / account bị khóa | Thu hồi session hash trong cùng transaction/operation thành công trước khi công bố thay đổi thành công |

Cookie production: `__Host-triton_admin_session`; `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, không có `Domain`, `Max-Age=8h`. Không trả token trong JSON, URL, log hoặc localStorage. Local HTTP development dùng `triton_admin_session_local` không có `__Host-` và `Secure=false` chỉ khi server có cả `NODE_ENV=development` và `ADMIN_LOCAL_HTTP=true`; không bật cờ này ngoài máy local và không tự giảm thuộc tính theo header do client gửi. Login thành công xóa cookie cũ `triton_admin_token`; `/auth/me` đã ngừng chấp nhận nó tại P01-008 local, logout còn chờ P01-029.

## Ranh giới enforcement

Một server-side guard đọc cookie, xác minh session/account/role và trả principal đã được DB xác nhận. Tất cả admin read lẫn mutation route dùng guard; client layout chỉ điều hướng UX. Middleware kill-switch `P01-000` vẫn chặn mutation khi `ADMIN_MUTATIONS_ENABLED !== 'true'`; bật flag không thay thế guard hoặc RLS. Service-role chỉ được dùng sau authorization và cấu hình thiếu phải fail closed.

Cookie được browser tự gửi nên admin mutation cần kiểm CSRF riêng tại server boundary: Origin phải khớp origin được cấu hình tin cậy; `SameSite` và `HttpOnly` chỉ là lớp bổ sung. Rule middleware hiện cho phép mọi `*.vercel.app` và request thiếu Origin; chưa đạt contract này.

`/admin/auth/login` được public để tạo phiên, nhưng phải rate-limit và chống credential stuffing; `/admin/auth/logout` được gọi với cookie hiện có và chỉ thu hồi đúng phiên đó. Cả hai route được `P01-000` loại trừ nên không được dùng exemption đó làm bằng chứng đã an toàn.

## Acceptance và negative evidence cho các task sau

1. Cookie tùy ý, cookie cũ, token sửa một byte, token hết hạn, account inactive, role lạ và DB lỗi đều nhận 401/403; không có persistent mutation ở POI/KB/cache/storage/audit business effect.
2. Login mới làm phiên cũ vô hiệu ngay; logout làm cùng token không dùng lại được; logout bằng token cũ không xóa phiên mới.
3. Role đổi trong DB có hiệu lực ngay request sau; thiếu role không được mặc định `SUPER_ADMIN`.
4. `ADMIN_MUTATIONS_ENABLED=false` vẫn trả 503 trước handler kể cả khi session hợp lệ.
5. Không có plaintext password, session token hoặc hash trong log/JSON response; cookie production có đủ flags.

## Migration và rollout dependency

- P01-003: bổ sung `password_hash`, `session_hash` (unique/indexed), `session_expires_at` vào `admin_users`; có `id` ổn định trước khi cấp phiên. Phải thiết kế backfill/rollback vì migration chain hiện chưa tạo `admin_users` từ đầu.
- P01-004: migrate credential hiện có mà không ghi plaintext vào log hoặc migration.
- P01-005: dùng password verifier trong login và loại plaintext/env fallback.
- P01-006: phát hành opaque token chỉ sau DB write thành công.
- P01-007: đặt cookie theo contract.
- P01-008: xác minh `/me` theo token hash, expiry và account state.
- P01-029: logout thu hồi đúng phiên và xóa cookie cũ.
- P01-009 trở đi: dùng guard tại read/mutation route; RLS tiếp tục là defense in depth.
- Giữ kill-switch tắt tới khi negative tests và RLS matrix pass. Deploy migration trước code; rollback giữ kill-switch tắt và vô hiệu hóa phiên mới.

P01-004/005 đã chọn bcrypt cost 12 và có proof local cho verifier/login route. P01-006 đã có proof local cho token 32 byte, SHA-256 DB hash, expiry 8h và chỉ cấp cookie sau session write thành công. P01-007 đã có proof local cho production/local cookie flags và xóa cookie legacy trong login response. P01-008 đã có proof local cho `/auth/me` hash/expiry/account/role và không có DB mutation ở request âm. Account thật chưa có `password_hash` được xác nhận và P01-003 chưa deploy; source mới không phải bằng chứng cutover production. P01-029 logout revocation và P01-009 guard cho admin API vẫn còn mở.

### P01-003 — bằng chứng migration và rollout an toàn

`20260924_admin_credential_session_fields.sql` là migration **bổ sung**, không tạo `admin_users`. Nó chỉ backfill `id` bằng UUID khi bảng cũ chưa có `id`; nếu đã có `id`, giữ nguyên giá trị và yêu cầu không null/duy nhất. `password_hash` và ba cột session khởi đầu `NULL`; việc chuyển credential thật thuộc P01-004, không được đưa password vào SQL migration. Session hash được index duy nhất; ràng buộc yêu cầu SHA-256 hex chữ thường, `session_created_at` và `session_expires_at` cùng có mặt, expiry sau created. Không có token/session nào được tạo bởi migration.

**Kiểm thử cục bộ 2026-09-24:** PostgreSQL 15 container với fixture giả lập `admin_users` cũ. Thiếu bảng → migration fail trước DDL. Có bảng không có `id` → migration thành công, ID được backfill, credential/session mới vẫn null; bảng có `id bigint=42` → giữ nguyên giá trị và kiểu. Session hợp lệ được nhận; session thiếu trường, hash sai dạng, hash trùng và ID null đều bị từ chối. Truy vấn sau các write lỗi cho thấy phiên cũ giữ nguyên; xóa đồng thời hash/created/expiry thu hồi được phiên. Đây là proof schema cục bộ, **không phải** proof production hay replay từ DB trắng.

**Điều kiện trước deploy:** P02-004 phải tạo baseline `admin_users` *trước* migration này trong thứ tự fresh replay; kiểm tra schema live, unique ID, lock/index impact và snapshot có thể khôi phục. Trước production deploy, phải xác minh RLS/grants không cho anonymous đọc/ghi credential/session. Khi rollback app: giữ `ADMIN_MUTATIONS_ENABLED` tắt, trả code auth về phiên bản trước, thu hồi mọi session mới bằng cách đặt ba trường session về `NULL` trong transaction có kiểm soát; **không drop cột tự động** hoặc xóa `id` đã backfill. Nếu thật sự cần rollback schema, owner phải xác nhận snapshot và không còn consumer của các cột mới. Legacy `password` plaintext vẫn tồn tại đến task cutover sau; lỗi constraint của PostgreSQL có thể chứa nội dung row, nên không gửi error detail ra response/log công khai và không coi migration này là đã bảo vệ credential.

**Preflight và containment live 2026-09-24:** G0 đã có Decision Record; project live có `admin_users.id bigint` primary key. Policy/grants anon nguy hiểm đã được thu hồi bằng migration `20260924083656_admin_users_rls_lockdown` (P02-000); DB post-check cho client roles deny và `service_role` allow, row count không đổi. **P01-003 vẫn chưa deploy**: phải loại fallback login sang anon key, xác nhận backup/rollback và kiểm tra auth production trước khi thêm credential/session fields. P02-004 vẫn cần cho fresh replay; không gộp nó vào rollout live. Không rollback P02-000 bằng cách mở lại quyền anon nếu login gặp lỗi.

## Evidence nền

- [Login source hiện tại](../../frontend/src/app/api/v1/admin/auth/login/route.ts) dùng bcrypt verifier theo P01-005, opaque token/hash theo P01-006 và cookie flags theo P01-007; `/auth/me` và logout vẫn chưa đạt contract.
- [Me source hiện tại](../../frontend/src/app/api/v1/admin/auth/me/route.ts) xác minh cookie mới qua DB theo P01-008 local; chưa chứng minh production hoặc guard ở admin API khác.
- [Logout hiện tại](../../frontend/src/app/api/v1/admin/auth/logout/route.ts) chỉ xóa cookie browser.
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) khuyến nghị token CSPRNG, state phía server, server expiry và invalidation.
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) mô tả flags cho session cookie.
