# QUY CHUẨN KỸ THUẬT SESSION IDENTIFIER CHATBOT DU LỊCH TRI TÔN
## Mã Quy Chuẩn: CHAT-SESSION-ID-CONTRACT-V1
## Tham chiếu: Task P04-002 | RULE 01 (Production Real) | Decision Gate G3

---

### 1. Bối Cảnh & Động Cơ Kỹ Thuật (Rationale)

Hệ thống Trợ lý Du Lịch Tri Tôn AI phục vụ du khách và người dân tra cứu thông tin du lịch, ẩm thực, lịch trình và văn hóa bản địa. Trước khi ban hành quy chuẩn này:
1. Client-side tự sinh session ID phân mảnh thông qua `Math.random().toString(36).substring(2, 9)` (ví dụ `page_session_a1b2c3d` tại `ChatbotPageClient.tsx` hoặc `session_x9y8z7w` tại `ChatbotWidget.tsx`).
2. Cơ chế này vi phạm nghiêm trọng tính an toàn mật mã:
   - **Dễ dự đoán (Predictable)**: `Math.random()` là Pseudo-Random Number Generator (PRNG) không an toàn, kẻ tấn công có thể suy diễn và tái tạo chuỗi ID.
   - **Xung đột định danh (High Collision Rate)**: Entropy chỉ có khoảng 36-40 bits (7 ký tự base36), dẫn đến nguy cơ ghi đè hoặc lộ lịch sử chat giữa các du khách khác nhau.
   - **Thiếu kiểm soát phân quyền (No Ownership Binding)**: Không có định dạng chuẩn mực để áp dụng Row Level Security (RLS) hoặc kiểm thực session ownership (Task P04-005).

**Quyết định ban hành:** Hệ thống chuẩn hóa duy nhất một định dạng Session Identifier trên toàn bộ hệ thống là **UUID v4 (RFC 4122)**.

---

### 2. Định Dạng Chuẩn Hóa Duy Nhất (Canonical Format)

Mọi mã định danh phiên hội thoại (`session_id`) trong toàn bộ cơ sở dữ liệu (`chat_sessions`, `chat_logs`), API routes (`/api/v1/chat/query`, `/api/v1/chat/stream`, `/api/v1/chat/session`) và UI Client (`ChatbotPageClient`, `ChatbotWidget`) **BẮT BUỘC** phải tuân thủ chuẩn **UUID Version 4** theo RFC 4122:

```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```
Trong đó:
- `x`: Ký tự hệ thập lục phân viết thường (`0-9`, `a-f`).
- `4`: Phiên bản UUID v4 (bắt buộc cố định tại vị trí ký tự thứ 15).
- `y`: Variant RFC 4122 (bắt buộc thuộc tập hợp `[8, 9, a, b]` tại vị trí ký tự thứ 20).
- Tổng chiều dài: **Chính xác 36 ký tự ASCII** (bao gồm 32 ký tự hex và 4 dấu gạch nối `-`).
- Ký tự: **Bắt buộc chuẩn hóa chữ thường (lowercase)** khi lưu trữ và truyền nhận.

#### Biểu thức chính quy kiểm thực (Regex Invariant):
```regex
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

---

### 3. Cơ Chế Sinh Session ID (Generation Protocol)

1. **Client-side Generation**:
   - Sử dụng Web Cryptography API chuẩn: `crypto.randomUUID()`.
   - Nếu không có `crypto.randomUUID()`, helper dùng `crypto.getRandomValues()` sinh 16 byte, đặt version 4 và variant RFC 4122; giữ 122 bits ngẫu nhiên từ CSPRNG.
   - Nếu Web Crypto không khả dụng hoặc báo lỗi, dừng sinh ID; không hạ xuống nguồn ngẫu nhiên không an toàn. Helper dùng chung không import module Node vào client bundle.
   - Tuyệt đối **NGHIÊM CẤM** sử dụng `Math.random()` để ghép chuỗi.

2. **Server-side Generation / Validation**:
   - Sử dụng Node.js native `crypto.randomUUID()` hoặc `generateSessionId()` từ `@/lib/sessionIdentifierContract` trên runtime có global Web Crypto.
   - Khi nhận `session_id` từ client, server **phải thẩm định** tính hợp lệ qua `isValidSessionId(id)`. Nếu nhận ID rỗng, sai định dạng hoặc chuỗi legacy cũ, server phải xử lý fail-closed hoặc tự động khởi tạo UUID v4 mới.

---

### 4. Danh Mục Định Dạng Bị Cấm (Prohibited Formats)

Hệ thống từ chối dứt điểm các định dạng sau:
- ❌ Chuỗi sinh từ `Math.random()` (ví dụ `session_xyz123`, `page_session_456abc`).
- ❌ Chuỗi tuần tự số (ví dụ `1`, `2`, `1001`).
- ❌ Dấu thời gian thô (ví dụ `session_1790666000000`).
- ❌ UUID các phiên bản khác không phải v4 (ví dụ UUID v1 theo timestamp/MAC, v3/v5 theo MD5/SHA-1) vì nguy cơ lộ địa chỉ mạng hoặc thời gian tạo.
- ❌ Chuỗi mang giá trị `'anonymous'` ghi vào persistent database (`chat_sessions`). Phiên ẩn danh chỉ được xử lý tạm thời in-memory và không được cấp quyền đọc lịch sử hội thoại của bất kỳ session nào.

---

### 5. Bất Biến Bảo Mật & Quyền Sở Hữu (Security Invariants)

- **`INV-SEC-01 (Cryptographic Entropy)`**: Mọi `session_id` phải sở hữu entropy tối thiểu 122 bits ngẫu nhiên an toàn mật mã (CSPRNG), triệt tiêu hoàn toàn khả năng đoán trước hoặc tấn công vét cạn (brute-force).
- **`INV-SEC-02 (Fail-Closed Server Validation)`**: Mọi endpoint đọc hoặc ghi vào bảng `chat_sessions` phải kiểm thực `session_id` khớp với `SESSION_ID_REGEX`. Mọi payload có session ID malformed sẽ bị từ chối với `HTTP 400 Bad Request` (`code: 'INVALID_SESSION_ID'`).
- **`INV-SEC-03 (Session Ownership Binding — Tiền đề P04-005)`**: Session ID sẽ được kết hợp với chữ ký token hoặc cookie phiên sở hữu của du khách, bảo đảm người dùng A không thể đọc trộm lịch sử hội thoại của người dùng B kể cả khi biết session ID.
- **`INV-SEC-04 (Vòng đời & Tự động hết hạn)`**: Phiên hội thoại du khách có thời hạn hiệu lực tối đa **24 giờ** tính từ thời điểm cập nhật cuối cùng (`updated_at`), phù hợp với chỉ mục `chat_sessions_updated_at_idx` trong cơ sở dữ liệu.

---

### 6. Thẩm Quyền & Phê Duyệt

- **Cơ quan ban hành**: Ban Quản trị Kỹ thuật Hệ thống Du Lịch Tri Tôn AI.
- **Người thẩm định & ký duyệt**: Chăm Rốch Thi (Lead Technical Auditor).
- **Thời điểm có hiệu lực**: `2026-09-29T14:40:00+07:00`.
- **Trạng thái thực thi**: `MANDATORY ENFORCEMENT` trên toàn bộ codebase.
