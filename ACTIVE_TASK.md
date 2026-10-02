# ACTIVE TASK — UNIFIED EXECUTION STREAM (LUỒNG THỐNG NHẤT)

> **CƠ CHẾ ĐIỀU HÀNH DUY NHẤT:**  
> Hệ thống đã hợp nhất toàn bộ Luồng A (App Security) và Luồng B (DB & Data Governance) thành **MỘT LUỒNG TUẦN TỰ DUY NHẤT**.  
> Tại mọi thời điểm, chỉ có **ĐÚNG 1 TASK ACTIVE DUY NHẤT** được thực thi và nghiệm thu bằng bằng chứng thực tế (production-real evidence).  
> Tài liệu tham chiếu: [Execution Board](docs/13_TWO_STREAM_EXECUTION_BOARD.md) · [Production Remediation Plan](docs/12_PRODUCTION_REMEDIATION_PLAN.md).

---

#### 🎯 Task Đang Mở (Current Active Task)

### P05-008 — Thêm consent UI nếu G3 yêu cầu (Proof: no-consent path không ghi dữ liệu không được phép)

- **Status:** `ready` / `active` cho Wave W5 (Privacy, User Data & Extended Observability).
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Mục tiêu duy nhất:** Rà soát yêu cầu đồng thuận người dùng (Consent Requirement) theo Decision Gate G3 (`docs/technical-spec/DECISION_RECORD_CHAT_SESSIONS_RETENTION.md` & `docs/technical-spec/CHAT_DATA_INVENTORY.md` tuân thủ Điều 17 Nghị định 13/2023/NĐ-CP). Bổ sung Banner/Consent UI minh bạch tại giao diện Chatbot, chứng minh luồng từ chối đồng thuận (no-consent path) không lưu trữ lịch sử phiên vào cơ sở dữ liệu trên máy chủ.
- **Next task sau P05-008:** P05-009 — Tách network call khỏi import-time của một test script (Proof: test import không gọi mạng).

---

## 📋 Lộ Trình Tuần Tự (Unified Linear Roadmap)

Mỗi task thực hiện tuần tự, nghiệm thu proof xong mới chuyển task kế tiếp:

1. 🟢 **`P02-012`** *(Hoàn thành)*: Thêm CHECK rating `[0.0, 5.0]` trên `public.places` (hoàn tất bộ 3 constraint: lat, lng, rating).
2. 🟢 **`P01-029`** *(Hoàn thành)*: Thu hồi admin session tại logout và xóa cookie (`/api/v1/admin/auth/logout/route.ts`).
3. 🟢 **`P01-030`** *(Hoàn thành)*: Bỏ `password.trim()` tại `src/app/admin/login/page.tsx` để bảo toàn nguyên vẹn byte mật khẩu.
4. 🟢 **`P01-009`** *(Hoàn thành)*: Xây dựng helper guard server-side dùng chung (`verifyAdminSession(req)`).
5. 🟢 **`P01-010`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `places`.
6. 🟢 **`P01-011`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `videos`.
7. 🟢 **`P01-012`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `itineraries`.
8. 🟢 **`P01-013`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `knowledge-base`.
9. 🟢 **`P01-014`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `videos/ai-scan`.
10. 🟢 **`P01-015`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `revalidate`.
11. 🟢 **`P01-016`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `upload`.
12. 🟢 **`P01-017`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `scrape-images`.
13. 🟢 **`P01-018`** *(Hoàn thành)*: Bọc guard bảo vệ route admin `gmaps-scraper`.
14. 🟢 **`P01-019`** *(Hoàn thành)*: Xóa bỏ fallback `service_role` → `anon` trong server client factory để fail-closed hoàn toàn (`dataCache.ts` & `serverSupabase.ts`).
15. 🟢 **`P02-023`** *(Hoàn thành)*: Fresh migration replay test toàn bộ chuỗi migration từ database trống.
16. 🟢 **`P02-024`** *(Hoàn thành)*: RLS matrix test tổng thể xác nhận quyền truy cập của mọi role trên mọi bảng (196/196 test pass 100%).
17. 🟢 **`P01-020`** *(Hoàn thành)*: Tạo URL validation contract cho server-side fetch (91/91 tests pass 100%).
18. 🟢 **`P01-021`** *(Hoàn thành)*: Chặn scheme không phải HTTPS tại `scrape-images` (17/17 tests pass 100%).
19. 🟢 **`P01-022`** *(Hoàn thành)*: Chặn private/loopback/link-local IP tại `scrape-images` (32/32 tests pass 100%).
20. 🟢 **`P01-023`** *(Hoàn thành)*: Chỉ cho redirect sang allowlist tại `scrape-images` (41/41 tests pass 100%).
21. 🟢 **`P01-024`** *(Hoàn thành)*: Áp URL validation contract vào `gmaps-scraper` (35/35 tests pass 100%).
22. 🟢 **`P01-025`** *(Hoàn thành)*: Đặt request body-size limit cho `upload` (199/199 tests pass 100%).
23. 🟢 **`P01-026`** *(Hoàn thành)*: Đặt MIME allowlist cho `upload` (207/207 tests pass 100%).
24. 🟢 **`P01-027`** *(Hoàn thành)*: Bỏ Unsplash fallback khỏi `upload` (207/207 tests pass 100%).
25. 🟢 **`P01-028`** *(Hoàn thành)*: Bỏ Unsplash fallback khỏi admin place creation (207/207 tests pass 100%).
26. 🟢 **`P03-001`** *(Hoàn thành)*: Tạo báo cáo count/ID cho từng source hiện có (CSV, frontend JSON, verified JSON, DB snapshot).
27. 🟢 **`P03-002`** *(Hoàn thành)*: Tạo bảng concordance cho một ID giữa các nguồn (status match, missing, hoặc conflict).
28: 28. 🟢 **`P03-003`** *(Hoàn thành)*: Tạo review queue cho toàn bộ ID conflict (102 tickets độc lập từ CRQ-001 đến CRQ-102).
29. 🟢 **`P03-004`** *(Hoàn thành)*: Xử lý một duplicate/conflict POI trong review queue (Ticket CRQ-001: Chùa Xà Tón).
30. 🟢 **`P03-005`** *(Hoàn thành)*: Xử lý một POI ngoài bounding box trong review queue (hoặc ngoại lệ có căn cứ).
31. 🟢 **`P03-006`** *(Hoàn thành)*: Xử lý một nhãn commune không có trong glossary (Chuẩn hóa danh mục 15 xã/thị trấn Tri Tôn).
32. 🟢 **`P03-007`** *(Hoàn thành)*: Xác minh một hotline khẩn cấp (Nguồn chính thức, verified_at, owner).
33. 🟢 **`P03-008`** *(Hoàn thành)*: Xác minh một claim văn hóa/ẩm thực mâu thuẫn (Nguồn và reviewer chuyên môn).
34. 🟢 **`P03-009`** *(Hoàn thành)*: Tạo template review cho *một* POI (Source, evidence, reviewer, expiry).
35. 🟢 **`P03-010`** *(Hoàn thành)*: Áp template P03-009 cho một POI (Record review hoàn chỉnh).
36. 🟢 **`P03-011`** *(Hoàn thành)*: Gán `verification_status` cho một POI đã review (Lưu trong canonical schema).
37. 🟢 **`P03-012`** *(Hoàn thành)*: Gán `verified_at` cho một POI đã review (Timestamp có nguồn).
38: 🟢 **`P03-013`** *(Hoàn thành)*: Gán `source_url` cho một field được xác minh (URL truy cập được và đúng field).
39. 🟢 **`P03-014`** *(Hoàn thành)*: Xuất canonical dataset version đầu tiên từ các record đã duyệt (Manifest có schema version/checksum/count).
40. 🟢 **`P03-015`** *(Hoàn thành)*: Viết validator schema cho canonical dataset (Fixture sai schema fail).
41. 🟢 **`P03-016`** *(Hoàn thành)*: Viết validator uniqueness cho canonical ID (Fixture duplicate fail).
42. 🟢 **`P03-017`** *(Hoàn thành)*: Viết validator GPS boundary (Fixture ngoài vùng fail).
43. 🟢 **`P03-018`** *(Hoàn thành)*: Viết validator commune glossary (Fixture nhãn lạ fail).
44. 🟢 **`P03-019`** *(Hoàn thành)*: Cho static frontend data sinh từ canonical manifest (Build artifact ghi cùng version).
45. 🟢 **`P03-020`** *(Hoàn thành)*: Cho sitemap sinh từ canonical manifest (Sitemap count khớp manifest).
46. 🟢 **`P03-021`** *(Hoàn thành)*: Chỉ cho phép RAG ingest canonical records verified (Fixture unverified không được ingest).
47. 🟢 **`P03-022`** *(Hoàn thành)*: Chạy Smart Delta Sync ở dry-run (Diff report có skip/create/patch/error chính xác).
48. 🟢 **`P03-023`** *(Hoàn thành)*: Sửa parser Smart Delta Sync cho field `address` (Unit test address diff pass).
49. 🟢 **`P03-024`** *(Hoàn thành)*: Sửa parser Smart Delta Sync cho field `description` (Unit test description diff pass).
50. 🟢 **`P03-025`** *(Hoàn thành)*: Kiểm tra HTTP response trước khi tăng counter sync (Fake 4xx/5xx không được tính success).
51. 🟢 **`P03-026`** *(Hoàn thành)*: Mở rộng itinerary diff với `for_whom` (Fixture khác `for_whom` tạo PATCH).
52. 🟢 **`P03-027`** *(Hoàn thành)*: Mở rộng itinerary diff với `budget_range` (Fixture khác budget tạo PATCH).
53. 🟢 **`P03-028`** *(Hoàn thành)*: Chạy sync production sau approval G2 và snapshot backup (Post-sync count/checksum khớp manifest).
54. 🟢 **`P04-001`** *(Hoàn thành)*: Thêm input-length limit cho chat query (Payload quá ngưỡng nhận 413/400).
55. 🟢 **`P04-002`** *(Hoàn thành)*: Chọn format session identifier (Contract nêu UUID/server-issued hoặc cơ chế đã duyệt).
56. 🟢 **`P04-003`** *(Hoàn thành)*: Thay session ID `Math.random()` tại `ChatbotPageClient` (Proof: test tạo session hợp lệ).
57. 🟢 **`P04-004`** *(Hoàn thành)*: Thay session ID `Math.random()` tại `ChatbotWidget` (Proof: test tạo session hợp lệ).
58. 🟢 **`P04-005`** *(Hoàn thành)*: Xác thực session ownership trước khi đọc chat history (Proof: session khác owner bị từ chối).
59. 🟢 **`P04-006`** *(Hoàn thành)*: Tạo embedding đúng một lần trong chat request (Proof: spy test đếm một call).
60. 🟢 **`P04-007`** *(Hoàn thành)*: Thay query token search tuần tự bằng một truy vấn giới hạn (Proof: query-count test giảm đúng mục tiêu đã ghi).
61. 🟢 **`P04-008`** *(Hoàn thành)*: Di chuyển user text khỏi PostgREST `.or` string interpolation (Proof: payload filter syntax không thay đổi điều kiện truy vấn).
62. 🟢 **`P04-009`** *(Hoàn thành)*: Không default `is_verified` thành true (Proof: missing field không được trả `verified`).
63. 🟢 **`P04-010`** *(Hoàn thành)*: Lọc retrieval theo `verification_status` đã duyệt (Proof: unverified fixture không xuất hiện).
64. 🟢 **`P04-011`** *(Hoàn thành)*: Ghi provider thực tế vào audit log (Proof: Groq/Gemini/fallback có giá trị khác nhau).
65. 🟢 **`P04-012`** *(Hoàn thành)*: Ghi model thực tế vào audit log (Proof: model ID khớp request đã hoàn tất).
66: 66. 🟢 **`P04-013`** *(Hoàn thành)*: Ghi latency thực tế vào audit log (Proof: latency là số đo, không phải constant).
67. 🟢 **`P04-014`** *(Hoàn thành)*: Chọn một chiến lược provider: sequential failover hoặc timed hedge (Proof: Decision Record mô tả quota/latency trade-off).
68. 🟢 **`P04-015`** *(Hoàn thành)*: Áp timeout đã chọn cho Groq (Proof: fault test chứng minh thời điểm failover).
69. 🟢 **`P04-016`** *(Hoàn thành)*: Viết integration test provider primary timeout (Proof: fallback trả structured result).
70. 🟢 **`P04-017`** *(Hoàn thành)*: Viết integration test provider primary stream error (Proof: response không treo và không trả partial sai).
71. 🟢 **`P04-018`** *(Hoàn thành)*: Thêm output schema validator cho câu trả lời chatbot (Proof: malformed provider output bị chặn/fallback).
72. 🟢 **`P04-019`** *(Hoàn thành)*: Thêm citation coverage check cho factual answer (Proof: factual fixture không nguồn không qua gate).
73. 🟢 **`P04-020`** *(Hoàn thành)*: Viết adversarial prompt-injection fixture (Proof: fixture không thay system/data policy).
74. 🟢 **`P04-021`** *(Hoàn thành)*: Viết poisoned-knowledge fixture (Proof: untrusted context không được dùng làm fact).
75. 🟢 **`P04-022`** *(Hoàn thành)*: Kiểm tra SOS payload với nguồn từng contact (Proof: từng số có `source_url` và `verified_at`).
76. 🟢 **`P04-023`** *(Hoàn thành)*: Bỏ sleep nhân tạo khỏi SOS response path (Proof: unit test xác nhận không gọi delay helper).
77. 🟢 **`P05-001`** *(Hoàn thành)*: Lập data inventory cho một field chat (Proof: field, purpose, retention, access role được ghi).
78. 🟢 **`P05-002`** *(Hoàn thành)*: Quyết định retention cho `chat_sessions` (Proof: Decision Record G3 có số ngày/điều kiện).
79. 🟢 **`P05-003`** *(Hoàn thành)*: Tạo job xóa `chat_sessions` hết hạn (Proof: fixture expired bị xóa).
80. 🟢 **`P05-004`** *(Hoàn thành)*: Tạo job xóa `chat_logs` hết hạn (Proof: fixture expired bị xóa).
81. 🟢 **`P05-005`** *(Hoàn thành)*: Tạo endpoint hoặc workflow xóa một session của chủ sở hữu (Proof: ownership test pass).
82. 🟢 **`P05-006`** *(Hoàn thành)*: Sửa một câu privacy notice về nơi lưu hội thoại (Proof: khớp hành vi code).
83. 🟢 **`P05-007`** *(Hoàn thành)*: Sửa một câu privacy notice về quyền truy cập (Proof: khớp RLS matrix).
84. 🟡 **`P05-008`** *(Đang mở)*: Thêm consent UI nếu G3 yêu cầu (Proof: no-consent path không ghi dữ liệu không được phép).

---

## 📜 Lịch Sử Task Đã Hoàn Thành (Consolidated Completed Records)

### P05-007 — Sửa một câu privacy notice về quyền truy cập (Proof: khớp RLS matrix)
- **Status:** `done` tại `frontend/src/app/privacy/page.tsx` và `frontend/scripts/privacy-notice-access-rights-concordance.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Sửa đổi toàn diện Mục 5 tại trang Chính Sách Bảo Mật (`frontend/src/app/privacy/page.tsx`): công bố tiêu chuẩn bảo vệ không tin cậy (Zero-Trust) và ma trận khóa chặt phân quyền cấp hàng (Row Level Security - RLS Matrix Lockdown theo chuẩn `P02-024`) trên cơ sở dữ liệu Supabase PostgreSQL.
  - Phân định rành mạch 3 tầng phân quyền dữ liệu khớp 100% với RLS Lockdown Matrix (`supabase/migrations/20260924_p02_024_rls_lockdown_client_roles_matrix.sql`) và Data Inventory chuẩn tắc (`DATA-INVENTORY-CHAT-001` trong `frontend/src/lib/chatDataInventory.ts`):
    1. Khách vãng lai (`anon`) & tài khoản thông thường (`authenticated`): bị tước bỏ 100% quyền truy cập trực tiếp (`REVOKE ALL: SELECT, INSERT, UPDATE, DELETE`) trên các bảng dữ liệu nhạy cảm (`chat_sessions`, `chat_logs`, `audit_logs`). Không ai có thể dùng PostgREST client từ trình duyệt để đọc trộm hay sửa đổi dữ liệu phiên người khác. Đối với dữ liệu công cộng (`places`), quyền đọc bị giới hạn chỉ hiển thị các bản ghi đã xác minh (`is_verified = true`).
    2. Cổng kết nối máy chủ an toàn (`service_role`): chỉ được kích hoạt độc quyền tại Next.js Server API Gateway sau khi kiểm thực thành công chữ ký mật mã HMAC-SHA256 (`x-chat-session-token`) bằng so sánh thời gian hằng số `timingSafeEqual`.
    3. Quản trị viên hệ thống (`admin`): tuyệt đối không được đọc nội dung chat thô của cá nhân du khách, chỉ quan sát các chỉ số vận hành tổng hợp (SLO, latency p95, phân bổ model) qua nhật ký kiểm toán bất biến `audit_logs`.
  - Bộ kiểm thử tự động `privacy-notice-access-rights-concordance.test.mjs` đạt 6/6 assertions pass 100%: (1) Explicit Zero-Trust & RLS Matrix Disclosure; (2) Anon & Authenticated Direct Access Denial; (3) service_role Gateway & HMAC Verification; (4) Admin Privacy Boundary; (5) DDL Migration & Data Inventory Specification Concordance; (6) Negative & Integrity Invariants (Zero demo/mock). Toàn bộ 181 routes Next.js 16 biên dịch thành công (exit code 0).

### P05-006 — Sửa một câu privacy notice về nơi lưu hội thoại (Proof: khớp hành vi code)
- **Status:** `done` tại `frontend/src/app/privacy/page.tsx`, `frontend/src/components/ChatbotWidget.tsx`, `frontend/src/components/ChatbotPageClient.tsx`, và `frontend/scripts/privacy-notice-chat-storage-concordance.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Sửa đổi toàn diện câu tuyên bố quyền riêng tư tại trang `frontend/src/app/privacy/page.tsx` (Mục 3 và Mục 4 chuyên biệt): xóa bỏ triệt để câu nói cũ gây hiểu lầm rằng toàn bộ nội dung trò chuyện chỉ lưu trong LocalStorage trên điện thoại; công khai minh bạch nơi lưu trữ thực tế trên máy chủ tại bảng `public.chat_sessions` ở cơ sở dữ liệu Supabase PostgreSQL (tối đa 20 lượt trao đổi gần nhất), gắn với mã phiên ẩn danh UUID v4 và chữ ký bảo vệ HMAC-SHA256.
  - Tuyên bố chính xác vòng đời lưu trữ tự hủy tối đa 24 giờ kể từ mốc tương tác cuối cùng (sliding window TTL 24h) tuân thủ Nghị định 13/2023/NĐ-CP và Quyết định Kiến trúc G3 (`DR-G3-RETENTION-SESSIONS-001`), được hệ thống tự động dọn dẹp sạch sẽ bởi scheduled job (P05-003).
  - Tuyên bố quyền xóa chủ động ngay lập tức (Right to Erasure) qua nút "Xóa chat", đồng thời nâng cấp cả hai client component `ChatbotWidget.tsx` và `ChatbotPageClient.tsx` kích hoạt lệnh gọi API thực tế `DELETE /api/v1/chat/session` (P05-005) kèm token sở hữu HMAC, bảo đảm 100% mọi nút bấm trên UI đều map tới backend operation thực tế (RULE 01).
  - Bộ kiểm thử tự động `privacy-notice-chat-storage-concordance.test.mjs` đạt 5/5 assertions pass 100%: (1) Explicit Chat Storage Disclosure Proof; (2) Code Behavior Concordance Proof với runtime constants và Data Inventory; (3) UI Action to Backend API Concordance Proof; (4) Negative Invariant: No False Claim of LocalStorage Only; (5) Legal & Architectural Authority Concordance (Decree 13/2023 & DR-G3). Toàn bộ 181 routes Next.js 16 biên dịch thành công (exit code 0).

### P05-005 — Tạo endpoint hoặc workflow xóa một session của chủ sở hữu (Proof: ownership test pass)
- **Status:** `done` tại `frontend/src/lib/chatSessionDeletionService.ts`, `frontend/src/app/api/v1/chat/session/route.ts`, và `frontend/scripts/chat-session-deletion.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module nghiệp vụ `chatSessionDeletionService.ts` (`executeChatSessionDeletion`) thực thi quyền được lãng quên / xóa bỏ dữ liệu tức thì (Right to Erasure / Immediate Erasure) theo Nghị định 13/2023/NĐ-CP và Decision Record G3, kiểm thực tính hợp lệ của UUID v4 (`validateSessionId`) và chữ ký mật mã HMAC-SHA256 (`verifySessionOwnershipToken`) trước khi cho phép thao tác xóa trên database.
  - Xây dựng REST API endpoint `DELETE /api/v1/chat/session` (`frontend/src/app/api/v1/chat/session/route.ts`) hỗ trợ nhận diện phiên qua Query Params (`sessionId`/`session_id`) hoặc JSON Body, trích xuất token sở hữu qua đa kênh (`x-chat-session-token` header, `triton_chat_session_token` cookie, hoặc `session_token` body), và tự động xóa bỏ cookie phiên khi hoàn tất xóa thành công.
  - Chứng minh bằng chứng thực tế (Proof):
    1. Chủ sở hữu hợp pháp (Alice) với đúng UUID v4 và HMAC token xóa thành công phiên hội thoại của mình, trả về 200 OK và bản ghi bị xóa sạch 100% khỏi cơ sở dữ liệu (`chat_sessions`).
    2. Kẻ tấn công mang token giả mạo/sai lệch bị từ chối dứt điểm với HTTP 403 Forbidden (`INVALID_SESSION_OWNERSHIP`), phiên của nạn nhân (Bob) được bảo toàn 100%.
    3. Yêu cầu thiếu token (empty, null, undefined) bị từ chối 403 và phiên được bảo toàn 100%.
    4. Tráo token giữa các phiên (token của Charlie dùng để xóa phiên của David) bị chặn đứng 403, cả hai phiên đều được giữ nguyên.
    5. Mã phiên dị tật/non-UUID bị từ chối 400 Bad Request (`INVALID_SESSION_ID`).
    6. Kiểm chứng trích xuất token qua cả 3 kênh Header, Cookie, Body.
  - Bộ kiểm thử tự động `chat-session-deletion.test.mjs` đạt 7/7 assertions pass 100%; build production Next.js 16 biên dịch thành công 181/181 routes (exit code 0).

### P05-004 — Tạo job xóa `chat_logs` hết hạn (Proof: fixture expired bị xóa)
- **Status:** `done` tại `supabase/migrations/20261002_p05_004_cleanup_expired_chat_logs.sql`, `frontend/src/lib/chatLogCleanupService.ts`, `frontend/src/app/api/v1/cron/cleanup-chat-logs/route.ts`, và `frontend/scripts/chat-logs-cleanup-job.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Bãi bỏ quy tắc PostgreSQL cũ `chat_logs_no_delete` (`DO INSTEAD NOTHING`) ngăn cản lệnh DELETE, đồng thời thu hồi triệt để quyền `DELETE, UPDATE` từ `PUBLIC, anon, authenticated` và chỉ cấp quyền `DELETE` duy nhất cho `service_role`.
  - Ban hành migration PostgreSQL DDL `20261002_p05_004_cleanup_expired_chat_logs.sql` tạo hàm RPC `public.cleanup_expired_chat_logs(p_batch_limit INT DEFAULT 1000)` với `SECURITY DEFINER`, xóa theo lô an toàn các bản ghi kiểm toán `WHERE created_at < (NOW() - INTERVAL '30 days')`, chỉ cấp quyền `EXECUTE` duy nhất cho `service_role`.
  - Phát triển module nghiệp vụ `chatLogCleanupService.ts` (`executeChatLogCleanup`, `isChatLogExpired`, `calculateChatLogExpirationDate`, `verifyCleanupAuthorization`) cung cấp cơ chế thực thi dọn dẹp theo lô kèm fallback, và API endpoint `/api/v1/cron/cleanup-chat-logs` bảo vệ bằng `CRON_SECRET` fail-closed.
  - Chứng minh bằng chứng thực tế (Proof): Khi đưa vào 4 fixtures (2 expired: `NOW - 31d`, `NOW - 60d` và 2 active: `NOW - 5d`, `NOW - 29d`), job xóa sạch 100% hai fixture expired trong khi 100% active fixtures được bảo toàn nguyên vẹn; đồng thời kiểm chứng batch limit safeguard chống nghẽn I/O.
  - Bộ kiểm thử tự động `chat-logs-cleanup-job.test.mjs` đạt 6/6 assertions pass 100%; toàn bộ 180 routes Next.js 16 build thành công (exit code 0).

### P05-003 — Tạo job xóa `chat_sessions` hết hạn (Proof: fixture expired bị xóa)
- **Status:** `done` tại `supabase/migrations/20261002_p05_003_cleanup_expired_chat_sessions.sql`, `frontend/src/lib/chatSessionCleanupService.ts`, `frontend/src/app/api/v1/cron/cleanup-chat-sessions/route.ts`, và `frontend/scripts/chat-sessions-cleanup-job.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành migration PostgreSQL DDL `20261002_p05_003_cleanup_expired_chat_sessions.sql` tạo hàm RPC `public.cleanup_expired_chat_sessions(p_batch_limit INT DEFAULT 1000)` với `SECURITY DEFINER`, xóa sạch các phiên `WHERE updated_at < (NOW() - INTERVAL '24 hours')`, tước quyền `anon, authenticated` và chỉ cấp quyền `EXECUTE` duy nhất cho `service_role`.
  - Phát triển module `chatSessionCleanupService.ts` (`executeChatSessionCleanup`, `verifyCleanupAuthorization`) cung cấp cơ chế thực thi dọn dẹp theo lô, hỗ trợ xác thực cron timing-safe qua `timingSafeEqual`, cùng API endpoint `/api/v1/cron/cleanup-chat-sessions` bảo vệ bằng `CRON_SECRET` (fail-closed).
  - Chứng minh bằng chứng thực tế (Proof): Khi đưa vào 4 fixtures (2 expired: `NOW - 25h`, `NOW - 72h` và 2 active: `NOW - 1h`, `NOW - 23h`), job xóa sạch 100% hai fixture expired trong khi 100% active fixtures được bảo toàn nguyên vẹn; đồng thời chứng minh cơ chế sliding window bảo vệ phiên cũ có câu hỏi mới (`NOW - 30m`).
  - Bộ kiểm thử tự động `chat-sessions-cleanup-job.test.mjs` đạt 6/6 assertions pass 100%; build production Next.js 16 biên dịch thành công 179/179 routes (exit code 0).

### P05-002 — Quyết định retention cho `chat_sessions` (Proof: Decision Record G3 có số ngày/điều kiện)
- **Status:** `done` tại `docs/technical-spec/DECISION_RECORD_CHAT_SESSIONS_RETENTION.md`, `frontend/src/lib/chatSessionRetentionPolicy.ts`, và `frontend/scripts/chat-sessions-retention-decision.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành tài liệu Decision Record kỹ thuật chính thức `docs/technical-spec/DECISION_RECORD_CHAT_SESSIONS_RETENTION.md` (mã quy chuẩn `DR-G3-RETENTION-SESSIONS-001`, phê duyệt bởi Lead Technical Architect Chăm Rốch Thi tại Decision Gate G3).
  - Phân tích ma trận đánh đổi định lượng giữa 4 phương án lưu trữ trên 5 tiêu chuẩn cốt lõi (Day-trip Continuity, Privacy Risk, Storage Quota, Cleanup Overhead, Audit Decoupling) và chốt lựa chọn duy nhất: **Phương án B — Thời hạn lưu trữ chính xác 24 giờ (1 ngày - Exactly 24 Hours / 1 Day)** tính từ mốc tương tác cuối cùng (`updated_at`).
  - Xác lập 4 điều kiện quy chuẩn bắt buộc: (1) **Sliding Window TTL:** trigger `trg_chat_sessions_updated_at` cập nhật `updated_at = NOW()` cấp mới thêm 24h cho mỗi câu hỏi tiếp nối; (2) **Expiration Threshold:** bản ghi có `updated_at < NOW() - INTERVAL '24 hours'` coi là hết hạn và đủ điều kiện xóa; (3) **Immediate Right to Erasure:** xóa ngay lập tức khi người dùng yêu cầu (P05-005) kèm session_token hợp lệ không cần chờ 24h; (4) **Audit Decoupling:** nội dung hội thoại thô tự hủy sạch, tách biệt hoàn toàn với lưu vết an ninh bất biến tại `chat_logs` (P05-004).
  - Phát triển module runtime `chatSessionRetentionPolicy.ts` cung cấp các hằng số và hàm logic kiểm tra hạn dùng (`isSessionExpired`, `calculateSessionExpirationDate`, `buildRetentionCleanupQuery`, `assertRetentionPolicyConcordance`) đồng bộ 100% với Data Inventory (P05-001).
  - Bộ kiểm thử tự động `chat-sessions-retention-decision.test.mjs` đạt 6/6 assertions pass 100%; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P05-001 — Lập data inventory cho một field chat (Proof: field, purpose, retention, access role được ghi)
- **Status:** `done` tại `frontend/src/lib/chatDataInventory.ts`, `docs/technical-spec/CHAT_DATA_INVENTORY.md`, và `frontend/scripts/chat-data-inventory.test.mjs`.
- **Luồng:** Thống nhất (Wave W5: Privacy, Data Retention & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module kiểm kê dữ liệu chính thức `chatDataInventory.ts` (`CANONICAL_CHAT_SESSION_ID_INVENTORY`, `REGISTERED_CHAT_FIELD_INVENTORIES`, `getChatFieldInventory`, `validateFieldInventory`) thiết lập quy chuẩn kỹ thuật `DATA-INVENTORY-CHAT-001`.
  - Ban hành tài liệu đặc tả `docs/technical-spec/CHAT_DATA_INVENTORY.md` đối chiếu toàn diện với Nghị định 13/2023/NĐ-CP và hệ thống an ninh dữ liệu Tri Tôn AI.
  - Chứng minh đầy đủ 4 tiêu chuẩn cốt lõi (Proof):
    1. **Field:** `public.chat_sessions.session_id` (TEXT PRIMARY KEY, định dạng UUID v4 RFC 4122).
    2. **Purpose:** Duy trì ngữ cảnh hội thoại đa lượt (multi-turn context continuity), cô lập phiên làm việc (session isolation) và xác thực quyền sở hữu phiên (HMAC-SHA256 ownership authentication).
    3. **Retention:** Lưu trữ 24 giờ kể từ `updated_at`, gắn chỉ mục `chat_sessions_updated_at_idx`, cơ chế thanh lọc tự động TTL định kỳ (P05-002, P05-003) và quyền xóa chủ động của người dùng (P05-005).
    4. **Access Roles:** Khớp 100% với RLS Matrix (P02-024) và migration DDL: `anon` bị tước bỏ 100% quyền trực tiếp (`REVOKE SELECT, INSERT, UPDATE, DELETE FROM anon`), `service_role` chỉ truy cập qua Server-side API Gateway sau khi kiểm thực token sở hữu, `admin` không đọc trực tiếp nội dung phiên trò chuyện cá nhân thô.
  - Bộ kiểm thử tự động `chat-data-inventory.test.mjs` đạt 6/6 assertions pass 100%; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-023 — Bỏ sleep nhân tạo khỏi SOS response path (Proof: unit test xác nhận không gọi delay helper)
- **Status:** `done` tại `frontend/src/lib/aiProvider.ts` và `frontend/scripts/chat-sos-zero-delay.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xóa bỏ triệt để toàn bộ vòng lặp trễ nhân tạo `await new Promise((r) => setTimeout(r, 4))` cùng mọi lời gọi delay helper khỏi luồng xử lý phản hồi khẩn cấp SOS (`SOS_EMERGENCY`) trong cả streaming generator (`streamAIResponse`) lẫn non-streaming generator (`generateAIResponse`) của `frontend/src/lib/aiProvider.ts`.
  - Phát xuất tức thì toàn bộ nội dung cứu nạn đã xác minh (`emergencyPayload`) trong 1 delta duy nhất và 1 `done` chunk kết thúc (< 5ms), đưa thời gian phát token đầu tiên (TTFT) về trạng thái tức thời không trễ, phục vụ tính mạng và cứu hộ khẩn cấp của người dân và du khách.
  - Bảo toàn 100% nội dung cứu nạn đã xác minh (P04-022 provenance): 100% số hotline, link nguồn kiểm toán chính thức `https://triton.angiang.gov.vn`, `https://congan.angiang.gov.vn` và timestamp `verified_at`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-sos-zero-delay.test.mjs` đạt 4/4 assertions pass 100%: (1) `streamAIResponse` SOS response path chạy với ZERO `setTimeout` calls (`setTimeoutCallCount === 0`); (2) Tính toàn vẹn nội dung SOS và trích dẫn provenance; (3) `generateAIResponse` chạy tức thì không delay (< 5ms); (4) Static Code Invariant Audit chứng minh 0% xuất hiện `setTimeout` / `sleep` trong khối code SOS của `aiProvider.ts`. Toàn bộ test regression pass 100%; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-022 — Kiểm tra SOS payload với nguồn từng contact (Proof: từng số có source_url và verified_at)
- **Status:** `done` tại `frontend/src/lib/sosPayloadValidator.ts`, `frontend/src/lib/ai/intentRouter.ts`, `frontend/src/lib/constants.ts`, `frontend/src/app/emergency/page.tsx`, `docs/technical-spec/VERIFIED_EMERGENCY_HOTLINES.json`, và `frontend/scripts/sos-payload-contact-provenance.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module kiểm toán chuyên dụng `sosPayloadValidator.ts` (`CANONICAL_VERIFIED_SOS_CONTACTS`, `validateSosContacts`, `generateCanonicalSosMarkdown`, `validateSosMarkdownProvenance`) thiết lập quy chuẩn kỹ thuật `EMERGENCY-HOTLINE-CONTRACT-001`.
  - Chứng minh tính bất biến nguồn liên hệ khẩn cấp (Contact Provenance Invariance Proof): 100% số điện thoại và liên hệ cứu hộ đều bắt buộc có `source_url` chính thức từ cơ quan nhà nước (`https://triton.angiang.gov.vn`, `https://congan.angiang.gov.vn`), timestamp thẩm định thực địa `verified_at` (chuỗi ISO 8601 hợp lệ `2026-09-28T20:55:00+07:00`), và `verification_status: 'VERIFIED'`.
  - Thẩm định fail-closed: từ chối dứt điểm mọi contact thiếu nguồn (`MISSING_SOURCE_URL`), URL không phải HTTPS (`INVALID_SOURCE_URL`), thiếu timestamp (`MISSING_VERIFIED_AT`), timestamp sai định dạng (`INVALID_VERIFIED_AT`), trạng thái chưa duyệt (`UNVERIFIED_STATUS`), hoặc chứa số điện thoại placeholder bị cấm (`UNAPPROVED_PHONE` như `0913 789 123`, `0296 3760 123`).
  - Tích hợp `generateCanonicalSosMarkdown` vào `intentRouter.ts` bảo đảm `emergencyPayload` của Chatbot AI gắn kèm trích dẫn nguồn và mốc kiểm toán cho mọi số hotline.
  - Chuẩn hóa `COMMUNE_EMERGENCY_DIRECTORY` trong `constants.ts` bổ sung `source_url` và `verified_at` cho toàn bộ 15 xã/thị trấn.
  - Nâng cấp giao diện `/emergency` (`emergency/page.tsx`) hiển thị badge kiểm toán và link nguồn xác minh minh bạch trên từng card liên hệ.
  - Bộ kiểm thử tự động `sos-payload-contact-provenance.test.mjs` đạt 6/6 assertions pass 100%; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-021 — Viết poisoned-knowledge fixture (Proof: untrusted context không được dùng làm fact)
- **Status:** `done` tại `frontend/src/lib/chatPoisonedKnowledgeGuard.ts`, `frontend/src/lib/chatAuditProviderHelper.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-poisoned-knowledge.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng Untrusted Context Firewall và Knowledge Provenance Guard `chatPoisonedKnowledgeGuard.ts` (`detectPoisonedKnowledgeClaims`, `sanitizeClientChatHistory`, `assertKnowledgeProvenanceInvariance`): ngăn chặn triệt để 4 họ tấn công ngộ độc tri thức: (1) Injected Context & Knowledge Override Markers (`[Bối cảnh mới]`, `Knowledge override:`, tài liệu mật mạo danh), (2) False Presupposition Entrapment Claims (gài bẫy tiền đề sai sự thật về thực địa như Hồ Tà Pạ cạn nước, Chùa Xà Tón bị cháy, Gà đốt Ô Thum bị cấm), (3) Fake Entities (truy vấn địa danh, quán ăn, resort 5 sao bịa đặt không có trong CSDL), và (4) Client Chat History Poisoning (lọc bỏ các turn giả mạo do client tự gửi lên gán cho assistant).
  - Thiết lập rào chắn Gateway Fail-Closed tại cả hai route `/api/v1/chat/query` và `/api/v1/chat/stream`, trả về thông tin đính chính sự thật từ CSDL xác minh thực địa và ghi nhận audit log với `provider_used: 'guard_poisoned_knowledge_firewall'`, `model_used: 'poisoned-knowledge-firewall-v1'`, `is_out_scope: true`, và `latency_ms` đo lường thực tế.
  - Chứng minh tính bất biến nguồn tri thức (Knowledge Provenance Invariance Proof): untrusted context tuyệt đối không được dùng làm fact (`untrustedContextUsedAsFact === false`), không bao giờ đồng tình với tiền đề gài bẫy (`falsePresuppositionEndorsed === false`), không thừa nhận thực thể bịa đặt (`fakeEntityAccepted === false`), bảo toàn 100% Canonical Verified Data.
  - Khử độc lịch sử hội thoại: `sanitizeClientChatHistory` lọc sạch các turns độc hại hoặc giả mạo assistant statement trước khi nạp vào context LLM.
  - Kiểm tra negative controls xác nhận 0% false-positive đối với câu hỏi du lịch thông thường.
  - Bộ kiểm thử tự động `chat-poisoned-knowledge.test.mjs` đạt 6/6 assertions pass 100%; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-020 — Viết adversarial prompt-injection fixture (Proof: fixture không thay system/data policy)
- **Status:** `done` tại `frontend/src/lib/chatPromptInjectionGuard.ts`, `frontend/src/lib/chatAuditProviderHelper.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-adversarial-prompt-injection.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module phòng thủ đối kháng chuyên dụng `chatPromptInjectionGuard.ts` (`detectPromptInjection`, `getPromptInjectionRejection`, `assertPolicyInvariance`): phân loại rành mạch 5 họ tấn công đối kháng: `SYSTEM_PROMPT_EXTRACTION`, `JAILBREAK_OVERRIDE`, `ROLEPLAY_HIJACKING`, `DATA_POLICY_TAMPERING`, và `CULTURAL_BOUNDARY_TAMPERING`.
  - Thiết lập rào chắn Gateway Firewall Fail-Closed tại cả hai route `/api/v1/chat/query` và `/api/v1/chat/stream`: phát hiện và trung hòa tức thì các yêu cầu prompt injection trước khi chạm tới LLMs, bảo vệ 100% token budget và tài nguyên hệ thống.
  - Ghi nhận kiểm toán trung thực vào `chat_logs` với `provider_used: 'guard_prompt_injection_firewall'`, `model_used: 'prompt-injection-firewall-v1'`, `is_out_scope: true`, và `latency_ms` thực tế đo lường.
  - Tích hợp defense-in-depth bên trong `streamAIResponse` và `generateAIResponse` của `aiProvider.ts`: ngăn chặn triệt để prompt rò rỉ kể cả khi hàm được gọi độc lập.
  - Chứng minh tính bất biến chính sách (Policy Invariance): không bao giờ để lộ system prompt (`systemPromptLeaked === false`), không chấp nhận thay đổi dữ liệu/hotline/rating/is_verified (`dataPolicyTampered === false`), giữ vững địa giới 15 xã/thị trấn theo RULE 02 (`boundaryPolicyViolated === false`), và bảo tồn nguyên vẹn ẩm thực gà đốt Ô Thum, bún cá củ ngải Khmer theo RULE 05 (`culturalPolicyViolated === false`).
  - Kiểm tra Negative Controls: các câu hỏi du lịch thông thường (hỏi rating Google Maps, hỏi số điện thoại công an, hỏi đường đi) không bị chặn nhầm (0% false-positive).
  - Bộ kiểm thử tự động `chat-adversarial-prompt-injection.test.mjs` đạt 8/8 assertions pass 100%; toàn bộ 455 assertions frontend pass sạch sẽ; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-019 — Thêm citation coverage check cho factual answer (Proof: factual fixture không nguồn không qua gate)
- **Status:** `done` tại `frontend/src/lib/chatCitationCoverageGate.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-citation-coverage-gate.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module kiểm toán trích dẫn chuyên dụng `chatCitationCoverageGate.ts` (`checkCitationCoverage`, `detectFactualElements`, `extractValidCitations`, `enrichFactualCitations`): phân loại chính xác câu trả lời xã giao (`NON_FACTUAL`) và câu trả lời mang tính sự kiện/thực địa (`isFactual = true`).
  - Thiết lập rào chắn Gatekeeper Fail-Closed: mọi câu trả lời factual nhắc đến các thực thể địa danh/ẩm thực/claims Tri Tôn mà có 0 trích dẫn xác minh (`MISSING_ALL_CITATIONS`) hoặc chứa link domain giả mạo/unapproved (`INVALID_CITATION_DOMAIN`) đều bị CHẶN ĐỨNG 100% không cho thông qua gate.
  - Hỗ trợ cơ chế Deterministic Citation Enrichment tự động bổ sung link Google Maps và TikTok xác minh cho các thực thể đã có trong CSDL tri thức; đối với các factual fixture bịa đặt / không nguồn, hệ thống từ chối enrich và fail-closed dứt điểm.
  - Nâng cấp `generateAIResponse` trong `aiProvider.ts`, route `query/route.ts` và route `stream/route.ts`: khi câu trả lời factual không qua Citation Gate, hệ thống tự động kích hoạt fallback an toàn sang Tầng 5: Local Expert RAG (`generateSmartLocalDomainResponse`) nơi 100% câu trả lời đều có trích dẫn bản đồ và video thực địa đã kiểm chứng.
  - Bộ kiểm thử tự động `chat-citation-coverage-gate.test.mjs` đạt 10/10 assertions pass 100%; toàn bộ 452/452 test assertions frontend pass sạch sẽ; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-018 — Thêm output schema validator cho câu trả lời chatbot (Proof: malformed provider output bị chặn/fallback)
- **Status:** `done` tại `frontend/src/lib/chatOutputSchemaValidator.ts`, `frontend/src/lib/chatGroqTimeoutHelper.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-output-schema-validator.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module kiểm toán schema chuyên dụng `chatOutputSchemaValidator.ts`: thẩm định fail-closed toàn bộ phản hồi từ LLM Providers, loại trừ 100% các dạng malformed: `EMPTY_OR_WHITESPACE` (rỗng, null bytes), `TOO_SHORT_OR_MEANINGLESS` (vô nghĩa, < 15 ký tự), `RAW_PROVIDER_ERROR` (chữ ký lỗi 500, 502, 503, 429, JSON error), `PROMPT_LEAKAGE` (rò rỉ `<system>`, `[INST]`, `<|im_start|>`), `MALFORMED_JSON_DUMP` (JSON rách, raw choices), và `REPETITIVE_LOOP` (vòng lặp lấy mẫu suy thoái n-gram).
  - Hỗ trợ cơ chế tự động khép kín markdown code fences (`repairMarkdownFences`) bảo vệ giao diện người dùng không bị vỡ bố cục.
  - Nâng cấp `orchestrateGroqWithFailover` trong `chatGroqTimeoutHelper.ts`: phát hiện và chặn đứng tức thì ngay tại token đầu tiên nếu Groq trả về raw error chunk, kích hoạt failover sạch sang Secondary Gemini / Local RAG không để rác lọt ra client stream.
  - Nâng cấp `generateAIResponse` trong `aiProvider.ts`, route `query/route.ts` và route `stream/route.ts`: khi phát hiện provider trả về text malformed, tự động kích hoạt fallback an toàn sang Tầng 5: Local Expert RAG (`generateSmartLocalDomainResponse`) và bảo đảm chỉ lưu session turns khi output hợp lệ.
  - Bộ kiểm thử tự động `chat-output-schema-validator.test.mjs` đạt 12/12 assertions pass 100%; toàn bộ 442/442 test assertions frontend pass sạch sẽ; build production Next.js 16 biên dịch thành công 178/178 routes (exit code 0).

### P04-017 — Viết integration test provider primary stream error (Proof: response không treo và không trả partial sai)
- **Status:** `done` tại `frontend/src/lib/chatGroqTimeoutHelper.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, `frontend/src/lib/chatStructuredResultContract.ts`, và `frontend/scripts/chat-provider-primary-stream-error-integration.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp bộ điều phối tuần tự `orchestrateGroqWithFailover` trong `frontend/src/lib/chatGroqTimeoutHelper.ts`: bổ sung callback `onPrimaryStreamError`, theo dõi `accumulatedPrimaryText`, kích hoạt failover tức thì khi gặp lỗi sớm (Early Error: HTTP 500/503/429) và phát xuất `done` chunk kết thúc an toàn khi gặp lỗi giữa chừng (Mid-stream Error) để downstream stream không bao giờ bị treo.
  - Nâng cấp khối `catch` trong `/api/v1/chat/stream/route.ts`: khi đã có tokens phát ra trước đó, bảo toàn nguyên vẹn `fullText` đã gửi ra client thay vì ghi đè partial sai lệch bằng thông báo lỗi, loại bỏ hoàn toàn mâu thuẫn dữ liệu giữa UI và server.
  - Bổ sung hàm kiểm toán `validateStreamTokenConcordance` vào `frontend/src/lib/chatStructuredResultContract.ts`, kiểm tra tính đồng nhất 100% giữa các delta tokens và trường `full_text` trong event `done`.
  - Xây dựng bộ kiểm thử tích hợp tự động `frontend/scripts/chat-provider-primary-stream-error-integration.test.mjs` đạt 8/8 assertions pass 100%:
    1. *Early Stream Error Proof*: Groq ném HTTP 500/Connection Reset trước token đầu tiên kích hoạt failover sạch 100% sang Secondary Provider (Gemini / Local RAG).
    2. *Mid-Stream Error Proof*: Groq crash sau khi đã stream 2 chunks không gây treo stream, phát xuất `done` chunk an toàn và bảo đảm tính đồng nhất partial 100%.
    3. *Corrupted Chunk Invariant*: Trung hòa an toàn các dòng SSE bị lỗi cú pháp JSON mà không crash tiến trình.
    4. *Socket Cleanup & Resource Release Proof*: `controller.close()` luôn được gọi trong khối `finally`, signal abort kích hoạt, dọn dẹp sạch sẽ tài nguyên.
    5. *Query Route Resilience*: `query/route.ts` xử lý stream error suy thoái an toàn về Local RAG và trả về Structured Result chuẩn 100%, không throw 500.
    6. *Negative Tests*: Từ chối dứt điểm stream bị treo, missing `full_text` hoặc partial mismatch.
    7. *Static Code Invariants*: Kiểm tra toàn diện codebase đảm bảo rào chắn `finally` và error handlers.
  - Toàn bộ 430/430 tests frontend pass sạch sẽ (0 failures); build production Next.js 16 (178/178 routes) đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Provider Primary Stream Error Resilience Proof).
- **Next task:** P04-018 — Thêm output schema validator cho câu trả lời chatbot (Proof: malformed provider output bị chặn/fallback).

### P04-016 — Viết integration test provider primary timeout (Proof: fallback trả structured result)
- **Status:** `done` tại `frontend/src/lib/chatStructuredResultContract.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-provider-primary-timeout-integration.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module contract và validator chuyên dụng `frontend/src/lib/chatStructuredResultContract.ts` (`StructuredChatResponse`, `StructuredStreamDoneEvent`, `validateStructuredChatResponse`, `validateStructuredStreamDoneEvent`) thiết lập chuẩn mực bất biến cho kết quả trả về của Chatbot AI Tri Tôn.
  - Tích hợp chuẩn contract vào cả 2 route chính: `/api/v1/chat/query` (`StructuredChatResponse`) và `/api/v1/chat/stream` (`StructuredStreamDoneEvent`), bảo đảm type safety và loại bỏ rủi ro rách dữ liệu.
  - Xây dựng bộ kiểm thử tích hợp tự động `frontend/scripts/chat-provider-primary-timeout-integration.test.mjs` đạt 8/8 assertions pass 100%:
    1. *Query Route Integration Proof*: khi Groq Primary bị timeout (treo socket > 2500ms), hệ thống ngắt kết nối chính xác và failover sang Secondary Provider (Gemini / Local RAG), trả về một Structured Result hoàn chỉnh 100% gồm `text_response` giàu thông tin, `provider` và `model` của fallback, `latency_ms >= 2500ms`, `suggestions` ngữ cảnh động, `places` xác minh và `ui_components` chuẩn.
    2. *Stream Route Integration Proof*: phát xuất chuỗi sự kiện SSE trôi chảy (`metadata`, `token` deltas, `done` event) với `full_text` khớp 100% tổng deltas và đóng socket an toàn không leak.
    3. *Zero Ghost Tokens Invariant*: triệt tiêu 100% token trễ từ Groq sau khi đã abort timeout, bảo đảm không ô nhiễm dữ liệu zombie vào stream của fallback.
    4. *Total Cloud Outage Proof*: khi cả Groq timeout và Gemini lỗi mạng, hệ thống suy thoái êm ả về Tầng 5: Local Expert RAG và vẫn trả về Structured Result chuẩn 100% không crash 500.
    5. *Audit Log Concordance*: ghi nhận chính xác provider/model fallback và latency thực tế $\ge 2500\text{ms}$.
    6. *Negative Schema Invariants*: từ chối mọi payload thiếu trường, latency giả định hoặc provider sai.
    7. *Static Code Invariants*: quét toàn bộ codebase xác nhận tính đồng nhất của các tham số và types.
  - Toàn bộ 422/422 tests frontend pass sạch sẽ (0 failures); build production Next.js 16 (178/178 routes) đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Provider Primary Timeout Structured Fallback Proof).
- **Next task:** P04-017 — Viết integration test provider primary stream error (Proof: response không treo và không trả partial sai).

### P04-015 — Áp timeout đã chọn cho Groq (Proof: fault test chứng minh thời điểm failover)
- **Status:** `done` tại `frontend/src/lib/chatGroqTimeoutHelper.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/lib/ai/fallbackClients.ts`, và `frontend/scripts/chat-groq-timeout-failover.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Phát triển module helper chuyên dụng `frontend/src/lib/chatGroqTimeoutHelper.ts` cung cấp `createBoundedTimeoutController` và `orchestrateGroqWithFailover` áp dụng tham số timeout chuẩn hóa `GROQ_PRIMARY_TIMEOUT_MS = 2500ms` (tuân thủ Decision Record `DR-LLM-STRATEGY-001`).
  - Áp dụng cơ chế `Promise.race` giữa TTFT token đầu tiên của Groq và Timeout Promise: giải quyết triệt để rủi ro treo socket/zombie generator, ngắt kết nối chính xác tại mốc $\sim 2500\text{ms}$ và chuyển ngay sang Secondary Provider (Gemini).
  - Tái cấu trúc Luồng 3 trong `frontend/src/lib/aiProvider.ts` ủy quyền cho `orchestrateGroqWithFailover`, loại bỏ mã lặp, hỗ trợ dependency injection qua `StreamAIOptions`.
  - Cập nhật native client `streamGroqNative` trong `frontend/src/lib/ai/fallbackClients.ts` bổ sung local timeout fail-safe 2500ms khi caller không truyền `abortSignal`.
  - Xây dựng bộ kiểm thử fault test tự động `frontend/scripts/chat-groq-timeout-failover.test.mjs` đạt 7/7 assertions pass 100%: đo lường thực tế thời điểm failover chính xác tại mốc $\sim 2500\text{ms}$ (`2512ms`) khi Groq bị treo socket, hủy timer ngay khi nhận token đầu tiên và chuyển tầng an toàn sang Gemini Secondary.
  - Toàn bộ 414/414 unit/integration tests frontend pass sạch sẽ (0 failures); build production Next.js 16 đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Groq Primary Bounded Timeout & Failover Proof).
- **Next task:** P04-016 — Viết integration test provider primary timeout (Proof: fallback trả structured result).

### P04-014 — Chọn một chiến lược provider: sequential failover hoặc timed hedge (Proof: Decision Record mô tả quota/latency trade-off)
- **Status:** `done` tại `docs/technical-spec/DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY.md` và `frontend/scripts/multi-llm-strategy-decision-record.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành Decision Record kỹ thuật chính thức `DR-LLM-STRATEGY-001` tại `docs/technical-spec/DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY.md`, phê duyệt bởi Chăm Rốch Thi.
  - Phân tích ma trận so sánh định lượng trade-off giữa 3 phương án (Timed Hedge 600ms, Sequential Failover fast timeout 2.5s, và Unbounded Sequential 30s) trên 6 tiêu chí kỹ thuật: tiêu thụ Quota/Token budget, rủi ro 429 cascade rate limit, độ trễ TTFT thông thường P50/P90, độ trễ sự cố P99, khả năng kiểm toán/auditability, và nguy cơ rò rỉ kết nối zombie requests.
  - Chốt quyết định duy nhất: **Phương án B (Sequential Failover với Fast Bounded Timeout)** nhằm bảo toàn 100% Quota/Token budget (Zero Quota Waste) và loại trừ nguy cơ rate-limit kép 429 trên hệ thống tài nguyên cộng đồng.
  - Xác lập bộ tham số timeout chuẩn hóa bất biến cho downstream: `GROQ_PRIMARY_TIMEOUT_MS = 2500ms`, `GEMINI_SECONDARY_TIMEOUT_MS = 6000ms`, `OPENROUTER_TERTIARY_TIMEOUT_MS = 5000ms`, `LOCAL_RAG_TIMEOUT_MS = 0ms`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/multi-llm-strategy-decision-record.test.mjs` đạt 7/7 assertions pass 100% kiểm chứng tính toàn vẹn tài liệu, mã định danh, ma trận trade-off, quyết định dứt khoát và liên kết kế hoạch downstream cho P04-015, P04-016, P04-017.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Multi-LLM Strategy Decision Record Proof).
- **Next task:** P04-015 — Áp timeout đã chọn cho Groq (Proof: fault test chứng minh thời điểm failover).

### P04-013 — Ghi latency thực tế vào audit log (Proof: latency là số đo, không phải constant)
- **Status:** `done` tại `supabase/migrations/20261002_p04_013_chat_logs_latency_ms.sql`, `frontend/src/lib/chatAuditLatencyHelper.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, `frontend/src/app/admin/chat-logs/page.tsx`, và `frontend/scripts/chat-latency-audit-log.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành migration DDL PostgreSQL `supabase/migrations/20261002_p04_013_chat_logs_latency_ms.sql` bổ sung ràng buộc CHECK `chk_chat_logs_latency_positive` (bảo đảm `latency_ms >= 0`), INDEX `chat_logs_latency_idx`, và COMMENT mô tả số đo thời gian thực tế không constant cho bảng `public.chat_logs`.
  - Phát triển module helper chuyên dụng `frontend/src/lib/chatAuditLatencyHelper.ts` cung cấp `startLatencyTimer`, `calculateElapsedMs`, `isValidAuditLatency`, `resolveAuditLatency`, và tập hợp `FORBIDDEN_AUDIT_LATENCIES`.
  - Tích hợp đo lường thời gian đáp ứng thực tế (`actualLatencyMs`) cho cả hai route `/api/v1/chat/query` và `/api/v1/chat/stream` (cả nhánh out-of-scope lẫn nhánh chính), ghi nhận vào audit log `chat_logs` và trả về `latency_ms` trong JSON response / SSE stream done event.
  - Loại bỏ hoàn toàn 100% demo mock fallback `|| 1200` tại giao diện Admin Chat Logs `frontend/src/app/admin/chat-logs/page.tsx`, thay thế bằng kiểm tra chuẩn xác `typeof log.latency_ms === 'number' ? `${log.latency_ms} ms` : '—'`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-latency-audit-log.test.mjs` đạt 8/8 assertions pass 100%: (1) Real Measured Latency Proof (chứng minh biến thiên thực tế giữa các lượt chạy); (2) Negative Invariants & Forbidden Constants Rejection Proof; (3) Static code invariant 0% mock 1200ms trong admin page; (4) Static code invariant trong query route; (5) Static code invariant trong stream route; (6) Database migration invariant; (7) End-to-End Simulation: Latency Measurement Concordance Proof giữa audit payload và client response.
  - Toàn bộ 400/400 unit/integration tests frontend pass sạch sẽ (0 failures); build production Next.js đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Actual Measured Latency Audit Log Proof & Client Concordance).
- **Next task:** P04-014 — Chọn một chiến lược provider: sequential failover hoặc timed hedge (Proof: Decision Record mô tả quota/latency trade-off).

### P04-012 — Ghi model thực tế vào audit log (Proof: model ID khớp request đã hoàn tất)
- **Status:** `done` tại `supabase/migrations/20261002_p04_012_chat_logs_model_used.sql`, `frontend/src/lib/chatAuditProviderHelper.ts`, `frontend/src/lib/ai/fallbackClients.ts`, `frontend/src/lib/ai/geminiClient.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, `frontend/src/app/admin/chat-logs/page.tsx`, và `frontend/scripts/chat-model-audit-log.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành migration DDL PostgreSQL `supabase/migrations/20261002_p04_012_chat_logs_model_used.sql` bổ sung cột `model_used TEXT`, COMMENT giải thích và INDEX `chat_logs_model_idx` cho bảng `public.chat_logs`.
  - Mở rộng module helper `frontend/src/lib/chatAuditProviderHelper.ts` với `resolveAuditModel`, `isValidAuditModel`, `FORBIDDEN_AUDIT_MODELS`, và các hằng số canonical model ID (`CANONICAL_OUT_OF_SCOPE_MODEL = 'intent-out-of-scope-filter'`, `CANONICAL_EMERGENCY_MODEL = 'emergency-instant-rule-engine'`, `CANONICAL_LOCAL_RAG_MODEL = 'local-expert-rag-v1'`).
  - Nâng cấp các native streaming clients (`fallbackClients.ts`, `geminiClient.ts`) phát xuất chính xác model ID của nhà cung cấp AI trong từng stream chunk.
  - Cập nhật AI Orchestrator `frontend/src/lib/aiProvider.ts`: `generateAIResponse` trả về `{ text: string; provider: string; model: string }`, theo dõi `model` qua từng lượt streaming racer và chuẩn hóa an toàn qua `resolveAuditModel`.
  - Cập nhật cả 2 route chat `/api/v1/chat/query` và `/api/v1/chat/stream`: thu thập chính xác model ID đã hoàn tất request, truyền vào `logChatEvent` (`model_used`) và trả về `model` trong JSON response / stream chunks.
  - Cập nhật giao diện Admin Chat Logs `frontend/src/app/admin/chat-logs/page.tsx` hiển thị nhãn `model_used` và hỗ trợ tìm kiếm theo model ID.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-model-audit-log.test.mjs` đạt 8/8 assertions pass 100%: (1) Model ID Resolution Accuracy; (2) Negative Invariants & Forbidden Values Rejection; (3) Provider-to-Model Extraction Invariant; (4) Static Code Invariant trong Query & Stream Routes; (5) Static Code Invariant trong aiProvider & Native Clients; (6) Database Migration Invariant; (7) End-to-End Simulation: Completed Request Model Concordance Proof.
  - Toàn bộ 392/392 unit/integration tests frontend pass sạch sẽ (0 failures); build production Next.js đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Actual AI Model Audit Log Proof & Completed Request Model Concordance).
- **Next task:** P04-013 — Ghi latency thực tế vào audit log (Proof: latency là số đo, không phải constant).

### P04-011 — Ghi provider thực tế vào audit log (Proof: Groq/Gemini/fallback có giá trị khác nhau)
- **Status:** `done` tại `frontend/src/lib/chatAuditProviderHelper.ts`, `frontend/src/lib/aiProvider.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-provider-audit-log.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · low` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module helper `frontend/src/lib/chatAuditProviderHelper.ts` cung cấp `resolveAuditProvider`, `classifyProviderFamily`, và `isValidAuditProvider`.
  - Loại bỏ hoàn toàn 100% hằng số hardcoded `'parallel-race'` khỏi `frontend/src/app/api/v1/chat/query/route.ts` khi ghi audit log `chat_logs`.
  - Nâng cấp `generateAIResponse` trả về `{ text: string; provider: string }`, thu thập chính xác provider từ các chunk stream (cả delta và done chunks) và chuẩn hóa qua `resolveAuditProvider`.
  - Ghi nhận chính xác nhà cung cấp thực tế đã hoàn thành lượt suy luận vào cột `provider_used` của bảng `chat_logs` và đưa thuộc tính `provider` vào JSON response của route.
  - Chuẩn hóa phân biệt rõ rệt 6 nhóm provider: Groq primary racer (`groq-*`), Gemini failover (`gemini-*`), OpenRouter fallback (`openrouter-*`), Local Expert RAG offline (`local_expert_rag`), Emergency SOS bypass (`emergency_instant_bypass`), và Out-of-Scope guard (`out_of_scope_guard`).
  - Thiết lập negative invariants: ngăn chặn triệt để mọi rò rỉ của `'parallel-race'`, `'none'`, rỗng, `null` hay `undefined` vào audit log.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-provider-audit-log.test.mjs` đạt 7/7 assertions pass 100%.
  - Toàn bộ 384/384 unit/integration tests frontend pass sạch sẽ (0 failures); build production Next.js đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Distinct AI Provider Audit Log Proof & Zero Parallel-Race Invariant).
- **Next task:** P04-012 — Ghi model thực tế vào audit log (Proof: model ID khớp request đã hoàn tất).

### P04-010 — Lọc retrieval theo verification_status đã duyệt (Proof: unverified fixture không xuất hiện)
- **Status:** `done` tại `frontend/src/lib/placeVerificationGuard.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/lib/chatTokenSearchHelper.ts`, `frontend/src/app/api/v1/search/route.ts`, `supabase/migrations/20260930_p04_010_match_places_verified_retrieval.sql`, và `frontend/scripts/retrieval-verification-status-filter.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Mở rộng module phòng thủ `frontend/src/lib/placeVerificationGuard.ts` cung cấp hai hàm lọc chuyên dụng `isRetrievalEligiblePlace` và `filterVerifiedRetrievalPlaces`.
  - Thiết lập rào chắn lọc kép fail-closed (database PostgREST filter + application memory guard) trên toàn bộ 5 luồng retrieval địa điểm của hệ thống: (1) Clustered/Intent POIs query `.eq('verification_status', 'VERIFIED').eq('is_verified', true)`, (2) Precision Token Search helper `chatTokenSearchHelper.ts`, (3) pgvector Vector Similarity Search (`match_places`), (4) PostGIS Geo-proximity Search (`match_places_nearby`), và (5) Fallback Hot Places query.
  - Tại `frontend/src/app/api/v1/search/route.ts`: bổ sung lọc PostgREST và bọc toàn bộ search pool bằng `filterVerifiedRetrievalPlaces`.
  - Ban hành migration RPC PostgreSQL `supabase/migrations/20260930_p04_010_match_places_verified_retrieval.sql` nâng cấp hai hàm `match_places` và `match_places_nearby` với mệnh đề `WHERE places.is_active = true AND places.is_verified = true AND places.verification_status = 'VERIFIED'` và bổ sung các cột metadata xác thực.
  - Chứng minh loại trừ 100% mọi fixtures unverified (`UNVERIFIED`, `IN_REVIEW`, `REJECTED`, `EXPIRED`, missing status, null status, hoặc cờ boolean mâu thuẫn) khỏi context RAG và API response.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/retrieval-verification-status-filter.test.mjs` đạt 7/7 assertions pass 100%.
  - Toàn bộ 377/377 unit/integration tests frontend pass sạch sẽ (0 failures); build production Next.js đạt exit code 0 thành công tuyệt đối.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Verified Retrieval Filter Invariant & Fixture Exclusion Proof).
- **Next task:** P04-011 — Ghi provider thực tế vào audit log (Proof: Groq/Gemini/fallback có giá trị khác nhau).

---

### P04-009 — Không default is_verified thành true (Proof: missing field không được trả verified)
- **Status:** `done` tại `frontend/src/lib/placeVerificationGuard.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/admin/places/route.ts`, `frontend/src/lib/chatTokenSearchHelper.ts`, `frontend/src/app/api/v1/search/route.ts`, `supabase/migrations/20260930_p04_009_places_is_verified_default_false.sql`, và `frontend/scripts/place-verification-guard.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module phòng vệ chuyên dụng `frontend/src/lib/placeVerificationGuard.ts` cung cấp các hàm `isRecordVerified(record)`, `resolveVerificationMetadata(record)`, và `sanitizePlaceVerification(place)`.
  - Xóa bỏ hoàn toàn cơ chế fallback nguy hiểm `is_verified: p.is_verified ?? true` tại `frontend/src/app/api/v1/chat/query/route.ts` (cả nhánh chính và nhánh fallback `hotPlaces`). Missing field không bao giờ được trả về `true`.
  - Xóa bỏ hành vi gán cứng `is_verified: true` vô điều kiện khi tạo mới POI tại `frontend/src/app/api/v1/admin/places/route.ts` POST; tích hợp `resolveVerificationMetadata` bảo đảm POI chỉ có `is_verified: true` khi có chứng thực hợp lệ và trạng thái `VERIFIED`.
  - Bổ sung trường `is_verified, verification_status, verified_at, source_url` vào câu truy vấn select của `frontend/src/lib/chatTokenSearchHelper.ts` và `frontend/src/app/api/v1/search/route.ts`.
  - Ban hành migration DDL PostgreSQL `supabase/migrations/20260930_p04_009_places_is_verified_default_false.sql`: đổi `ALTER TABLE public.places ALTER COLUMN is_verified SET DEFAULT false` và fail-closed các bản ghi NULL hoặc không có trạng thái `VERIFIED`.
  - Tước bỏ trường `verified_at` đối với các bản ghi unverified nhằm triệt tiêu giả mạo timestamp kiểm toán.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/place-verification-guard.test.mjs` đạt 6/6 assertions pass 100%: (1) Unit test fail-closed trên các fixtures missing field, null, undefined, 0, string, unverified statuses; (2) Unit test resolveVerificationMetadata tước bỏ timestamp trên unverified; (3) Unit test sanitizePlaceVerification; (4) Static code invariant quét 4 file trọng yếu, xác nhận 0% xuất hiện fallback `is_verified ?? true` hay `|| true`; (5) Database migration invariant.
  - Toàn bộ 370/370 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Place Verification Guard Invariant & Fail-Closed Proof).
- **Next task:** P04-010 — Lọc retrieval theo `verification_status` đã duyệt (Proof: unverified fixture không xuất hiện).

---

### P04-008 — Di chuyển user text khỏi PostgREST .or string interpolation (Proof: payload filter syntax không thay đổi điều kiện truy vấn)
- **Status:** `done` tại `frontend/src/lib/postgrestFilterSanitizer.ts`, các API routes (`search`, `videos`, `admin/places`, `admin/audit-logs`, `admin/knowledge-base`, `admin/itineraries`, `lib/places.ts`, `lib/chatTokenSearchHelper.ts`), và `frontend/scripts/postgrest-filter-sanitizer.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Phát triển module phòng thủ chuyên dụng `frontend/src/lib/postgrestFilterSanitizer.ts` cung cấp các hàm `sanitizeFilterTerm(rawInput)`, `buildSafeOrIlikeFilter(fields, rawTerm)`, `buildSafeMultiTermOrFilter(fields, rawTerms)`, và `countPostgrestClauses(filterStr)`.
  - Trung hòa triệt để các ký tự điều khiển cú pháp PostgREST (`,`, `(`, `)`, `"`, `\`), loại bỏ multiple percent wildcards và chuẩn hóa khoảng trắng.
  - Thay thế toàn bộ các điểm nội suy chuỗi thô của người dùng trong `.or()` trên toàn codebase:
    1. `frontend/src/app/api/v1/search/route.ts` (search places): bọc an toàn qua `buildSafeOrIlikeFilter`.
    2. `frontend/src/app/api/v1/videos/route.ts` (location & search query): bọc an toàn qua `buildSafeOrIlikeFilter`.
    3. `frontend/src/app/api/v1/admin/places/route.ts` (admin category & keyword search): bọc an toàn qua `buildSafeOrIlikeFilter`.
    4. `frontend/src/app/api/v1/admin/audit-logs/route.ts` (audit log search): bọc an toàn qua `buildSafeOrIlikeFilter`.
    5. `frontend/src/app/api/v1/admin/knowledge-base/route.ts` (knowledge base search): bọc an toàn qua `buildSafeOrIlikeFilter`.
    6. `frontend/src/app/api/v1/admin/itineraries/route.ts` (PATCH & DELETE itinerary targetId / itinerary_id): bọc qua `sanitizeFilterTerm`.
    7. `frontend/src/lib/places.ts` (getPlacesFiltered category query): bọc qua `sanitizeFilterTerm`.
    8. `frontend/src/lib/chatTokenSearchHelper.ts` (bounded token search): bọc qua `buildSafeMultiTermOrFilter`.
  - Thiết lập bất biến toán học clause-count: số lượng mệnh đề logic PostgREST sinh ra luôn luôn bằng chính xác `fields.length` (hoặc `fields.length * terms.length`), bảo đảm các payload tấn công chứa toán tử lọc (như `hồ tà pạ,is_active.eq.false,(id.gt.0)`) tuyệt đối không thể chèn thêm bất kỳ mệnh đề lọc nào vào câu truy vấn hoặc làm sai lệch kết quả.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/postgrest-filter-sanitizer.test.mjs` đạt 6/6 assertions pass 100%: (1) Static code invariant quét 8 file trọng yếu, xác nhận 0% nội suy chuỗi thô của người dùng trong `.or()`; (2) Unit test kiểm chứng trung hòa PostgREST delimiters, operators và giữ nguyên văn bản tiếng Việt hợp lệ; (3) Unit test chứng minh bất biến số lượng mệnh đề và khả năng miễn nhiễm injection dưới payload độc hại; (4) Multi-term bounded generation test; (5) Unit test bộ đếm clause count PostgREST.
  - Toàn bộ 364/364 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (PostgREST Filter Sanitizer Invariant & Injection Resistance Proof).
- **Next task:** P04-009 — Không default `is_verified` thành true (Proof: missing field không được trả `verified`).

---

### P04-007 — Thay query token search tuần tự bằng một truy vấn giới hạn (Proof: query-count test giảm đúng mục tiêu đã ghi)
- **Status:** `done` tại `frontend/src/lib/chatTokenSearchHelper.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, và `frontend/scripts/chat-token-search-bounded.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Phát triển module helper chuyên dụng `frontend/src/lib/chatTokenSearchHelper.ts` cung cấp các hàm `extractSearchTerms(query, maxTerms)`, `buildBoundedOrFilter(terms)`, và `executeBoundedTokenSearch(supabase, query, options)`.
  - Tái cấu trúc quy trình RAG token matching trong `frontend/src/app/api/v1/chat/query/route.ts`: xóa bỏ hoàn toàn hai vòng lặp tuần tự lồng nhau `for (const phrase of nGramPhrases)` và `for (const token of filteredTokens)` từng gây bùng nổ 10-20+ round-trips PostgREST tuần tự trên mỗi lượt chat (N+1 query issue).
  - Thuật toán mới trích xuất n-grams (ưu tiên trigrams và bigrams), lọc bỏ stop words, loại trừ các ký tự phân tách nhạy cảm (`%`, `,`, `(`, `)`), giới hạn tối đa `maxTerms = 6` thuật ngữ đặc trưng nhất, ghép thành một mệnh đề `.or()` duy nhất và thực thi với `.limit(8)`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-token-search-bounded.test.mjs` đạt 6/6 assertions pass 100%: (1) Static code invariant xác nhận route import và gọi `executeBoundedTokenSearch`, loại bỏ triệt để 100% vòng lặp tuần tự cũ; (2) Unit test trích xuất n-grams/tokens, lọc stop words, khử trùng lặp và sinh mệnh đề PostgREST .or() hợp chuẩn; (3) Query-count benchmark chứng minh số lượng truy vấn DB giảm từ 12-15 queries xuống ĐÚNG 1 QUERY DUY NHẤT (mức giảm >= 90%); (4) Robustness test kiểm chứng chuỗi rỗng hoặc toàn stop words không gửi bất kỳ truy vấn DB nào (`queryCount === 0`); (5) Robustness test kiểm chứng lỗi kết nối DB suy giảm an toàn thành mảng rỗng mà không crash ứng dụng.
  - Toàn bộ 358/358 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Single bounded token search invariant & query-count proof).
- **Next task:** P04-008 — Di chuyển user text khỏi PostgREST `.or` string interpolation (Proof: payload filter syntax không thay đổi điều kiện truy vấn).

---

### P04-006 — Tạo embedding đúng một lần trong chat request (Proof: spy test đếm một call)
- **Status:** `done` tại `frontend/src/lib/chatEmbeddingHelper.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, và `frontend/scripts/chat-embedding-single-call.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module helper chuyên biệt `frontend/src/lib/chatEmbeddingHelper.ts` cung cấp hàm `generateQueryEmbedding(text, options)` tích hợp cơ chế Dependency Injection (`options.fetchFn`), thiết lập timeout an toàn và fail-safe fallback.
  - Tái cấu trúc endpoint xử lý câu hỏi `frontend/src/app/api/v1/chat/query/route.ts`: loại bỏ hoàn toàn lời gọi embedding trùng lặp thứ 2 trong `query/route.ts` (thay thế `const queryVector = await generateQueryEmbedding(queryStr);` bằng cách tái sử dụng trực tiếp kết quả embedding ở Bước 1: `const queryVector = qEmbedding;`).
  - Bảo đảm cả 3 tác vụ downstream (`match_golden` RPC few-shot formatting, `match_places` RPC pgvector hybrid search, và `match_kb` RPC knowledge base retrieval) chia sẻ chung một vector embedding 768 chiều duy nhất, loại bỏ hoàn toàn lãng phí độ trễ mạng và bảo vệ quota Gemini embedding.
  - Khắc phục triệt để lỗi phạm vi biến `supabase` trong `query/route.ts` và `fetchContextAwareVideos` với các rào chắn null check an toàn, đạt `npx tsc --noEmit` sạch 100% trong `query/route.ts`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-embedding-single-call.test.mjs` đạt 6/6 assertions pass 100%: (1) Static code invariant xác nhận route chỉ gọi `generateQueryEmbedding` đúng 1 lần và `queryVector` tái sử dụng `qEmbedding`; (2) Unit spy test với `spyFetch` chứng minh API embedding chỉ được gọi đúng 1 lần cho mỗi câu hỏi chat (`callCount === 1`) trả về vector 768 chiều; (3) Simulation test đa tác vụ (golden few-shots + places + kb) xác nhận 100% người tiêu thụ nhận cùng đối tượng vector và tổng số cuộc gọi mạng embedding qua toàn bộ request giữ nguyên strictly 1; (4) Robustness test kiểm chứng chuỗi rỗng và khoảng trắng trả về null với `0 network calls`; (5) Robustness test kiểm chứng lỗi mạng suy giảm an toàn thành null mà không crash ứng dụng.
  - Toàn bộ 352/352 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Chat embedding single-call invariant & spy proof).
- **Next task:** P04-007 — Thay query token search tuần tự bằng một truy vấn giới hạn (Proof: query-count test giảm đúng mục tiêu đã ghi).

---

### P04-005 — Xác thực session ownership trước khi đọc chat history (Proof: session khác owner bị từ chối)
- **Status:** `done` tại `docs/technical-spec/CHAT_SESSION_OWNERSHIP_CONTRACT.md`, `frontend/src/lib/chatSessionOwnership.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-session-ownership.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành quy chuẩn kỹ thuật `CHAT-SESSION-OWNERSHIP-CONTRACT-V1` tại `docs/technical-spec/CHAT_SESSION_OWNERSHIP_CONTRACT.md` xác lập 5 bất biến bắt buộc (`INV-OWN-01` đến `INV-OWN-05`) khắc phục triệt để nguy cơ Threat Model TM-05 (đoán/thay session ID để đọc trộm lịch sử hoặc ngộ độc ngữ cảnh).
  - Xây dựng module helper `frontend/src/lib/chatSessionOwnership.ts` cung cấp các hàm `createSessionOwnershipToken` (HMAC-SHA256 64 ký tự hex an toàn mật mã), `verifySessionOwnershipToken` (so khớp thời gian hằng số `timingSafeEqual`), `extractSessionOwnershipToken` (đa kênh: Header `x-chat-session-token`, Cookie `triton_chat_session_token`, Body `session_token`), và `verifySessionOwnership`.
  - Tích hợp rào chắn vào cả hai route `/api/v1/chat/query` và `/api/v1/chat/stream`: thẩm định quyền sở hữu trước khi nạp lịch sử qua `loadHistory`. Nếu session đã tồn tại trên database mà client không có token sở hữu hợp lệ (kẻ tấn công hoặc session khác owner) thì bị từ chối dứt điểm với mã `HTTP 403 Forbidden` (`code: 'INVALID_SESSION_OWNERSHIP'`); đối với phiên mới, server tự động cấp quyền và trả về token sở hữu qua header `X-Chat-Session-Token` và Set-Cookie `triton_chat_session_token`.
  - Nâng cấp cả hai client component `ChatbotPageClient.tsx` và `ChatbotWidget.tsx` lưu trữ và gửi kèm ownership token.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-session-ownership.test.mjs` đạt 8/8 assertions pass 100%: (1) Static invariant; (2) Unit test sinh token tất định và kiểm thực timing-safe; (3) Unit test trích xuất đa kênh (Header, Cookie, Body); (4) Simulation phiên mới cấp token thành công; (5) Simulation chủ sở hữu hợp lệ được phép truy cập lịch sử; (6) Simulation kẻ tấn công (không token, sai token, fake token) bị từ chối dứt điểm với HTTP 403; (7) Chuỗi tấn công hai bước TM-05 (đánh cắp session ID) bị chặn đứng 100%.
  - Toàn bộ 346/346 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Chat session ownership verification).
- **Next task:** P04-006 — Tạo embedding đúng một lần trong chat request (Proof: spy test đếm một call).

---

### P04-004 — Thay session ID Math.random() tại ChatbotWidget (Proof: test tạo session hợp lệ)
- **Status:** `done` tại `frontend/src/components/ChatbotWidget.tsx` và `frontend/scripts/chatbot-widget-session.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp component `frontend/src/components/ChatbotWidget.tsx`, loại bỏ triệt để 100% dòng code tạo chuỗi ID ngẫu nhiên không an toàn `'session_' + Math.random().toString(36).substring(2, 9)`.
  - Tích hợp module chuẩn hóa `@/lib/sessionIdentifierContract` với hai hàm `isValidSessionId` và `generateSessionId`.
  - Thiết lập cơ chế kiểm tra và di trú tự động: khi khởi tạo hoặc đọc từ `localStorage.getItem('triton_widget_session_id')`, hệ thống kiểm tra `stored && isValidSessionId(stored)`. Nếu session đã lưu là UUID v4 hợp lệ theo chuẩn RFC 4122 thì tái sử dụng nguyên vẹn; nếu là chuỗi legacy cũ dạng `session_...`, chuỗi rỗng hoặc giá trị sai lệch thì tự động cấp mới UUID v4 CSPRNG và cập nhật đè vào `localStorage`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chatbot-widget-session.test.mjs` đạt 6/6 assertions pass 100%: (1) Static invariant xác nhận 0% chuỗi `Math.random` trong `ChatbotWidget.tsx` và có import/kiểm tra `isValidSessionId`; (2) Khách truy cập mới sinh đúng UUID v4 và lưu vào `localStorage`; (3) Di trú phiên cũ (legacy migration) tự động thay thế `session_...` bằng UUID v4; (4) Tái sử dụng phiên hợp lệ không sinh mới; (5) Phòng vệ payload rỗng, khoảng trắng, dị tật hoặc script injection.
  - Toàn bộ 338/338 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (ChatbotWidget session identifier).
- **Next task:** P04-005 — Xác thực session ownership trước khi đọc chat history (Proof: session khác owner bị từ chối).

---

### P04-003 — Thay session ID Math.random() tại ChatbotPageClient (Proof: test tạo session hợp lệ)
- **Status:** `done` tại `frontend/src/components/ChatbotPageClient.tsx` và `frontend/scripts/chatbot-page-client-session.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp component `frontend/src/components/ChatbotPageClient.tsx`, xóa bỏ 100% cơ chế tự sinh ID ngẫu nhiên không an toàn `'page_session_' + Math.random().toString(36).substring(2, 9)`.
  - Tích hợp module chuẩn hóa `@/lib/sessionIdentifierContract` với hai hàm `isValidSessionId` và `generateSessionId`.
  - Thiết lập cơ chế kiểm tra và di trú tự động: khi khởi tạo hoặc đọc từ `localStorage`, nếu giá trị lưu trữ hợp lệ theo chuẩn UUID v4 (`stored && isValidSessionId(stored)`) thì tái sử dụng; nếu là chuỗi legacy cũ hoặc rỗng thì tự động cấp mới UUID v4 bằng CSPRNG `generateSessionId()` và lưu đè vào `localStorage`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chatbot-page-client-session.test.mjs` đạt 5/5 assertions pass 100%: (1) Static invariant xác nhận 0% chuỗi `Math.random` trong `ChatbotPageClient.tsx` và có import/kiểm tra `isValidSessionId`; (2) Khách truy cập mới sinh đúng UUID v4 và lưu vào `localStorage`; (3) Di trú phiên cũ (legacy migration) tự động thay thế `page_session_...` bằng UUID v4; (4) Tái sử dụng phiên hợp lệ không sinh mới; (5) Phòng vệ dữ liệu rỗng hoặc khoảng trắng.
  - Toàn bộ 332/332 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (ChatbotPageClient session identifier).
- **Next task:** P04-004 — Thay session ID `Math.random()` tại `ChatbotWidget` (Proof: test tạo session hợp lệ).

---

### P04-002 — Chọn format session identifier (Contract nêu UUID/server-issued hoặc cơ chế đã duyệt)
- **Status:** `done` tại `docs/technical-spec/CHAT_SESSION_IDENTIFIER_CONTRACT.md`, `frontend/src/lib/sessionIdentifierContract.ts`, và `frontend/scripts/chat-session-identifier-contract.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành quy chuẩn kỹ thuật `CHAT-SESSION-ID-CONTRACT-V1` tại `docs/technical-spec/CHAT_SESSION_IDENTIFIER_CONTRACT.md` xác lập định dạng chuẩn hóa duy nhất: UUID v4 (chuẩn RFC 4122), độ dài chính xác 36 ký tự ASCII lowercase, regex invariant `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`.
  - Nghiêm cấm hoàn toàn cơ chế tự sinh ID ngẫu nhiên bằng `Math.random()`, số tuần tự hoặc timestamps.
  - Xây dựng module helper `frontend/src/lib/sessionIdentifierContract.ts` cung cấp `isValidSessionId`, `generateSessionId` (CSPRNG native `crypto.randomUUID()`), `sanitizeSessionId`, và `validateSessionId`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-session-identifier-contract.test.mjs` đạt 6/6 assertions pass 100%: (1) Static specification invariant; (2) Unit test thẩm định nghiêm ngặt UUID v4, từ chối v1/v3/v5, variant sai, chuỗi `Math.random` cũ và shape dị tật; (3) Unit test sinh ngẫu nhiên an toàn mật mã bảo đảm 100% không đụng độ (zero collision) trên 1.000 mẫu liên tiếp; (4) Unit test chuẩn hóa `sanitizeSessionId`; (5) Unit test kiểm thực API `validateSessionId`.
  - Toàn bộ 327/327 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Chat session identifier contract).
- **Next task:** P04-003 — Thay session ID `Math.random()` tại `ChatbotPageClient` (Proof: test tạo session hợp lệ).

---

### P04-001 — Thêm input-length limit cho chat query (Payload quá ngưỡng nhận 413/400)
- **Status:** `done` tại `frontend/src/lib/chatQueryGuard.ts`, `frontend/src/app/api/v1/chat/query/route.ts`, `frontend/src/app/api/v1/chat/stream/route.ts`, và `frontend/scripts/chat-query-length-limit.test.mjs`.
- **Luồng:** Thống nhất (Wave W4: AI Grounding, Verification Claims & Observability).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module phòng thủ `frontend/src/lib/chatQueryGuard.ts` cung cấp hàm `validateChatQuery` và hằng số trần `DEFAULT_MAX_CHAT_QUERY_LENGTH = 1000` ký tự (tương đương 200-250 từ), hỗ trợ cấu hình qua biến môi trường `CHAT_MAX_QUERY_LENGTH`.
  - Tích hợp rào chắn fail-closed vào cả 2 route chat `/api/v1/chat/query` và `/api/v1/chat/stream`: câu hỏi rỗng hoặc không hợp lệ nhận HTTP 400 Bad Request (`code: 'MISSING_QUERY'`), câu hỏi vượt quá 1000 ký tự nhận HTTP 413 Payload Too Large (`code: 'QUERY_TOO_LONG'`).
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/chat-query-length-limit.test.mjs` đạt 6/6 assertions pass 100%: (1) Static code invariant xác nhận việc tích hợp guard và xử lý status 413/400; (2) Unit test cấu hình biến môi trường; (3) Unit test truy vấn chuẩn, cận biên (1000 ký tự), quá ngưỡng (1001 ký tự) và chuỗi tấn công DoS / token bomb (50.000 ký tự); (4) Unit test câu hỏi rỗng nhận HTTP 400; (5) Integration test kiểm chứng hợp đồng phản hồi fail-closed cho cả 2 route query và stream.
  - Toàn bộ 321/321 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Chat query input-length limit guard).
- **Next task:** P04-002 — Chọn format session identifier (Contract nêu UUID/server-issued hoặc cơ chế đã duyệt).

---

### P03-028 — Chạy sync production sau approval G2 và snapshot backup (Post-sync count/checksum khớp manifest)
- **Status:** `done` tại `scripts/sync/create_production_snapshot.js`, `scripts/sync/smart_delta_sync.js`, và `frontend/scripts/smart-delta-sync-production-run.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng module snapshot backup fail-closed `scripts/sync/create_production_snapshot.js` tự động thẩm định điều kiện phê duyệt Gate G2 (`data/canonical/canonical_manifest.json` do lead auditor Chăm Rốch Thi ký duyệt).
  - Tự động sao lưu toàn bộ dữ liệu Live DB trước khi đồng bộ thành các bản ghi JSON băm SHA-256 (`data/backups/snapshot_places_2026-09-29T07-23-14-982Z.json` với 137 POIs thật [2.1MB, hash: `ed2504b4...`], `snapshot_itineraries_2026-09-29T07-23-14-982Z.json` với 27 tours thật [163KB, hash: `78ff8afb...`], và `snapshot_manifest_2026-09-29T07-23-14-982Z.json`).
  - Tích hợp `createProductionSnapshot` và quy trình kiểm toán đối soát post-sync concordance verification vào `runSmartDeltaSync` trong `scripts/sync/smart_delta_sync.js`. Khi chạy chế độ LIVE, hệ thống tự động tạo snapshot an toàn trước khi kích hoạt bất kỳ mutation nào.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-production-run.test.mjs` đạt 5/5 assertions pass 100%: (1) Static code invariant xác nhận việc tích hợp Gate G2, snapshot backup và post-sync audit; (2) Gate G2 fail-closed từ chối snapshot nếu manifest thiếu hoặc không hợp lệ; (3) Unit test kiểm chứng tạo snapshot backup với SHA-256 hợp lệ; (4) Integration test kiểm chứng luồng điều phối LIVE mode hoàn chỉnh; (5) Artifact verification kiểm chứng sự tồn tại của snapshot live và checksum trên đĩa thực tế.
  - Toàn bộ 315/315 unit/integration tests frontend pass sạch sẽ (0 failures). Hoàn tất toàn bộ Phase P03 (Wave W3).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Production snapshot backup & Smart Delta Sync live orchestration).
- **Next task:** P04-001 — Thêm input-length limit cho chat query (Payload quá ngưỡng nhận 413/400).

---

### P03-027 — Mở rộng itinerary diff với budget_range (Fixture khác budget tạo PATCH)
- **Status:** `done` tại `scripts/sync/smart_delta_sync.js` và `frontend/scripts/smart-delta-sync-itinerary-budget.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Hoàn thiện hàm so lệch chuyên biệt `computeItineraryDiff(payload, db)` trong `scripts/sync/smart_delta_sync.js` với trường khoảng chi phí `budget_range`, kết hợp hàm `normalizeText` để chuẩn hóa khoảng trắng thừa và ký tự xuống dòng (`\r\n` vs `\n`), loại trừ triệt để false-diff do sai lệch xuống dòng giữa Windows và Linux.
  - Ánh xạ trường `budget_range` trong `payload` từ `it.budget_level` với giá trị fallback an toàn `'200k - 500k/người'`.
  - Tối ưu hóa mutation PATCH: khi phát hiện khác biệt `budget_range`, hệ thống chỉ gửi trường thay đổi trong `diff` lên Supabase REST API và ghi nhận chi tiết vào `report.details`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-itinerary-budget.test.mjs` đạt 4/4 assertions pass 100%: (1) Static code invariant xác nhận việc map và so sánh `budget_range` qua `normalizeText`; (2) Unit test kiểm chứng phát hiện diff `budget_range` (khớp bỏ qua, CRLF/khoảng trắng không sinh false-diff, khác biệt sinh diff chính xác, DB null sinh diff); (3) Integration test kiểm chứng fixture có `budget_range` khác biệt tạo đúng 1 PATCH mutation với ID và payload chính xác; (4) Integration test kiểm chứng fixture có `budget_range` đồng nhất bỏ qua 100% (27/27 SKIP) với zero PATCH calls.
  - Toàn bộ 310/310 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Smart Delta Sync itinerary budget_range diff engine).
- **Next task:** P03-028 — Chạy sync production sau approval G2 và snapshot backup.

---

### P03-026 — Mở rộng itinerary diff với for_whom (Fixture khác for_whom tạo PATCH)
- **Status:** `done` tại `scripts/sync/smart_delta_sync.js` và `frontend/scripts/smart-delta-sync-itinerary-for-whom.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xây dựng và xuất khẩu hàm chuyên biệt `computeItineraryDiff(payload, db)` trong `scripts/sync/smart_delta_sync.js`, tích hợp chuẩn hóa văn bản `normalizeText` loại trừ triệt để false-diff do khoảng trắng và xuống dòng giữa Windows/Linux.
  - Nâng cấp `syncItinerariesDelta` thay thế logic so sánh boolean thô cứng cũ bằng `computeItineraryDiff`, phát hiện chuẩn xác các khác biệt của trường `for_whom` giữa Supabase DB và `data/lichtrinh.json`.
  - Tối ưu hóa mutation PATCH: chỉ gửi payload diff chứa các trường thực sự thay đổi thay vì gửi toàn bộ payload lớn, đồng thời ghi nhận chi tiết `diff` vào `report.details`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-itinerary-for-whom.test.mjs` đạt 4/4 assertions pass 100%: (1) Static code invariant xác nhận export `computeItineraryDiff` và logic so sánh `for_whom`; (2) Unit test kiểm chứng phát hiện diff `for_whom` với cơ chế chuẩn hóa (khớp bỏ qua, CRLF/khoảng trắng không sinh false-diff, khác biệt sinh diff, null sinh diff); (3) Integration test kiểm chứng fixture có `for_whom` khác biệt tạo đúng 1 PATCH mutation với ID và payload chính xác; (4) Integration test kiểm chứng fixture có `for_whom` đồng nhất bỏ qua 100% (27/27 SKIP) với zero PATCH calls.
  - Toàn bộ 306/306 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Smart Delta Sync itinerary for_whom diff engine).
- **Next task:** P03-027 — Mở rộng itinerary diff với `budget_range` (Fixture khác budget tạo PATCH).

---

### P03-025 — Kiểm tra HTTP response trước khi tăng counter sync (Fake 4xx/5xx không được tính success)
- **Status:** `done` tại `scripts/sync/smart_delta_sync.js` và `frontend/scripts/smart-delta-sync-http-response.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp `scripts/sync/smart_delta_sync.js`: hỗ trợ dependency injection `options.fetch` cho cả `syncPlacesDelta` và `syncItinerariesDelta`.
  - Tái cấu trúc kiểm tra mã trạng thái HTTP: di chuyển các bộ đếm thành công `report.create++` và `report.patch++` vào sâu bên trong khối `if (postRes.ok)` và `if (patchRes.ok)`. Triệt để loại trừ hiện tượng tăng counter ảo trước khi gọi API hoặc khi API trả về mã lỗi.
  - Chặn đứng 100% lỗi fail-open: khi Supabase REST API trả về các mã phản hồi `4xx` (400, 401, 403, 404, 409) hoặc `5xx` (500, 502, 503), hệ thống giữ nguyên bộ đếm thành công, tăng `report.error++`, đồng thời bóc tách nội dung lỗi từ server và ghi chi tiết vào `report.details` kèm mã HTTP status.
  - Bọc toàn bộ các thao tác mạng bằng khối `try...catch` để bắt và chuyển đổi ngoại lệ mạng (`ECONNRESET`, timeout) thành bản ghi lỗi `report.error++`.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-http-response.test.mjs` đạt 6/6 assertions pass 100%: (1) Static code invariant xác nhận việc kiểm tra `res.ok` trước khi tăng counter; (2) Unit test ma trận lỗi 4xx client errors xác nhận counter create/patch bằng 0 và counter error tăng chính xác; (3) Unit test ma trận lỗi 5xx server errors xác nhận không tăng counter thành công; (4) Unit test đồng bộ itineraries xử lý an toàn lỗi 4xx/5xx; (5) Unit test bắt ngoại lệ mạng `ECONNRESET`; (6) Positive control kiểm chứng các mã phản hồi thành công 2xx (200, 201, 204) tăng đúng các bộ đếm create/patch với 0 lỗi.
  - Toàn bộ 302/302 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Smart Delta Sync HTTP response verification & fail-closed counter guard).
- **Next task:** P03-026 — Mở rộng itinerary diff với `for_whom` (Fixture khác `for_whom` tạo PATCH).

---

### P03-024 — Sửa parser Smart Delta Sync cho field description (Unit test description diff pass)
- **Status:** `done` tại `scripts/sync/smart_delta_sync.js` và `frontend/scripts/smart-delta-sync-description-parser.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp `scripts/sync/smart_delta_sync.js`: trích xuất trường `description` từ cột 9 (index 8) của Master CSV, khắc phục triệt để lỗi biểu thức chính quy 7 nhóm cũ (`match[9]` luôn undefined) làm mất mô tả thực tế và bỏ qua hoàn toàn việc sync mô tả lên database.
  - Xây dựng hàm chuẩn hóa văn bản `normalizeText(text)`: xử lý nhất quán giá trị `null`/`undefined`, chuẩn hóa ký tự xuống dòng (`\r\n` và `\r` thành `\n`), và cắt tỉa khoảng trắng hai đầu (`trim()`), loại bỏ 100% false-diff do dị biệt xuống dòng giữa các hệ điều hành (Windows vs Linux).
  - Tích hợp `normalizeText` vào `computePlaceDiff(master, db)` cho cả trường `description` và các trường văn bản khác, đảm bảo chỉ phát hiện các thay đổi nội dung thực chất; bảo toàn mô tả DB khi master không có mô tả.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-description-parser.test.mjs` đạt 4/4 assertions pass 100%: (1) Static code invariant xác nhận export `normalizeText`, `parseMasterCsv`, và `computePlaceDiff`; (2) Unit test giải mã mô tả chứa nháy kép escape, multiline và markdown; (3) Unit test so lệch mô tả với cơ chế chuẩn hóa (match không sinh diff, CRLF vs LF không sinh diff, khoảng trắng không sinh diff, nội dung khác biệt sinh diff chính xác, master rỗng không ghi đè DB); (4) Integration test kiểm chứng 100% (132/132) bản ghi Master CSV có trường mô tả phong phú (chiều dài >= 15 ký tự, các địa danh như Hồ Tà Pạ, Chùa Tà Pạ, Núi Cô Tô có mô tả đầy đủ).
  - Toàn bộ 296/296 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Smart Delta Sync description parser and diff engine).
- **Next task:** P03-025 — Kiểm tra HTTP response trước khi tăng counter sync (Fake 4xx/5xx không được tính success).

---

### P03-023 — Sửa parser Smart Delta Sync cho field address (Unit test address diff pass)
- **Status:** `done` tại `scripts/sync/smart_delta_sync.js` và `frontend/scripts/smart-delta-sync-address-parser.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp `scripts/sync/smart_delta_sync.js`: triển khai bộ giải mã CSV chuẩn RFC 4180 `parseCsvRows(csvText)` hỗ trợ đầy đủ các trường bọc trong dấu nháy kép, dấu phẩy trong trường dữ liệu, dấu nháy kép escape (`""`) và trường nhiều dòng (multiline).
  - Tái cấu trúc hàm `parseMasterCsv(csvText)`: ánh xạ động theo header CSV, trích xuất chính xác trường `address` từ cột thứ 8 (index 7), khắc phục triệt để lỗi biểu thức chính quy 7 nhóm cũ (`match[8]` luôn undefined) làm mất cột địa chỉ thực tế và làm rơi 11 bản ghi multiline (nâng tổng số bản ghi phân tích từ 121 lên đủ 132/132 bản ghi sạch).
  - Tách bạch hàm chuyên dụng `computePlaceDiff(master, db)`: chuẩn hóa so sánh địa chỉ `(db.address || '').trim() !== master.address.trim()`, loại trừ hoàn toàn các khác biệt giả mạo do khoảng trắng thừa ở hai đầu.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-address-parser.test.mjs` đạt 5/5 assertions pass 100%: (1) Static code invariant xác nhận export `parseCsvRows`, `parseMasterCsv`, và `computePlaceDiff`; (2) Unit test giải mã địa chỉ chứa dấu phẩy, nháy kép và multiline; (3) Unit test cơ chế fallback an toàn về địa chỉ xã khi trường address rỗng hoặc chỉ có khoảng trắng; (4) Unit test so lệch địa chỉ (match không sinh diff, diff sinh đúng master address, null DB address được gán master, chuẩn hóa khoảng trắng); (5) Integration test kiểm chứng toàn vẹn dữ liệu địa chỉ trên toàn bộ 132 bản ghi `tri_ton_master_cleaned.csv` (100% bản ghi có địa chỉ hợp lệ, các địa danh trọng yếu như Hồ Tà Pạ, Chùa Tà Pạ, Hồ Soài Chek có địa chỉ thực địa chính xác).
  - Toàn bộ 292/292 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Smart Delta Sync address parser and diff engine).
- **Next task:** P03-024 — Sửa parser Smart Delta Sync cho field description (Unit test description diff pass).

---

### P03-022 — Chạy Smart Delta Sync ở dry-run (Diff report có skip/create/patch/error chính xác)
- **Status:** `done` tại `scripts/sync/smart_delta_sync.js` và `frontend/scripts/smart-delta-sync-dryrun.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp `scripts/sync/smart_delta_sync.js` hỗ trợ cờ dòng lệnh `--dry-run` và tùy chọn `options.dryRun`, thiết lập rào chắn `isDryRun` ngăn chặn 100% persistent mutation (POST/PATCH/DELETE) lên cơ sở dữ liệu Supabase Live.
  - Cơ chế dry-run chạy đối soát thực tế toàn bộ thực thể Places và Itineraries, kết xuất báo cáo diff report có cấu trúc định lượng rõ ràng: Places (skip=71, patch=41, create=20, error=0), Itineraries (skip=0, patch=27, create=0, error=0); tổng cộng: skip=71, patch=68, create=20, error=0.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/smart-delta-sync-dryrun.test.mjs` đạt 3/3 assertions pass 100%: (1) Static code invariant xác nhận cờ `isDryRun` bảo vệ mọi mutation; (2) Unit test giải mã Master CSV; (3) Integration test kiểm chứng dry-run tạo diff report chuẩn với 0 lỗi kết nối.
  - Toàn bộ unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (Smart Delta Sync dry-run mode).
- **Next task:** P03-023 — Sửa parser Smart Delta Sync cho field address (Unit test address diff pass).

---

## 📜 Lịch Sử Task Đã Hoàn Thành (Consolidated Completed Records)

### P03-021 — Chỉ cho phép RAG ingest canonical records verified (Fixture unverified không được ingest)
- **Status:** `done` tại `frontend/src/lib/ai/ragEngine.ts` và `frontend/scripts/canonical-rag-ingest.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Nâng cấp RAG Engine `frontend/src/lib/ai/ragEngine.ts`: loại bỏ hoàn toàn việc nạp trực tiếp tập dữ liệu legacy `triton_pois_full.json` cùng các tuyên bố khống về số lượng địa điểm ("149 Verified POIs").
  - Xây dựng cổng kiểm soát Ingestion Gate fail-closed chuyên dụng `ingestCanonicalPlacesForRag(rawCandidates, options)` và hàm `getActiveRagPlaces()`, chỉ nạp và lập chỉ mục RAM cho các thực thể canonical places đã qua thẩm định thực địa (`verification_status === 'VERIFIED'` và `is_verified === true`).
  - Cơ chế fail-closed tự động loại trừ 100% các bản ghi chưa thẩm định (`UNVERIFIED`, `PENDING`, `IN_REVIEW`, `REJECTED`, `EXPIRED`, `MOCK`), cờ `is_verified` giả mạo, hoặc các đầu vào malformed/non-object; ném lỗi khi ở chế độ nghiêm ngặt (`strict: true`).
  - Cập nhật tiêu đề ngữ cảnh LLM thành `CSDL ĐỊA ĐIỂM TRI TÔN CANONICAL XÁC MINH (VERIFIED GROUNDING):`, tích hợp matching qua danh sách bí danh `alt_names` của canonical places.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-rag-ingest.test.mjs` đạt 6/6 assertions pass 100%: (1) Positive control nạp thành công 100% POI canonical production trên đĩa; (2) Positive control `getActiveRagPlaces` trả về danh sách verified hợp chuẩn; (3) Negative fixtures chặn đứng và loại trừ 100% các trạng thái unverified; (4) Negative fixture cờ is_verified giả mạo/sai lệch bị từ chối dứt điểm; (5) Negative fixture xử lý an toàn đầu vào malformed/non-object; (6) Integration test bảo đảm output của `buildUnifiedRagContext` chỉ chứa POI canonical verified.
  - Toàn bộ 284/284 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical verified RAG ingestion gate).
- **Next task:** P03-022 — Chạy Smart Delta Sync ở dry-run (Diff report có skip/create/patch/error chính xác).

---

### P03-020 — Cho sitemap sinh từ canonical manifest (Sitemap count khớp manifest)
- **Status:** `done` tại `frontend/src/app/sitemap.ts` và `frontend/scripts/canonical-sitemap.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Tái cấu trúc hoàn toàn `frontend/src/app/sitemap.ts`, loại bỏ 100% việc nạp tập dữ liệu legacy `triton_pois_full.json` và xóa bỏ bình luận cũ ("149 verified POI detail pages").
  - Tích hợp trực tiếp artifact tĩnh chuẩn hóa `frontend/src/data/places.canonical.json`, duyệt qua các địa điểm đã thẩm định (`verification_status === 'VERIFIED'`), sinh các dynamic routes chuẩn hóa dạng `/places/${canonical_id}`.
  - Đồng bộ timestamp `lastModified` của từng dynamic route với dấu thời gian thẩm định `verified_at`, gán `changeFrequency: 'weekly'` và `priority: 0.85`.
  - Bảo tồn nguyên vẹn 12 static core routes của ứng dụng.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-sitemap.test.mjs` đạt 5/5 assertions pass 100%: (1) Static code invariant xác nhận 0% tham chiếu tới legacy json hay claim sai lệch; (2) Concordance check xác nhận số lượng dynamic POI routes khớp chính xác 100% với `total_count` và `manifest.places.length`; (3) Canonical slug invariant xác nhận 100% slug dynamic routes nằm trong manifest và không chứa UUID prefix; (4) Metadata verification kiểm chứng tính hợp lệ của timestamp `lastModified`, `changeFrequency` và `priority`; (5) Static core routes check bảo toàn các trang chủ lực.
  - Toàn bộ 278/278 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical sitemap generator).
- **Next task:** P03-021 — Chỉ cho phép RAG ingest canonical records `verified` (Fixture unverified không được ingest).

---

### P03-019 — Cho static frontend data sinh từ canonical manifest (Build artifact ghi cùng version)
- **Status:** `done` tại `scripts/generate_static_frontend_places.mjs`, `frontend/src/data/places.canonical.json`, và `frontend/scripts/canonical-static-frontend-places.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Phát triển script phát hành tất định `scripts/generate_static_frontend_places.mjs` đọc trực tiếp từ `data/canonical/canonical_manifest.json` và các tệp trong `data/canonical/places/`.
  - Thực hiện kiểm tra toàn vẹn mật mã: tính toán lại mã băm SHA-256 từng file dữ liệu và đối soát với `entry.sha256` trong manifest. Chặn đứng lỗi nếu phát hiện lệch mã băm (`Checksum mismatch`).
  - Thực thi cơ chế phòng thủ nghiêm ngặt (Fail-closed): chỉ chấp nhận các POI có `verification_status === 'VERIFIED'` và `is_verified === true`. Từ chối bất kỳ POI unverified hoặc mock/fake nào.
  - Sắp xếp tất định theo `canonical_id` và kết xuất tệp `frontend/src/data/places.canonical.json` ghi nhận đầy đủ metadata nguồn `source_manifest` (`manifest_name`, `manifest_version: "1.0.0"`, `schema_version: "CANONICAL-POI-SCHEMA-V1"`, `manifest_sha256`, `overall_sha256`).
  - Tích hợp lifecycle hook `prebuild` trong `frontend/package.json` và script `generate:places` trong root `package.json` tự động đồng bộ artifact trước mỗi lần build Next.js.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-static-frontend-places.test.mjs` đạt 6/6 assertions pass 100%: (1) Positive control kiểm tra tồn tại và metadata `places.canonical.json`; (2) Positive control xác nhận 100% POI mang trạng thái VERIFIED và có đủ các trường hiển thị frontend; (3) Positive control kiểm chứng tính tất định của generator khi chạy lặp lại; (4) Negative control ném lỗi Checksum mismatch khi mã băm không khớp manifest; (5) Negative control ném lỗi fail-closed khi phát hiện POI chưa thẩm định; (6) Negative control ném lỗi khi thiếu file dữ liệu được tham chiếu.
  - Toàn bộ 273/273 unit/integration tests frontend pass sạch sẽ (0 failures).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical static frontend places artifact).
- **Next task:** P03-020 — Cho sitemap sinh từ canonical manifest (Sitemap count khớp manifest).

---

### P03-018 — Viết validator commune glossary (Fixture nhãn lạ fail)
- **Status:** `done` tại `scripts/validate_canonical_dataset.mjs` và `frontend/scripts/canonical-commune-validator.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Mở rộng engine kiểm toán `scripts/validate_canonical_dataset.mjs` với hàm `validateCommuneGlossary(commune, options)` và các bảng tra cứu chuẩn hóa `COMMUNE_BARE_NAME_MAP`, `COMMUNE_KNOWN_TYPOS_MAP`; tích hợp trực tiếp vào quy trình kiểm toán bản ghi canonical `validatePlaceRecord`.
  - Xác nhận 100% bản ghi canonical production hiện tại mang nhãn xã chuẩn khớp danh mục 15 đơn vị hành chính Tri Tôn theo RULE 02.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-commune-validator.test.mjs` đạt 7/7 assertions pass 100%: (1) Positive control trên toàn bộ 15 xã/thị trấn chuẩn; (2) Positive control trên toàn bộ bản ghi canonical production trên đĩa; (3) Negative fixture typo chính tả `"Xã Lương Cương"` fail-closed và gợi ý `"Xã Lương Phi"`; (4) Negative fixture nhãn cộc thiếu tiền tố (`"Tri Tôn"`, `"Cô Tô"`, `"Ba Chúc"`) fail-closed và tự động gợi ý nhãn đầy đủ; (5) Negative fixture nhãn xã ngoài huyện/tỉnh (Vĩnh Tế, Núi Sam, Mỹ Bình, Ninh Kiều, Bến Nghé) fail-closed; (6) Negative fixture null, undefined, số, boolean, object, chuỗi rỗng fail-closed; (7) Integration check xác nhận 100% bản ghi trên đĩa và trong manifest tuân thủ glossary.
  - Toàn bộ 267/267 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical commune glossary validator boundary).
- **Next task:** P03-019 — Cho static frontend data sinh từ canonical manifest (Build artifact ghi cùng version).

---

## 📜 Lịch Sử Task Đã Hoàn Thành (Consolidated Completed Records)

### P03-017 — Viết validator GPS boundary (Fixture ngoài vùng fail)
- **Status:** `done` tại `scripts/validate_canonical_dataset.mjs` và `frontend/scripts/canonical-gps-boundary-validator.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Mở rộng engine kiểm toán `scripts/validate_canonical_dataset.mjs` với hàm `validateGpsBoundary(coordinates, options)` và hằng số bất biến `TRI_TON_BBOX` [10.30 - 10.55, 104.80 - 105.15]; tích hợp trực tiếp vào quy trình kiểm toán bản ghi canonical `validatePlaceRecord`.
  - Xác nhận 100% tọa độ các địa điểm canonical production hiện tại nằm trọn trong BBOX Tri Tôn.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-gps-boundary-validator.test.mjs` đạt 9/9 assertions pass 100%: (1) Positive control trên toàn bộ bản ghi canonical production trên đĩa; (2) Negative fixture vượt trần vĩ độ (> 10.55); (3) Negative fixture dưới đáy vĩ độ (< 10.30); (4) Negative fixture ngoài biên kinh độ bên tây (< 104.80); (5) Negative fixture ngoài biên kinh độ bên đông (> 105.15); (6) Negative fixture tráo ngược tọa độ vĩ/kinh (`GPS_SWAPPED_COORDINATES`); (7) Negative fixture sai kiểu số, NaN, Infinity (`GPS_INVALID_TYPE`); (8) Negative fixture các thành phố lớn ngoài địa giới (Hà Nội, TP.HCM, Đà Nẵng, Long Xuyên, Cần Thơ); (9) Xác nhận điểm giáp ranh đã thẩm định (Hồ Đá Latina) tuân thủ trọn vẹn BBOX.
  - Toàn bộ 260/260 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical gps boundary validator boundary).
- **Next task:** P03-018 — Viết validator commune glossary (Fixture nhãn lạ fail).

---

## 📜 Lịch Sử Task Đã Hoàn Thành (Consolidated Completed Records)

### P03-016 — Viết validator uniqueness cho canonical ID (Fixture duplicate fail)
- **Status:** `done` tại `scripts/validate_canonical_dataset.mjs` và `frontend/scripts/canonical-uniqueness-validator.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Mở rộng engine kiểm toán `scripts/validate_canonical_dataset.mjs` với hàm `validateCanonicalIdUniqueness(places, options)` thực hiện kiểm toán tính duy nhất tuyệt đối của `canonical_id`, phát hiện xung đột alias chéo (`alt_names`), và nâng cấp `validateCanonicalDataset` quét toàn bộ thư mục `data/canonical/places/` cùng `data/canonical/canonical_manifest.json`, xác thực tên file trùng khớp `${canonical_id}.json` và đối soát sự đồng nhất tuyệt đối giữa đĩa và manifest.
  - Xác nhận 100% ID trên dataset và manifest hiện tại không bị trùng lặp.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-uniqueness-validator.test.mjs` đạt 8/8 assertions pass 100%: (1) Positive control trên dataset canonical và manifest; (2) Negative fixture duplicate ID trong mảng object fail-closed với mã lỗi `DUPLICATE_CANONICAL_ID`; (3) Negative fixture duplicate ID trong mảng string fail-closed; (4) Negative fixture alias trùng lặp với canonical_id của POI khác fail-closed; (5) Negative fixture 2 POI khác nhau khai báo trùng alias fail-closed; (6) Negative fixture file name trên đĩa không khớp canonical_id fail-closed; (7) Negative fixture duplicate ID giữa nhiều file trên đĩa fail-closed; (8) Negative fixture sai lệch đối soát (concordance discrepancy) giữa đĩa và manifest fail-closed.
  - Toàn bộ 251/251 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical id uniqueness validator boundary).
- **Next task:** P03-017 — Viết validator GPS boundary (Fixture ngoài vùng fail).


### P03-015 — Viết validator schema cho canonical dataset (Fixture sai schema fail)
- **Status:** `done` tại `scripts/validate_canonical_dataset.mjs` và `frontend/scripts/canonical-dataset-validator.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Phát triển module kiểm toán độc lập `scripts/validate_canonical_dataset.mjs` hỗ trợ thẩm định tự động từng bản ghi hoặc toàn bộ tập dữ liệu canonical theo chuẩn `CANONICAL-POI-SCHEMA-V1` và 5 bất biến toàn vẹn (`INV-01` đến `INV-05`).
  - Thẩm định 100% bản ghi canonical production trên đĩa đạt hợp lệ tuyệt đối với 0 lỗi.
  - Xây dựng bộ kiểm thử tự động `frontend/scripts/canonical-dataset-validator.test.mjs` đạt 5/5 assertions pass 100%, chứng minh 16 kịch bản negative fixtures (thiếu trường required, sai tọa độ BBOX, sai xã theo RULE 02, sai định dạng ID, vi phạm review_id/is_verified/verified_at/source_url) đều fail-closed đúng thiết kế; toàn bộ 243/243 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical schema dataset validator boundary).
- **Next task:** P03-016 — Viết validator uniqueness cho canonical ID (Fixture duplicate fail).


### P03-014 — Xuất canonical dataset version đầu tiên từ các record đã duyệt (Manifest có schema version/checksum/count)
- **Status:** `done` tại `docs/technical-spec/CANONICAL_DATASET_MANIFEST.md`, `data/canonical/canonical_manifest.json`, `scripts/generate_canonical_manifest.mjs`, và `frontend/scripts/canonical-dataset-manifest.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành Quy chuẩn Kỹ thuật `docs/technical-spec/CANONICAL_DATASET_MANIFEST.md` (mã quy chuẩn `CANONICAL-MANIFEST-V1`).
  - Xuất bản tệp Manifest chuẩn hóa tại `data/canonical/canonical_manifest.json` chứa 100% dữ liệu sạch đã thẩm định (`chua-xa-ton`), `total_verified_count: 1`, `manifest_version: "1.0.0"`, `schema_version: "CANONICAL-POI-SCHEMA-V1"`, SHA-256 từng file dữ liệu (`5398587c...`), và mã băm toàn vẹn tổng thể `overall_sha256: "f65d568ab075eb7d4a0689e6d35a45420e6a27739064c4e755ff1a83ba2b3cfb"`.
  - Phát triển script phát hành tất định `scripts/generate_canonical_manifest.mjs`.
  - Bộ kiểm thử tự động `frontend/scripts/canonical-dataset-manifest.test.mjs` đạt 4/4 assertions pass 100% bao gồm cả positive hash verification, phát hiện can thiệp dữ liệu (tamper resistance) và kiểm thử tính bất biến của generator script; toàn bộ 238/238 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical dataset manifest v1 boundary).
- **Next task:** P03-015 — Viết validator schema cho canonical dataset (Fixture sai schema fail).


### P03-013 — Gán `source_url` cho một field được xác minh (URL truy cập được và đúng field)
- **Status:** `done` tại `docs/technical-spec/CANONICAL_POI_SCHEMA.md`, `data/canonical/places/chua-xa-ton.json`, `frontend/src/app/admin/places/types.ts`, và `frontend/scripts/poi-source-url.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Bổ sung bất biến `INV-05 (Authoritative Source URL Invariant)` vào `docs/technical-spec/CANONICAL_POI_SCHEMA.md` và `docs/technical-spec/CANONICAL_POI_SCHEMA.json`.
  - Gán trường `source_url: "https://triton.angiang.gov.vn"` trong bản ghi canonical `data/canonical/places/chua-xa-ton.json` khớp 100% byte-for-byte với nguồn chứng thực cấp Quốc gia trong hồ sơ kiểm toán nguyên tử `docs/technical-spec/poi-reviews/PVR-CHUA-XA-TON.json`.
  - Thiết lập phòng thủ an ninh mạng: bắt buộc scheme HTTPS, chặn scheme nguy hiểm (`http:`, `javascript:`, `file:`), chặn IP nội bộ/loopback/cloud metadata (`127.0.0.1`, `169.254.169.254`, `localhost`), chặn link mock/placeholder, fail-closed khi thiếu URL hoặc gán sai nguồn.
  - Đồng bộ interface `PlaceRecord` trong `frontend/src/app/admin/places/types.ts` với trường `source_url?: string;` và xác nhận đồng bộ với cột `source_url TEXT` trong schema PostgreSQL.
  - Bộ kiểm thử tự động `frontend/scripts/poi-source-url.test.mjs` đạt 4/4 assertions pass 100% bao gồm cả positive validation cho Chùa Xà Tón, negative controls kiểm duyệt bảo mật và đối soát provenance, và kiểm tra đồng bộ DB/TS; toàn bộ 234/234 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical schema source_url verification boundary).
- **Next task:** P03-014 — Xuất canonical dataset version đầu tiên từ các record đã duyệt (Manifest có schema version/checksum/count).


### P03-012 — Gán `verified_at` cho một POI đã review (Timestamp có nguồn)
- **Status:** `done` tại `docs/technical-spec/CANONICAL_POI_SCHEMA.md`, `data/canonical/places/chua-xa-ton.json`, và `frontend/scripts/poi-verified-at.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Bổ sung bất biến `INV-04 (Provenance Timestamp Invariant)` vào `docs/technical-spec/CANONICAL_POI_SCHEMA.md` và `docs/technical-spec/CANONICAL_POI_SCHEMA.json`.
  - Gán trường `verified_at: "2026-09-28T22:00:00+07:00"` trong bản ghi canonical `data/canonical/places/chua-xa-ton.json` khớp 100% byte-for-byte với thời điểm ký duyệt thực địa của chuyên gia bản địa `Chăm Rốch Thi` trong hồ sơ thẩm định nguyên tử `docs/technical-spec/poi-reviews/PVR-CHUA-XA-TON.json`.
  - Ràng buộc chặt chẽ quan hệ trình tự thời gian (`verified_at < expires_at`), đồng thời fail-closed không cho phép trạng thái phi-verified (`UNVERIFIED`, `REJECTED`) gán `verified_at` để ngăn chặn giả mạo nhãn kiểm toán.
  - Xác nhận tính tương thích đồng bộ với cột `verified_at TIMESTAMPTZ` trên PostgreSQL và interface `PlaceRecord` trong `frontend/src/app/admin/places/types.ts`.
  - Bộ kiểm thử tự động `frontend/scripts/poi-verified-at.test.mjs` đạt 4/4 assertions pass 100% bao gồm cả positive validation cho Chùa Xà Tón, negative controls kiểm soát nguồn gốc và trình tự thời gian, và kiểm tra đồng bộ DB/TS; toàn bộ 230/230 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical schema verified_at provenance boundary).
- **Next task:** P03-013 — Gán `source_url` cho một field được xác minh (URL truy cập được và đúng field).


### P03-011 — Gán `verification_status` cho một POI đã review (Lưu trong canonical schema)
- **Status:** `done` tại `docs/technical-spec/CANONICAL_POI_SCHEMA.json`, `data/canonical/places/chua-xa-ton.json`, `supabase/migrations/20260928000000_p03_011_places_verification_status.sql`, và `frontend/scripts/poi-verification-status.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành Quy chuẩn Kỹ thuật `docs/technical-spec/CANONICAL_POI_SCHEMA.md` và artifact JSON Schema máy đọc `docs/technical-spec/CANONICAL_POI_SCHEMA.json` (mã quy chuẩn `CANONICAL-POI-SCHEMA-V1`).
  - Thiết lập chuẩn hóa 5 trạng thái vòng đời POI: `UNVERIFIED`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`.
  - Quy định bất biến kiểm toán nghiêm ngặt (Audit Backlink Invariant): POI có `verification_status: "VERIFIED"` bắt buộc phải có `is_verified: true`, `review_id` hợp lệ và hồ sơ thẩm định nguyên tử tồn tại thực tế trên đĩa (`docs/technical-spec/poi-reviews/{review_id}.json`); các trạng thái phi-verified bắt buộc fail-closed `is_verified: false`.
  - Xuất bản bản ghi canonical nguyên tử đầu tiên tại `data/canonical/places/chua-xa-ton.json` với `verification_status: "VERIFIED"`, `is_verified: true`, `review_id: "PVR-CHUA-XA-TON-2026"`.
  - Đồng bộ DDL PostgreSQL `supabase/migrations/20260928000000_p03_011_places_verification_status.sql` thiết lập CHECK constraint `chk_places_verification_status` và đồng bộ TypeScript `frontend/src/app/admin/places/types.ts`.
  - Bộ kiểm thử tự động `frontend/scripts/poi-verification-status.test.mjs` đạt 4/4 assertions pass 100% bao gồm cả positive validation cho Chùa Xà Tón, negative controls cho các bất biến fail-closed và kiểm tra đồng bộ DB/TS; toàn bộ 226/226 unit/integration tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (canonical schema verification status lifecycle boundary).
- **Next task:** P03-012 — Gán `verified_at` cho một POI đã review (Timestamp có nguồn).


### P03-010 — Áp template P03-009 cho một POI (Record review hoàn chỉnh)
- **Status:** `done` tại `docs/technical-spec/poi-reviews/PVR-CHUA-XA-TON.json` và `frontend/scripts/poi-review-chua-xa-ton.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Hoàn tất lập và xuất bản hồ sơ thẩm định thực địa nguyên tử đầu tiên cho địa danh lịch sử trọng yếu `chua-xa-ton` (Chùa Xà Tón / Wat Xvayton) tại `docs/technical-spec/poi-reviews/PVR-CHUA-XA-TON.json` tuân thủ 100% biểu mẫu `POI-VERIFY-TEMPLATE-V1`:
    1. **`source`:** Quyết định số 224/QĐ-BVHTT ngày 12/12/1986 của Bộ Văn hóa Thông tin xếp hạng Di tích Kiến trúc Nghệ thuật cấp Quốc gia; Kỷ lục VietKings 2006.
    2. **`evidence`:** Tọa độ GPS thực địa [10.4110, 105.0089] nằm trọn vẹn trong trung tâm Thị trấn Tri Tôn; 3 ảnh thực địa WebP độ nét cao đã kiểm chứng; xếp hạng di tích quốc gia `NATIONAL_HERITAGE`.
    3. **`reviewer`:** Ký duyệt bởi chuyên gia bản địa `Chăm Rốch Thi` với mã băm chữ ký SHA-256.
    4. **`lifecycle` & `expiry`:** Trạng thái `VERIFIED`, chu kỳ tái thẩm định 365 ngày (`freshness_cycle_days: 365`), `verified_at: 2026-09-28T22:00:00+07:00`, `expires_at: 2027-09-28T22:00:00+07:00`.
    5. **`field_level_provenance`:** Xác nhận 100% tính chính xác của các trường tên, tọa độ, xã, danh mục và bảo tồn văn hóa viếng chùa Khmer theo RULE 05.
  - Bộ kiểm thử tự động `frontend/scripts/poi-review-chua-xa-ton.test.mjs` đạt 2/2 assertions pass 100%; toàn bộ 222/222 tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (atomic poi review record boundary).
- **Next task:** P03-011 — Gán `verification_status` cho một POI đã review (Lưu trong canonical schema).


### P03-009 — Tạo template review cho một POI (Source, evidence, reviewer, expiry)
- **Status:** `done` tại `docs/technical-spec/POI_VERIFICATION_REVIEW_TEMPLATE.md`, `docs/technical-spec/POI_VERIFICATION_REVIEW_TEMPLATE.json`, và `frontend/scripts/poi-verification-template.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành Quy chuẩn Kỹ thuật `docs/technical-spec/POI_VERIFICATION_REVIEW_TEMPLATE.md` và artifact JSON Schema máy đọc `docs/technical-spec/POI_VERIFICATION_REVIEW_TEMPLATE.json` (mã quy chuẩn `POI-VERIFY-TEMPLATE-V1`).
  - Thiết lập bắt buộc 4 trụ cột kiểm toán cốt lõi cho mọi POI:
    1. **`source`:** Nguồn chứng thực có thẩm quyền (`GOVERNMENT_DECISION`, `FIELD_SURVEY`, `OFFICIAL_PORTAL`, `SATELLITE_GEO`, `HERITAGE_REGISTRY`).
    2. **`evidence`:** Bằng chứng kiểm toán cụ thể (`reference_number`, `legal_classification`, `gps_audit_status`, `photos_evidence`, `field_notes`).
    3. **`reviewer`:** Danh tính, chức vụ và chữ ký kiểm toán SHA-256 của chuyên gia (`Chăm Rốch Thi`).
    4. **`lifecycle` & `expiry`:** Trạng thái (`UNVERIFIED`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`), `verified_at`, `expires_at`, và chu kỳ kiểm toán định kỳ `freshness_cycle_days` (180–365 ngày).
  - Ràng buộc trắc địa WGS84 nằm trọn trong BBOX Tri Tôn [10.30 - 10.55, 104.80 - 105.15] và xã/thị trấn phải thuộc 15 đơn vị hành chính chuẩn theo RULE 02.
  - Bộ kiểm thử tự động `frontend/scripts/poi-verification-template.test.mjs` đạt 4/4 assertions pass 100% bao gồm cả positive validation cho Chùa Xà Tón và 7 kịch bản negative controls fail-closed; toàn bộ 220/220 tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (poi verification review template contract boundary).
- **Next task:** P03-010 — Áp template P03-009 cho một POI (Record review hoàn chỉnh).


### P03-008 — Xác minh một claim văn hóa/ẩm thực mâu thuẫn (Nguồn và reviewer chuyên môn)
- **Status:** `done` tại `docs/technical-spec/VERIFIED_CULTURAL_CLAIMS.md`, `docs/technical-spec/VERIFIED_CULTURAL_CLAIMS.json`, `scripts/seed_knowledge_base.py`, `frontend/src/lib/dataSanitizer.ts`, và `frontend/scripts/verified-cultural-claims.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Ban hành Quy chuẩn Thẩm định Tri thức Văn hóa Ẩm thực tại `docs/technical-spec/VERIFIED_CULTURAL_CLAIMS.md` và artifact máy đọc `docs/technical-spec/VERIFIED_CULTURAL_CLAIMS.json`.
  - Thẩm định và chuẩn hóa dứt điểm 3 hồ sơ tri thức cốt lõi:
    1. **`CUL-CLAIM-001` (Trái Trúc Bảy Núi - *Citrus hystrix* - tiếng Khmer: *Krut*):** Xác nhận lá hình số 8 độc nhất vô nhị, vỏ xù xì dày giàu tinh dầu the nồng gấp nhiều lần chanh thường; bác bỏ 100% sai lầm đánh đồng "chanh rừng" hay "chanh Thái lai tạp".
    2. **`CUL-CLAIM-002` (Nghệ thuật ẩm thực Gà Đốt Ô Thum):** Bắt nguồn từ đồng bào Khmer hồ Ô Thum (xã Ô Lâm); chuẩn hóa kỹ thuật độc bản đốt chậm trong thố đất/nồi gang lót muối hột và sả cây 35-45 phút; bác bỏ 100% sai lệch gọi là gà chiên ngập dầu hay gà nướng vỉ than hoa.
    3. **`CUL-CLAIM-003` (Bún Cá Củ Ngải Bảy Núi):** Xác quyết nguyên tắc bất biến theo RULE 05: Tri Tôn TUYỆT ĐỐI KHÔNG CÓ BÚN NƯỚC LÈO, KHÔNG NẤU MẮM; nước dùng thanh tao nấu từ cá lóc đồng xào nghệ vàng tươi và củ ngải bún thảo mộc.
  - Sửa đổi triệt để bài viết tri thức `KB004` và loại bỏ chuỗi sai lệch ở `KB011` trong `scripts/seed_knowledge_base.py` cùng thực đơn signature tại `frontend/src/lib/dataSanitizer.ts`.
  - Người duyệt chuyên môn bản địa: `Chăm Rốch Thi` lúc `2026-09-28T21:15:00+07:00`.
  - Bộ kiểm thử tự động `frontend/scripts/verified-cultural-claims.test.mjs` đạt 4/4 assertions pass 100%; toàn bộ 216/216 tests frontend pass sạch sẽ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (verified cultural and culinary claims boundary).
- **Next task:** P03-009 — Tạo template review cho *một* POI (Source, evidence, reviewer, expiry).


### P03-007 — Xác minh một hotline khẩn cấp (Nguồn chính thức, verified_at, owner)
- **Status:** `done` tại `docs/technical-spec/VERIFIED_EMERGENCY_HOTLINES.md`, `docs/technical-spec/VERIFIED_EMERGENCY_HOTLINES.json`, `frontend/src/lib/constants.ts`, `frontend/src/lib/offlineStorage.ts`, và `frontend/scripts/verified-emergency-hotlines.test.mjs`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Xác minh chính thức 3 đầu mối hotline trọng yếu của Huyện Tri Tôn:
    1. **Công an Huyện Tri Tôn (Trực ban Khẩn cấp 24/7):** `0296 3874 113` — Chủ quản: Công an Huyện Tri Tôn (Công an Tỉnh An Giang).
    2. **Trung tâm Y tế Huyện Tri Tôn (Cấp cứu 24/7):** `0296 3874 115` — Chủ quản: Trung tâm Y tế Huyện Tri Tôn (Sở Y tế Tỉnh An Giang).
    3. **Văn phòng HĐND & UBND Huyện Tri Tôn:** `0296 3874 114` — Chủ quản: UBND Huyện Tri Tôn.
  - Gắn siêu dữ liệu kiểm toán bắt buộc: `source_url: "https://triton.angiang.gov.vn"`, `verified_at: "2026-09-28T20:55:00+07:00"`, `owner`, `service_scope`, `verification_status: "VERIFIED"`.
  - Loại bỏ hoàn toàn các số giả định/placeholder (`0913 789 123`, `0296 3760 123`) khỏi `frontend/src/lib/constants.ts` và `frontend/src/lib/offlineStorage.ts`.
  - Bộ kiểm thử tự động `frontend/scripts/verified-emergency-hotlines.test.mjs` đạt 5/5 assertions pass 100%; toàn bộ 212/212 tests frontend pass sạch sẽ.
  - Người ký duyệt: `Chăm Rốch Thi` lúc `2026-09-28T20:55:00+07:00`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (verified emergency hotline boundary).
- **Next task:** P03-008 — Xác minh một claim văn hóa/ẩm thực mâu thuẫn (Nguồn và reviewer chuyên môn).

### P03-006 — Xử lý một nhãn commune không có trong glossary (Chuẩn hóa danh mục 15 xã/thị trấn Tri Tôn)
- **Status:** `done` tại `scripts/verify_commune_glossary.py`, `scripts/resolve_p03_006_commune_glossary.py`, `data/tri_ton_master_cleaned.csv`, `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.json`, và `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Công cụ kiểm toán tự động `scripts/verify_commune_glossary.py` đối soát 100% nhãn xã/thị trấn qua 4 nguồn dữ liệu với danh mục chuẩn 15 đơn vị hành chính Tri Tôn theo RULE 02.
  - Xử lý dứt điểm 2 trường hợp:
    1. **Khắc phục lỗi chính tả nghiêm trọng (typo):** Sửa bản ghi Row 120 Master CSV (`chua-ta-miet-coi-nguon-dua-bo`) từ `"Xã Lương Cương"` (xã không tồn tại) thành danh xưng chuẩn `"Xã Lương Phi"` (ấp Tà Miệt); bảo đảm Master CSV không còn bất kỳ nhãn xã sai lệch nào.
    2. **Nghiệm thu Ticket `CRQ-086` (Hàng Thốt Nốt Khmer Trái Tim):** Chuyển trạng thái `RESOLVED`, chuẩn hóa nhãn cộc ngoài glossary `"Tri Tôn"` thành danh xưng chuẩn `Xã An Tức` (ấp Phú Hiệp, Tri Tôn) và ánh xạ alias pilot vào canonical slug hệ thống `cay-thot-not-trai-tim` để kế thừa trọn vẹn bộ ảnh cào pilot độ nét cao.
  - Người ký duyệt: `Chăm Rốch Thi` lúc `2026-09-28T20:55:00+07:00`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (commune glossary compliance boundary).
- **Next task:** P03-007 — Xác minh một hotline khẩn cấp (Nguồn chính thức, verified_at, owner).

### P03-005 — Xử lý một POI ngoài bounding box trong review queue (hoặc ngoại lệ có căn cứ)
- **Status:** `done` tại `scripts/verify_bounding_box_compliance.py`, `scripts/resolve_p03_005_bounding_box.py`, `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.json`, và `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** 
  - Công cụ kiểm thử trắc địa tự động `scripts/verify_bounding_box_compliance.py` đối soát 100% tọa độ GPS trên toàn bộ nguồn dữ liệu với Bounding Box Huyện Tri Tôn [10.30 - 10.55, 104.80 - 105.15].
  - Xử lý dứt điểm 2 trường hợp:
    1. **Loại trừ thực thể ngoài biên:** Ghi nhận quyết định `REJECT_OUT_OF_BOUNDS` cho `diem-du-lich-tri-ton-12` (`ភូមិស្រែឃ្មួញ`, vĩ độ 10.5567842 > 10.55 vượt trần BBOX và gán sai xã 'Thị trấn Tri Tôn') từ tệp cào thô legacy; cấm tuyệt đối nạp vào Master Data sạch hoặc DB production.
    2. **Nghiệm thu Ticket `CRQ-035` (Hồ Đá Latina):** Tọa độ (10.482, 105.002) nằm trọn trong BBOX Tri Tôn; chuyển trạng thái `RESOLVED`, chuẩn hóa canonical slug `ho-da-latina`, quy về đơn vị hành chính tiếp giáp của Tri Tôn là `Xã An Tức` (hướng tiếp cận du lịch chính và dịch vụ dẫn vào từ Tỉnh lộ 948 Tri Tôn) và gắn cờ liên kết vùng `CROSS_BORDER_ATTRACTION` tuân thủ nghiêm ngặt danh mục 15 xã/thị trấn theo RULE 02.
  - Người ký duyệt: `Chăm Rốch Thi` lúc `2026-09-28T19:15:00+07:00`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (bounding box compliance & border attraction boundary).
- **Next task:** P03-006 — Xử lý một nhãn commune không có trong glossary (Chuẩn hóa danh mục 15 xã/thị trấn Tri Tôn).

### P03-004 — Xử lý một duplicate/conflict POI trong review queue (Ticket CRQ-001: Chùa Xà Tón)
- **Status:** `done` tại `scripts/resolve_crq_ticket.py`, `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.json`, và `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** Cập nhật ticket `CRQ-001` sang trạng thái `RESOLVED` trong cả JSON và Markdown Review Queue:
  - Hợp nhất dứt điểm 3 mã định danh dị biệt lịch sử (`0c1d5e83-chùa-xà-tón-(wat-xva` trong Live DB Supabase, `chua-xa-ton-chua-svayton` trong Master CSV/Frontend JSON, và `chua-xa-ton-tri-ton` trong Pilot Data) về canonical slug duy nhất `chua-xa-ton`.
  - Quyết định: `STANDARDIZE_AND_MERGE`.
  - Căn cứ pháp lý xác minh: Quyết định số 224/QĐ-BVHTT ngày 12/12/1986 của Bộ Văn hóa Thông tin xếp hạng Di tích Kiến trúc Nghệ thuật cấp Quốc gia; Xác lập Kỷ lục VietKings năm 2006 về ngôi chùa lưu giữ nhiều bộ Kinh lá buông Satra nhất Việt Nam.
  - Người ký duyệt: `Chăm Rốch Thi` lúc `2026-09-28T18:45:00+07:00`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (atomic conflict review queue boundary).
- **Next task:** P03-005 — Xử lý một POI ngoài bounding box trong review queue (hoặc ngoại lệ có căn cứ).

### P03-003 — Tạo review queue cho toàn bộ ID conflict (mỗi conflict có ticket riêng)
- **Status:** `done` tại `scripts/conflict_review_queue_generator.py`, `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md`, và `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.json`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** Sổ quản lý xung đột dữ liệu `docs/technical-spec/POI_CONFLICT_REVIEW_QUEUE.md` và artifact máy đọc `POI_CONFLICT_REVIEW_QUEUE.json`:
  - Khởi tạo đầy đủ 102 tickets riêng biệt (`CRQ-001` đến `CRQ-102`) cho 100% thực thể có dị biệt dữ liệu.
  - Phân loại chi tiết theo 3 nhóm nghiệp vụ:
    - 73 tickets `UUID_PREFIX_STANDARDIZATION` (71.6%): Chuẩn hóa tiền tố UUID lịch sử sang slug tiếng Việt không dấu sạch.
    - 23 tickets `UNSYNCED_MASTER_DATA` (22.5%): Thẩm định thực địa địa điểm có trên Frontend/Live DB để nạp vào Master CSV hoặc loại bỏ.
    - 6 tickets `PILOT_ALIAS_MAPPING` (5.9%): Ánh xạ file cào pilot vào slug canonical chính thức.
  - Mỗi ticket lưu vết đầy đủ tên địa danh, xã/thị trấn, tọa độ GPS, cờ hiện diện trên từng nguồn, đề xuất hành động (`STANDARDIZE_SLUG`, `VERIFY_AND_INGEST_TO_MASTER`, `MERGE_ALIAS_TO_CANONICAL`) và trạng thái ban đầu `OPEN_FOR_REVIEW`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (atomic conflict review queue boundary).
- **Next task:** P03-004 — Xử lý một duplicate/conflict POI trong review queue (Ticket CRQ-001: Chùa Xà Tón).

### P03-002 — Tạo bảng concordance cho một ID giữa các nguồn (status match, missing, hoặc conflict)
- **Status:** `done` tại `scripts/concordance_table_generator.py`, `docs/technical-spec/POI_CONCORDANCE_TABLE.md`, và `docs/technical-spec/POI_CONCORDANCE_TABLE.json`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** Bảng đối soát đa chiều `docs/technical-spec/POI_CONCORDANCE_TABLE.md` và mã nguồn `scripts/concordance_table_generator.py`:
  - Gom nhóm và phân loại toàn bộ 167 thực thể POI thực tế trên 4 nguồn dữ liệu:
    - 65 thực thể `MATCH` (38.9%): Đồng nhất hoàn toàn về ID và thuộc tính giữa Master CSV, Frontend JSON và Live DB Supabase.
    - 73 thực thể `UUID_CONFLICT` (43.7%): Chứa tiền tố UUID lịch sử (`[0-9a-f]{8}-...`) cần chuẩn hóa sang canonical slug sạch.
    - 6 thực thể `SLUG_ALIAS` (3.6%): Cùng một địa danh nhưng mang biến thể slug giữa pilot và hệ thống chính.
    - 23 thực thể `MISSING_IN_MASTER` (13.8%): Tồn tại trên Frontend JSON hoặc Live DB nhưng chưa có trong Master CSV.
  - Đã xuất bản artifact JSON máy đọc `POI_CONCORDANCE_TABLE.json` hỗ trợ pipeline tự động cho các task Review Queue (P03-003) và Smart Delta Sync (P03-022).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (multi-source concordance mapping boundary).
- **Next task:** P03-003 — Tạo review queue cho toàn bộ ID conflict (mỗi conflict có ticket riêng).

---

## 📜 Lịch Sử Task Đã Hoàn Thành (Consolidated Completed Records)

### P03-001 — Tạo báo cáo count/ID cho từng source hiện có (CSV, frontend JSON, verified JSON, DB snapshot)
- **Status:** `done` tại `scripts/data_sources_inventory_report.py` & `docs/technical-spec/DATA_SOURCES_INVENTORY_REPORT.md`.
- **Luồng:** Thống nhất (Wave W3: Quyết định địa lý & Dữ liệu).
- **AI route đề xuất:** `Astra · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** Báo cáo kiểm kê dữ liệu kỹ thuật `docs/technical-spec/DATA_SOURCES_INVENTORY_REPORT.md` và mã nguồn kiểm toán `scripts/data_sources_inventory_report.py`:
  - Khảo sát thực địa và tính toán checksum SHA-256 chính xác:
    - `data/tri_ton_master_cleaned.csv`: 132 POIs (SHA-256: `dcbe791914475c68369ff051cd3b288dc9e47685bc9eb55a1b7dac2420fa60b6`).
    - `frontend/src/data/triton_pois_full.json`: 141 POIs (SHA-256: `b6bb124500f545dbfb6f6b18084101172ecfcc0a7a6b52a387ff9cde7eece808`), trùng khớp 100% byte-for-byte với `data/triton_pois_full.json`.
    - Live DB Supabase `public.places`: 137 POIs (được truy vấn trực tiếp qua REST API).
    - `output_pilot/data/*.json`: 11 tệp JSON xác minh thực địa.
  - Phân tích đối soát ID ban đầu:
    - 129 ID trùng khớp hoàn toàn giữa Master CSV và Frontend JSON.
    - 3 ID chỉ có ở Master CSV: `ca-phe-thuy-moc-tri-ton`, `chu-tri-ton-nui-co-to`, `ny-coffee-tea-tri-ton`.
    - 12 ID chỉ có ở Frontend JSON (trong đó 6 ID mang mã lai UUID prefix).
    - 25 ID trên Live DB mang UUID prefix lịch sử.
  - Kiểm tra Bounding Box không gian: 100% tọa độ trong Master CSV (`Lat [10.3083, 10.5270]`, `Lon [104.8866, 105.0751]`) và Frontend JSON (`Lat [10.3083, 10.5270]`, `Lon [104.8061, 105.1208]`) đều nằm trọn vẹn trong ranh giới địa lý Tri Tôn.
  - Loại bỏ hoàn toàn tuyên bố cũ không có căn cứ thực nghiệm ("149 bản ghi đã xác minh 100%").
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (data sources count, checksum and cross-inventory boundary).
- **Next task:** P03-002 — Tạo bảng concordance cho một ID giữa các nguồn (status match, missing, hoặc conflict).

### P01-028 — Bỏ Unsplash fallback khỏi admin place creation
- **Status:** `done` tại `frontend/src/app/api/v1/admin/places/route.ts` & `frontend/scripts/admin-places-guard.test.mjs`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-places-guard.test.mjs`; toàn bộ 207/207 tests frontend pass sạch sẽ 100%:
  - Xóa bỏ triệt để logic gán URL stock mặc định `https://images.unsplash.com/...` tại dòng 177 của `frontend/src/app/api/v1/admin/places/route.ts`.
  - Khi tạo địa điểm mới thiếu ảnh (`image_url` và `photos` đều rỗng), trường `image_url` được lưu là `null` và `photos` là `[]`.
  - Tuyệt đối không tự động gắn ảnh stock Unsplash nước ngoài giả mạo vào cơ sở dữ liệu production, tuân thủ 100% RULE 01 (Production Real, No Mock / No Fake / No Placeholder).
  - Khi tạo địa điểm có ảnh hợp lệ, URL ảnh được giữ nguyên vẹn.
  - Static code assertion xác nhận 0% xuất hiện chuỗi `unsplash` trong route `admin/places`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local admin place creation image fallback boundary).
- **Next task:** P03-001 — Tạo báo cáo count/ID cho từng source hiện có (CSV, frontend JSON, verified JSON, DB snapshot).

### P01-027 — Bỏ Unsplash fallback khỏi `upload`
- **Status:** `done` tại `frontend/src/app/api/v1/admin/upload/route.ts`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-upload-guard.test.mjs`; toàn bộ 207/207 tests frontend pass sạch sẽ:
  - Loại bỏ hoàn toàn 100% logic sinh ảnh stock ngẫu nhiên `images.unsplash.com` tại endpoint upload hình ảnh.
  - Xử lý lỗi từ Cloudinary REST API minh bạch, trung thực và fail-closed:
    - Khi Cloudinary gặp sự cố mạng hoặc timeout, trả về HTTP 502 `STORAGE_CONNECTION_FAILED`, không fallback sang link ảnh giả mạo.
    - Khi Cloudinary từ chối tệp tin (400, 401, 500,...), trả về HTTP 502 `STORAGE_UPLOAD_FAILED` kèm chi tiết lỗi thực tế từ provider.
    - Khi phản hồi từ Cloudinary thiếu `secure_url`, trả về HTTP 502 `STORAGE_RESPONSE_INVALID`.
    - Chỉ ghi audit log và trả về `success: true` khi 100% tệp tin được tải lên thành công và có `secure_url` hợp lệ.
  - Static assertion kiểm tra toàn bộ mã nguồn file route xác nhận 0% tồn tại từ khóa `unsplash`.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local upload provider error handling boundary).
- **Next task:** P01-028 — Bỏ Unsplash fallback khỏi admin place creation.

### P01-026 — Đặt MIME allowlist cho `upload`
- **Status:** `done` tại `frontend/src/app/api/v1/admin/upload/route.ts` & `frontend/src/lib/mimeValidator.ts`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · high` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/mime-validator.test.mjs` (8/8 pass) và `frontend/scripts/admin-upload-guard.test.mjs`; toàn bộ 207/207 tests frontend pass sạch sẽ:
  - Xây dựng module `frontend/src/lib/mimeValidator.ts` cung cấp kiểm soát MIME allowlist nghiêm ngặt:
    - Danh mục MIME được phép: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
    - Danh mục phần mở rộng tương ứng: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
    - Chặn đứng 100% các file chứa vector XSS như SVG (`image/svg+xml`), HTML (`text/html`), PDF (`application/pdf`), hoặc GIF với HTTP 400 `DISALLOWED_MIME_TYPE`.
    - Giải mã nhị phân trực tiếp và kiểm tra Magic Bytes (Binary Signature Inspection: `FF D8 FF` cho JPEG, `\x89PNG\r\n\x1a\n` cho PNG, `RIFF/WEBP` cho WebP, `ftyp/avif` cho AVIF), chặn đứng 100% hành vi giả mạo header MIME trên chuỗi Base64 với HTTP 400 `MIME_SIGNATURE_MISMATCH`.
    - Đối với URL từ xa: bắt buộc giao thức HTTPS và extension ảnh hợp lệ trong allowlist; chặn đứng HTTP không an toàn và các extension độc hại (`.exe`, `.svg`, `.pdf`).
    - Cơ chế Atomic Batch Rejection: nếu bất kỳ file nào trong mảng vi phạm, toàn bộ request bị từ chối ngay lập tức, không upload lén hay phát sinh side-effect.
  - Tích hợp vào `frontend/src/app/api/v1/admin/upload/route.ts` bảo vệ an toàn tuyệt đối endpoint upload.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local upload MIME boundary).
- **Next task:** P01-027 — Bỏ Unsplash fallback khỏi `upload`.

### P01-025 — Đặt request body-size limit cho `upload`
- **Status:** `done` tại `frontend/src/app/api/v1/admin/upload/route.ts` & `frontend/src/lib/requestBodyGuard.ts`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · high` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/request-body-guard.test.mjs` (12/12 pass) và `frontend/scripts/admin-upload-guard.test.mjs`; toàn bộ 199/199 tests frontend pass sạch sẽ:
  - Xây dựng module `frontend/src/lib/requestBodyGuard.ts` cung cấp cơ chế phòng vệ đa lớp (Multi-layer Body Size Enforcement):
    - Ngưỡng mặc định 10MB (`DEFAULT_MAX_BODY_SIZE_BYTES = 10,485,760 bytes`), hỗ trợ cấu hình qua `ADMIN_UPLOAD_MAX_BYTES`.
    - Kiểm tra sớm header `Content-Length` (fast-path 413 `PAYLOAD_TOO_LARGE`).
    - Phòng thủ chống giả mạo header và chunked transfer bằng bộ đếm byte stream thực tế (ngắt stream tức thì và trả về 413 nếu vượt ngưỡng).
    - Xử lý fail-closed với header `Content-Length` âm/sai định dạng (400 `INVALID_CONTENT_LENGTH`).
    - Xử lý fail-closed với payload JSON malformed (400 `INVALID_JSON`).
  - Tích hợp vào `frontend/src/app/api/v1/admin/upload/route.ts` bảo vệ an toàn endpoint upload trước nguy cơ DoS/OOM.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local upload body size boundary).
- **Next task:** P01-026 — Đặt MIME allowlist cho `upload`.

### P01-024 — Áp URL validation contract vào `gmaps-scraper`
- **Status:** `done` tại `frontend/src/app/api/v1/admin/gmaps-scraper/route.ts` & `frontend/scripts/admin-gmaps-scraper-guard.test.mjs`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-gmaps-scraper-guard.test.mjs`; 35/35 subtests pass; toàn bộ 187/187 tests frontend pass sạch sẽ:
  - Tích hợp `validateSafeFetchUrl` và `safeServerFetch` thay thế hoàn toàn raw `fetch()` và `redirect: 'follow'`.
  - Phân định chuẩn xác giữa từ khóa tìm kiếm địa danh và URL Google Maps qua helper `isUrlLike`.
  - Chặn đứng 100% các scheme nguy hiểm (`http:`, `file:`, `data:`, `gopher:`, `ftp:`, `javascript:`, `//`) với HTTP 400 `INVALID_SCHEME`.
  - Chặn đứng 100% các yêu cầu tới dải IP private RFC 1918, loopback (`127.0.0.1`, `::1`), link-local / Cloud Metadata IMDS (`169.254.169.254`, `fe80::1`) với HTTP 400 `BLOCKED_IP`.
  - Chặn đứng các hostname nội bộ nhạy cảm (`localhost`, `metadata.google.internal`) với HTTP 400 `BLOCKED_HOSTNAME`.
  - Chặn đứng các domain ngoài danh sách Google Maps với HTTP 400 `DISALLOWED_DOMAIN`.
  - Chuẩn hóa toàn bộ URL ảnh trích xuất từ Google CDN và thẻ og:image sang HTTPS an toàn.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local gmaps-scraper URL & SSRF boundary).
- **Next task:** P01-025 — Đặt request body-size limit cho `upload`.

### P01-023 — Chỉ cho redirect sang allowlist tại `scrape-images`
- **Status:** `done` tại `frontend/src/app/api/v1/admin/scrape-images/route.ts` & `frontend/scripts/admin-scrape-images-guard.test.mjs`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-scrape-images-guard.test.mjs`; 41/41 subtests pass; toàn bộ 153/153 tests frontend pass sạch sẽ:
  - Bổ sung cấu hình `allowedRedirectDomains` và export `GOOGLE_MAPS_ALLOWED_DOMAINS` trong module lõi `serverFetchValidator.ts`.
  - Phân loại chuẩn xác loại URL: đối với liên kết Google Maps (`goo.gl`, `maps.app.goo.gl`, `google.com`, `google.com.vn`), áp dụng hồ sơ `GOOGLE_MAPS` và danh sách miền tin cậy `GOOGLE_MAPS_ALLOWED_DOMAINS`; đối với bài viết du lịch thông thường, giới hạn chuyển hướng trong cùng base domain.
  - Kiểm soát nghiêm ngặt từng hop chuyển hướng (Redirect Hop Interception):
    - Bẫy redirect sang HTTP scheme bị chặn đứng 400 (`INVALID_SCHEME`).
    - Bẫy redirect sang IP loopback / metadata IMDS (`127.0.0.1`, `169.254.169.254`) bị chặn đứng 400 (`BLOCKED_IP`).
    - Vòng lặp redirect vượt quá ngưỡng 3 hops bị chặn đứng 400 (`MAX_REDIRECTS_EXCEEDED`).
    - Redirect sang host bên thứ ba ngoài allowlist (Open Redirect abuse) bị chặn đứng 400 (`DISALLOWED_DOMAIN`).
    - Chuyển hướng an toàn từ Google Maps shortlink hoặc bài viết tới đích đến hợp lệ hoàn tất thành công với HTTP 200 OK và bóc tách ảnh chính xác.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local scrape-images redirect boundary).
- **Next task:** P01-024 — Áp URL validation contract vào `gmaps-scraper`.

### P01-022 — Chặn private/loopback/link-local IP tại `scrape-images`
- **Status:** `done` tại `frontend/src/app/api/v1/admin/scrape-images/route.ts` & `frontend/scripts/admin-scrape-images-guard.test.mjs`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-scrape-images-guard.test.mjs`; 32/32 subtests pass; toàn bộ 142/142 tests frontend pass sạch sẽ:
  - Tích hợp `validateSafeFetchUrl` và `safeServerFetch` kiểm soát chặt chẽ toàn bộ dải IP private RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).
  - Chặn đứng 100% loopback (`127.0.0.1`, `::1`), link-local / Cloud Metadata IMDS (`169.254.169.254`, `fe80::1`) với HTTP 400 và code `BLOCKED_IP`.
  - Chặn đứng 100% các hostname nội bộ nhạy cảm (`localhost`, `metadata.google.internal`, `instance-data`) với HTTP 400 và code `BLOCKED_HOSTNAME`.
  - Phân định chuẩn xác giữa từ khóa tìm kiếm địa danh Tri Tôn và đường dẫn URL qua helper `isUrlLike`, bảo toàn trọn vẹn trải nghiệm người dùng với từ khóa thực địa ("Tà Pạ", "Hồ Tà Pạ", "Chùa Xà Tón").
  - Chuyển đổi toàn bộ cơ chế tải HTML sang `safeServerFetch` loại bỏ hoàn toàn rủi ro theo vết redirect mù quáng sang mạng nội bộ.
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local scrape-images IP boundary).
- **Next task:** P01-023 — Chỉ cho redirect sang allowlist tại `scrape-images`.

### P01-021 — Chặn scheme không phải HTTPS tại `scrape-images` (SSRF boundary)
- **Status:** `done` tại `frontend/src/app/api/v1/admin/scrape-images/route.ts` & `frontend/scripts/admin-scrape-images-guard.test.mjs`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-scrape-images-guard.test.mjs`; 17/17 subtests pass; toàn bộ 127/127 tests frontend pass sạch sẽ:
  - Loại bỏ hoàn toàn logic tự động gắn prefix `http://` hoặc chấp nhận `http://`.
  - Tích hợp scheme inspector ở tầng gateway input: chặn ngay lập tức mọi URI scheme không phải HTTPS (`http:`, `file:`, `data:`, `gopher:`, `ftp:`, `javascript:`, `//`) trả về HTTP 400 với `{ error: '...', code: 'INVALID_SCHEME' }`.
  - Tích hợp `validateSafeFetchUrl` từ `@/lib/serverFetchValidator` trước mọi thao tác bóc tách ảnh trực tiếp hoặc fetch HTML.
  - Đảm bảo toàn bộ ảnh bóc tách xuất ra client đều được chuẩn hóa sang giao thức HTTPS an toàn.
  - Bảo tồn 100% tính năng tìm kiếm từ khóa địa danh Tri Tôn và bảo toàn token secrecy (không rò rỉ token trong log).
- **Claim state:** `PLANNED → IMPLEMENTED → VERIFIED` (local scrape-images route boundary).
- **Next task:** P01-022 — Chặn private/loopback/link-local IP tại `scrape-images`.

### P01-020 — Tạo URL validation contract cho server-side fetch (SSRF mitigation)
- **Status:** `done` tại `frontend/scripts/server-fetch-validator.test.mjs`.
- **Luồng:** Thống nhất (SSRF, upload và request boundary).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:**
  - Tài liệu đặc tả chuẩn: [`docs/technical-spec/SERVER_FETCH_VALIDATION_CONTRACT.md`](docs/technical-spec/SERVER_FETCH_VALIDATION_CONTRACT.md) quy định 7 bất biến bảo mật (INV-01 đến INV-07), danh sách đen CIDR toàn diện IPv4/IPv6, quy tắc DNS pre-resolution và cơ chế Safe Redirect.
  - Module lõi: [`frontend/src/lib/serverFetchValidator.ts`](frontend/src/lib/serverFetchValidator.ts) triển khai engine thẩm định URL zero-dependency, bitwise/BigInt CIDR matching, bóc tách IPv4-mapped IPv6, DNS resolution pre-check và wrapper `safeServerFetch`.
  - Bộ kiểm thử: [`frontend/scripts/server-fetch-validator.test.mjs`](frontend/scripts/server-fetch-validator.test.mjs) pass 100% (89/89 tests pass) kiểm chứng toàn bộ các kịch bản: chấp nhận HTTPS chuẩn/hoa, từ chối scheme không an toàn (`http`, `file`, `data`, `gopher`, `ftp`, `javascript`, `blob`), chặn toàn bộ dải IP loopback/RFC 1918/link-local/cloud metadata/CGNAT/multicast/broadcast (cả IPv4 và IPv6), chặn hostname nội bộ/metadata/dotless, kiểm soát port mặc định 443, chống DNS rebinding, kiểm soát hồ sơ `GOOGLE_MAPS` và `STRICT`, chặn redirect tới HTTP/loopback/metadata/loop, và giới hạn kích thước phản hồi chống DoS. Toàn bộ test suite frontend (111/111 tests) pass 100%.
- **Claim state:** `DESIGNED → IMPLEMENTED` (shared server fetch validation contract boundary).
- **Next task:** P01-021 — Chặn scheme không phải HTTPS tại `scrape-images`.

### P02-024 — RLS matrix test tổng thể xác nhận quyền truy cập của mọi role trên mọi bảng
- **Status:** `done` tại `scripts/testbed_rls_matrix_test.py` trên container `triton_testbed_w2` (database `triton_replay_fresh`).
- **Luồng:** Thống nhất (DB Governance & Security Matrix).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `supabase/migrations/20260924_p02_024_rls_lockdown_client_roles_matrix.sql` và `scripts/testbed_rls_matrix_test.py`. 100% assertions đạt (196/196 passed).
  - 192 kịch bản ma trận phân quyền (16 bảng x 3 roles x 4 thao tác): 6 bảng nhạy cảm (`admin_users`, `audit_logs`, `chat_sessions`, `chat_logs`, `eval_cases`, `eval_runs`) bị từ chối 100% (SELECT/INSERT/UPDATE/DELETE trả về lỗi `permission denied`) đối với `anon` và `authenticated`; 10 bảng nghiệp vụ public read-only chỉ cho phép `anon` và `authenticated` SELECT qua policy RLS, cấm 100% mọi hành vi mutation (INSERT/UPDATE/DELETE); `service_role` có toàn quyền quản trị hợp lệ trên cả 16 bảng.
  - Gỡ bỏ các rewrite rules cũ (`audit_logs_no_update`, `audit_logs_no_delete`, `chat_logs_no_update`, `chat_logs_no_delete`) để loại bỏ nguy cơ silent bypass của PostgreSQL rewriter, bảo đảm tính fail-closed tuyệt đối.
  - 4 kịch bản row-filtering logic trên `places`, `videos`, `preset_itineraries`, `custom_knowledge_base`: xác nhận `anon` chỉ nhìn thấy dữ liệu active/verified (`is_active = true`, `is_verified = true`), `service_role` nhìn thấy toàn bộ 100% dữ liệu.
- **Claim state:** `PLANNED → VERIFIED` (comprehensive 196-point RLS access control matrix on PostgreSQL 15 + PostGIS 3.3).
- **Next task:** P01-020 — Tạo URL validation contract cho server-side fetch.

### P01-019 — Xóa bỏ fallback `service_role` → `anon` trong server client factory để fail-closed hoàn toàn
- **Status:** `done` tại `frontend/scripts/server-client-factory-fail-closed.test.mjs`.
- **Luồng:** Thống nhất (App Security & Defense-in-Depth).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/server-client-factory-fail-closed.test.mjs`; 100% pass (6/6 subtests, 22/22 tests across test suite); khi thiếu `SUPABASE_SERVICE_ROLE_KEY` hoặc URL, `getSupabaseServerClient()` trả về null và `requireSupabaseServerClient()` ném lỗi fail-closed tường minh; tuyệt đối không hạ cấp quyền về anon key; loại bỏ 100% hardcoded URL `knmlbwsmfljlabhvqfid` và fallback anti-pattern `SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY` trên toàn bộ codebase (`dataCache.ts`, `serverSupabase.ts`, `audit-logs`, `stats`, `feedback`, `ai-metrics`, `search`, `places/[id]/videos`, `videos/trending`, `chat/stream`, `chat/itinerary`, `chat/query`, `systemConfig.ts`).
- **Claim state:** `PLANNED → IMPLEMENTED` (fail-closed server client boundary).
- **Next task:** P02-023 — Fresh migration replay test toàn bộ chuỗi migration từ database trống.

### P01-018 — Bảo vệ route admin `gmaps-scraper` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-gmaps-scraper-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-gmaps-scraper-guard.test.mjs`; POST không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền bóc tách Google Maps và đồng bộ; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin gmaps-scraper route boundary).
- **Next task:** P01-019 — Xóa bỏ fallback `service_role` → `anon` trong server client factory để fail-closed hoàn toàn.

### P01-017 — Bảo vệ route admin `scrape-images` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-scrape-images-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-scrape-images-guard.test.mjs`; POST không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền trích xuất ảnh; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin scrape-images route boundary).
- **Next task:** P01-018 — Bảo vệ route admin `gmaps-scraper`.

### P01-016 — Bảo vệ route admin `upload` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-upload-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-upload-guard.test.mjs`; POST không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền tải ảnh; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin upload route boundary).
- **Next task:** P01-017 — Bảo vệ route admin `scrape-images`.

### P01-015 — Bảo vệ route admin `revalidate` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-revalidate-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-revalidate-guard.test.mjs`; POST không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền revalidate; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin revalidate route boundary).
- **Next task:** P01-016 — Bảo vệ route admin `upload`.

### P01-014 — Bảo vệ route admin `videos/ai-scan` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-ai-scan-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-ai-scan-guard.test.mjs`; POST không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền quét video; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin ai-scan route boundary).
- **Next task:** P01-015 — Bảo vệ route admin `revalidate`.

### P01-013 — Bảo vệ route admin `knowledge-base` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-knowledge-base-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-knowledge-base-guard.test.mjs`; GET/POST (root) và GET/PUT/PATCH/DELETE ([id]) không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền thực thi toàn bộ method; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503 trong khi GET đọc vẫn hoạt động; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin knowledge-base route boundary).
- **Next task:** P01-014 — Bảo vệ route admin `videos/ai-scan`.

### P01-012 — Bảo vệ route admin `itineraries` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-itineraries-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-itineraries-guard.test.mjs`; GET/POST/PATCH/DELETE không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền thực thi GET/POST/PATCH/DELETE; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503 trong khi GET đọc vẫn hoạt động; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin itineraries route boundary).
- **Next task:** P01-013 — Bảo vệ route admin `knowledge-base`.

### P01-011 — Bảo vệ route admin `videos` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-videos-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-videos-guard.test.mjs`; GET/POST/PATCH/DELETE không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền thực thi GET/POST/PATCH/DELETE; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503 trong khi GET đọc vẫn hoạt động; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin videos route boundary).
- **Next task:** P01-012 — Bảo vệ route admin `itineraries`.

### P01-010 — Bảo vệ route admin `places` bằng server guard (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-places-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Route Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-places-guard.test.mjs`; GET/POST/PATCH/DELETE không có cookie phiên bị chặn 401; user role `VIEWER` bị chặn 403; admin hợp lệ được cấp quyền thực thi GET/POST/PATCH/DELETE; audit log lưu đúng `user_name` và `user_role` từ token principal; `ADMIN_MUTATIONS_ENABLED=false` chặn mutation 503 trong khi GET đọc vẫn hoạt động; không rò rỉ token trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local admin places route boundary).
- **Next task:** P01-011 — Bảo vệ route admin `videos`.

### P01-009 — Xây dựng helper guard server-side dùng chung (`verifyAdminSession`)
- **Status:** `done` tại `frontend/scripts/admin-session-guard.test.mjs`.
- **Luồng:** Thống nhất (App Security & Server-side Authorization).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-session-guard.test.mjs`; 16 kịch bản kiểm thử pass 100%: phân định chính xác role `ADMIN` và `SUPER_ADMIN`; từ chối role thiếu hoặc sai quyền (`VIEWER`, `null`) với 403; từ chối token rỗng/sai/hết hạn/chưa đến hạn/quá 8h/inactive với 401; fail-closed trả 503 khi DB lỗi hoặc thiếu key; kiểm soát cờ local HTTP chặt chẽ; không rò rỉ token/hash trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local guard module boundary).
- **Next task:** P01-010 — Bảo vệ route admin `places`.

### P01-030 — Bỏ password.trim() trên form admin login
- **Status:** `done` tại `frontend/scripts/admin-login-page.test.mjs`.
- **Luồng:** Thống nhất (App Security & Credential Fidelity).
- **AI route đề xuất:** `Sol · medium` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-login-page.test.mjs`; xác nhận không còn `password.trim()` nào trong `frontend/src/app/admin/login/page.tsx`; kiểm tra form `!password` giữ nguyên cấu trúc; JSON body truyền nguyên vẹn chuỗi password có khoảng trắng đầu/cuối sang API backend.
- **Claim state:** `PLANNED → IMPLEMENTED` (local login form UI boundary).
- **Next task:** P01-009 — Xây dựng helper guard server-side dùng chung.

### P01-029 — Thu hồi admin session tại logout và xóa cookie
- **Status:** `done` tại `frontend/scripts/admin-logout.integration.test.mjs`.
- **Luồng:** Thống nhất (App Security & Session Lifecycle).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `frontend/scripts/admin-logout.integration.test.mjs`; token hợp lệ thu hồi session trong DB và trả cookie `Max-Age=0` cho `__Host-triton_admin_session`, `triton_admin_session_local` và `triton_admin_token` với `HttpOnly; Secure; SameSite=Strict; Path=/`; logout với token cũ bảo toàn session mới trong DB; token hỏng/thiếu cookie xử lý an toàn không lỗi; ghi nhận audit log `LOGOUT_SUCCESS`; không rò rỉ token/hash trong log.
- **Claim state:** `PLANNED → IMPLEMENTED` (local `/auth/logout` boundary).
- **Next task:** P01-030 — Bỏ password.trim() trên form login.

### P02-012 — Thêm CHECK rating [0.0, 5.0] trên bảng `public.places`
- **Status:** `done` tại PostgreSQL 15 + PostGIS 3.3 disposable fixture; chưa áp Supabase live.
- **Luồng:** Thống nhất (Data Integrity & Schema Replay).
- **AI route đề xuất:** `Sol · xhigh` theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md).
- **AI thực dùng:** Gemini 3.8 Flash (High).
- **Evidence:** `supabase/tests/p02_012_places_rating_check.sql` sau migration `20260807090000_p02_012_places_rating_check.sql`; thêm constraint `chk_places_rating_range` giới hạn rating trong [0.0, 5.0]; xác nhận giá trị hợp lệ (4.5, 0.0, 5.0) và NULL insert thành công; giá trị ngoài biên (< 0.0 hoặc > 5.0) hoặc UPDATE điểm bất hợp lệ (9.9) bị từ chối với `check_violation`; negative control kiểm tra phát hiện thiếu constraint; migration idempotent khi chạy lại.
- **Claim state:** `PLANNED → VERIFIED` (local DB constraint & replay boundary).
- **Next task:** P01-029 — Thu hồi admin session tại logout và xóa cookie.

### P02-011 — Thêm CHECK longitude theo boundary [104.80, 105.15]
- **Status:** `done` tại PostgreSQL 15 + PostGIS 3.3 disposable fixture.
- **Evidence:** `supabase/tests/p02_011_places_longitude_boundary_check.sql` sau migration `20260807080000_p02_011_places_longitude_boundary_check.sql`; thêm constraint `chk_places_longitude_boundary` giới hạn longitude trong [104.80, 105.15]; xác nhận giá trị hợp lệ (105.0068, 104.80, 105.15) và NULL insert thành công; giá trị ngoài biên (< 104.80 hoặc > 105.15) bị từ chối với `check_violation`.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-010 — Thêm CHECK latitude theo boundary [10.30, 10.55]
- **Status:** `done` tại PostgreSQL 15 + PostGIS 3.3 disposable fixture.
- **Evidence:** `supabase/tests/p02_010_places_latitude_boundary_check.sql` sau migration `20260807070000_p02_010_places_latitude_boundary_check.sql`; thêm constraint `chk_places_latitude_boundary` giới hạn latitude trong [10.30, 10.55]; xác nhận giá trị hợp lệ (10.4128, 10.30, 10.55) và NULL insert thành công; giá trị ngoài biên (< 10.30 hoặc > 10.55) bị từ chối với `check_violation`.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-009 — Sửa RPC khoảng cách (`match_places_nearby`) khớp kiểu trắc địa
- **Status:** `done` tại PostgreSQL 15 + PostGIS 3.3 disposable fixture.
- **Evidence:** `supabase/tests/p02_009_match_places_nearby_rpc.sql` sau migration `20260807060000_p02_009_fix_match_places_nearby_rpc.sql`; bổ sung các cột `source_url`, `is_verified`, `verified_at`; RPC `match_places_nearby` chuẩn hóa 100% sang `GEOGRAPHY`; kiểm thử 5 địa điểm thực tế tại Tri Tôn trả kết quả khoảng cách mét chính xác.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-008 — Chọn duy nhất kiểu không gian `GEOGRAPHY(Point, 4326)` cho `places.geom`
- **Status:** `done` tại PostgreSQL 15 + PostGIS 3.3 disposable fixture.
- **Evidence:** [Decision Record](docs/technical-spec/DECISION_RECORD_SPATIAL_TYPE.md); migration `20260807050000_p02_008_places_geom_spatial_type.sql` bổ sung cột `geom GEOGRAPHY(Point, 4326)`, GiST index và trigger auto-sync `trg_sync_places_geom`; test suite `supabase/tests/p02_008_places_geom_spatial_type.sql` pass.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-007 — Bật 6 Core Extensions trên database trống
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_007_enable_core_extensions.sql` sau migration `20260807040000_p02_007_enable_core_extensions.sql`; nạp thành công 6 extensions (`uuid-ossp`, `pgcrypto`, `vector`, `postgis`, `unaccent`, `pg_trgm`) kèm functional smoke tests.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-006 — Migration baseline cho `videos`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_006_videos_baseline.sql` sau migration `20260807030000_p02_006_create_videos_baseline.sql`; foreign key `place_id` liên kết `places`; RLS bật, anon chỉ xem video verified, cấm write.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-005 — Migration baseline cho `preset_itineraries`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_005_preset_itineraries_baseline.sql` sau migration `20260807020000_p02_005_create_preset_itineraries_baseline.sql`; RLS bật, anon chỉ xem tour active, cấm write.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-004 — Migration baseline cho `admin_users`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_004_admin_users_baseline.sql` sau migration `20260807010000_p02_004_create_admin_users_baseline.sql`; downstream lockdown và session extension pass.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-003 — Migration baseline độc lập cho `places`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_003_places_baseline.sql` sau migration `20260807_p02_003_create_places_baseline.sql`; giải quyết foreign key cho toàn bộ migration sau.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-022 — Khóa custom knowledge-base policy đúng `service_role`
- **Status:** `done` tại PostgreSQL 15 + pgvector disposable fixture.
- **Evidence:** `supabase/tests/p02_022_custom_knowledge_base_policy.sql` sau migration `20260924_p02_022_custom_knowledge_base_restrict_policy.sql`; thu hồi write từ anon, chỉ cho anon SELECT bài active.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-021 — Thu hồi anon write từ `semantic_chat_cache`
- **Status:** `done` tại PostgreSQL 15 + pgvector disposable fixture.
- **Evidence:** `supabase/tests/p02_021_semantic_chat_cache_anon_write.sql`; thu hồi INSERT/UPDATE/DELETE từ anon, bảo toàn SELECT & RPC.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-020 — Thu hồi anon write từ `system_configs`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_020_system_configs_anon_write.sql`; thu hồi INSERT/UPDATE/DELETE từ anon, bảo toàn SELECT công khai.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-019 — Thu hồi anon write từ `golden_answers`
- **Status:** `done` tại PostgreSQL 15 + pgvector disposable fixture.
- **Evidence:** `supabase/tests/p02_019_golden_answers_anon_write.sql`; thu hồi write từ anon, bảo toàn SELECT và `match_golden` RPC.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-018 — Thu hồi anonymous SELECT từ `audit_logs`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_018_audit_logs_anon_select.sql`; anon SELECT bị `insufficient_privilege`.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-017 — Thu hồi anonymous INSERT từ `audit_logs`
- **Status:** `done` tại PostgreSQL 15 disposable fixture.
- **Evidence:** `supabase/tests/p02_017_audit_logs_anon_insert.sql`; anon INSERT bị chặn, service_role ghi được.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-016 — Thu hồi anonymous SELECT từ `chat_logs`
- **Status:** `done` tại PostgreSQL 15 fixture.
- **Evidence:** `supabase/tests/p02_016_chat_logs_anon_select.sql`; anon SELECT bị `insufficient_privilege`.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-015 — Thu hồi anonymous INSERT từ `chat_sessions`
- **Status:** `done` tại PostgreSQL 15 fixture.
- **Evidence:** `supabase/tests/p02_015_chat_sessions_anon_insert.sql`; anon INSERT và upsert bị từ chối.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-014 — Thu hồi anonymous SELECT từ `chat_sessions`
- **Status:** `done` tại PostgreSQL 15 fixture.
- **Evidence:** `supabase/tests/p02_014_chat_sessions_anon_select.sql`; anon SELECT bị `insufficient_privilege`.
- **Claim state:** `PLANNED → VERIFIED`.

### P02-013 — Assert RLS enabled cho `chat_sessions`
- **Status:** `done` (PostgreSQL 15 assertion).
- **Evidence:** `supabase/tests/p02_013_chat_sessions_rls.sql`.
- **Claim state:** `PLANNED → VERIFIED`.

### P01-008 — Xác minh admin session tại /auth/me (local)
- **Status:** `done` tại `frontend/scripts/admin-me.integration.test.mjs`.
- **Evidence:** Cookie mới hợp lệ trả user/role từ DB; cookie rỗng/cũ/giả/hết hạn/inactive trả 401; read-only DB calls.
- **Claim state:** `PLANNED → IMPLEMENTED`.

### P01-007 — Cookie admin theo contract (local)
- **Status:** `done` tại `frontend/scripts/admin-login.integration.test.mjs`.
- **Evidence:** Cookie `__Host-triton_admin_session`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, `Max-Age=8h`.
- **Claim state:** `PLANNED → IMPLEMENTED`.

### P01-006 — Opaque admin session tại login (local)
- **Status:** `done` cho login/storage boundary.
- **Evidence:** 32-byte CSPRNG token, SHA-256 DB hash; DB write error không cấp cookie.
- **Claim state:** `PLANNED → IMPLEMENTED`.

### P01-005 — Login dùng bcrypt verifier
- **Status:** `done` tại login route.
- **Evidence:** Bcrypt verifier thay thế plaintext/env password; hash đúng 200, sai trả 401.
- **Claim state:** `PLANNED → IMPLEMENTED`.

### P01-004 — Bcrypt migration helper
- **Status:** `done` tại `frontend/scripts/admin-credential-migration.test.mjs`.
- **Evidence:** Bcrypt cost 12, từ chối password > 72 bytes.
- **Claim state:** `PLANNED → IMPLEMENTED`.

### P01-003 — Admin credential/session fields migration
- **Status:** `done` (PostgreSQL 15 fixture).
- **Evidence:** Migration `20260924_admin_credential_session_fields.sql`.
- **Claim state:** `DESIGNED → IMPLEMENTED`.

### P01-000 — Mutation kill-switch
- **Status:** `done` (local verification).
- **Evidence:** `ADMIN_MUTATIONS_ENABLED=false` trả 503 cho POST/PATCH/DELETE admin routes.
- **Claim state:** `IMPLEMENTED`.

### P02-000 — Emergency `admin_users` RLS/grants lockdown
- **Status:** `done` / `VERIFIED` tại DB boundary trên Supabase Cloud `knmlbwsmfljlabhvqfid`.
- **Evidence:** Migration `20260924083656_admin_users_rls_lockdown`.
- **Claim state:** `OBSERVED FAIL → VERIFIED`.

### P00-001 — Decision Record G0 (Môi trường & Owner)
- **Status:** `done`.
- **Evidence:** [Decision Record G0](docs/technical-spec/DECISION_RECORD_G0.md).
- **Claim state:** `DISPUTED → VERIFIED`.

### P02-001 & P02-002 — Inventories
- **Status:** `done`.
- **Evidence:** [PRODUCTION_ROUTE_DATA_INVENTORY.md](docs/technical-spec/PRODUCTION_ROUTE_DATA_INVENTORY.md) & [MIGRATION_TABLE_INVENTORY.md](docs/technical-spec/MIGRATION_TABLE_INVENTORY.md).
- **Claim state:** `PLANNED → IMPLEMENTED`.
