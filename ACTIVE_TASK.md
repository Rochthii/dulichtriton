# ACTIVE TASK

> Mỗi luồng chỉ có tối đa một task active; hai session song song cùng đọc file này. Khi chọn task kế tiếp, đọc [Execution Board](docs/13_TWO_STREAM_EXECUTION_BOARD.md) và dependency trực tiếp. Không coi task `done` là production verified.

## Task theo luồng

- **Luồng A kế tiếp:** P01-029 — logout thu hồi đúng phiên; P01-008 đã có proof `/auth/me` local.
- **Luồng B kế tiếp:** P02-017 — thu hồi anon `INSERT` từ `audit_logs`; P02-016 đã pass local test. Production rollout của P02-014/015/016 chờ Luồng A có đường chat-session và admin chat-log read được ủy quyền.
- Mỗi session chỉ cập nhật task của luồng đã chọn; trạng thái của luồng kia giữ nguyên.
- **W0 exit:** P01-000/P01-001 và P00-001/P02-001/P02-002 đều có proof; W1 được mở cho một task mỗi luồng.

## P01-008 — Xác minh admin session tại /auth/me (local)

- **Status:** `done` cho route/test local; production và server guard toàn bộ admin API chưa verified.
- **Luồng:** A — App security, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Evidence:** `node --test scripts/admin-me.integration.test.mjs` trong `frontend`; cookie mới hợp lệ trả user/role từ DB, cookie rỗng/cũ/giả/sửa/hết hạn/inactive/role lạ/account xóa/DB lỗi/missing key 401, read-only DB calls và account state không đổi.
- **Claim state:** `PLANNED → IMPLEMENTED` local tại `/auth/me`; route guard và logout chưa `VERIFIED`.
- **Next task Luồng A:** P01-029 — logout thu hồi đúng phiên; P01-030 UI password trim trước cutover.

```text
Task: P01-008
Luồng: A
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Lý do: session verification và fail-closed admin identity
Evidence: route test với Supabase HTTP fixture; positive, stale/legacy/fake/expired/inactive/role/DB negative; no persistent mutation
Claim state: PLANNED → IMPLEMENTED (local /auth/me boundary only)
Next task: P01-029 — logout revocation; P01-030 trước production cutover
```

## P01-007 — Cookie admin theo contract (local)

- **Status:** `done` tại login route/test local; `/auth/me`, logout và production chưa verified.
- **Luồng:** A — App security, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Evidence:** `node --test scripts/admin-login.integration.test.mjs` trong `frontend`; production cookie có `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=8h`, không Domain; local HTTP cần cả hai env flags; cookie legacy bị xóa khi login thành công.
- **Claim state:** `PLANNED → IMPLEMENTED` local tại login cookie boundary; full session validation thuộc P01-008.
- **Next task Luồng A:** P01-008. Finding phụ: P01-030 sửa `password.trim()` trong UI trước production cutover.

```text
Task: P01-007
Luồng: A
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Lý do: cookie security boundary và local HTTP downgrade control
Evidence: route test production/development/default/local explicit flag; legacy cookie expiry
Claim state: PLANNED → IMPLEMENTED (local cookie issuance only)
Next task: P01-008 — /auth/me session validation; P01-030 UI password byte fidelity before cutover
```

## P01-006 — Opaque admin session tại login (local)

- **Status:** `done` cho login/storage boundary; `/auth/me` và production chưa verified.
- **Luồng:** A — App security, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Evidence:** `node --test scripts/admin-login.integration.test.mjs` trong `frontend`; 32-byte CSPRNG token, SHA-256 DB hash, login lại thay session, tampered hash mismatch, DB write error/no-match/thiếu ID không cấp cookie hoặc đổi persisted session, chỉ audit success sau write.
- **Claim state:** `PLANNED → IMPLEMENTED` local tại session issuance/storage; full authorization chưa `VERIFIED` vì P01-029/009 còn mở.
- **Next task Luồng A:** P01-007.

```text
Task: P01-006
Luồng: A
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Lý do: session issuance, race witness và DB write failure
Evidence: route test với Supabase HTTP fixture; token/hash/expiry, replay overwrite, tampered mismatch, failed write/no-match/no-ID no cookie and unchanged session
Claim state: PLANNED → IMPLEMENTED (local login/storage boundary only)
Next task: P01-007 — secure cookie attributes; P01-008 vẫn cần xác minh token tại /auth/me
```

## P01-005 — Login dùng bcrypt verifier (local)

- **Status:** `done` — route và test local; production deploy/account cutover chưa thực hiện.
- **Luồng:** A — App security, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Evidence:** `node --test scripts/admin-login.integration.test.mjs` trong `frontend`; hash đúng 200, sai/env fallback 401, thiếu service role 503; negative cases không set cookie.
- **Claim state:** `PLANNED → IMPLEMENTED` local; admin session/production authentication chưa `VERIFIED`.
- **Next task Luồng A:** P01-006.

```text
Task: P01-005
Luồng: A
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Lý do: login credential boundary và loại fallback bypass
Evidence: route test với Supabase HTTP fixture; positive/negative/env fallback/missing key
Claim state: PLANNED → IMPLEMENTED (local route proof only)
Next task: P01-006 — opaque server-side session
```

## P01-004 — Hash credential cho một admin account mẫu (local)

- **Status:** `done` — chỉ verified ở helper/test local; chưa chuyển account thật hoặc ghi Supabase.
- **Luồng:** A — App security, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Evidence:** `frontend/scripts/admin-credential-migration.test.mjs`; `node --test scripts/admin-credential-migration.test.mjs` trong `frontend`.
- **Claim state:** `PLANNED → IMPLEMENTED` (bcrypt migration helper và in-memory sample proof; account persistence/production chưa verified).
- **Next task Luồng A:** P01-005.

```text
Task: P01-004
Luồng: A
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Lý do: credential hashing và auth-security invariant
Evidence: bcrypt cost 12 helper; positive/negative verifier tests; no plaintext in migrated object; no external DB write
Claim state: PLANNED → IMPLEMENTED (local helper/test only)
Next task: P01-005 — login verifier integration and env fallback removal
```

## P00-001 — Decision Record G0: trạng thái môi trường và owner

- **Status:** `done`
- **Luồng:** B — DB & data governance, W0
- **AI route đề xuất:** `Luna · xhigh`
- **AI thực dùng:** `Codex GPT-6` (effort identifier không được cung cấp)
- **Evidence:** [Decision Record G0](docs/technical-spec/DECISION_RECORD_G0.md), public URL mở được ngày 2026-09-24, project owner declarations và user attestation.

### Completion record

```text
Task: P00-001
Luồng: B
AI route đề xuất: Luna · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Evidence: docs/technical-spec/DECISION_RECORD_G0.md
Claim state: DISPUTED → VERIFIED cho public URL, Vercel/Supabase usage và owner declarations; staging/internal project metadata vẫn UNKNOWN
Next task: P02-001
```

### P02-001 — Inventory route tới bảng/RPC

- **Status:** `done` — hoàn tất source inventory; không xác nhận deployed runtime/schema.

- **Mục tiêu:** truy vết các production route đang đọc/ghi Supabase, rồi lập mapping `route + method → table/RPC`.
- **Proof cần có:** mỗi mapping kèm đường dẫn file và vị trí truy vấn; ghi rõ route nào không chạm DB. Không kết luận runtime chỉ từ tên file.
- **Đầu ra dự kiến:** `docs/technical-spec/PRODUCTION_ROUTE_DATA_INVENTORY.md`.
- **Ranh giới:** chỉ đọc source và lập inventory; không gọi production DB, không chạy sync, không sửa route, migration hoặc policy RLS.
- **Model phù hợp:** `Luna · xhigh` — inventory W0 Luồng B theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md); escalate sang `Astra · xhigh` chỉ nếu source/evidence mâu thuẫn về production runtime hoặc owner.
- **Sau task:** `P02-002` — inventory các bảng được tạo bởi migration chain; chưa triển khai trước khi P02-001 có proof.

### Completion record — P02-001

```text
Task: P02-001
Luồng: B
AI route đề xuất: Luna · xhigh
AI thực dùng: Codex GPT-6 (effort identifier không được cung cấp)
Lý do: source inventory nhiều route/helper để lập route → table/RPC map trước RLS work
Evidence: docs/technical-spec/PRODUCTION_ROUTE_DATA_INVENTORY.md; rà 33 route.ts; git diff --check
Claim state: PLANNED → IMPLEMENTED (source references only; deployed runtime/schema/RLS chưa verified)
Next task: P02-002 — inventory tables created by migration chain
```

- Scope hoàn tất bằng source inspection; không có request tới production DB, sync hoặc sửa code.
- Ghi nhận riêng client/page trực tiếp dùng Supabase để không bỏ sót khỏi RLS inventory tiếp theo.

### P02-002 — Inventory bảng được khai báo tạo trong migration chain

- **Status:** `done` — hoàn tất source inventory; replay và schema production chưa verified.
- **Luồng:** B — DB & data governance, W0.
- **AI route đề xuất:** `Luna · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** `Codex GPT-6` (effort identifier không được cung cấp).
- **Evidence:** [Migration Table Inventory](docs/technical-spec/MIGRATION_TABLE_INVENTORY.md); rà 21 migration SQL, 12 khai báo `CREATE TABLE` trong 11 file; `git diff --check`.
- **Claim state:** `PLANNED → IMPLEMENTED` (source declarations only; fresh replay/schema live chưa verified).
- **Next task Luồng B:** `P02-013` — bật RLS cho `chat_sessions`, sau khi W0 exit gate toàn dự án pass. Trước gate này task ở trạng thái `not-ready`; model dự kiến `Sol · xhigh`.

```text
Task: P02-002
Luồng: B
AI route đề xuất: Luna · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Lý do: inventory migration chain, không thay đổi schema/runtime
Evidence: docs/technical-spec/MIGRATION_TABLE_INVENTORY.md; 21 migration files, 12 CREATE TABLE declarations; git diff --check
Claim state: PLANNED → IMPLEMENTED (source-only; replay/schema live chưa verified)
Next task: P02-013 sau W0 exit gate; hiện not-ready
```

### P02-013 — Kiểm chứng RLS enabled cho `chat_sessions`

- **Status:** `done` — migration hiện có bật RLS; assertion pass trên PostgreSQL 15.19 tạm.
- **Luồng:** B — DB & data governance, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Ranh giới:** chỉ xác minh cờ `relrowsecurity`; không đổi policy/grant, không áp lên Supabase live. Policy `chat_sessions_anon_all` vẫn cho anon `FOR ALL`; thu hồi quyền là P02-014/P02-015.

```text
Task: P02-013
Luồng: B
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Evidence: supabase/tests/p02_013_chat_sessions_rls.sql; PostgreSQL 15.19 disposable container, role anon fixture; migration và positive assertion pass; negative control `DISABLE ROW LEVEL SECURITY` bị assertion từ chối
Claim state: PLANNED → VERIFIED tại fresh PostgreSQL migration-test boundary; Supabase live chưa xác minh
Next task: P02-014 — thu hồi anonymous SELECT từ chat_sessions
```

### P02-014 — Thu hồi anonymous SELECT từ `chat_sessions`

- **Status:** `done` — migration và negative control pass trên PostgreSQL 15.19 tạm; chưa áp production.
- **Luồng:** B — DB & data governance, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex GPT-6 (effort identifier không được cung cấp).
- **Evidence:** `supabase/tests/p02_014_chat_sessions_anon_select.sql`; PostgreSQL 15.19 baseline + anon CRUD grant fixture + P02-014 migration; SELECT nhận `insufficient_privilege`, INSERT còn hoạt động trong transaction test, re-grant SELECT khiến test fail.
- **Claim state:** `PLANNED → VERIFIED` tại PostgreSQL 15.19 disposable permission boundary; Supabase live chưa xác minh.
- **Tác động tương thích:** `/api/v1/chat/query` dùng anon key cho history select/upsert. Read lỗi fallback về history rỗng; upsert session hiện hữu bị `permission denied`. Không sửa Luồng A; production rollout cần server-side authorized path.
- **Policy effect:** thay `FOR ALL` bằng INSERT-only; anon UPDATE/DELETE cũng không còn policy cho phép.
- **Next task Luồng B:** P02-015 — thu hồi anon INSERT từ `chat_sessions`; model đề xuất `Sol · xhigh`.

```text
Task: P02-014
Luồng: B
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex GPT-6 (effort không được cung cấp)
Evidence: PostgreSQL 15.19 disposable fixture; baseline migration; anon CRUD grant; P02-014 migration; anon SELECT denial + INSERT preservation pass; re-grant SELECT negative control rejected; anon-key upsert on existing session returns permission denied
Claim state: PLANNED → VERIFIED tại local DB privilege boundary; live chưa xác minh
Next task: P02-015; production rollout chờ authorized chat-session path trong Luồng A
```

### P02-015 — Thu hồi anonymous INSERT từ `chat_sessions`

- **Status:** `done` tại PostgreSQL 15.19 disposable fixture; migration chưa áp Supabase live.
- **Luồng:** B — DB & data governance, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex (host không cung cấp model/effort identifier cho phiên này).
- **Evidence:** `supabase/tests/p02_015_chat_sessions_anon_insert.sql` sau baseline + P02-014 + P02-015; anon INSERT mới và upsert session cũ đều bị `insufficient_privilege`, không có row mới hoặc history đổi; re-grant INSERT negative control khiến test fail.
- **Claim state:** `PLANNED → VERIFIED` chỉ tại local PostgreSQL privilege/persistence boundary; EV-02 và Supabase live vẫn chưa verified.
- **Tác động tương thích:** route chat hiện dùng anon key cho `chat_sessions` upsert; P02-014 đã làm upsert session cũ lỗi, P02-015 chặn cả insert mới. Không rollout trước khi Luồng A có authorized server-side path và kiểm thử tích hợp.
- **Next task Luồng B:** P02-016 — thu hồi anon SELECT từ `chat_logs`; model đề xuất `Sol · xhigh`.

```text
Task: P02-015
Luồng: B
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex (model/effort identifier không được host cung cấp)
Lý do: RLS/grant migration với negative persistent-write proof
Evidence: PostgreSQL 15.19 disposable fixture; baseline + P02-014 + P02-015; denied INSERT/upsert leaves rows unchanged; re-grant negative control rejected
Claim state: PLANNED → VERIFIED tại local DB privilege/persistence boundary; live chưa xác minh
Next task: P02-016; production rollout chờ authorized chat-session path trong Luồng A
```

### P02-016 — Thu hồi anonymous SELECT từ `chat_logs`

- **Status:** `done` tại PostgreSQL 15.19 disposable fixture; migration chưa áp Supabase live.
- **Luồng:** B — DB & data governance, W1.
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Codex (host không cung cấp model/effort identifier cho phiên này).
- **Evidence:** `supabase/tests/p02_016_chat_logs_anon_select.sql`; fixture tạo `chat_logs_anon_select` theo migration hợp nhất schema, sau P02-016 anon SELECT toàn bảng và theo session ID đều bị `insufficient_privilege`; anon INSERT vẫn persist trong test transaction, row private không đổi; re-grant SELECT + policy negative control khiến test fail.
- **Claim state:** `PLANNED → VERIFIED` chỉ tại local PostgreSQL privilege/read boundary; EV-02 và Supabase live vẫn chưa verified.
- **Tác động tương thích:** `frontend/src/app/admin/chat-logs/page.tsx` đọc trực tiếp bằng anon key; `/api/v1/admin/ai-metrics` cũng dùng anon key đọc `chat_logs`. Chưa rollout trước khi Luồng A có đường đọc server-side được xác thực và test tích hợp.
- **Next task Luồng B:** P02-017 — thu hồi anon INSERT từ `audit_logs`; model đề xuất `Sol · xhigh`.

```text
Task: P02-016
Luồng: B
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex (model/effort identifier không được host cung cấp)
Lý do: RLS/grant migration và chat-log privacy boundary
Evidence: PostgreSQL 15.19 disposable fixture; baseline + SELECT policy from consolidation + P02-016; anon read denied, INSERT preserved, private row unchanged; reopen negative control rejected
Claim state: PLANNED → VERIFIED tại local DB privilege/read boundary; live chưa xác minh
Next task: P02-017; production rollout chờ authorized admin chat-log read path trong Luồng A
```

### Ghi chú tiếp nối

- Vercel dashboard và production environment mapping chưa được kiểm tra trực tiếp.
- Không tìm thấy staging URL/project trong checkout; giữ trạng thái `unknown`.
- Completion record Luồng A bên dưới được giữ nguyên làm lịch sử.

---

## P01-003 — Admin credential/session fields migration

- **Status:** `done` cho migration và proof cục bộ; **production deploy chưa thực hiện**.
- **Luồng:** A — App security, W1
- **AI route đề xuất:** `Sol · xhigh`
- **Lý do chọn AI:** schema credential/session, identity backfill và ràng buộc ghi có tác động security.
- **AI thực dùng:** Codex session model (host không cung cấp model identifier/effort)
- **Dependency:** P01-002 contract; G0 đã có record; P02-004 còn thiếu cho fresh replay, còn live deploy chờ login fallback/backup sau P02-000.

### Một mục tiêu duy nhất

Bổ sung schema cho credential và opaque admin session trong `admin_users` mà không chuyển password hay bật admin mutation.

### Acceptance và evidence

- Migration [20260924_admin_credential_session_fields.sql](supabase/migrations/20260924_admin_credential_session_fields.sql) thêm `password_hash`, `session_hash`, `session_created_at`, `session_expires_at` và ID khi thiếu, không chứa secret thật.
- PostgreSQL 15 disposable fixture: thiếu bảng → fail trước DDL; bảng legacy không có ID → backfill ID; bảng có ID bigint → giữ `42`/`bigint`; các cột mới null; phiên hợp lệ → ghi được; hash sai/trùng, thiếu field, ID null → ghi bị từ chối và persisted session không đổi.
- Rollback vận hành được thử bằng việc thu hồi phiên (đặt đồng thời ba field session về null); schema rollback tự động bị loại vì có thể làm mất ID/credential sau cutover. [Contract](docs/technical-spec/ADMIN_SESSION_CONTRACT.md) ghi preflight, snapshot và rollback.
- Preflight **chỉ đọc** trên Supabase project `knmlbwsmfljlabhvqfid`: bảng live có `id bigint` primary key, nhưng ban đầu cho anon SELECT/INSERT và đọc cột `password`. P02-000 đã khóa DB boundary đó; P01-003 vẫn chưa áp live vì login fallback/backup chưa xử lý. Fresh replay vẫn cần P02-004 đúng thứ tự; không claim `VERIFIED` production.

### Completion record

```text
Task: P01-003
Luồng: A
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex session model (host identifier/effort unavailable)
Lý do: migration credential/session và security invariants
Evidence: PostgreSQL 15 fixture; missing-table fail, ID backfill, positive/negative session writes, no persistent mutation on rejected writes, session revocation
Claim state: DESIGNED → IMPLEMENTED (local schema proof only)
Next task: P01-004 cho local; production deployment requires login compatibility and backup evidence; P02-004 still required for fresh replay
```

---

## P02-000 — Emergency `admin_users` RLS/grants lockdown

- **Status:** `done` / `VERIFIED` tại DB permission boundary, không phải toàn bộ admin authentication.
- **Luồng:** B — DB & data governance, emergency trước P02-002.
- **AI route đề xuất:** `Sol · xhigh` (RLS/credential exposure).
- **AI thực dùng:** Codex session model (host không cung cấp model identifier/effort).
- **Scope:** chỉ policy và table grants của `public.admin_users`; không đổi account row, auth route hoặc schema session.
- **Evidence:** [migration](supabase/migrations/20260924083656_admin_users_rls_lockdown.sql) áp trên Supabase project `knmlbwsmfljlabhvqfid`, remote version `20260924083656`. PostgreSQL 15 fixture: anon SELECT/INSERT và authenticated SELECT bị từ chối, service_role SELECT được; live post-check policy count 0, client role privileges false, service_role SELECT/UPDATE true, row count 1→1, session columns vẫn 0. Anon REST GET admin_users trả 401, public places control cùng key trả 200.
- **Rollback:** không mở lại anon policy/grants nếu login production lỗi; sửa service-role env/route, vì RLS-only migration không xóa dữ liệu. Backup/PITR chưa được xác nhận; P01-003 không deploy.

```text
Task: P02-000
Luồng: B
AI route đề xuất: Sol · xhigh
AI thực dùng: Codex session model (host identifier/effort unavailable)
Lý do: emergency credential exposure at DB boundary
Evidence: PostgreSQL role-negative fixture; Supabase migration 20260924083656; live grant/policy/row-count post-check; anon REST GET 401 with public control 200
Claim state: OBSERVED FAIL → VERIFIED (admin_users DB permission only)
Next task: A-route login fallback removal / production auth check; P01-003 waits backup, P02-013 is next regular B task after W0 exit gate
```
