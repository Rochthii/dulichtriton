# BÁO CÁO KIỂM TOÁN SỔ ĐĂNG KÝ RỦI RO P0/P1 — DU LỊCH TRI TÔN AI
## Production Risk Register & Remediation Acceptance Audit Report
**Mã quy chuẩn tài liệu:** `RR-TRI-TON-PROD-001`  
**Phiên bản:** `1.0.0` (Production Release Gate Verification)  
**Thời điểm đánh giá:** `2026-10-05T14:50:00+07:00`  
**Kiểm toán viên & Release Owner:** Chăm Rốch Thi (Lead Technical Architect)  
**Trạng thái kiểm toán tổng thể:** 🟢 **VERIFIED — ZERO UNACCEPTED P0/P1 RISKS**

---

> [!IMPORTANT]
> **RÀNG BUỘC PHÊ DUYỆT DECISION GATE G4 (DEFINITION OF DONE):**  
> Một phase chỉ hoàn tất khi **tất cả task trong phase đều có bằng chứng**, các dependency đã pass và **không có bất kỳ rủi ro P0/P1 nào chưa được giải quyết hoặc chưa được phê chuẩn chính thức**.  
> Tài liệu này chứng minh 100% các rủi ro mức P0 (Blocker) và P1 (Critical/High) được ghi nhận xuyên suốt quá trình kiểm toán kiến trúc [Current State Audit](CURRENT_STATE_AUDIT.md) và kế hoạch [Production Remediation Plan](../12_PRODUCTION_REMEDIATION_PLAN.md) đều đã đạt trạng thái `REMEDIATED` hoặc `ACCEPTED_RISK` (có Decision Gate và Owner ký duyệt).

---

## 1. Bảng Tổng Hợp Trạng Thái Rủi Ro (Executive Summary)

| Chỉ số kiểm toán | Giá trị | Tỷ lệ | Đánh giá kỹ thuật |
|---|---|---|---|
| **Tổng số rủi ro P0/P1 được theo dõi** | **11** | 100% | Toàn diện (Toàn bộ phát hiện từ Current State Audit & Remediation) |
| **Rủi ro mức P0 (Blocker)** | **4** | 36.4% | 100% Đã khắc phục triệt để (`REMEDIATED`) |
| **Rủi ro mức P1 (Critical/High)** | **7** | 63.6% | 6 `REMEDIATED` (85.7%) + 1 `ACCEPTED_RISK` (14.3%) |
| **Rủi ro đã khắc phục (`REMEDIATED`)** | **10** | **90.9%** | Đã nghiệm thu bằng chứng qua test suites release-gate |
| **Rủi ro chấp nhận có kiểm soát (`ACCEPTED_RISK`)** | **1** | **9.1%** | Đã ký duyệt bởi Decision Gate G3 (`DR-G3-RATELIMIT-BACKEND-001`) |
| **Rủi ro chưa giải quyết (`OPEN` / `UNACCEPTED`)** | **0** | **0.0%** | 🟢 **ĐẠT NGUYÊN TẮC BẤT BIẾN ZERO UNACCEPTED RISK** |

---

## 2. Chi Tiết Ma Trận Rủi Ro Mức P0 (P0 Blocker Risks — 100% Remediated)

### 🔴 RSK-P0-001: Plaintext Admin Passwords & Missing Server-Side Mutation Authorization
- **Phân loại:** An ninh xác thực & Phân quyền (`SECURITY_AUTHENTICATION`)
- **Nguồn phát hiện:** [CURRENT_STATE_AUDIT.md](CURRENT_STATE_AUDIT.md) (Mục 13 & 23)
- **Mô tả nguy cơ:** Bảng `admin_users` lưu mật khẩu dạng plaintext hoặc so sánh thô, các API mutation quản trị (`places`, `videos`, `itineraries`, `knowledge-base`,...) thiếu guard xác thực phiên máy chủ cho phép kẻ tấn công thực hiện thao tác sửa đổi dữ liệu trái phép.
- **Biện pháp xử lý (`REMEDIATED`):**
  1. Xây dựng helper guard máy chủ dùng chung `verifyAdminSession(req)` và bọc bảo vệ toàn bộ 19 phương thức mutation của 12 route quản trị từ Phase P01.
  2. Băm mật khẩu quản trị viên bằng bcrypt cost 12, loại bỏ 100% so sánh plaintext và mật khẩu mặc định trong env.
  3. Cấp phát token ngẫu nhiên an toàn 256-bit CSPRNG, lưu trữ duy nhất mã băm SHA-256 server-side, thiết lập cookie bảo mật cao `__Host-triton_admin_session` (HttpOnly, Secure, SameSite=Strict).
  4. Thu hồi phiên máy chủ và xóa sạch cookie khi người dùng đăng xuất (`/api/v1/admin/auth/logout`).
- **Bằng chứng nghiệm thu (Proof):** [`frontend/scripts/authenticated-admin-negative.test.mjs`](../../frontend/scripts/authenticated-admin-negative.test.mjs) (114 negative tests pass 100%, từ chối 401/403/503, 0% database writes).
- **Phê duyệt:** `GATE_G0` · **Owner:** Chăm Rốch Thi (Platform & Security Owner).

### 🔴 RSK-P0-002: Permissive RLS Policies & Anonymous Access to Privileged Tables
- **Phân loại:** Bảo mật Cơ sở dữ liệu & RLS (`DATABASE_RLS_SECURITY`)
- **Nguồn phát hiện:** [CURRENT_STATE_AUDIT.md](CURRENT_STATE_AUDIT.md) (Mục 14 & 23)
- **Mô tả nguy cơ:** Các chính sách Row Level Security (RLS) cũ cấp quyền `SELECT`/`INSERT` công khai cho vai trò `anon` trên các bảng nhạy cảm (`admin_users`, `chat_sessions`, `chat_logs`, `audit_logs`), cho phép client khai thác trực tiếp qua Supabase PostgREST.
- **Biện pháp xử lý (`REMEDIATED`):**
  1. Ban hành migration DDL `20260924_p02_024_rls_lockdown_client_roles_matrix.sql` kích hoạt RLS trên toàn bộ 16 bảng CSDL.
  2. Thu hồi 100% quyền truy cập (`REVOKE ALL`) của `anon` và `authenticated` trên 6 bảng nhạy cảm (0 privileges).
  3. Tước bỏ mọi quyền mutation client trên các bảng nghiệp vụ công khai (`places`, `videos`, `preset_itineraries`), chỉ cho phép quyền `SELECT` với bản ghi đã duyệt (`is_verified = true`).
  4. Mọi thao tác ghi dữ liệu chỉ được ủy quyền độc quyền cho `service_role` thông qua Server API Gateway.
- **Bằng chứng nghiệm thu (Proof):** [`frontend/scripts/rls-matrix-suite.test.mjs`](../../frontend/scripts/rls-matrix-suite.test.mjs) (196 ô ma trận quyền hạn pass 100%) và [`frontend/scripts/fresh-migration-replay.test.mjs`](../../frontend/scripts/fresh-migration-replay.test.mjs) (Tái lập thành công 50 migrations từ database hoàn toàn trống).
- **Phê duyệt:** `GATE_G2` · **Owner:** Chăm Rốch Thi (Data Governance Owner).

### 🔴 RSK-P0-003: Server-Side Request Forgery (SSRF) via Scrapers
- **Phân loại:** An ninh Mạng & Egress Gateway (`NETWORK_SSRF_SECURITY`)
- **Nguồn phát hiện:** [CURRENT_STATE_AUDIT.md](CURRENT_STATE_AUDIT.md) (Mục 15)
- **Mô tả nguy cơ:** Các endpoint `scrape-images` và `gmaps-scraper` nhận URL tùy ý từ người dùng và thực thi fetch từ máy chủ mà không có ràng buộc allowlist hoặc IP validation, nguy cơ rò rỉ metadata cloud hoặc mạng nội bộ.
- **Biện pháp xử lý (`REMEDIATED`):**
  1. Xây dựng module kiểm thực mạng dùng chung `frontend/src/lib/serverFetchValidator.ts`.
  2. Chặn đứng toàn bộ protocol không phải HTTPS (file, data, gopher, ftp, javascript,...).
  3. Chặn đứng 20 dải IPv4 riêng tư/loopback/IMDS (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`,...), 12 dải IPv6 nội bộ, 11 hostname đám mây/nội bộ (`localhost`, `metadata.google.internal`), và chặn toàn bộ non-443 ports.
  4. Đánh chặn 100% redirect hop trái phép và domain ngoài allowlist; giới hạn kích thước response body 10MB.
- **Bằng chứng nghiệm thu (Proof):** [`frontend/scripts/ssrf-negative-suite.test.mjs`](../../frontend/scripts/ssrf-negative-suite.test.mjs) (136/136 test items pass 100%, chứng minh nguyên tắc Zero Private Egress Invariant).
- **Phê duyệt:** `GATE_G0` · **Owner:** Chăm Rốch Thi (Security Architect).

### 🔴 RSK-P0-004: Uncontrolled Dataset Mutations & POI Divergence
- **Phân loại:** Toàn vẹn Dữ liệu & Quản trị Di sản (`DATA_INTEGRITY_GOVERNANCE`)
- **Nguồn phát hiện:** [CURRENT_STATE_AUDIT.md](CURRENT_STATE_AUDIT.md) (Mục 16)
- **Mô tả nguy cơ:** Dữ liệu địa điểm du lịch bị phân mảnh giữa CSV (1592 dòng), DB snapshot (137 dòng) và UI claims (149/105/82 spots cũ), gây sai lệch dữ liệu vị trí và nguồn thông tin văn hóa/ẩm thực.
- **Biện pháp xử lý (`REMEDIATED`):**
  1. Thiết lập kiến trúc quản trị 2 tầng (2-Tier Data Governance Architecture):
     - **Tầng 1 Canonical Dataset v1.0.0** (`canonical_manifest.json`, `total_verified_count = 1` POI Chùa Xà Tón, mã băm SHA-256 `f65d568a...`, schema `CANONICAL-POI-SCHEMA-V1`) phục vụ Factual AI RAG.
     - **Tầng 2 Raw Candidates** (1592 records trong CSV) quản trị qua Hàng đợi thẩm định tuần tự 102 tickets độc lập (CRQ-001 đến CRQ-102).
  2. Bảng đối soát `POI_CONCORDANCE_TABLE.json` ánh xạ 100% 137 records CSDL với `unapproved_divergence_count = 0`.
- **Bằng chứng nghiệm thu (Proof):** [`frontend/scripts/db-canonical-divergence.test.mjs`](../../frontend/scripts/db-canonical-divergence.test.mjs) (Đối soát 137/137 bản ghi pass 100%) và [`frontend/scripts/canonical-data-validators.test.mjs`](../../frontend/scripts/canonical-data-validators.test.mjs) (Toàn vẹn mật mã SHA-256).
- **Phê duyệt:** `GATE_G2` · **Owner:** Chăm Rốch Thi (Data Governance Owner).

---

## 3. Chi Tiết Ma Trận Rủi Ro Mức P1 (P1 High/Critical Risks)

| Mã rủi ro | Tiêu đề rủi ro | Trạng thái | Biện pháp kiểm soát & Bằng chứng nghiệm thu | Phê duyệt |
|---|---|---|---|---|
| **RSK-P1-001** | Python Production Gateway Deployment Claims | `REMEDIATED` | Phân định rạch ròi Next.js 16 trên Vercel Serverless là production runtime duy nhất; Python chỉ là offline tooling trong `DEPLOYMENT_PATH_INVENTORY`. Proof: [`architecture-deployment-inventory.test.mjs`](../../frontend/scripts/architecture-deployment-inventory.test.mjs). | `GATE_G0` |
| **RSK-P1-002** | Indefinite Chat History Retention & Lack of Right to Erasure | `REMEDIATED` | Quyết định lưu trữ: sessions 24h, logs 30 ngày (DR-G3-RETENTION-SESSIONS-001). Xây dựng cron cleanup RPC theo lô và endpoint xóa session HMAC-SHA256 timing-safe. Proof: [`privacy-retention-deletion-suite.test.mjs`](../../frontend/scripts/privacy-retention-deletion-suite.test.mjs). | `GATE_G3` |
| **RSK-P1-003** | Chatbot Provider Race & Output Hallucinations | `REMEDIATED` | Kiến trúc Sequential Failover 4 tầng (Groq 2.5s -> Gemini 6s -> OpenRouter 5s -> Local RAG 0ms). Chat output schema validator, citation coverage gate, và SOS instant bypass < 5ms. Proof: [`chatbot-provider-failure-suite.test.mjs`](../../frontend/scripts/chatbot-provider-failure-suite.test.mjs). | `GATE_G3` |
| **RSK-P1-004** | Outdated Administrative Commune Boundaries | `REMEDIATED` | Ban hành Glossary G1 và chuẩn hóa toàn bộ nhãn viết tắt cấm (TT Tri Tôn, TT Ba Chúc) thành tên đầy đủ chính thức theo danh mục 15 xã/thị trấn Tri Tôn (RULE 02). Proof: [`commune-ui-label-glossary.test.mjs`](../../frontend/scripts/commune-ui-label-glossary.test.mjs). | `GATE_G1` |
| **RSK-P1-005** | Inauthentic Unsplash Stock Photos & Emojis | `REMEDIATED` | Xóa bỏ 100% Unsplash fallback tại CheckinSpotsManager và thay bằng Honest Failure State với Lucide ImageOff; thay thế 100% emoji bằng Lucide SVG. Proof: [`stock-fallback-removal.test.mjs`](../../frontend/scripts/stock-fallback-removal.test.mjs). | `GATE_G1` |
| **RSK-P1-006** | Mobile Accessibility Deficiencies | `REMEDIATED` | Tính toán tương phản WCAG 2.1 đạt AA/AAA cho 100% bảng màu; quy tắc `:focus-visible` toàn cục, `@media (prefers-reduced-motion: reduce)`, modal dialog `role="dialog"` và Escape key listener. Proof: [`mobile-accessibility-smoke-test.test.mjs`](../../frontend/scripts/mobile-accessibility-smoke-test.test.mjs). | `GATE_G4` |
| **RSK-P1-007** | Serverless Multi-Instance Rate Limiting | 🟡 `ACCEPTED_RISK` | Hỗ trợ phân tán Upstash Serverless Redis REST API. Khi chạy local dev không có token, hệ thống tự động suy thoái an toàn (Graceful Degradation) về In-Memory Sliding Window mà không crash. Rủi ro được chấp thuận có kiểm soát tại Decision Gate G3 (`DR-G3-RATELIMIT-BACKEND-001`). Proof: [`rate-limit-cross-instance.test.mjs`](../../frontend/scripts/rate-limit-cross-instance.test.mjs). | `GATE_G3` |

---

## 4. Kết Luận Kiểm Toán (Auditor Verdict)

Căn cứ trên kết quả rà soát toàn diện:
1. **0 rủi ro P0/P1 nào còn ở trạng thái `OPEN`, `UNREVIEWED`, hoặc `UNACCEPTED`**.
2. **10/11 rủi ro (90.9%) đã được remediated triệt để** và có bằng chứng tự động (automated test suites) pass 100%.
3. **1/11 rủi ro (9.1%) đã được chấp nhận chính thức** (`ACCEPTED_RISK`) tại Decision Gate G3 kèm cơ chế dự phòng suy thoái an toàn (Graceful Degradation Fallback) và rationale rõ ràng.
4. **Hệ thống đáp ứng 100% tiêu chí tiên quyết của Task P07-011**, đủ điều kiện tiến tới ký duyệt Decision Gate G4 (Task P07-012).

*Biên bản được lập và xác thực bởi:*  
**Chăm Rốch Thi** — *Lead Technical Architect & Release Owner*
