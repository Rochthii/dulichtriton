# BẢNG KIỂM KÊ DỮ LIỆU TRÒ CHUYỆN (CHAT DATA INVENTORY SPECIFICATION)

> **Mã quy chuẩn kỹ thuật:** `DATA-INVENTORY-CHAT-001`  
> **Nhiệm vụ:** `P05-001 — Lập data inventory cho một field chat (Proof: field, purpose, retention, access role được ghi)`  
> **Căn cứ pháp lý:** Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ Dữ liệu Cá nhân & Tiêu chuẩn Kiến trúc Hệ thống Du Lịch Tri Tôn AI  
> **Quyền kiểm toán & Ban hành:** Chăm Rốch Thi (Lead Technical Architect)  
> **Ngày ban hành & Thẩm định:** 2026-10-02  
> **Trạng thái:** `VERIFIED` — Khớp 100% mã nguồn thực tế, RLS Matrix và Migration DDL.

---

## 1. Mục Đích & Nguyên Tắc Quản Trị Dữ Liệu (Data Governance Principles)

Tài liệu này xác lập danh mục kiểm kê dữ liệu chính thức cho các trường dữ liệu được thu thập, xử lý và lưu trữ trong hệ thống Trợ lý Trò chuyện Du Lịch Tri Tôn AI.

### Nguyên Tắc Cốt Lõi:
1. **Thu Thập Tối Thiểu (Data Minimization):** Tuyệt đối không thu thập thông tin định danh cá nhân trực tiếp (Họ tên, SĐT, CCCD, Email, Địa chỉ nhà) của du khách khi sử dụng trợ lý tra cứu du lịch thông thường.
2. **Định Danh Giả Danh (Pseudonymization):** Mọi tương tác hội thoại được quản lý qua mã định danh phiên ngẫu nhiên mật mã (UUID v4), không liên kết với hồ sơ người dùng thực tế.
3. **Giới Hạn Thời Gian Lưu Trữ (Storage Limitation & TTL):** Dữ liệu phiên chỉ tồn tại tạm thời theo chu kỳ vòng đời cần thiết (24 giờ), tự động hết hạn và bị thu hồi vĩnh viễn.
4. **Bảo Vệ Tại Nguồn (Defense-in-Depth & Zero Direct Access):** Quyền truy cập trực tiếp từ phía client ẩn danh (`anon`) bị tước bỏ 100% ở tầng cơ sở dữ liệu (PostgreSQL RLS). Mọi tương tác phải đi qua cổng máy chủ có xác thực quyền sở hữu (HMAC-SHA256 Token).

---

## 2. Bảng Kiểm Kê Trường Dữ Liệu: `public.chat_sessions.session_id`

Dưới đây là bản ghi kiểm kê chuẩn tắc duy nhất (Canonical Inventory Item) cho trường dữ liệu phiên trò chuyện cốt lõi theo nhiệm vụ **P05-001**:

| Thuộc tính kiểm kê | Chi tiết quy chuẩn kỹ thuật | Minh chứng / Bằng chứng đối chiếu |
| :--- | :--- | :--- |
| **Mã định danh kiểm kê** | `INV-CHAT-SESSIONS-SESSION-ID-001` | [chatDataInventory.ts](../../frontend/src/lib/chatDataInventory.ts) |
| **Bảng cơ sở dữ liệu** | `public.chat_sessions` | Migration [`20260809_create_chat_sessions.sql`](../../supabase/migrations/20260809_create_chat_sessions.sql) |
| **Tên trường (Field)** | `session_id` | Định nghĩa cột khóa chính: `session_id TEXT PRIMARY KEY` |
| **Kiểu dữ liệu & Ràng buộc** | `TEXT NOT NULL`, Primary Key | Khóa chính duy nhất, định dạng canonical UUID v4 RFC 4122 |
| **Phân loại dữ liệu** | `PSEUDONYMOUS` (Dữ liệu định danh giả danh) | Không chứa thông tin danh tính cá nhân trực tiếp (PII) |
| **Căn cứ pháp lý** | Điều 17 Nghị định 13/2023/NĐ-CP & Phục vụ dịch vụ theo yêu cầu | Cung cấp dịch vụ trợ lý ảo du lịch tức thì theo yêu cầu của du khách |

---

## 3. Bốn Tiêu Chuẩn Nghiệm Thu Cốt Lõi (Core Proof Criteria)

Theo định nghĩa của kế hoạch cải tổ production (`P05-001 Proof`):

### 3.1. Field (Tên Trường & Phạm Vi Dữ Liệu)
- **Tên trường đầy đủ:** `public.chat_sessions.session_id`
- **Mô tả kỹ thuật:** Chuỗi định danh phiên trò chuyện được cấp phát từ phía máy chủ hoặc trình duyệt client theo quy chuẩn `CHAT-SESSION-ID-CONTRACT-V1` (P04-002, P04-003, P04-004).
- **Định dạng hợp lệ:** Chuỗi UUID v4 gồm 36 ký tự phân tách bởi 4 dấu gạch ngang (ví dụ: `f47ac10b-58cc-4372-a567-0e02b2c3d479`).

### 3.2. Purpose (Mục Đích Xử Lý)
- **Duy trì ngữ cảnh đa lượt (Multi-turn Context Continuity):** Cho phép mô hình AI hiểu được chuỗi câu hỏi tiếp nối của du khách (ví dụ: *"Ở đó có món gì ngon?"* sau khi vừa hỏi về *"Hồ Tà Pạ"*).
- **Cô lập phiên làm việc (Session Boundary Isolation):** Đảm bảo dữ liệu hội thoại của du khách này không bao giờ bị lẫn lộn hoặc nhìn thấy bởi du khách khác.
- **Xác thực quyền sở hữu phiên (Ownership Authentication):** Kết hợp cùng `session_token` (HMAC-SHA256 theo `CHAT-SESSION-OWNERSHIP-CONTRACT-V1`, P04-005) để chứng minh quyền hợp pháp của trình duyệt trước khi cho phép đọc lịch sử hoặc ghi nhận tin nhắn mới.

### 3.3. Retention (Chính Sách & Thời Hạn Lưu Trữ)
- **Thời hạn lưu trữ:** **24 giờ (24 hours)** kể từ thời điểm tương tác gần nhất (`updated_at`).
- **Cơ chế thanh lọc (Eviction Mechanism):**
  - **Index hỗ trợ:** Chỉ mục PostgreSQL `chat_sessions_updated_at_idx` trên cột `updated_at`.
  - **Trigger tự động:** Trigger `trg_chat_sessions_updated_at` cập nhật `updated_at = NOW()` mỗi khi có tin nhắn mới phát sinh.
  - **Tiến trình dọn dẹp:** Thực hiện qua tác vụ quét định kỳ loại bỏ các bản ghi `WHERE updated_at < NOW() - INTERVAL '24 hours'` (nhiệm vụ P05-002 và P05-003).
  - **Xóa chủ động:** Người dùng có quyền gửi yêu cầu xóa phiên ngay lập tức thông qua cơ chế Right to Erasure (P05-005).

### 3.4. Access Role (Phân Quyền Vai Trò & RLS Matrix)
Quyền truy cập trên bảng `public.chat_sessions` đối với trường `session_id` tuân thủ tuyệt đối ma trận RLS đã nghiệm thu tại **P02-024**:

| Vai trò (Role) | Trạng thái quyền | Quyền thao tác | Cơ chế thực thi (Enforcement Mechanism) | Rationale & Ý nghĩa an ninh |
| :--- | :---: | :---: | :--- | :--- |
| **`anon`** | 🔴 **DENY** | `0% (None)` | `REVOKE SELECT, INSERT, UPDATE, DELETE FROM anon;` | Tước bỏ hoàn toàn quyền trực tiếp của người dùng ẩn danh (P02-014, P02-015), ngăn ngừa triệt để nguy cơ tấn công enumeration/scraping phiên qua PostgREST client. |
| **`authenticated`** | 🔴 **DENY** | `0% (None)` | Mặc định chặn qua chính sách RLS | Người dùng đăng nhập không được truy vấn tự do các phiên chat thô nếu không qua cổng kiểm soát máy chủ. |
| **`service_role`** | 🟢 **ALLOW** | `SELECT, INSERT, UPDATE, DELETE` | Server-side Backend Gateway (Next.js App Router API Routes) | Dành riêng cho máy chủ nội bộ (`/api/v1/chat/query`, `/api/v1/chat/stream`) sau khi đã xác thực token sở hữu HMAC-SHA256 (`verifySessionOwnership`). |
| **`admin`** | 🔴 **DENY** | `0% (None)` | Admin UI không nối trực tiếp bảng `chat_sessions` | Bảo vệ quyền riêng tư du khách; quản trị viên không đọc trộm nội dung chat cá nhân mà chỉ quan sát các chỉ số vận hành tổng hợp (AI Metrics, Audit Logs) có ghi vết kiểm toán. |

---

## 4. Kiểm Soát An Ninh & Quyền Của Du Khách (Security Controls & User Rights)

### 4.1. Biện Pháp Kiểm Soát Kỹ Thuật (Technical Safeguards)
1. **Kiểm thực UUID v4 chặt chẽ:** Loại bỏ 100% các giá trị rác, ký tự injection SQL hoặc session id tự chế giả mạo.
2. **Khế ước sở hữu phiên thời gian hằng số:** Hàm `verifySessionOwnershipToken` ứng dụng `crypto.timingSafeEqual` triệt tiêu hoàn toàn tấn công kênh phụ (timing side-channel attacks).
3. **RLS Lockdown:** Đảm bảo dù khóa API anon có bị lộ trên mã nguồn client thì kẻ tấn công cũng không thể SELECT hoặc UPDATE bất kỳ hàng nào trong bảng `chat_sessions`.

### 4.2. Quyền Của Chủ Thể Dữ Liệu (Data Subject Rights)
- **Quyền được biết:** Minh bạch qua tài liệu này và trang [Chính Sách Bảo Mật](/privacy).
- **Quyền xóa bỏ dữ liệu (Right to Erasure):** Du khách có thể xóa toàn bộ lịch sử trò chuyện bất kỳ lúc nào bằng cách làm mới phiên trên widget hoặc bấm nút xóa hội thoại.
- **Quyền phản đối:** Du khách có thể sử dụng chatbot mà không cần cung cấp bất kỳ thông tin nhận diện nào.

---

## 5. Danh Mục Đối Chiếu Kỹ Thuật (Concordance Verification)

- **Mã nguồn TypeScript:** [`frontend/src/lib/chatDataInventory.ts`](../../frontend/src/lib/chatDataInventory.ts)
- **Migration Schema:** [`supabase/migrations/20260809_create_chat_sessions.sql`](../../supabase/migrations/20260809_create_chat_sessions.sql)
- **Migration RLS Revoke Select:** [`supabase/migrations/20260924140500_p02_014_chat_sessions_revoke_anon_select.sql`](../../supabase/migrations/20260924140500_p02_014_chat_sessions_revoke_anon_select.sql)
- **Migration RLS Revoke Insert:** [`supabase/migrations/20260924141700_p02_015_chat_sessions_revoke_anon_insert.sql`](../../supabase/migrations/20260924141700_p02_015_chat_sessions_revoke_anon_insert.sql)
- **RLS Matrix Test (P02-024):** `frontend/scripts/rls-matrix-comprehensive.test.mjs`
- **Bộ kiểm thử tự động P05-001:** `frontend/scripts/chat-data-inventory.test.mjs`
