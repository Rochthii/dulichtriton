# QUY CHUẨN KỸ THUẬT: XÁC THỰC QUYỀN SỞ HỮU PHIÊN HỘI THOẠI (CHAT SESSION OWNERSHIP CONTRACT)

> **Mã quy chuẩn:** `CHAT-SESSION-OWNERSHIP-CONTRACT-V1`  
> **Cấp thẩm quyền phê duyệt:** Hội đồng Quản trị & Kỹ thuật Hệ thống Du Lịch Tri Tôn  
> **Mục tiêu:** Thực hiện cam kết tại [Production Remediation Plan (P04-005)](../12_PRODUCTION_REMEDIATION_PLAN.md), khắc phục rủi ro [Threat Model TM-05](THREAT_MODEL.md) (Đoán hoặc thay session ID để đọc trộm lịch sử hội thoại hoặc ngộ độc ngữ cảnh), và hiện thực hóa bất biến `INV-SEC-03` tại [Chat Session Identifier Contract](CHAT_SESSION_IDENTIFIER_CONTRACT.md).

---

## 1. Bối Cảnh & Phân Tích Mối Đe Dọa (Threat Context)

Trước Wave W4, hệ thống sử dụng định danh phiên hội thoại tự sinh ngẫu nhiên hoặc UUID v4 không kèm chứng thư sở hữu. Khi một du khách trò chuyện, toàn bộ các lượt trao đổi (`turns`) được lưu trữ tại bảng `public.chat_sessions` trên cơ sở dữ liệu Supabase PostgreSQL.

Mối đe dọa kỹ thuật (TM-05):
- **Đọc trộm lịch sử (Eavesdropping / Context Leakage)**: Kẻ tấn công đoán hoặc thu thập `session_id` của du khách khác, gửi request đến `/api/v1/chat/query` hoặc `/api/v1/chat/stream`. Server nạp lịch sử (`loadHistory`) của nạn nhân đưa vào ngữ cảnh LLM, khiến thông tin cá nhân/hành trình của nạn nhân bị tiết lộ.
- **Ngộ độc ngữ cảnh (Context Poisoning)**: Kẻ tấn công gửi các prompt độc hại với `session_id` của nạn nhân nhằm ghi đè nội dung bẩn (`saveHistory`) vào phiên của nạn nhân.

Quy chuẩn `CHAT-SESSION-OWNERSHIP-CONTRACT-V1` thiết lập rào chắn **Cryptographic Session Ownership Binding**: bất kỳ hành vi đọc lịch sử hội thoại nào đều bắt buộc phải chứng minh quyền sở hữu phiên bằng chữ ký mật mã an toàn do máy chủ cấp phát.

---

## 2. Hệ Thống Bất Biến Kỹ Thuật (Invariants)

Hệ thống áp dụng nghiêm ngặt 5 bất biến kỹ thuật:

### 2.1. `INV-OWN-01`: Cryptographic Token Binding (HMAC-SHA256)
Mọi Session ID hợp lệ (chuẩn UUID v4 RFC 4122) đều được ràng buộc với một chữ ký mật mã duy nhất:
$$\text{OwnershipToken} = \text{HMAC-SHA256}(\text{SessionId}, \text{ServerSecret})$$
- `ServerSecret`: Khóa bí mật máy chủ lưu tại biến môi trường (`CHAT_SESSION_SECRET` hoặc fallback `SUPABASE_SERVICE_ROLE_KEY`). Tuyệt đối không để lộ ra phía client.
- Độ dài chữ ký: 64 ký tự hex lowercase (256-bit entropy).

### 2.2. `INV-OWN-02`: Multi-Channel Transport Support
Để đảm bảo tính tương thích cao giữa Web Portal, Mobile Browser, PWA và các môi trường mạng khác nhau, hệ thống hỗ trợ 3 kênh truyền nhận token theo thứ tự ưu tiên:
1. **HTTP Header**: `x-chat-session-token: <hex_token>`
2. **HTTP Cookie**: `triton_chat_session_token=<hex_token>` (thuộc tính `HttpOnly; SameSite=Lax; Path=/`)
3. **JSON Request Body**: `{ "session_token": "<hex_token>", ... }`

### 2.3. `INV-OWN-03`: Timing-Safe Verification
Quá trình so khớp giữa token do client cung cấp và token kỳ vọng máy chủ tính toán BẮT BUỘC sử dụng hàm so sánh thời gian hằng số (`crypto.timingSafeEqual`). Tuyệt đối cấm so sánh chuỗi bằng toán tử thông thường (`===`) nhằm triệt tiêu hoàn toàn nguy cơ tấn công kênh kề (Side-channel Timing Attacks).

### 2.4. `INV-OWN-04`: Fail-Closed Denial on Unowned Session History Access
Khi một request yêu cầu truy cập với `session_id`:
- Nếu `session_id` **đã tồn tại trên cơ sở dữ liệu** (`chat_sessions`) mà client **không cung cấp token hoặc cung cấp token không khớp**:
  - Hệ thống xác định đây là hành vi truy cập trái phép hoặc mạo danh phiên của du khách khác.
  - **TỪ CHỐI TRIỆT ĐỂ**: Route API trả về mã lỗi `HTTP 403 Forbidden` với mã lỗi máy đọc `INVALID_SESSION_OWNERSHIP`.
  - Hàm `loadHistory` tuyệt đối không nạp bất kỳ lượt hội thoại nào của phiên bị chiếm dụng.

### 2.5. `INV-OWN-05`: Fresh Session Lifecycle & Auto-Issuance
- Đối với phiên hội thoại mới tinh (chưa từng tồn tại trên database):
  - Server xác nhận quyền sở hữu cho người khởi tạo ban đầu, `loadHistory` trả về rỗng `[]`.
  - Server tự động sinh `OwnershipToken` tương ứng và đính kèm vào response thông qua header `X-Chat-Session-Token` và Set-Cookie `triton_chat_session_token` để client tự động sở hữu phiên trong các request tiếp theo.

---

## 3. Ma Trận Quyết Định Xác Thực (Verification Decision Matrix)

| Session ID Trạng Thái | Candidate Token | Database Status | Quyết Định Quyền Sở Hữu | Hành Vi Server |
| :--- | :--- | :--- | :---: | :--- |
| `anonymous` | Bất kỳ | Không áp dụng | **Cho phép** (Public) | `loadHistory` trả về `[]`, không lưu DB |
| Sai chuẩn UUID v4 | Bất kỳ | Không áp dụng | **Từ chối** (Bad Request) | Trả về `HTTP 400 INVALID_SESSION_ID` |
| Hợp lệ UUID v4 | Khớp HMAC | Đã có hoặc mới | **Xác thực thành công** | Cho phép `loadHistory`, cập nhật phiên |
| Hợp lệ UUID v4 | Thiếu / Không khớp | **Đã có trên DB** | **TỪ CHỐI** (Forbidden) | **HTTP 403 INVALID_SESSION_OWNERSHIP** |
| Hợp lệ UUID v4 | Thiếu / Không khớp | **Chưa có trên DB** | **Cho phép khởi tạo** | Cấp token mới qua response header/cookie |

---

## 4. Biên Bản Kiểm Toán & Phê Duyệt

- **Tác giả đặc tả:** Hệ thống Trợ lý Du Lịch Tri Tôn AI (Wave W4 Core Security).
- **Lead Security Reviewer:** Chăm Rốch Thi.
- **Ngày phê chuẩn:** 2026-09-29.
