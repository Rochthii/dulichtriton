# UI/UX — lượt hợp nhất 2026-10-23

`UX-CONSOLIDATED-CLOSEOUT` · Luồng A. User yêu cầu gộp phần còn lại, thực thi tinh gọn và commit. **Code/UI trong phạm vi này `IMPLEMENTED` local; readiness toàn bộ còn chờ G2 và browser acceptance.** Không tạo thêm các task code nhỏ để bàn giao.

## Đã rà và sửa

| Mức | Bằng chứng baseline `637b84b` | Kết quả |
|---|---|---|
| P1 | `app/places/[id]/page.tsx` dùng ảnh hero Tà Pạ khi thiếu ảnh, `ratingCount: 50`, parking=true và touristType gán chung | OG/Twitter/JSON-LD chỉ dùng ảnh cung cấp qua presentation gate; bỏ rating khi thiếu count hợp lệ, giữ count đã có; bỏ tiện ích và đối tượng suy đoán. Không xác nhận nguồn của rating/count có sẵn |
| P1/P2 | Culture mapper tự gán 4.9/ảnh Unsplash; spotlight gọi lịch theo tháng là “đang/sắp diễn ra” và “thời gian thực” | Dùng chung missing image/rating; spotlight được gắn tham khảo, lịch chưa xác nhận. Không sửa ngày, địa giới, lịch sử hoặc nghi thức trong nội dung nguồn |
| P2 | Card/radius/shadow, chip active/touch, loading/empty/reset khác nhau giữa bốn catalog; stay empty không có thông báo | `CatalogUI.tsx` dùng chung card/filter/feedback với surface, ink, jade-deep, palm, radius/shadow hiện có và touch 44px; list trên mobile một cột, sm trở lên nhiều cột; giữ layout spotlight riêng |
| P2 | Food/stay/culture bỏ qua HTTP lỗi hoặc response thiếu field, không có retry rõ; response rỗng có thể để lại dữ liệu cũ | Kiểm response status/array tại client fetch; lỗi ban đầu/manual retry hiển thị fallback và nút thử lại; retry gọi fetch trực tiếp; array rỗng hợp lệ xóa card cũ. Cleanup chặn update từ effect cũ. Background SWR của cache hiện hữu vẫn có thể thất bại im lặng |
| P2 | Hai chip audience youth/family trong `/places` không có điều kiện lọc; ô tìm kiếm thiếu tên truy cập | Bỏ hai chip chưa thực thi; các chip còn lại có `aria-pressed`, tên input và focus; reset tiếp tục xóa toàn bộ filter |
| P2 | Food/stay/culture chưa có control lưu chung; lỗi lưu ở footer có thể mở ra ngoài card bị clip | Dùng `SavePlaceButton` và storage đã có; popup lỗi mở lên từ footer, mở xuống từ ảnh, không lồng vào link; header ảnh PlaceCard không clip popup. Vị trí pixel/focus vẫn cần browser acceptance |
| P2 | Hai inline markdown renderer khác hành vi; URL chưa giới hạn scheme; timeline cắt `07:30` thành `07` | Chung `InlineMarkdown.tsx`: bold/italic/link, nội bộ cùng tab, external http(s) có rel, scheme thực thi/protocol-relative/control chars bị từ chối, raw HTML là text; không rút gọn mất nhãn link. Giữ đủ giờ/phút, nhận heading; list detail dùng ul/li, bảng cuộn focus được |

Không ghi P0 hoặc P3 mới. Tham chiếu các findings lịch sử, phạm vi itinerary/chat/SOS/auth và mobile/desktop đã rà trong [audit gốc](UI_UX_READINESS_AUDIT_2026_10_20.md). Lượt này tập trung bốn catalog, metadata detail, saved controls, rich text/chat presentation và evidence nguồn; không audit lại mọi route.

## Quy tắc UI hội tụ

- Catalog thường dùng `CatalogCard`; metadata riêng từng loại vẫn được giữ. CTA có thông tin hành động cụ thể; footer có thể xuống dòng để chứa các vùng chạm 44px.
- Filter dùng `FilterChip`, active jade-deep/white, `aria-pressed`; empty/loading/error dùng `CatalogFeedback`, thông báo thật và action reset/retry. Food filter dùng Lucide thay emoji; anchor chỉ đường trên mobile có tên truy cập đầy đủ.
- Body markdown tối thiểu 14px ở những block được sửa, link cùng token/focus và nhãn đầy đủ; table cuộn trong vùng focus được. Đây không phải chứng nhận tương phản/WCAG toàn app.
- Thiếu ảnh đi thẳng vào `PlaceListingImage` thay vì qua optimizer tạo SVG trước, để giữ nhãn truy cập “Chưa có ảnh địa điểm”. Không thêm ảnh hoặc dependency.

## Evidence đã chạy

```text
node --test scripts/ui-closeout.test.mjs scripts/public-data-trust.test.mjs scripts/saved-places.test.mjs scripts/poi-ui-claim-canonical.test.mjs scripts/mobile-accessibility-smoke-test.test.mjs scripts/canonical-data-validators.test.mjs
```

**46/46 pass, 2 suites**; gồm **11 tests mới**. Tests mới thực thi component/page/metadata source bằng TypeScript loader, SSR và effect harness: HTTP 503/malformed response, fallback/retry/cache bypass, empty thật, filter selection, culture missing facts, link schemes/escaping, time phút, list/table semantics và popup hướng trong card. Không là DOM/browser: saved button được stub trong catalog harness, cache/fetch/place lookup có fixture; tests riêng của saved hook/control vẫn chạy. Test missing-image ban đầu fail vì optimizer biến URL rỗng thành SVG trước renderer; đã sửa luồng này, chạy lại pass.

- TypeScript standalone pass; **Turbopack production build + TypeScript pass, 181/181 static-generation progress**. Gọi Next trực tiếp để không chạy prebuild ghi generated canonical artifact. Còn warning parent bun.lock ngoài repo và middleware convention.
- **ESLint 11 TS/TSX source: 0 errors, 44 warnings**, exit 0; test scripts không được lint bởi cấu hình hiện tại. Không dọn warnings ngoài phạm vi.
- `git diff --check` pass sau bỏ whitespace mới; diff với `data/`, `frontend/src/data/`, `supabase/` rỗng. Không thay schema, canonical, quyền, AI routing hoặc dependency/lock.
- Không retry/bypass browser URL đã bị công cụ từ chối trong follow-up trước; không có screenshot, kiểm viewport, PDF layout hoặc browser/staging proof mới. Không phát sinh cuộc gọi hotline hay mutation DB để kiểm UI.

## Hai gate còn lại — một gói nghiệm thu

| Gate / trạng thái | Evidence còn thiếu để đóng |
|---|---|
| **G2/source approval — còn mở** | P00-007 trong remediation plan chưa được đối chiếu thành record owner/policy nhất quán; các completion lịch sử khác nói G2 đã qua nên không chọn claim thuận tiện. Manifest hiện chỉ xác nhận **1 POI verified**; cần record có thẩm quyền cho thay đổi phạm vi/count, taxonomy mâu thuẫn, ảnh/narrative và các dữ kiện có sẵn. Tách snapshot DB và candidate artifact khỏi canonical |
| **SOS trong G2 — còn mở** | Mỗi local contact cần deep source/capture, phone/address/phạm vi tiếp nhận hiện hành, người duyệt và ngày hết hiệu lực. Ledger có verified_by nhưng URL homepage không giải quyết xung đột/độ mới; UI không tự bật lại CTA. AI/offline/constants cũ cần workflow đồng bộ sau approval, vẫn ngoài phạm vi được phép sửa ở đây |
| **Browser/staging acceptance — thiếu quyền/evidence** | Khi có surface truy cập được: 390×844 và 1440×900, search/filter/reset, save card/detail/list và nhiều tab, keyboard/focus sau bỏ lưu, error/retry/storage blocked, chat/link/timeline, SOS discovery, PDF và layout footer. Cần quan sát thực trước khi đóng; không tạo số liệu usability từ tests/build |

Gộp G2 và acceptance vào cùng hồ sơ này để tiếp nhận evidence; không tự duyệt hoặc đánh dấu `VERIFIED` từ build. Các giới hạn consent/auth và source khác trong [evidence trước](PUBLIC_DATA_TRUST_EVIDENCE_2026_10_23.md) vẫn áp dụng; không kết luận release-ready.

**AI/review:** đề xuất Sol · medium cho UI, xhigh cho ranh giới tin cậy; thực dùng Codex GPT-6 (effort không công bố). Theo skill Antigravity, job read-only `agy-af0d8c26` dùng Gemini 3.8 Flash (High), Linear **CRT-31 Done**. Worker lần này đọc đúng checkout; Codex xác nhận metadata defaults, manifest 1, ledger thiếu expiry/deep source và mâu thuẫn record G2. Không dùng số lượng “Live DB” hoặc suy luận nguồn từ worker làm evidence mới. Skill: `.codex/skills/antigravity-delegation/SKILL.md` ở user profile. Commit theo yêu cầu user; chưa push/deploy.
