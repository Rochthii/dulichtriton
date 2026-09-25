# KẾ HOẠCH KHẮC PHỤC PRODUCTION — TRI TÔN TOURISM AI

> Phiên bản: 1.1 · Ngày lập: 2026-09-23 · Trạng thái: **ATOMIC CONTROL LEDGER**
>
> Tài liệu này là sổ kiểm soát các task nguyên tử từ audit, không phải bảng điều phối hằng ngày. Điều phối hai luồng, WIP và thứ tự triển khai dùng [13_TWO_STREAM_EXECUTION_BOARD.md](13_TWO_STREAM_EXECUTION_BOARD.md). Nó **không** xác nhận bất kỳ số lượng POI, địa giới, hotline hay trạng thái production nào là đúng. Những sự thật đó chỉ được chốt tại các Decision Gate bên dưới.

## 1. Mục tiêu, phạm vi và thứ tự bất biến

Mục tiêu duy nhất: đưa hệ thống về trạng thái có thể chứng minh được là an toàn, có dữ liệu nhất quán, có câu trả lời AI truy vết được và có quy trình phát hành lặp lại được.

Thứ tự thực hiện không được đảo:

```text
Sự thật & quyền quyết định
  → chặn bề mặt tấn công
  → database/RLS tái lập được
  → một master data chuẩn
  → AI chỉ dùng tri thức đã duyệt
  → privacy, vận hành, UX
  → release gate
```

Không triển khai feature mới, không chạy sync ghi production và không mở beta công khai trước khi hoàn tất P01, P02 và các gate G0–G3.

### Nguyên tắc tác vụ nguyên tử

Mỗi ID bên dưới là **một task độc lập, một đầu ra kiểm chứng được, một pull request**. Không gộp nhiều ID vào một PR. Nếu một task phát hiện cần quyết định nghiệp vụ, dừng tại task đó, ghi Decision Record và không tự chọn thay người sở hữu dữ liệu.

- Một task chỉ được sửa một ranh giới: một route, một policy, một migration, một dataset record, một tài liệu, hoặc một test case.
- Mọi task phải ghi `before`, `after`, test đã chạy và rollback path vào PR/issue.
- Không sửa generated files, lock files hoặc đẩy dữ liệu cloud khi task không yêu cầu.
- Bất cứ phát hiện mới nào làm sai giả định của phase phải được thêm vào risk register trước task kế tiếp.

Mẫu bắt buộc cho từng issue nằm tại [ATOMIC_TASK_TEMPLATE.md](E:/Projects/Project_ca_nhan/dulichtriton/docs/ATOMIC_TASK_TEMPLATE.md).

## 2. Decision Gates — không được lách

| Gate | Quyết định cần có | Người quyết định | Bằng chứng hoàn tất |
|---|---|---|---|
| G0 | Môi trường nào đang public, owner nào chịu trách nhiệm và dữ liệu thật có tồn tại không | Product owner + platform owner | Decision Record có URL môi trường và ngày chốt |
| G1 | Đích địa lý là vùng Tri Tôn lịch sử hay đơn vị hành chính sau sắp xếp 2025 | Product owner + cơ quan/chuyên gia địa phương | Danh mục địa danh, nguồn chính thức, `effective_from` |
| G2 | Dataset nào là canonical và ai có quyền phê duyệt một POI | Data owner | Manifest versioned, checksum, schema, approval policy |
| G3 | Chính sách lưu/xóa hội thoại và căn cứ consent | Product owner + privacy owner | Retention policy và privacy notice được duyệt |
| G4 | Tiêu chí GO/NO-GO | Release owner | Release checklist ký nhận |

## 3. Backlog theo phase

### P00 — Khóa phạm vi và thiết lập nguồn chân lý

- [ ] **P00-001** — Tạo Decision Record G0. **Đầu ra:** một bản ghi xác định public/staging/local và owner. **Proof:** URL môi trường + người chịu trách nhiệm.
- [ ] **P00-002** — Lập inventory biến môi trường theo *tên biến*, không ghi giá trị. **Đầu ra:** danh sách owner và nơi nạp từng secret. **Proof:** không có secret trong tài liệu.
- [ ] **P00-003** — Lập inventory deployment path. **Đầu ra:** sơ đồ runtime thực tế cho Vercel/Next/Supabase/Python. **Proof:** mỗi thành phần có đường build/deploy.
- [ ] **P00-004** — Gắn trạng thái `active`, `legacy`, hoặc `unknown` cho `backend`, `tourism_ai_core`, `tourism_ai_platform`. **Proof:** mỗi thư mục có owner và căn cứ.
- [ ] **P00-005** — Tạo Decision Record G1. **Đầu ra:** chọn phạm vi địa lý và mốc hiệu lực. **Proof:** nguồn hành chính chính thức được liên kết.
- [ ] **P00-006** — Tạo glossary cho tên địa danh được phép hiển thị. **Proof:** không có tên hành chính không rõ thời điểm.
- [ ] **P00-007** — Tạo Decision Record G2. **Đầu ra:** chỉ định canonical dataset và data owner. **Proof:** một người/phòng ban phê duyệt được ghi rõ.
- [ ] **P00-008** — Tạo schema version cho canonical dataset. **Proof:** version, checksum algorithm và migration policy được ghi.
- [ ] **P00-009** — Tạo Decision Record G3. **Đầu ra:** retention, deletion và consent policy. **Proof:** owner privacy phê duyệt.
- [ ] **P00-010** — Đánh dấu `docs/11_Roadmap.md` là roadmap lịch sử, không phải release authority. **Proof:** link đến tài liệu này xuất hiện ở đầu file.
- [ ] **P00-011** — Thêm tài liệu này vào docs index. **Proof:** có link từ `docs/README.md`.
- [ ] **P00-012** — Tạo risk register có owner, due date, trạng thái. **Proof:** mọi finding P0/P1 từ audit có một dòng riêng.

### P01 — Cô lập bề mặt tấn công trước khi sửa tính năng

**Exit của phase:** không có admin mutation, SSRF hay privileged database access nào thực hiện được bởi request anonymous.

#### P01-A. Admin identity và authorization

- [x] **P01-000** — Thêm kill-switch server-side chặn mọi admin mutation. **Evidence (2026-09-24):** local server với `ADMIN_MUTATIONS_ENABLED=false` trả 503 cho POST/PATCH/DELETE business routes; `/admin/auth/login` không bị chặn. **State:** `IMPLEMENTED`; full authorization/RLS vẫn thuộc P01-A/P02-B.
- [x] **P01-001** — Liệt kê tất cả admin route có method mutation. **Evidence (2026-09-24):** [Admin Mutation Inventory](technical-spec/ADMIN_MUTATION_INVENTORY.md) xác nhận 20 business mutation method-route pairs, 2 auth lifecycle pairs và owner state chưa gán; không sửa route code.
- [x] **P01-002** — Viết [contract session admin server-side](technical-spec/ADMIN_SESSION_CONTRACT.md). **Evidence (2026-09-24):** expiry 8h, opaque 256-bit token, server-side hash/revocation, DB role check, cookie và negative cases; `DESIGNED`, chờ owner G0 trước production cutover. Opaque token được xác minh qua DB nên không cần chữ ký riêng.
- [x] **P01-003** — Thêm migration credential/session fields trong `admin_users` theo contract P01-002. **Evidence (2026-09-24):** PostgreSQL 15 fixture xác nhận ID backfill, cột nullable, session consistency/unique và rollback thu hồi session; [contract](technical-spec/ADMIN_SESSION_CONTRACT.md) ghi điều kiện deploy. **State:** `IMPLEMENTED` cục bộ; fresh replay chờ baseline P02-004, production chưa được xác minh.
- [x] **P01-004** — Viết migration helper chuyển đổi *một* admin account mẫu sang bcrypt hash. **Evidence (2026-09-24):** bcrypt cost 12; verifier đúng/sai pass; sample record không còn plaintext; từ chối password quá 72 byte; test không log password. Chỉ helper + in-memory fixture, chưa migrate/persist account thật hoặc xác minh production.
- [x] **P01-005** — Thay comparison plaintext và env password fallback trong login bằng bcrypt verifier. **Evidence (2026-09-24):** route test với Supabase HTTP fixture: hash đúng 200, sai/env fallback/password quá 72 byte 401, thiếu service role 503; không có cookie ở negative cases hoặc plaintext trong log/payload. **State:** `IMPLEMENTED` local; chưa deploy/hash account thật, P01-008 đã có proof local, P01-030 UI trim còn thiếu trước cutover.
- [x] **P01-006** — Thay token dự đoán được bằng opaque 256-bit session lưu hash server-side. **Evidence (2026-09-24):** route test với Supabase HTTP fixture chứng minh token 32 byte ngẫu nhiên, DB chỉ lưu SHA-256, login thứ hai thay hash cũ; token sửa không khớp hash; DB write error/no-match/thiếu ID không cấp cookie hoặc đổi phiên đã lưu; success audit chỉ sau write thành công. **State:** `IMPLEMENTED` local tại login/storage boundary; P01-007 cookie và P01-008 `/me` có proof local, chưa deploy/account cutover.
- [x] **P01-007** — Đặt cookie admin `httpOnly`, `secure` và `sameSite` đúng contract. **Evidence (2026-09-24):** route test kiểm `__Host-triton_admin_session`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, không Domain, `Max-Age=8h`; local HTTP chỉ khi `NODE_ENV=development` và `ADMIN_LOCAL_HTTP=true`, dùng tên riêng và không Secure; login thành công xóa cookie cũ. **State:** `IMPLEMENTED` local; `/auth/me` đã chuyển ở P01-008 local, logout còn dùng cookie cũ, chưa deploy.
- [x] **P01-008** — Xác minh hash, expiry, account state và role trong `admin/auth/me`. **Evidence (2026-09-24):** route test với Supabase HTTP fixture: cookie mới hợp lệ trả user từ DB; rỗng/cũ/giả/sửa/hết hạn/inactive/role lạ/account xóa, DB error/missing key đều trả 401; chỉ GET, account state không đổi, local cookie chỉ khi hai env flags. **State:** `IMPLEMENTED` local; guard route khác/logout và production chưa verified.
- [ ] **P01-029** — Thu hồi đúng session trong `admin/auth/logout`, xóa cookie cũ. **Proof:** token đã logout nhận 401; logout bằng token cũ không làm mất phiên mới.
- [ ] **P01-030** — Bỏ `password.trim()` tại trang admin login để gửi đúng byte mật khẩu. **Scope:** chỉ `src/app/admin/login/page.tsx`. **Proof:** test UI gửi nguyên mật khẩu có khoảng trắng đầu/cuối; không mở thêm đường auth. **Dependency:** P01-005; hoàn tất trước production cutover. **AI route:** `Sol · medium`.
- [ ] **P01-009** — Thêm server-side admin guard dùng chung. **Proof:** unit test role thiếu/sai/đúng.
- [ ] **P01-010** — Bảo vệ route admin `places` bằng guard. **Proof:** POST/PATCH/DELETE anonymous trả 401/403.
- [ ] **P01-011** — Bảo vệ route admin `videos` bằng guard. **Proof:** mutation anonymous trả 401/403.
- [ ] **P01-012** — Bảo vệ route admin `itineraries` bằng guard. **Proof:** mutation anonymous trả 401/403.
- [ ] **P01-013** — Bảo vệ route admin `knowledge-base` bằng guard. **Proof:** mutation anonymous trả 401/403.
- [ ] **P01-014** — Bảo vệ route admin `ai-scan` bằng guard. **Proof:** POST anonymous trả 401/403.
- [ ] **P01-015** — Bảo vệ route admin `revalidate` bằng guard. **Proof:** POST anonymous trả 401/403.
- [ ] **P01-016** — Bảo vệ route admin `upload` bằng guard. **Proof:** POST anonymous trả 401/403.
- [ ] **P01-017** — Bảo vệ route admin `scrape-images` bằng guard. **Proof:** POST anonymous trả 401/403.
- [ ] **P01-018** — Bảo vệ route admin `gmaps-scraper` bằng guard. **Proof:** POST anonymous trả 401/403.
- [ ] **P01-019** — Xóa fallback service-role → anon trong *một* server client factory. **Proof:** missing service role làm route fail closed.

#### P01-B. SSRF, upload và request boundary

- [ ] **P01-020** — Tạo URL validation contract cho server-side fetch. **Proof:** scheme, allowlist, redirect và DNS policy được viết.
- [ ] **P01-021** — Chặn scheme không phải HTTPS tại `scrape-images`. **Proof:** test `file:`, `http:`, `data:` bị từ chối.
- [ ] **P01-022** — Chặn private/loopback/link-local IP tại `scrape-images`. **Proof:** test `127.0.0.1`, RFC1918, metadata IP bị từ chối.
- [ ] **P01-023** — Chỉ cho redirect sang allowlist tại `scrape-images`. **Proof:** redirect host khác bị từ chối.
- [ ] **P01-024** — Áp URL validation contract vào `gmaps-scraper`. **Proof:** test private URL bị từ chối.
- [ ] **P01-025** — Đặt request body-size limit cho `upload`. **Proof:** payload vượt ngưỡng nhận 413.
- [ ] **P01-026** — Đặt MIME allowlist cho `upload`. **Proof:** payload MIME không hợp lệ bị từ chối.
- [ ] **P01-027** — Bỏ Unsplash fallback khỏi `upload`. **Proof:** provider failure trả lỗi rõ ràng, không sinh URL giả.
- [ ] **P01-028** — Bỏ Unsplash fallback khỏi admin place creation. **Proof:** create thiếu ảnh không tạo ảnh stock.

### P02 — Database tái lập được và quyền tối thiểu

**Exit của phase:** database mới dựng được từ migration; quyền anonymous chỉ còn đúng quyền công khai đã xét duyệt.

- [x] **P02-000 — Emergency `admin_users` lockdown (Luồng B, ngoại lệ ưu tiên):** thu hồi direct grants của `anon`/`authenticated` và hai policy anon SELECT/INSERT trên đúng bảng này. **Evidence (2026-09-24):** PostgreSQL fixture và live Supabase migration `20260924083656_admin_users_rls_lockdown`; live post-check client roles deny, `service_role` allow, row count 1→1. **State:** `VERIFIED` tại DB boundary; chưa xác minh admin login production hoặc credential đã từng bị truy cập.
- [x] **P02-001** — Liệt kê bảng được route production tham chiếu. **Proof:** [source inventory 33 route handlers, helper và direct page/component access](technical-spec/PRODUCTION_ROUTE_DATA_INVENTORY.md); source mapping hoàn tất, deployed runtime/schema chưa verified.
- [x] **P02-002** — Liệt kê các bảng có khai báo `CREATE TABLE` trong migration chain. **Proof:** [source inventory 21 migration files, 12 CREATE TABLE declarations](technical-spec/MIGRATION_TABLE_INVENTORY.md); không xác nhận replay hoặc schema live.
- [ ] **P02-003** — Tạo migration baseline cho `places`. **Proof:** fresh replay tạo được bảng.
- [ ] **P02-004** — Tạo migration baseline cho `admin_users`. **Proof:** fresh replay tạo được bảng.
- [ ] **P02-005** — Tạo migration baseline cho `preset_itineraries`. **Proof:** fresh replay tạo được bảng.
- [ ] **P02-006** — Tạo migration baseline cho `videos`. **Proof:** fresh replay tạo được bảng.
- [ ] **P02-007** — Tạo migration bật extension cần thiết. **Proof:** fresh replay có extension đúng.
- [ ] **P02-008** — Chọn duy nhất kiểu không gian cho `places.geom`. **Proof:** Decision Record nêu `geometry` hoặc `geography`.
- [ ] **P02-009** — Sửa một RPC khoảng cách để khớp kiểu không gian đã chọn. **Proof:** RPC test chạy với dữ liệu mẫu.
- [ ] **P02-010** — Thêm một CHECK latitude theo boundary đã duyệt tại G1. **Proof:** insert ngoài vùng bị từ chối.
- [ ] **P02-011** — Thêm một CHECK longitude theo boundary đã duyệt tại G1. **Proof:** insert ngoài vùng bị từ chối.
- [ ] **P02-012** — Thêm CHECK rating. **Proof:** rating âm và lớn hơn 5 bị từ chối.
- [x] **P02-013** — Bật RLS cho `chat_sessions`. **Proof:** [PostgreSQL 15 migration assertion](../supabase/tests/p02_013_chat_sessions_rls.sql) pass sau khi áp migration `20260809_create_chat_sessions.sql` với fixture role `anon`; chỉ xác nhận `relrowsecurity = true`, chưa khóa anonymous access và chưa xác minh live.
- [x] **P02-014** — Thu hồi anon SELECT từ `chat_sessions`. **Proof:** [PostgreSQL 15 fixture test](../supabase/tests/p02_014_chat_sessions_anon_select.sql) xác nhận không còn quyền bảng/policy SELECT và truy vấn role `anon` bị `insufficient_privilege`; re-grant negative control bị test bắt; anon INSERT còn hoạt động trong test transaction. Local only; thay policy `FOR ALL` bằng INSERT-only cũng bỏ anon UPDATE/DELETE. Route hiện dùng anon key nên history read fallback về rỗng và upsert session hiện hữu bị từ chối; chờ Luồng A chuẩn bị authorized server path trước production rollout.
- [x] **P02-015** — Thu hồi anon INSERT từ `chat_sessions`. **Proof:** [PostgreSQL 15 fixture test](../supabase/tests/p02_015_chat_sessions_anon_insert.sql) sau baseline + P02-014 + P02-015 xác nhận anon INSERT mới/upsert session cũ đều bị từ chối và row/history không đổi; re-grant INSERT bị test bắt. Local only; chưa áp Supabase live vì route chat cần authorized server-side session path từ Luồng A.
- [x] **P02-016** — Thu hồi anon SELECT từ `chat_logs`. **Proof:** [PostgreSQL 15 fixture test](../supabase/tests/p02_016_chat_logs_anon_select.sql) xác nhận anon SELECT toàn bảng và theo session ID bị từ chối, row private không đổi, anon INSERT vẫn hoạt động; re-grant SELECT + policy bị test bắt. Local only; admin chat-logs page và ai-metrics hiện dùng anon key để đọc, cần authorized server-side path trước rollout live.
- [ ] **P02-017** — Thu hồi anon INSERT từ `audit_logs`. **Proof:** anon write bị từ chối.
- [ ] **P02-018** — Thu hồi anon SELECT từ `audit_logs`. **Proof:** anon read bị từ chối.
- [ ] **P02-019** — Thu hồi anon write từ `golden_answers`. **Proof:** anon insert/update/delete bị từ chối.
- [ ] **P02-020** — Thu hồi anon write từ `system_configs`. **Proof:** anon insert/update/delete bị từ chối.
- [ ] **P02-021** — Thu hồi anon write từ `semantic_chat_cache`. **Proof:** anon insert/update/delete bị từ chối.
- [ ] **P02-022** — Giới hạn custom knowledge-base policy đúng `service_role` hoặc role admin đã duyệt. **Proof:** policy integration test theo role.
- [ ] **P02-023** — Viết fresh migration replay test. **Proof:** database trống migrate thành công.
- [ ] **P02-024** — Viết RLS matrix test. **Proof:** mỗi role/table/action có expected allow/deny.

### P03 — Một master data, một sự thật công khai

**Exit của phase:** website, Supabase, RAG và sitemap cùng đọc một dataset version; từng POI có trạng thái review và nguồn.

- [ ] **P03-001** — Tạo báo cáo count/ID cho từng source hiện có. **Proof:** CSV, frontend JSON, verified JSON, DB snapshot đều có count/checksum.
- [ ] **P03-002** — Tạo bảng concordance cho một ID giữa các nguồn. **Proof:** status `match`, `missing`, hoặc `conflict`.
- [ ] **P03-003** — Tạo review queue cho toàn bộ ID conflict. **Proof:** mỗi conflict có ticket riêng.
- [ ] **P03-004** — Xử lý một duplicate POI trong review queue. **Proof:** quyết định merge/keep/reject có nguồn.
- [ ] **P03-005** — Xử lý một POI ngoài bounding box trong review queue. **Proof:** sửa hoặc exception có căn cứ.
- [ ] **P03-006** — Xử lý một nhãn commune không có trong glossary. **Proof:** mapped hoặc rejected.
- [ ] **P03-007** — Xác minh một hotline khẩn cấp. **Proof:** nguồn chính thức, `verified_at`, owner.
- [ ] **P03-008** — Xác minh một claim văn hóa/ẩm thực mâu thuẫn. **Proof:** nguồn và reviewer chuyên môn.
- [ ] **P03-009** — Tạo template review cho *một* POI. **Proof:** có các field source, evidence, reviewer, expiry.
- [ ] **P03-010** — Áp template P03-009 cho một POI. **Proof:** record review hoàn chỉnh.
- [ ] **P03-011** — Gán `verification_status` cho một POI đã review. **Proof:** trạng thái được lưu trong canonical schema.
- [ ] **P03-012** — Gán `verified_at` cho một POI đã review. **Proof:** timestamp có nguồn.
- [ ] **P03-013** — Gán `source_url` cho một field được xác minh. **Proof:** URL truy cập được và đúng field.
- [ ] **P03-014** — Xuất canonical dataset version đầu tiên từ các record đã duyệt. **Proof:** manifest có schema version/checksum/count.
- [ ] **P03-015** — Viết validator schema cho canonical dataset. **Proof:** fixture sai schema fail.
- [ ] **P03-016** — Viết validator uniqueness cho canonical ID. **Proof:** fixture duplicate fail.
- [ ] **P03-017** — Viết validator GPS boundary. **Proof:** fixture ngoài vùng fail.
- [ ] **P03-018** — Viết validator commune glossary. **Proof:** fixture nhãn lạ fail.
- [ ] **P03-019** — Cho static frontend data sinh từ canonical manifest. **Proof:** build artifact ghi cùng version.
- [ ] **P03-020** — Cho sitemap sinh từ canonical manifest. **Proof:** sitemap count khớp manifest.
- [ ] **P03-021** — Chỉ cho phép RAG ingest canonical records `verified`. **Proof:** fixture unverified không được ingest.
- [ ] **P03-022** — Chạy Smart Delta Sync ở dry-run. **Proof:** diff report có `skip/create/patch/error` chính xác.
- [ ] **P03-023** — Sửa parser Smart Delta Sync cho field `address`. **Proof:** unit test address diff pass.
- [ ] **P03-024** — Sửa parser Smart Delta Sync cho field `description`. **Proof:** unit test description diff pass.
- [ ] **P03-025** — Kiểm tra HTTP response trước khi tăng counter sync. **Proof:** fake 4xx/5xx không được tính success.
- [ ] **P03-026** — Mở rộng itinerary diff với `for_whom`. **Proof:** fixture khác `for_whom` tạo PATCH.
- [ ] **P03-027** — Mở rộng itinerary diff với `budget_range`. **Proof:** fixture khác budget tạo PATCH.
- [ ] **P03-028** — Chạy sync production sau approval G2 và snapshot backup. **Proof:** post-sync count/checksum khớp manifest.

> Quy tắc mở rộng: P03-004 đến P03-013 là task mẫu theo **một record/một field/một claim**. Không đóng bulk ticket “clean data”; mỗi record conflict sinh ticket riêng từ P03-003.

### P04 — AI có thể kiểm chứng, không tự gắn nhãn “đã xác minh”

**Exit của phase:** một câu trả lời truy vết được nguồn, không đọc/ghi context bị anonymous poisoning, và failover phản ánh đúng hành vi đã công bố.

- [ ] **P04-001** — Thêm input-length limit cho chat query. **Proof:** payload quá ngưỡng nhận 413/400.
- [ ] **P04-002** — Chọn format session identifier. **Proof:** contract nêu UUID/server-issued hoặc cơ chế đã duyệt.
- [ ] **P04-003** — Thay session ID `Math.random()` tại `ChatbotPageClient`. **Proof:** test tạo session hợp lệ.
- [ ] **P04-004** — Thay session ID `Math.random()` tại `ChatbotWidget`. **Proof:** test tạo session hợp lệ.
- [ ] **P04-005** — Xác thực session ownership trước khi đọc chat history. **Proof:** session khác owner bị từ chối.
- [ ] **P04-006** — Tạo embedding đúng một lần trong chat request. **Proof:** spy test đếm một call.
- [ ] **P04-007** — Thay query token search tuần tự bằng một truy vấn giới hạn. **Proof:** query-count test giảm đúng mục tiêu đã ghi.
- [ ] **P04-008** — Di chuyển user text khỏi PostgREST `.or` string interpolation. **Proof:** payload filter syntax không thay đổi điều kiện truy vấn.
- [ ] **P04-009** — Không default `is_verified` thành true. **Proof:** missing field không được trả `verified`.
- [ ] **P04-010** — Lọc retrieval theo `verification_status` đã duyệt. **Proof:** unverified fixture không xuất hiện.
- [ ] **P04-011** — Ghi provider thực tế vào audit log. **Proof:** Groq/Gemini/fallback có giá trị khác nhau.
- [ ] **P04-012** — Ghi model thực tế vào audit log. **Proof:** model ID khớp request đã hoàn tất.
- [ ] **P04-013** — Ghi latency thực tế vào audit log. **Proof:** latency là số đo, không phải constant.
- [ ] **P04-014** — Chọn một chiến lược provider: sequential failover hoặc timed hedge. **Proof:** Decision Record mô tả quota/latency trade-off.
- [ ] **P04-015** — Áp timeout đã chọn cho Groq. **Proof:** fault test chứng minh thời điểm failover.
- [ ] **P04-016** — Viết integration test provider primary timeout. **Proof:** fallback trả structured result.
- [ ] **P04-017** — Viết integration test provider primary stream error. **Proof:** response không treo và không trả partial sai.
- [ ] **P04-018** — Thêm output schema validator cho câu trả lời chatbot. **Proof:** malformed provider output bị chặn/fallback.
- [ ] **P04-019** — Thêm citation coverage check cho factual answer. **Proof:** factual fixture không nguồn không qua gate.
- [ ] **P04-020** — Viết adversarial prompt-injection fixture. **Proof:** fixture không thay system/data policy.
- [ ] **P04-021** — Viết poisoned-knowledge fixture. **Proof:** untrusted context không được dùng làm fact.
- [ ] **P04-022** — Kiểm tra SOS payload với nguồn từng contact. **Proof:** từng số có `source_url` và `verified_at`.
- [ ] **P04-023** — Bỏ sleep nhân tạo khỏi SOS response path. **Proof:** unit test xác nhận không gọi delay helper.

### P05 — Privacy, test và vận hành có thể lặp lại

**Exit của phase:** người dùng biết dữ liệu nào được lưu; hệ thống có test, giới hạn và quan sát được production.

#### P05-A. Privacy

- [ ] **P05-001** — Lập data inventory cho một field chat. **Proof:** field, purpose, retention, access role được ghi.
- [ ] **P05-002** — Quyết định retention cho `chat_sessions`. **Proof:** Decision Record G3 có số ngày/điều kiện.
- [ ] **P05-003** — Tạo job xóa `chat_sessions` hết hạn. **Proof:** fixture expired bị xóa.
- [ ] **P05-004** — Tạo job xóa `chat_logs` hết hạn. **Proof:** fixture expired bị xóa.
- [ ] **P05-005** — Tạo endpoint hoặc workflow xóa một session của chủ sở hữu. **Proof:** ownership test pass.
- [ ] **P05-006** — Sửa một câu privacy notice về nơi lưu hội thoại. **Proof:** khớp hành vi code.
- [ ] **P05-007** — Sửa một câu privacy notice về quyền truy cập. **Proof:** khớp RLS matrix.
- [ ] **P05-008** — Thêm consent UI nếu G3 yêu cầu. **Proof:** no-consent path không ghi dữ liệu không được phép.

#### P05-B. Quality và observability

- [ ] **P05-009** — Tách network call khỏi import-time của một test script. **Proof:** test import không gọi mạng.
- [ ] **P05-010** — Sửa import `BaseExporter` trong một test đang fail. **Proof:** test collection pass.
- [ ] **P05-011** — Thêm regression test cho alias `Hồ Tà Pạ`. **Proof:** deduplicate test pass.
- [ ] **P05-012** — Chọn backend distributed cho rate limit. **Proof:** Decision Record về Redis/managed provider/chi phí.
- [ ] **P05-013** — Chuyển rate limiter sang backend đã chọn. **Proof:** cross-instance integration test.
- [ ] **P05-014** — Đặt rate limit riêng cho chat query. **Proof:** vượt quota nhận 429 chuẩn.
- [ ] **P05-015** — Đặt rate limit riêng cho admin mutation. **Proof:** vượt quota nhận 429 chuẩn.
- [ ] **P05-016** — Ghi metric p95 chatbot latency. **Proof:** request thành công tạo metric.
- [ ] **P05-017** — Ghi metric provider fallback rate. **Proof:** fallback fixture tăng metric.
- [ ] **P05-018** — Ghi metric retrieval zero-result rate. **Proof:** fixture zero-result tăng metric.
- [ ] **P05-019** — Thêm CI build job. **Proof:** clean checkout build được.
- [ ] **P05-020** — Thêm CI lint job. **Proof:** lint failure làm CI fail.
- [ ] **P05-021** — Thêm CI unit-test job. **Proof:** test failure làm CI fail.
- [ ] **P05-022** — Thêm CI migration replay job. **Proof:** migration failure làm CI fail.
- [ ] **P05-023** — Thêm CI RLS matrix job. **Proof:** policy regression làm CI fail.
- [ ] **P05-024** — Viết runbook cho provider outage. **Proof:** có trigger, owner, rollback, verification.
- [ ] **P05-025** — Viết runbook cho data rollback. **Proof:** có snapshot version và restore verification.

### P06 — Đồng bộ giao diện, tài liệu và giới hạn claim

**Exit của phase:** UI không nói nhiều hơn dữ liệu có thể chứng minh; docs không còn hai roadmap cùng tranh quyền.

- [ ] **P06-001** — Tạo danh sách claim số lượng POI trên UI/docs. **Proof:** file/line/current claim/source.
- [ ] **P06-002** — Sửa một claim POI ở UI theo canonical manifest. **Proof:** rendered value khớp manifest.
- [ ] **P06-003** — Sửa một claim POI ở tài liệu theo canonical manifest. **Proof:** doc có version/source.
- [ ] **P06-004** — Tạo danh sách tên đơn vị hành chính đang hiển thị. **Proof:** file/line/current label.
- [ ] **P06-005** — Sửa một label hành chính theo glossary G1. **Proof:** UI test/snapshot pass.
- [ ] **P06-006** — Tạo inventory emoji theo component. **Proof:** mỗi occurrence có file/component.
- [ ] **P06-007** — Thay một emoji bằng Lucide/icon theo design system. **Proof:** component render đúng, không thêm asset placeholder.
- [ ] **P06-008** — Tạo inventory ảnh stock/fallback. **Proof:** URL/component/feature owner.
- [ ] **P06-009** — Xóa một fallback ảnh stock. **Proof:** failure state trung thực, không hiển thị ảnh không liên quan.
- [ ] **P06-010** — Cập nhật một tài liệu kiến trúc theo deployment inventory P00-003. **Proof:** docs link route/build thực tế.
- [ ] **P06-011** — Cập nhật một tài liệu AI theo behavior test P04. **Proof:** không còn claim race/RAG chưa tồn tại.
- [ ] **P06-012** — Cập nhật một tài liệu data theo G1/G2. **Proof:** số liệu có manifest version.
- [ ] **P06-013** — Gắn nhãn archived cho một tài liệu superseded. **Proof:** banner link tới tài liệu authority.

> Quy tắc mở rộng: P06-002, P06-003, P06-005, P06-007, P06-009 đến P06-013 là một task cho **một occurrence/một component/một document**. Không mở PR “dọn toàn bộ UI/docs”.

### P07 — Chứng minh GO/NO-GO

**Exit của phase:** release owner có đủ evidence để chọn GO hoặc NO-GO, không dựa trên cảm nhận.

- [ ] **P07-001** — Chạy authenticated-admin negative test. **Proof:** toàn bộ mutation route từ P01 từ chối anonymous.
- [ ] **P07-002** — Chạy SSRF negative test suite. **Proof:** private/redirect/scheme payload đều bị chặn.
- [ ] **P07-003** — Chạy fresh migration replay. **Proof:** database trống dựng thành công.
- [ ] **P07-004** — Chạy RLS matrix suite. **Proof:** tất cả expected allow/deny pass.
- [ ] **P07-005** — Chạy canonical data validators. **Proof:** manifest hiện tại pass.
- [ ] **P07-006** — So sánh DB count/checksum với canonical manifest. **Proof:** report không còn divergence chưa chấp thuận.
- [ ] **P07-007** — Chạy chatbot provider failure suite. **Proof:** timeout/stream-error/output-invalid đều có behavior đúng.
- [ ] **P07-008** — Chạy privacy retention/deletion suite. **Proof:** expired và owner-request fixture pass.
- [ ] **P07-009** — Chạy build và lint clean. **Proof:** zero error theo rule đã duyệt.
- [ ] **P07-010** — Chạy mobile accessibility smoke test. **Proof:** keyboard, focus, reduced motion và contrast checklist pass.
- [ ] **P07-011** — Review open P0/P1 risk register. **Proof:** không còn risk chưa accept.
- [ ] **P07-012** — Tạo Decision Record G4. **Proof:** release owner chọn GO/NO-GO và ký evidence links.

## 4. Những việc bị hoãn rõ ràng

Các việc sau không được ưu tiên trước P07, trừ khi chúng là một phần trực tiếp của remediation: thêm model AI mới, phát triển dashboard partner, booking/payment, crawler expansion, beta marketing, analytics growth, thêm POI/video hàng loạt và rewrite Python/Next toàn bộ.

## 5. Definition of Done cho một phase

Một phase chỉ hoàn tất khi tất cả task trong phase đều có bằng chứng, các dependency đã pass và không có P0/P1 mới phát hiện mà chưa được đưa vào risk register. “Build pass”, “đã merge” hoặc “đã sửa UI” không phải bằng chứng hoàn tất một phase.
