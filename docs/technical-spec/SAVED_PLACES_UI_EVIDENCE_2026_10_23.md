# UX-FOLLOWUP-COMPONENTS — lưu và tìm lại điểm đến

Ngày 2026-10-23 · Luồng A · code `IMPLEMENTED` local. Phạm vi task này chỉ hội tụ luồng lưu POI; không tuyên bố mọi card/filter/renderer đã đồng bộ hoặc readiness toàn hệ thống đã đạt.

## Kết luận và phạm vi

Card và chi tiết dùng chung một nút lưu, danh sách `/places?saved=1` cho phép tìm lại. Dữ liệu thuộc trình duyệt hiện tại, không đồng bộ tài khoản; lịch trình nháp và tour đã lưu vẫn là nghiệp vụ riêng. Không thay schema, dữ liệu canonical/candidate, quyền hoặc AI routing.

Đã rà source và controlled SSR cho danh sách tất cả/đã lưu, empty/loading/storage-error; helper/hook thực với storage và event fixtures cho thao tác lưu/bỏ lưu. Đã rà tích hợp card, chi tiết, menu mobile và ranh giới storage lịch trình. **Chưa quan sát browser hoặc viewport trong follow-up này**: lần kiểm local trước bị công cụ từ chối URL policy, không thử đường vòng. Không suy SSR/build thành bằng chứng responsive, screen reader, usability hay production.

## Findings và thay đổi

| Mức | Finding trong baseline `fcf1e34` | Sửa và evidence source hiện tại |
|---|---|---|
| P2 | Card giữ favorites riêng, chi tiết chỉ có thao tác thêm vào lịch trình; không có chỗ xem lại favorites | `SavePlaceButton.tsx:8`, `PlaceCard.tsx:150`, `PlaceDetailClient.tsx:415`; tabs `/places` và `/places?saved=1` tại `app/places/page.tsx:281`; entry menu mobile `SiteNav.tsx:48` |
| P2 | Trạng thái ở card được đọc một lần, có thể lệch khi một instance/tab khác lưu | `hooks/useSavedPlaces.ts:6`: refresh ban đầu, custom event cùng tab và storage events khác tab, cleanup listeners; test thực thi hook source |
| P2 | JSON storage không được kiểm cấu trúc; ID/slug chưa có cách khớp thống nhất | `lib/savedPlaces.ts:12`, `:26`: kiểm mảng string, không ghi đè dữ liệu lỗi; nhận slug/id/place_id của record hiện tại, lưu mới ưu tiên slug; gỡ toàn bộ alias trùng của record |
| P2 | Filter cũ có thể còn khi chuyển URL; reset chưa xóa cluster/TikTok; list có nested main | `app/places/page.tsx:92`, `:260`, `:516`: reset theo URL và reset toàn bộ filter hiện có; dùng container thường trong main của layout |

Không phát hiện P0/P1 mới trong phạm vi hẹp này; không hạ mức các findings ngoài phạm vi của [audit gốc](UI_UX_READINESS_AUDIT_2026_10_20.md). Không tạo finding P3 chỉ để đủ mức phân loại.

### Quy tắc UI được áp dụng

- Nút lưu dùng chung Lucide Heart, vùng chạm tối thiểu 44px, focus nhìn thấy, `aria-pressed` chỉ khi đã đọc được storage. Active dùng jade-deep/white; surface/ink cho trạng thái chưa lưu. Không đo hay tuyên bố WCAG toàn trang.
- Trạng thái thành công chỉ cập nhật sau `setItem` thành công; live status mô tả lưu trên thiết bị. Lỗi có thông báo và đọc lại, không báo đã lưu hoặc âm thầm reset JSON hỏng.
- Saved view chỉ hiển thị card khớp dữ liệu đã lưu; không trộn spotlight chưa lưu. Empty chưa có dữ liệu khác với dữ liệu không khớp danh mục/filter và lỗi đọc storage; có đường quay lại khám phá.
- Menu mobile có entry trực tiếp; desktop dùng tab trong Khám phá, không tăng độ dài thanh điều hướng desktop. Thanh hành động chi tiết được phép xuống dòng.

## Kiểm chứng đã chạy

| Kiểm tra | Kết quả / giới hạn |
|---|---|
| `node --test scripts/saved-places.test.mjs` | 10/10 pass: legacy aliases, dữ liệu hỏng/quota/blocked storage không ghi đè, đọc giá trị mới nhất trước toggle, hook sync/cross-tab/recovery, button SSR, saved list/empty/error SSR và source integration. Hook harness không là React DOM/browser test; SSR list dùng state được kiểm soát và card stub để kiểm membership |
| Suite trên + public-data-trust, poi-ui-claim-canonical, canonical-data-validators, sos-payload-contact-provenance, stock-fallback-removal, mobile-accessibility-smoke-test | 42/42 pass, 2 suites. Có source/math/fixture checks; tên suite lịch sử không chứng minh hotline hoặc usability production |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Pass sau gỡ tham chiếu `isLiked` còn sót khi tách nút chung |
| ESLint 7 TS/TSX thay đổi | Exit 0; 0 errors, 27 warnings. Không gọi là warning-clean hoặc nói test script được lint |
| `node node_modules/next/dist/bin/next build` | Turbopack + TypeScript pass, 181/181 static-generation progress. Không chạy prebuild để tránh ghi generated canonical artifact. Còn cảnh báo parent bun.lock/middleware convention |
| `git diff --check` | Pass trước commit; thông báo CRLF không phải lỗi whitespace |

## Giới hạn và phần còn lại

- localStorage không có transaction giữa các tab: thao tác đồng thời thực sự vẫn có thể last-writer-wins; không claim chống mất cập nhật đa tab tuyệt đối. Mỗi toggle đọc lại giá trị hiện có.
- ID cũ chỉ khớp khi còn trong aliases của record hiện tại; không suy một ID đã biến mất thành POI khác hoặc tự migration danh tính khi thiếu evidence. Keys không khớp danh mục vẫn được giữ.
- Chưa nghiệm thu focus sau khi bỏ lưu làm card đang focus biến mất, layout thực trên điện thoại, screen reader, navigation back/forward hoặc nhiều tab browser thật. Cần browser acceptance khi quyền công cụ cho phép.
- Đồng bộ component còn lại: card/filter/loading/error ở food/stay/culture, markdown renderer và type hierarchy theo audit gốc; chưa làm trong task này.
- G2/source approval, SOS AI/offline và staging acceptance vẫn mở theo [data-trust handoff](PUBLIC_DATA_TRUST_EVIDENCE_2026_10_23.md). Khi đọc dependency còn thấy metadata SEO chi tiết dùng fallback ảnh/ratingCount cố định (`app/places/[id]/page.tsx:30`, `:154`); cần task data-trust riêng, không sửa nghiệp vụ trong đợt lưu điểm.

## AI và review

Đề xuất Sol · medium; thực dùng Codex GPT-6 (host không công bố effort). Antigravity Gemini 3.8 Flash Low read-only `agy-24cf7b98`, Linear `CRT-30` Done: worker trả kết quả từ checkout `provide_context` khác, có component/storage không tồn tại ở checkout hiện tại; **không dùng kết quả đó làm evidence review source hiện tại**. Codex tự truy vết và kiểm chứng các thay đổi nêu trên. Không push/deploy hoặc sửa quyết định G2/G4.
