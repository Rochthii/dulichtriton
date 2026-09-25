# CURRENT STATE AUDIT

> Scope: checkout hiện tại; riêng mục “Supabase live preflight” dưới đây là quan sát read-only từ project được xác định ngày 2026-09-24. Mọi dòng `OBSERVED` cần tái kiểm khi code/runtime đổi.

## Trục trách nhiệm

**Hệ thống chỉ được đưa thông tin du lịch hoặc SOS mà người dùng có thể tin để hành động khi dữ liệu có nguồn/xác minh rõ ràng; mọi thay đổi persistent vào dữ liệu, tri thức AI hoặc cấu hình phải đi qua authorization server-side và database policy.**

## Facts, claims và verdict

| Claim / boundary | Evidence hiện tại | State | Verdict |
|---|---|---|---|
| Admin mutation chỉ dành cho admin hợp lệ | Kill-switch middleware fail-closed cho non-auth mutations đã có; cookie/token tự chế và route-level authorization/RLS vẫn chưa hoàn tất | `IMPLEMENTED` | Containment P01-000 đạt; full control vẫn cần P01-A/P02-B |
| Anonymous không thể đọc/ghi dữ liệu nhạy cảm | Nhiều migration grant/policy anon cho chat, cache, config hoặc knowledge | `OBSERVED` | Không đạt; remediation P02 |
| Server chỉ fetch URL an toàn | Scraper nhận URL request rồi server fetch, thiếu network allowlist | `OBSERVED` | Không đạt; remediation P01-B |
| UI, DB, RAG có một master data | Các dataset hiện có số lượng/ID/commune không khớp | `DISPUTED` | Không được claim count; remediation P03 |
| Python AI core là production runtime | Vercel build đi qua `frontend`; deployment Python chưa có evidence | `UNVERIFIED` | Không được claim active runtime |
| Chat chỉ lưu local / RLS nghiêm ngặt | API/migration cho thấy persistence và policy mâu thuẫn | `OBSERVED` | Privacy claim cần sửa; remediation P05 |
| SOS và địa giới hiện hành | Rule/data cũ mâu thuẫn nguồn hành chính 2025 | `DISPUTED` | Chờ G1 và source review |

## Supabase live preflight — 2026-09-24

Project ref `knmlbwsmfljlabhvqfid` khớp cấu hình local. `public.admin_users` tồn tại, `id bigint` là primary key. Preflight thấy hai policy `admin_users_anon_select` (`USING true`) và `admin_users_anon_insert` (`WITH CHECK true`), cùng table grants cho `anon`/`authenticated`; `anon` có thể SELECT cột `password`. Không đọc giá trị credential.

**Remediation live 2026-09-24:** migration `20260924083656_admin_users_rls_lockdown` đã xóa hai policy và thu hồi table grants của client roles. Post-check: policy count 0; `anon` SELECT/INSERT/UPDATE/DELETE false; `authenticated` SELECT/INSERT false; `service_role` SELECT/UPDATE true; admin row count 1→1. REST GET `admin_users?select=id` bằng anon key nhận 401, trong khi public `places?select=id` cùng key nhận 200 (không in response body). Fixture PostgreSQL 15 cho thấy SELECT/INSERT dưới `anon` bị từ chối và service role vẫn đọc được. `VERIFIED` chỉ cho DB permission boundary tại thời điểm kiểm tra; không chứng minh chưa từng có truy cập trái phép, không xác minh login production. P01-003 chưa deploy; chưa có cột session mới. Cần xử lý login fallback, backup và credential rotation.

**Source update P01-005 (local):** login route hiện query `password_hash` qua service role, dùng bcrypt verifier và bỏ `ADMIN_EMAIL`/`ADMIN_PASSWORD` cùng anon-key fallback. Route test với Supabase HTTP fixture chứng minh positive/negative/env fallback/missing-key behavior. Source chưa deploy; cột hash và credential thật chưa cutover; không nâng claim production authentication.

**Source update P01-006 (local):** login route hiện phát token CSPRNG 32 byte, lưu chỉ SHA-256 hash + thời gian 8h bằng DB update có điều kiện, và chỉ cấp cookie sau write thành công. Test âm xác nhận write lỗi/no-match/thiếu ID không cấp cookie và session đã lưu không đổi; token sửa không khớp DB hash. Không claim session authorization end-to-end hoặc production.

**Source update P01-007 (local):** login route đặt cookie production `__Host-triton_admin_session` với HttpOnly/Secure/Strict/Path=/8h/no Domain, và local HTTP cookie tên riêng chỉ khi hai env flags xác định rõ; test kiểm cả ba nhánh và legacy cookie expiry. Trang admin login vẫn `trim()` mật khẩu trước khi gửi; ghi P01-030 để sửa byte fidelity trước production cutover.

**Source update P01-008 (local):** `/auth/me` chỉ đọc cookie mới, tra `admin_users` qua SHA-256 hash và re-read `is_active`, role, expiry; cookie cũ/giả/sửa và row invalid đều bị từ chối. Test fixture xác nhận request âm chỉ GET và không thay account state. Logout vẫn chưa thu hồi cookie/session mới (P01-029), các admin API khác chưa dùng guard (P01-009 trở đi), P01-003/account cutover chưa deploy; không nâng claim production auth.

## Những gì chưa được phép tuyên bố

- Production-ready, secure-by-default, RLS strict, canonical 149 POI, current 15-unit boundary.
- Parallel provider race, vector retrieval production, zero-cost/quota/latency guarantee.
- Exact hotline, văn hóa/ẩm thực tuyệt đối nếu chưa có `source_url`, reviewer và `verified_at`.

## Evidence sẽ thay đổi verdict

- G0 xác định runtime public/staging/local và owner.
- Fresh migration replay + RLS matrix pass.
- Canonical manifest G2 có checksum, count và review provenance.
- Negative tests chứng minh unauthorized request không để lại persistent business effect.

Chi tiết task/acceptance: [Atomic Control Ledger](../12_PRODUCTION_REMEDIATION_PLAN.md).
