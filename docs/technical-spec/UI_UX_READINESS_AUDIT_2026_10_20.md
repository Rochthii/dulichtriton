# UI/UX và độ sẵn sàng sử dụng — 2026-10-20

Task: `UX-AUDIT-20261020-01` · Luồng A · audit hoàn tất, sửa UI `IMPLEMENTED` local.

## Kết luận

**Chưa đủ căn cứ nghiệm thu sẵn sàng sử dụng rộng rãi.** Các luồng tìm kiếm, chọn tour, lưu trên thiết bị và dialog đã có sửa nhỏ, một số hành vi được kiểm tra trực tiếp local. Còn các vấn đề P1 về consent, nguồn SOS, phân loại/claim dữ liệu và build/type-check. Không suy ra usability từ 126 task hoàn tất hoặc Decision G4 cũ. Không thay đổi quyết định phát hành của release owner hay tuyên bố trạng thái deployment hiện hành.

Không có user testing với du khách, đo completion rate, kiểm toán WCAG đầy đủ, đo p95 hoặc kiểm thử thiết bị GPS thật. Không chấm điểm số vì chưa có dữ liệu để quy đổi thành điểm.

## Inventory màn hình và boundary

`rg --files frontend/src/app -g page.tsx` tìm thấy 29 page files, gồm 18 public và 11 admin; đây là số file route, không phải số URL sau static generation.

| Nhóm | Route thực có | Component/boundary | Mức rà |
|---|---|---|---|
| Khám phá | `/`, `/places`, `/places/[id]` | Page riêng, `SearchAutocomplete`, `PlaceCard`, `PlaceDetailClient` | Source + public baseline + local tương tác |
| Danh mục | `/food`, `/stay`, `/culture` | Các page tự dựng UI/data mapping | Source + local rendered content; không kiểm mọi card/filter |
| Lịch trình | `/itinerary`, `/planner` | Cùng dùng `ItineraryClientPage`; `SmartTripBuilder`, `ItineraryExportModal` | Source + chọn tour từ URL + dialog local |
| AI | `/chatbot`, `/chat` | `ChatbotPageClient`; `/chat` được cấu hình redirect; global `ChatbotWidget` | Source cả hai client; runtime widget mở/đóng, không gửi query tới provider |
| Bản đồ | `/map` | `MapClientPage`, dynamic `MapComponent` | Source; runtime local bị chặn bởi Turbopack, không kiểm GPS thật |
| An toàn | `/emergency` | Danh bạ riêng, nguồn/ngày gắn tại từng contact | Source + DOM local; không gọi điện, không xác minh hotline với cơ quan |
| Hỗ trợ | `/guide`, `/auth`, `/partner`, `/privacy`, `/terms`, `/pitch-deck` | Page riêng | Inventory; chưa audit đầy đủ nội dung và mọi trạng thái |
| Admin | `/admin`, `/admin/login`, `/admin/places`, `/admin/videos`, `/admin/itineraries`, `/admin/knowledge-base`, `/admin/stories`, `/admin/feedback`, `/admin/feedbacks`, `/admin/chat-logs`, `/admin/ai-metrics` | `AdminLayout`, `AdminSidebar`, login và các page | Login source + DOM local, layout source; dashboard có auth chưa có credential để rà runtime |

Các file `FoodClientPage`, `StayClientPage`, `CultureClientPage` không được import từ `src/app` tại lúc rà. Không coi việc review các file này là đã kiểm tra route đang chạy; không sửa các file đó trong diff cuối.

## Findings và xử lý

Mức P0 chỉ dùng khi có bằng chứng chặn tác vụ cốt lõi hoặc nguy hiểm nghiêm trọng. Chưa xác lập P0 trong phạm vi quan sát này; điều đó không chứng minh toàn sản phẩm không có P0.

| ID / mức | Bằng chứng source / quan sát | Hậu quả với người dùng | Kết quả |
|---|---|---|---|
| UX01 P1 | `PlaceDetailClient.tsx` trước sửa gắn stamp vô điều kiện; home/list/footer/stay có nhãn 149/100% | Đánh đồng tập ứng viên với canonical đã duyệt | Đã sửa các vị trí trong diff; resolver `canonicalClaims.ts:34` yêu cầu identity + cờ + review/source/timestamp khớp artifact còn hạn. Không fuzzy-match tên hoặc rating. Test negative fail-closed. Các claim văn hóa/SOS riêng còn mở |
| UX02 P1 | `MapClientPage.tsx:105`, callback GPS error trước sửa tự đặt tọa độ mẫu | Khoảng cách/radar không dựa vị trí thật | Đã bỏ tọa độ giả, xóa radius/location và hướng dẫn thử lại/chọn điểm. Chưa kiểm permission-denied trên thiết bị thật |
| UX03 P1 | `SearchAutocomplete.handleSubmit`; `/places` trước sửa không đọc `q` | Nút tìm kiếm mở AI; URL tìm kiếm không được áp vào danh mục | Đã dùng `/places?q=...`, AI vẫn có hành động riêng. Local search “Hồ Tà Pạ” tới đúng URL, ô input giữ từ khóa, 1 kết quả tại lần quan sát |
| UX04 P1 | `ItineraryClientPage.tsx:46`, `:83` | Link tour trước sửa chọn tour đầu; chọn tour mới có thể giữ detail cũ khi lỗi | Đã chọn slug từ URL, xóa detail cũ khi tải, có empty/error/retry. Local link food-tour chọn đúng heading “Food tour ẩm thực 1 ngày + Đêm”. Chưa fault-inject lỗi API |
| UX05 P1 | `ChatbotWidget.tsx:350`, `ChatbotPageClient.tsx:331` | Lỗi tải tour gây append tin nhắn user hai lần | Chặn append lần hai cho itinerary intent và giữ đường trả lời dự phòng. Source review; chưa thực thi lỗi provider/runtime |
| UX06 P1 | `PlaceDetailClient.handleReportSubmit` bỏ qua SDK `error` | Thông báo đã gửi dù request bị từ chối | Đã kiểm `error`, hiển thị thất bại và giữ nội dung. Không đổi bảng/quyền/API; không gửi báo cáo thật để kiểm persistent mutation |
| UX07 P1 | Các dialog báo lỗi, chat, export; nested `a button` trong `PlaceCard` trước sửa | Focus thoát modal, không quay lại; lưu điểm có thể lẫn điều hướng | Hook `useDialogFocus`, Escape, focus loop/return, scroll lock; backdrop chat; bỏ template PDF khỏi accessibility tree. Lưu/bỏ lưu qua button riêng, `aria-pressed`, chỉ báo thành công sau storage write |
| UX08 P1 mở | `ChatbotWidget.tsx:365–380`, `ChatbotPageClient.tsx:346–361`: chỉ `denied` mới gửi consent=false; `unset` đi nhánh granted | Giao diện còn hỏi consent nhưng request có thể khai báo đã đồng ý; header unset hiện “Lưu 24h” | Chưa đổi privacy/session contract trong task UI này. Cần kiểm request và chứng minh không ghi session/log trước lựa chọn; chưa gửi query để tránh tạo dữ liệu |
| UX09 P1 mở | SOS lặp tại home/footer/detail/export/danh bạ; `emergency/page.tsx` gắn source tổng quát và “100%” | Không đủ evidence để bảo đảm các nơi cùng contact/nguồn/phạm vi thời gian | Giữ nguyên số điện thoại theo giới hạn người dùng. Cần task riêng đối chiếu từng contact với nguồn được duyệt; không kết luận số cụ thể đúng/sai từ lần rà này |
| UX10 P1 mở | Build Turbopack CSS subprocess panic; webpack import trace `node:crypto → sessionIdentifierContract → ChatbotWidget`; final tsc có 3 extra exports | Chưa có artifact build đủ để nghiệm thu bản sửa | Xem kết quả validation bên dưới. Những import/export gây lỗi đã có ở `HEAD` trước task; chưa chứng minh toàn pipeline baseline bằng build checkout riêng |
| UX11 P1/P2 mở | `/food` local từng render “Đua Bò Bảy Núi” như quán; mapper/filter dựa keyword; home có cost/time defaults | Phân loại và gợi ý hành động có thể sai; dữ liệu thiếu bị biến thành fact | Không thay dataset/phân loại nghiệp vụ. Đã bỏ fallback giá theo tên món trong `/food`, giữ giá có sẵn và hiển thị thiếu giá trung thực. Phần mapping còn cần G2/data owner |
| UX12 P2 | `globals.css` base-layer token bị legacy CSS unlayered ghi đè; SiteNav trắng/slate, tablet chỉ một phần link | Màu/font/component khác nhau giữa màn hình và viewport | Đưa token authority ra ngoài layer; kiểm computed `--primary=#0e8c7f`, `--surface=#fffdf7`. Header dùng surface, tablet dùng menu đầy đủ, `aria-current`, `aria-expanded`; mobile có SOS trực tiếp |
| UX13 P2 | Card vàng mọi category, nút nhỏ; detail fixed bar thiếu safe-area | Khó nhận loại POI, thao tác chạm và vùng đáy thiếu ổn định | Card dùng radius/shadow/token danh mục, CTA chỉ đường palm, controls chính 44px. Fixed detail bar cộng safe-area; chưa giả lập notch/GPS thật |
| UX14 P2 mở | Favorite local không có màn hình saved rõ; lưu tour và yêu thích dùng key khác nhau; nhiều card riêng | Người dùng có thể không biết tìm lại điểm đã lưu ở đâu | Cần thống nhất entry point “Đã lưu”, cách giải thích lưu trên thiết bị và feedback state; chưa đổi storage schema/workflow |
| UX15 P2/P3 mở | Chi tiết có raw `**`, heading rỗng; nested main; emoji/monospace/CTA và animation còn rải rác | Đọc khó, hierarchy yếu; trải nghiệm không nhất quán | Cần hội tụ renderer + shared filter/card/empty state. Chưa đổi narrative văn hóa hoặc thêm thư viện |

## Quy tắc đồng bộ được dùng

- Giữ Folk-Modern Bảy Núi: `--bg`, `--surface`, `--ink`, `--ink-soft`, jade, palm; token authority trong `globals.css`; không sửa generated `lovable.css`.
- CTA điều hướng chính palm, hành động phụ jade/outline, SOS có semantic warning; một category dùng cùng token. Font display/body/note theo design skill, giảm font-mono cho thông báo người dùng.
- Dùng radius 12/18/26, shadow token và spacing bội 8 khi sửa. Chưa đưa mọi page riêng về cùng component trong một lượt audit.
- Loading không đồng nghĩa có dữ liệu; lỗi phải có mô tả và đường phục hồi; giá/rating/source thiếu không được tự suy ra.
- Modal có accessible name, focus vào trong, Tab loop, Escape và trả focus; controls chính được sửa có target 44px. Điều này không tương đương chứng nhận WCAG toàn site.
- Admin có shell riêng; tắt public nav/footer/chat trong admin, login có label/autocomplete, trạng thái hiện mật khẩu và error alert. Không đổi auth API hay tự nhận có 2FA.

## Validation thực hiện

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| Git baseline | `main...origin/main`, clean trước sửa. Không merge, commit, deploy hoặc thay schema/config/dependency/lockfile |
| Browser public baseline | Mobile 390×844: home, danh mục và trạng thái không kết quả; đối chiếu nhãn đại trà. Không coi public là bản đã sửa |
| Browser local | 390×844 và 1440×900: screenshot/DOM của danh mục, detail, itinerary; header mobile/desktop, không horizontal overflow tại mẫu danh mục đã kiểm |
| Search | Từ home nhập “Hồ Tà Pạ” và Enter → `/places?q=H%E1%BB%93%20T%C3%A0%20P%E1%BA%A1`; không mở dialog AI, từ khóa và kết quả giữ đúng |
| Favorite | Bấm lưu/bỏ lưu trên card, aria-pressed true/false, URL giữ nguyên; `a button` count=0 trong trang mẫu. Không ghi tài khoản/server |
| Dialog góp ý | Initial focus ở nút đóng, Shift+Tab tới nút gửi, Tab quay lại đóng, Escape đóng và trả focus về nút báo lỗi. Không bấm gửi |
| Dialog chat | Mở/đóng, Escape; focus trả về FAB sau khi giữ FAB mounted. Không gửi prompt hoặc xác minh chất lượng câu trả lời |
| Dialog export | Mở đúng tour, Escape đóng, focus về CTA export. Không xuất PDF/QR để chứng nhận nội dung/layout file |
| Login | DOM local có labels email/password, toggle tên rõ; không có public nav/footer/chat. Không đăng nhập hay truy cập dashboard có auth |
| `node --test scripts/poi-ui-claim-canonical.test.mjs scripts/mobile-accessibility-smoke-test.test.mjs` | 11/11 pass; gồm 2 test mới về provenance/expiry/missing flags. Smoke cũ phần lớn source/math assertions, không phải user testing/WCAG audit |
| Rerun canonical test sau tightening identity | 6/6 pass (4 cũ + 2 mới). Không test mạng hoặc DB live |
| ESLint các file TS/TSX được sửa | Lượt cuối pass 0 errors; chỉ lint các TS/TSX trong phạm vi sửa, không suy ra accessibility/readiness |
| `tsc --noEmit --incremental false` | Lượt đầu pass. Sau build sinh `.next/types`, **fail** vì extra exports `removeVietnameseTones` (search route), `CLUSTER_DEFS` (home), `CLUSTERS_MAP` (places). Final verdict type-check là fail, không dùng lượt đầu để tuyên bố pass |
| `next build` (mặc định Turbopack) | Fail cả trong và ngoài sandbox: CSS `leaflet.css`, child Node exits before connection. Dev `/map` cũng xuất Runtime Error. Không kết luận nguyên nhân cuối cùng là sandbox |
| `next build --webpack` | Sandbox fail EPERM ghi `.next`; ngoài sandbox fail `UnhandledSchemeError node:crypto` qua helper session được import vào client. Không sửa security helper hoặc cấu hình bundler để né lỗi |
| `git diff --check` | Pass tại completion; chỉ có cảnh báo line ending CRLF, không có whitespace error |

Chỉ những UI behavior được liệt kê local mới có quan sát tái lập. Không có test chứng minh negative request không persistent-write trong task này; không nâng các claim RLS/auth/privacy/backend.

## Thứ tự task tiếp theo

1. `UX-FOLLOWUP-BUILD`: xử lý client/server import và route export hợp lệ; build/type-check từ checkout sạch phải pass. Route đề xuất `Sol · xhigh` do helper session/crypto, tránh thay đổi semantics identifier khi sửa bundling.
2. `UX-FOLLOWUP-CONSENT`: đồng bộ unset/granted/denied ở cả hai client với server guard; negative case phải chứng minh không có session/log/cache/audit/external mutation trước consent. `Sol · xhigh`.
3. `UX-FOLLOWUP-DATA-TRUST`: G2/data owner đối chiếu mapping category, source/expiry từng contact SOS và các price/time defaults; không tự invent facts. `Astra · xhigh` khi nguồn mâu thuẫn.
4. `UX-FOLLOWUP-COMPONENTS`: hội tụ card/filter/empty/loading/error giữa page đang dùng, entry point đã lưu, renderer markdown và type hierarchy. `Sol · medium`.
5. Kiểm thử với du khách lần đầu trên điện thoại thật: tìm điểm → xem độ tin cậy → chỉ đường; tìm/lưu tour; gặp lỗi mạng; tìm SOS. Ghi bằng chứng và vấn đề thực tế trước khi chốt readiness.

## AI và tài liệu liên quan

- AI route đề xuất: `Sol · xhigh` cho nhãn tin cậy/UI và đánh giá boundary; `Sol · medium` cho phần style thông thường.
- AI thực dùng: Codex GPT-6; host không cung cấp effort/version cụ thể cho lượt hiện hành. Antigravity `Claude Sonnet 4.6 (Thinking)` read-only, job `agy-d814d887`, Linear `CRT-26` Done. Lead đã kiểm lại findings; không nhận nhãn P0/production verdict của worker một cách tự động.
- SDK response.error được đối chiếu với [Supabase insert documentation](https://supabase.com/docs/reference/javascript/insert). Không tạo mutation live để chứng minh đường góp ý hoạt động.


## Bổ sung 2026-10-23 — UX-FOLLOWUP-BUILD

> **Data trust follow-up:** phần UI đã chặn food subtype mâu thuẫn/default giả và local SOS tranh chấp, dùng chung national SOS, placeholder ảnh trung tính. 91 combined tests, lint 37 files 0 errors/132 warnings và build+TS 181/181 pass. [Evidence/G2 handoff](PUBLIC_DATA_TRUST_EVIDENCE_2026_10_23.md). UX09/UX11 có containment local, chưa đóng source approval, AI/offline hoặc browser/staging acceptance.

> **Cập nhật tiếp theo cùng ngày:** `UX-FOLLOWUP-CONSENT` đã sửa local các lỗi unset/fallback/history và đồng bộ UI consent. 58 targeted tests, lint 0 errors và Turbopack + TS 181/181 pass; [evidence consent](CHAT_CONSENT_BOUNDARY_EVIDENCE_2026_10_23.md). Các mô tả lỗi consent ban đầu giữ làm lịch sử; chưa có browser/staging/DB live proof và chưa nghiệm thu readiness tổng thể.

**Luồng A · done local, code IMPLEMENTED.** Kết quả dưới đây thay thế kết luận build/type-check ngày 2026-10-20 cho working tree hiện tại; không thay kết luận readiness tổng thể hoặc Decision Gate của owner.

### Thay đổi và nguyên nhân

- `frontend/src/lib/sessionIdentifierContract.ts`: static import `node:crypto` bị kéo vào cả hai client chatbot. Bỏ import đó; ưu tiên Web Crypto `randomUUID()`, fallback 16 bytes `getRandomValues()` với version/variant masks, throw khi nguồn mật mã thiếu hoặc lỗi. Validation/ownership không đổi.
- `frontend/src/lib/searchText.ts`: di chuyển nguyên hàm `removeVietnameseTones` từ API route; route và `SearchAutocomplete` import helper này. Client không còn import server API module; hành vi tìm kiếm có dấu/Unicode giữ nguyên.
- `frontend/src/app/page.tsx`, `frontend/src/app/places/page.tsx`, search route: bỏ exports ngoài contract Next. Không có consumer khác của các page exports bị bỏ.
- Contract doc và tests: ghi fallback/fail-closed đúng implementation, thêm browser VM kiểm không import Node, branch native/fallback/thiếu CSPRNG và search NFC/NFD.

### Kiểm chứng thực chạy

| Kiểm tra | Kết quả và giới hạn |
|---|---|
| `node --test scripts/chat-session-identifier-contract.test.mjs scripts/search-text.test.mjs scripts/chatbot-widget-session.test.mjs scripts/chatbot-page-client-session.test.mjs scripts/chat-session-ownership.test.mjs scripts/chat-session-deletion.test.mjs` | 36/36 pass. Ownership/deletion dùng fixture/unit boundary; không phải DB live hoặc production authorization audit |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Pass, có Next-generated route types; production builds cũng chạy TypeScript pass |
| ESLint 6 file source thay đổi trong follow-up và 2 test scripts | Exit 0, 0 errors; 18 source warnings có sẵn về unused/img; 2 warnings do scripts bị ignore theo config. Không nói test scripts đã được lint |
| `node node_modules/next/dist/bin/next build --webpack` | Pass, 181/181 static-generation progress; không chạy prebuild để tránh ghi lại generated canonical artifact |
| Turbopack với cache cũ | Vẫn fail CSS subprocess, cả Node 24.11.1 và bundled Node 24.22.1 ngoài sandbox. Không kết luận chỉ do sandbox hoặc runtime version |
| Chẩn đoán cache | Mẫu Next tối thiểu với PostCSS/Tailwind pass; chuyển `.next` sang backup rồi build dự án pass. Lượt này có 7 CSS warnings vì Tailwind quét bản backup generated. Đã xóa đúng thư mục backup/probe vừa tạo |
| `node node_modules/next/dist/bin/next build` sau dọn diagnostics | Pass lần xác nhận, 181/181, TypeScript pass, không còn 7 CSS optimization warnings. Còn cảnh báo parent bun.lock ngoài repo và middleware convention. Không cần đổi config/dependency/bundler |
| Runtime browser recheck | Đã chạy `next start` localhost:3000; công cụ browser từ chối quyền quan sát URL local theo URL policy. Không thử bypass và không tuyên bố đã kiểm lại map/runtime/UI trong follow-up này |
| `git diff --check` | Pass; chỉ có thông báo line endings CRLF |

Lỗi CSS subprocess không tái hiện sau tạo lại cache. Đây là bằng chứng phục hồi local; chưa xác định cơ chế hỏng cache ban đầu, chưa kiểm CI hoặc checkout sạch. Build pass không chứng minh usability, consent, nguồn hotline hay tính chính xác POI.

**Review:** đề xuất Sol · xhigh; thực dùng Codex GPT-6, host không công bố effort. Antigravity Gemini 3.8 Flash High read-only `agy-afd1597f` completed, Codex đối chiếu masks/consumer/negative tests, Linear `CRT-27` Done. Không sử dụng kết luận production/security tuyệt đối của worker làm evidence.

**Tiếp theo:** `UX-FOLLOWUP-CONSENT`, rồi `UX-FOLLOWUP-DATA-TRUST` và component convergence. Các findings P1/P2 ngoài build trong báo cáo vẫn còn mở. Chưa deploy.
