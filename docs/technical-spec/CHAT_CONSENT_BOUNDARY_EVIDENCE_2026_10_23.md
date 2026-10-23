# UX-FOLLOWUP-CONSENT — evidence local, 2026-10-23

## Phạm vi và trạng thái

Luồng A. Code `IMPLEMENTED` trong working tree; các trường hợp fixture bên dưới đã được thực thi. Không phải audit pháp lý, kiểm DB live, UI browser, xác minh RLS hoặc nghiệm thu production. Giữ nguyên dữ liệu/schema/quyền/AI routing và thời hạn server 24 giờ theo `DR-G3-RETENTION-SESSIONS-001`.

AI đề xuất: Sol · xhigh. Thực dùng: Codex GPT-6 (host không công bố effort). Đã thử independent review với Antigravity Gemini 3.8 Flash High, `agy-c45a0870`; canceled sau hơn 12 phút không trả kết quả, log có tool-step error, Linear `CRT-28` Canceled. Không dùng worker làm review evidence.

## Root cause đã đối chiếu

| Finding | Bằng chứng trước sửa | Sửa trong phạm vi |
|---|---|---|
| P1 — chưa chọn bị coi là đồng ý | `chatConsentGuard.shouldPersistChatSession/shouldLoadChatHistory` chỉ loại denied; hai client tạo `consent: !isConsentDenied` | Chỉ `granted` được lưu/tải; header/body mâu thuẫn thì denied thắng |
| P1 — fallback bỏ consent | `ChatbotWidget` và `ChatbotPageClient` gọi query fallback với ID/token nhưng không có consent | Cả stream/fallback dùng `chatClientPrivacy.buildChatRequest`; unset/denied gửi anonymous, history rỗng, không token/cookie |
| P1 — history/log vượt guard | Stream gọi `loadHistory(sessionId)` khi client history rỗng; query/stream audit helper không có consent | ID hiệu lực anonymous trước ownership nếu chưa granted; stream tôn trọng canLoadHistory; audit helper chặn tại cùng điểm ghi trước khi lấy DB client |
| P1 — trạng thái riêng tư lệch giữa hai client | Mỗi component có state/localStorage riêng, không có cùng-tab notification, history luôn được restore/save | `useChatPrivacy` chung: hydrate/sinh ID/restore/persist chỉ granted; đồng bộ custom event và storage event; unset/denied dọn local history/ID/token |
| P2 — badge không trung thực, banner khó đọc trên hẹp | Unset hiển thị “Lưu 24h”; widget banner truncate; nút nhỏ | `ChatConsentControls` chung: Chưa lưu/Không lưu/Lưu 24h, nội dung wrap, min-height 44px, token surface/ink/palm, focus nhìn thấy |
| P1 — phản hồi cũ sau đổi lựa chọn | Token và message async có thể ghi lại storage sau khi đổi trạng thái | AbortController và revision cho mỗi request/consent change; chặn late token/response và fallback của request đã hủy; grant lại mở ID mới |
| P2 — xóa phiên không có feedback lỗi | Auto DELETE khi denied bỏ qua response/failure | Chỉ xác nhận khi response ok và success true; giữ quyền xóa tối thiểu trong RAM để thử lại, hiển thị retry khi lỗi |

Kiểm route thật bằng fixture cũng phát hiện stream đóng controller ở early return rồi đóng lần hai trong finally. Đã bỏ ba lần close sớm; finally là điểm đóng duy nhất, tránh lỗi SSE ở injection/out-of-scope/poisoned branch.

## Data flow sau sửa

| Lựa chọn | Thiết bị | Request stream/query | Server private state |
|---|---|---|---|
| unset | Chỉ lưu trạng thái giao diện trong RAM; không restore/save transcript, ID hoặc token | consent false, header unset, anonymous, history [], credentials omit | Không đọc/lưu session; không thử ghi chat log; không cấp token/cookie |
| denied | Lưu lựa chọn denied; transcript/ID/token cũ được dọn khỏi localStorage | consent false, anonymous, history [], credentials omit | Như unset; nếu chuyển từ granted có owned token, gửi DELETE riêng để xóa phiên đã cho phép lưu trước đó |
| granted | Lưu lựa chọn, UUID hợp lệ, token và transcript; đổi từ không lưu sang lưu bắt đầu hội thoại mới | Header/body granted, ID/token/history hợp lệ | Ownership guard giữ nguyên; được load/save session và đi qua chat-log helper |

Không quảng bá “ẩn danh tuyệt đối”: câu hỏi hiện tại vẫn có thể đi tới embedding/AI provider để trả lời. Consent trong task này quản lý lưu/replay hội thoại ở ứng dụng; không xác nhận việc lưu log tại hạ tầng hoặc provider bên ngoài. Weather cache công khai không chứa transcript; semantic-cache helper không được gọi trong hai route đã trace. Không đổi provider routing.

## Kiểm chứng thực thi

Lệnh (từ `frontend`):

```text
node --test scripts/chat-consent-boundary.test.mjs scripts/chat-consent-guard.test.mjs scripts/chatbot-page-client-session.test.mjs scripts/chatbot-widget-session.test.mjs scripts/chat-session-identifier-contract.test.mjs scripts/chat-session-ownership.test.mjs scripts/chat-session-deletion.test.mjs scripts/privacy-retention-deletion-suite.test.mjs
```

**58/58 tests pass**, gồm 12 test mới tại `chat-consent-boundary.test.mjs`:

- Nạp và thực thi POST source thật cho query/stream với DB recorder và provider fixtures; không thay route bằng handler giả. Next response adapter, provider/retrieval outputs được cô lập; loader chặn fetch ngoài dự kiến.
- Mỗi route: unset, denied, body granted/header denied và ngược lại; mỗi trạng thái đi qua normal, injection và out-of-scope query. Recorder xác nhận snapshot session giữ nguyên, không có private table read hoặc mutation attempt vào session/log/cache/audit, không token/cookie, không replay private client/server history.
- Granted positive control thực sự upsert session trong fixture; query log được insert. Stream log helper hiện có tạo lazy insert builder nhưng không await/then, nên không coi đó là bằng chứng stream log đã persist. Không sửa vấn đề observability này trong task consent.
- Hai bước granted → denied giữ nguyên snapshot sau bước denied và không đọc lại phiên; request granted có signal đã abort không khởi tạo session/log write.
- Hook source thật chạy trong harness quản lý refs/state/effects: đồng bộ page/widget và storage event, xóa local private keys, abort request, chặn stale token kể cả khi grant lại, hydrate UUID hợp lệ và migrate legacy ID không mang theo token cũ.
- Lỗi xóa phiên được hiển thị; retry nhận success true mới xóa pending credentials trong RAM. SSR của shared controls xác nhận label unset/denied không giả “Lưu 24h”, có lựa chọn không lưu và retry. Không phải browser interaction/visual test.
- Test cũ kiểm source đã được điều chỉnh để theo shared hook; không coi những source assertions hoặc mô phỏng thuật toán cũ là UI runtime proof. Script boundary mới được đăng ký trong `npm test`; không chạy toàn bộ npm test ở lượt này.

Các kiểm tra khác:

- ESLint 8 source files trong phạm vi: exit 0, **0 errors / 13 warnings** (unused/img/exhaustive-deps cũ; không thêm dependency hay sửa lock file).
- `node node_modules/next/dist/bin/next build`: Turbopack pass **181/181**, TypeScript pass. Gọi trực tiếp để không chạy prebuild ghi generated canonical artifact. Còn warning parent bun.lock ngoài repo và middleware convention.
- `git diff --check`: pass; chỉ có thông báo CRLF.
- Không gọi DB/provider live hoặc gửi/xóa hội thoại production. Không thử lại browser sau URL-policy rejection của lượt trước và không dùng workaround.

## Giới hạn và rủi ro còn lại

1. Abort/revision chặn client mới và server write khi signal đã abort; không thu hồi thao tác đã commit hay bảo đảm distributed revocation cho request granted đang chạy trên nhiều worker. Cần browser + staging concurrency test trước claim privacy production.
2. Pending deletion chỉ giữ trong RAM; reload/unmount khi đang lỗi sẽ mất khả năng retry từ phiên UI này. Giữ trang mở để thử lại. Không tự ghi token trở lại localStorage khi đã từ chối.
3. `chatSessionOwnership.getSessionSecret` có fallback secret cố định trong source trước task; cần task auth riêng trước release. Bộ HMAC unit test không chứng minh secret production được cấu hình an toàn. Không đổi auth trong lượt UI/consent này.
4. Local transcript granted chưa có TTL riêng; “24 giờ” trong banner chỉ nói retention ngữ cảnh máy chủ. Các khẳng định tuyệt đối cũ trong privacy page/Decision Records cần owner review; không tự nâng thành legal/security certification.
5. Stream log lazy builder và phản hồi xóa lịch sử thủ công cũ cần follow-up riêng. Không dùng completion này để chứng nhận toàn bộ logging/deletion policy.

**Tiếp theo:** `UX-FOLLOWUP-DATA-TRUST` — nguồn/mapping POI và SOS, với G2/data owner cho claim; sau đó component convergence và staging/browser acceptance. Readiness tổng thể vẫn chưa nghiệm thu; chưa deploy.
