# UX-FOLLOWUP-DATA-TRUST — UI containment và evidence

Ngày: 2026-10-23 · Luồng A · code `IMPLEMENTED` local. Hoàn tất phần hiển thị trong task; **G2/data owner chưa chốt các nguồn nghiệp vụ đang mâu thuẫn**, không nghiệm thu readiness tổng thể. Không deploy hoặc gọi thử số khẩn cấp.

## Authority và nguồn đã đọc

- Canonical manifest hiện ghi **1 POI verified**. `frontend/src/data/triton_pois_full.json` có 141 bản ghi ứng viên; đây không phải 141 verified hoặc count DB live. Không thay manifest, canonical records, frontend generated artifact hoặc Supabase schema.
- Đối chiếu `CURRENT_STATE_AUDIT.md`, audit UI/UX trước, `VERIFIED_EMERGENCY_HOTLINES.json/.md`, `sosPayloadValidator.ts`, source route thực tế và helpers trực tiếp. Không lấy claim 149 verified từ tài liệu cũ.
- Danh bạ JSON có `verified_by`; tuy nhiên nguồn chỉ tới homepage và không có expiry/evidence page chi tiết. Các giá trị điện thoại/địa chỉ của page cũ và contract không thống nhất. Có dấu VERIFIED và timestamp chưa giải quyết được mâu thuẫn này.
- Tham khảo primary source [Cổng Thông tin Chính phủ, bài ngày 03/09/2025](https://xaydungchinhsach.chinhphu.vn/tong-dai-so-112-tiep-nhan-24-7-cac-thong-tin-ve-su-co-thien-tai-tham-hoa-119250902150528929.htm): tài liệu mô tả liên thông các tổng đài quốc gia. Chỉ giữ các đầu số 113/114/115 đã có sẵn trên UI/contract; không thêm đầu số, xác nhận khả năng tiếp nhận thực tế hay tự thay thế số địa phương bằng số mới.
- Search cũng trả bài primary về kế hoạch tích hợp năm 2026 trên [Công an Sơn La](https://congan.sonla.gov.vn/tich-hop-cac-so-dich-vu-khan-cap-113-114-115-nang-cao-hieu-qua-phuc-vu-nhan-dan/); full page fetch trả 502. Không dùng snippet để kết luận An Giang đã chuyển đổi hoặc sửa hotline. Đây là phần owner cần đối chiếu thêm trước phát hành.

## Findings và sửa có phạm vi rõ

| Mức | Bằng chứng | Thay đổi |
|---|---|---|
| P1 | Artifact có `le-hoi-dua-bo-bay-nui-tri-ton` category gastronomy/subcategory cultural_event; `dua-bo-bay-nui` gastronomy/artwork. UI trước lọc thêm keyword bò/quán và prefix ID | `isFoodListing` chỉ nhận category food/gastronomy và chặn subtype mâu thuẫn đã thấy; dùng cho initial/live `/food`, home food và nearby-food. Không sửa category nguồn hoặc gắn verified cho phần còn lại |
| P1 | `/emergency` trước có 11 contact với phone/address khác ledger, nhưng quảng bá 100%; home/footer/detail/PDF/commune directory lặp số khác nhau | Dừng công bố danh bạ địa phương trên page và các CTA công khai đã rà; hiển thị trạng thái đang đối chiếu, nguồn và các tổng đài quốc gia vốn có. `EmergencyQuickLinks` dùng chung cho home/detail/SOS; export dùng cùng bộ số. Bỏ hotline du lịch không có bằng chứng khỏi PDF |
| P1 | Thiếu phone quán trước dẫn về số Công an như hỗ trợ đặt bàn | CTA khi không có số cơ sở không có href và có aria-disabled; không điều hướng việc đặt bàn sang số SOS |
| P1/P2 | `parseTravelGuide` tự gán giờ 06:00–18:30, miễn phí, loại xe, mùa đi; detail/food/stay/home tự gán giá/giờ/rating | Chỉ giữ giá trị có sẵn hoặc trạng thái thiếu rõ ràng; parser chịu được JSON null/array/corrupt/type sai. Rating 0 thật được giữ, missing/invalid không thành 4.8/4.9/5 |
| P1/P2 | Detail gọi menu generator theo tên, quảng bá thực đơn chuẩn thực địa, chỗ đỗ/tiện ích không lấy từ cơ sở | Bỏ menu suy từ tên và matrix tiện ích gán chung; hiển thị yêu cầu xác nhận. Nhãn tiếp cận và chỗ đỗ không khẳng định khả năng xe/địa hình khi chưa có evidence |
| P2 | Nearby helpers tự tạo rating/review count 150/180 và specialties theo tên; stays tự thêm Wifi/điều hòa/giá đêm | Bỏ các default đó, giữ field có nguồn; helpers không suy dữ liệu thiếu thành social proof |
| P1/P2 | Category fallback dùng ảnh Tà Pạ/cổng chùa cho địa điểm khác; image optimizer tiếp tục đưa ảnh cổng chùa vào empty URL dù mapper đã bỏ ảnh fallback | Hai điểm dùng chung trả SVG placeholder trung tính có chữ “Chưa có ảnh địa điểm”. Food/stay không dùng ảnh Unsplash hoặc ảnh hero làm ảnh cơ sở; `PlaceListingImage` xử lý missing minh bạch. Không thêm ảnh stock, dependency hoặc nguồn/license tự điền |

Trang SOS được rút về các thao tác có thể công bố và trạng thái thiếu dữ liệu; các contact/filter/copy và cẩm nang cũ không còn được render. Không xóa hoặc sửa contact source authority trong docs/constants/AI/offline data; không chọn một tập số địa phương để gắn nhãn verified mới. Phần AI/offline là rủi ro còn mở bên dưới.

Home cache keys cho POI/food presentation tăng version để không tiếp tục dùng default giả từ cache client cũ. API food/schema giữ nguyên; home select thêm `category` đã tồn tại để áp gate, subtype mâu thuẫn đối chiếu local bằng ID/slug. Đó là exclusion ở UI, không phải canonical recategorization.

## Kiểm chứng đã chạy

### Combined regression

Từ `frontend`:

```text
node --test scripts/public-data-trust.test.mjs scripts/poi-ui-claim-canonical.test.mjs scripts/canonical-data-validators.test.mjs scripts/sos-payload-contact-provenance.test.mjs scripts/stock-fallback-removal.test.mjs scripts/mobile-accessibility-smoke-test.test.mjs scripts/chat-consent-boundary.test.mjs scripts/chat-consent-guard.test.mjs scripts/chatbot-page-client-session.test.mjs scripts/chatbot-widget-session.test.mjs scripts/chat-session-identifier-contract.test.mjs scripts/chat-session-ownership.test.mjs scripts/chat-session-deletion.test.mjs scripts/privacy-retention-deletion-suite.test.mjs scripts/search-text.test.mjs
```

**91/91 Node tests pass.** Có 8 test mới tại `public-data-trust.test.mjs`: category conflict/mutation-free input, malformed/missing guide, missing/zero rating, placeholder/optimizer, nearby facts và SSR thực source `/food`, `/emergency`. SSR xác nhận hai record Đua Bò không render như quán; SOS chỉ còn tel 113/114/115 và trạng thái địa phương đang đối chiếu; các entry/export không còn số địa phương đang tranh chấp. Đây không phải browser hoặc field usability proof.

Test SOS cũ bắt buộc string “Xác minh 100%” đã được sửa theo hành vi trung thực mới. Các tests metadata/AI SOS cũ còn pass **chỉ chứng minh code/format của contract cũ**, không xác nhận tính đúng/độ mới của số điện thoại hay toàn hệ thống. Stock-fallback suite cũ tự có 5 assertions, Node tính là một script test; không cộng thành số usability.

### Các kiểm tra khác

- Lint **37 file TS/TSX thay đổi hoặc mới** của toàn bộ đợt tích lũy UI/build/consent/data trust: **0 errors / 132 warnings**, exit 0. Còn unused/img/exhaustive-deps và một số imports không dùng sau khi bỏ block. Không tuyên bố lint sạch warning.
- `node node_modules/next/dist/bin/next build`: Turbopack **181/181 pass**, TypeScript pass; còn parent bun.lock và middleware convention warnings. Gọi trực tiếp để không chạy prebuild ghi generated canonical artifact.
- `git diff --check` pass; chỉ có thông báo line endings. Diff đối với `data/`, `frontend/src/data/`, `supabase/` rỗng.
- Không chạy toàn bộ `npm test`, không DB/provider live, không call/SMS khẩn cấp hoặc export PDF thật. Boundary suite mới được đăng ký trong npm test; lock/dependencies không đổi.
- Browser tool đã chặn quyền quan sát URL local ở lượt trước; không thử lại/bypass. Chỉ có browser evidence mobile/desktop của audit trước, chưa có quan sát UI mới cho các thay đổi lần này.

## Owner handoff và giới hạn còn lại

1. **G2/data owner:** đối chiếu từng local contact: số chính/phụ, đơn vị/địa chỉ/phạm vi tiếp nhận hiện hành, deep source/capture, người duyệt, ngày kiểm/expiry. Không bật lại CTA chỉ từ homepage + nhãn VERIFIED cũ. Nguồn hành chính/2026 integration phải được owner chốt; không tự sửa địa giới trong task này.
2. **Category governance:** sửa các bản ghi mâu thuẫn tại nguồn đã duyệt theo workflow riêng; blacklist subtype UI là containment cho trường hợp đã thấy, chưa chứng minh toàn bộ food/stay taxonomy đúng. Stay service type có thể là dữ liệu dịch vụ bổ sung; không tự sửa category của các record cafe/homestay.
3. **AI/offline SOS:** generator/intent router/constants/offline vẫn có local numbers/claims cũ; không đổi AI routing/dataset ngoài scope UI. Không nghiệm thu toàn bộ SOS readiness cho tới khi nguồn được duyệt và cùng metadata được dùng trên các boundary đó.
4. **Narrative/ảnh/thông số còn lại:** helper golden hours, mô tả văn hóa, weather/advisory, amenities có sẵn trong dataset và image provenance của ảnh cung cấp cần review riêng. Bỏ fallback không chứng minh mọi ảnh đang có đúng địa điểm/được cấp phép. Không thay nội dung nghiệp vụ bằng dữ liệu tự tạo.
5. **Acceptance:** cần browser/staging trên ít nhất hai viewport cho bản mới, permission/network failure và PDF layout; user testing trên điện thoại thật. Build/SSR pass không đủ nâng production claim.

**AI:** đề xuất Sol · xhigh; thực dùng Codex GPT-6 (effort không công bố). Antigravity Gemini 3.8 Flash Low, `agy-af913405` completed / Linear `CRT-29` Done; Codex kiểm findings. Bác bỏ phần worker nói “không có reviewer” vì JSON thực có `verified_by`; chỉ nhận kết luận thiếu expiry/deep evidence và source mismatch.

**Next:** `UX-FOLLOWUP-DATA-TRUST-G2` (owner evidence, Astra · xhigh khi nguồn xung đột), song song phần UI được phép tiếp là `UX-FOLLOWUP-COMPONENTS` (Sol · medium; không tự đóng G2/G4). Commit local theo yêu cầu người dùng; chưa push/deploy.
