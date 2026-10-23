# Đánh giá cơ chế AI trợ lý du lịch Tri Tôn — 2026-10-23

- Task: AI-MECHANISM-AUDIT-20261023 · Luồng A · đánh giá, chưa triển khai remediation.
- Source baseline: `447b805`, `main`; working tree sạch trước đánh giá.
- AI route đề xuất: Sol · xhigh cho AI integrity/privacy; quyết định nguồn G1/G2 vẫn thuộc owner. Thực dùng: Codex GPT-6, effort không được host công bố. Review phụ theo [antigravity-delegation](C:/Users/Admin/.codex/skills/antigravity-delegation/SKILL.md): job `agy-1046b995`, Gemini 3.8 Flash (High), hủy sau khoảng 9,5 phút không có kết quả dùng được và log có lỗi đọc file; Linear `CRT-32` Canceled. Không sử dụng kết luận worker; evidence dưới đây do Codex tự đối chiếu.
- Phạm vi evidence: đọc source/migration/decision và chạy fixture cục bộ. Không dùng kết quả này để xác nhận provider, database, hotline hoặc production hiện hành.

## A. Kết luận

**Đã có khung trợ lý hỏi đáp và trình bày lịch trình; chưa đủ evidence để tin cậy như người lập chuyến đi hoặc kênh cứu hộ.** Điểm yếu chính là quản trị sự thật và sự khác biệt giữa các đường trả lời, chưa phải thiếu model mạnh.

Source triển khai SSE, failover tuần tự, lọc hai cờ verified cho POI, consent/ownership, giới hạn query, rate limit và một số kiểm tra output. Những lớp này đáng giữ, nhưng không chứng minh nội dung đúng. Manifest hiện có **1 POI verified**; không thể lấy độ phong phú của prompt, DB hoặc tour mẫu thay cho phạm vi canonical.

Khả năng đã có: hỏi đáp tiếng Việt theo từ khóa, gợi ý tiếp, card địa điểm mở Maps/chi tiết, chọn tour mẫu, rule SOS và fallback khi cloud lỗi. Khả năng chưa được chứng minh: hiểu tiếng Việt toàn diện, nhớ chính xác ràng buộc, xác nhận tình trạng hiện tại, lịch trình khả thi cho từng nhóm khách, nguồn cho từng claim, vận hành khi mất kết nối tới chính website.

## B. Luồng thực tế

```text
ChatbotWidget / ChatbotPageClient (/chat và /chatbot)
  ├─ phát hiện từ khóa lịch trình ở client
  │    → GET /api/v1/chat/itinerary?slug=...
  │    → đọc data/lichtrinh.json, enrich POI DB; DB preset là fallback
  └─ câu hỏi thường → POST /api/v1/chat/stream
       → validate query → consent → ownership
       → injection/poison rules
       → buildUnifiedRagContext (canonical artifact + các JSON phụ + weather)
       → history + scope check → ghép prompt
       → streamAIResponse
            ├─ regex SOS → danh bạ hardcode
            ├─ regex realtime → Gemini có Search; có nhánh bỏ Search
            └─ Groq → Gemini → OpenRouter → localExpertRag
       → token đã gửi → kiểm output/citation → done → persistence có consent
       → client hiển thị token/card/gợi ý

Client gặp lỗi stream → POST /api/v1/chat/query
  → pipeline khác: embedding + golden + token/vector/KB/nearby DB
  → route/cost + provider chung → validator/citation → JSON
```

Điểm vào: [client](../../frontend/src/components/ChatbotPageClient.tsx#L193), [stream](../../frontend/src/app/api/v1/chat/stream/route.ts#L141), [query](../../frontend/src/app/api/v1/chat/query/route.ts#L315), [orchestrator](../../frontend/src/lib/aiProvider.ts#L73).

| Boundary | Hành vi source thực tế |
|---|---|
| Session/context | Chỉ granted được gửi/tải/lưu history. Stream dùng tối đa 5 entry client, mỗi entry đưa vào prompt tối đa 300 ký tự; save tối đa 10 entry. Query tải DB, sanitizer tối đa 10 entry, save helper tối đa 20. Đây là entry/message, không phải 5 cặp hội thoại. Chưa có trip state có cấu trúc. |
| Retrieval | Stream dùng `places.canonical.json`; query dùng Supabase `places`, `knowledge_base`, `golden_answers`, video. Các tập này không tự tương đương. Transport/festival/tour JSON và câu trả lời hardcode là nguồn bổ sung ngoài manifest POI. |
| Quyền/tool | Chat route ưu tiên server client service role; query có anon fallback. Model chỉ được gửi prompt và Search tool của Gemini, chưa thấy tool gọi DML/booking. Các write chat là history/log do server thực hiện, không phải model tự được cấp DB tool. Chưa kiểm quyền DB live. |
| Provider/model | Config ưu tiên Groq `llama-3.3-70b-versatile`, Gemini `gemini-flash-lite-latest`, OpenRouter `google/gemma-2-27b-it`, có vòng model/key phụ. Đây là giá trị trong source, không xác nhận model còn khả dụng hoặc miễn phí. |
| Timeout/retry | Groq có TTFT bound mặc định 2500 ms; hết timer sau token đầu. Gemini secondary và OpenRouter stream chưa áp bound 6000/5000 ms đã ghi trong Decision Record; thiếu deadline/idle timeout xuyên suốt và truyền client abort. Realtime có timer riêng đến chunk đầu, có thể lặp key/model. |
| Cache | Weather cache trong RAM 15 phút, trả cache cũ khi fetch lỗi; query itinerary enrich cache 5 phút. Semantic answer cache có module nhưng không tìm thấy call site trong luồng chat; không tính là cache đang tiết kiệm quota. |
| Runtime | `vercel.json` build Next.js; hai chat route không gọi Python. `BACKEND_API_URL` trong query chưa được sử dụng. Không có evidence mới về Python production runtime. |

## C. Findings và bằng chứng

| ID / mức | Vấn đề, tác động và evidence |
|---|---|
| F01 **P0** | **Rule “chống tri thức độc” phủ nhận sự cố hiện tại bằng câu trả lời cố định.** Truy vấn fixture “Chùa Xà Tón bị cháy hôm nay à?” sinh kết luận “sai sự thật… vẫn hoạt động… bình thường”, không tra nguồn mới; route chạy rule này trước SOS/provider. Không có bằng chứng sự cố thật trong audit; vấn đề là code không thể biết để phủ nhận. [rule](../../frontend/src/lib/chatPoisonedKnowledgeGuard.ts#L66), [thứ tự stream](../../frontend/src/app/api/v1/chat/stream/route.ts#L261). |
| F02 **P0** | **AI tiếp tục công bố local SOS đang tranh chấp.** `CANONICAL_VERIFIED_SOS_CONTACTS` hardcode contact địa phương, nguồn cấp homepage, không có expiry; nhãn VERIFIED và kiểm đúng định dạng không chứng minh số còn đúng. UI containment trước đã ghi AI/offline SOS còn mở. SOS được nhận diện trong provider sau retrieval/history; bản không dấu “toi bi ran can” không vào SOS, trong khi “Tìm bệnh viện để tham quan” lại vào SOS. [contacts](../../frontend/src/lib/sosPayloadValidator.ts#L48), [intent](../../frontend/src/lib/ai/intentRouter.ts#L25), [audit hiện hành](CURRENT_STATE_AUDIT.md#quan-sát-bổ-sung-2026-10-23--data-trust-ui-containment). |
| F03 **P1** | **Citation gate kiểm link, chưa kiểm bằng chứng cho claim.** Enrichment tự thêm Maps search/TikTok hashtag; allowlist chấp nhận cả `google.com`; coverage đếm link/thực thể, strict mặc định false. Fixture giá vé bịa “999000 đồng” và giờ “24/7” qua gate nhờ enrichment. Các số này chỉ là fixture, không phải thông tin địa điểm. [enrichment](../../frontend/src/lib/chatCitationCoverageGate.ts#L331), [gate](../../frontend/src/lib/chatCitationCoverageGate.ts#L365). |
| F04 **P1** | **Stream đã hiển thị nội dung trước hậu kiểm và không sửa được kết quả.** Route không thay câu trả lời khi citation lỗi `INVALID_CITATION_DOMAIN`; client ưu tiên `accumulatedText` hơn `done.full_text`. Actual route fixture trả token và done vẫn giữ link không hợp lệ. Schema validation cũng chưa tương đương kiểm factual correctness. [route](../../frontend/src/app/api/v1/chat/stream/route.ts#L347), [gate](../../frontend/src/app/api/v1/chat/stream/route.ts#L395), [client](../../frontend/src/components/ChatbotPageClient.tsx#L366), [widget](../../frontend/src/components/ChatbotWidget.tsx#L384). |
| F05 **P1** | **Phạm vi trust chưa hội tụ.** Hai cờ verified không kiểm membership/review/version/expiry của manifest; ingest nhận fixture VERIFIED đã expired và inactive. Query nhận hai POI fixture chỉ có cờ DB, ngoài canonical. KB/golden đưa thẳng vào prompt mà không giữ provenance/verification contract tương đương; JSON phụ được gắn nhãn “đã xác minh”. Empty retrieval bị thay bằng landmark, làm mất tín hiệu “không có dữ liệu”. [ingest](../../frontend/src/lib/ai/ragEngine.ts#L55), [fallback](../../frontend/src/lib/ai/ragEngine.ts#L451), [DB/KB/golden](../../frontend/src/app/api/v1/chat/query/route.ts#L477), [guard](../../frontend/src/lib/placeVerificationGuard.ts#L100). |
| F06 **P1** | **AI tự điền dữ liệu thiếu.** Stream hỏi quán gà đốt trả card Chùa Xà Tón, thêm rating 4.8, đổi `source_url` thành link Maps search. Query dùng “Miễn phí/Cả ngày” khi thiếu giá/giờ. Fixture actual query xác nhận cả hai default. [RAG](../../frontend/src/lib/ai/ragEngine.ts#L469), [query](../../frontend/src/app/api/v1/chat/query/route.ts#L668). |
| F07 **P1** | **Realtime có thể âm thầm trở thành câu trả lời không Search.** Gemini gặp HTTP 400/404 khi bật Search thì bỏ tool rồi retry; không đánh dấu mất grounding, cũng không chuyển grounding metadata về caller. Fixture xác nhận request thứ hai không có Search nhưng kết thúc thành công. Các câu “có mở không” mặc định về static route; weather không chứng minh giờ mở cửa. [client](../../frontend/src/lib/ai/geminiClient.ts#L43), [parser](../../frontend/src/lib/ai/geminiClient.ts#L109), [intent](../../frontend/src/lib/ai/intentRouter.ts#L32). |
| F08 **P1** | **Lịch trình chưa thực thi ràng buộc chuyến đi.** Client chọn slug theo từ khóa rồi return, chỉ gửi slug, có thể bỏ ngân sách/giờ xuất phát/trẻ nhỏ/không leo núi. Query select POI không lấy tọa độ, sau đó dùng chung tọa độ mặc định: fixture hai POI cho tổng 0 km. Route engine dùng Haversine × hệ số và tốc độ cố định, không phải đường đi thực; budget dùng hằng số, `poisCount` không được dùng. [client](../../frontend/src/components/ChatbotPageClient.tsx#L212), [select](../../frontend/src/lib/chatTokenSearchHelper.ts#L103), [route/cost](../../frontend/src/app/api/v1/chat/query/route.ts#L653), [engine](../../frontend/src/lib/routeEngine.ts#L31), [cost](../../frontend/src/lib/costCalculator.ts#L21). |
| F09 **P1** | **Fallback có thể treo hoặc kết thúc bằng nội dung dở dang.** Sau token đầu không còn idle bound; secondary không được gắn timer, OpenRouter được gọi không có abort signal. Request abort từ UI chưa truyền vào orchestrator. Fixture stream dừng sau token đầu vẫn pending vượt timeout TTFT; khi lỗi giữa stream, helper có nhánh phát done cho phần đã có. [helper](../../frontend/src/lib/chatGroqTimeoutHelper.ts#L123), [secondary](../../frontend/src/lib/chatGroqTimeoutHelper.ts#L217), [OpenRouter](../../frontend/src/lib/aiProvider.ts#L201). |
| F10 **P1** | **Ownership lookup lỗi có thể cấp token cho phiên đã tồn tại.** Code không kiểm `error` của `.maybeSingle()`: `{data:null,error:...}` bị coi là session mới. Probe xác nhận `isOwner:true` và cấp token; cần người biết UUID và lookup lỗi, chưa chứng minh đã khai thác production. Hệ quả tiềm năng: token được cấp lúc DB lỗi có thể dùng lại khi DB phục hồi. [ownership](../../frontend/src/lib/chatSessionOwnership.ts#L171). |
| F11 **P1** | **Lịch sử không đáng tin được ghép vào system prompt.** Client history được ưu tiên; sanitizer lọc vài regex tri thức, không phải boundary tin cậy cho mọi instruction. Probe giữ nguyên một instruction giả trong assistant turn; chưa chạy model để chứng minh model làm theo. KB/few-shot cũng có đường mang instruction/nội dung không duyệt. Không thấy model có DB mutation tool, nên không suy ra prompt injection tự ghi được DB. [history](../../frontend/src/lib/chatPoisonedKnowledgeGuard.ts#L163), [prompt](../../frontend/src/app/api/v1/chat/stream/route.ts#L335). |
| F12 **P2** | **Tốn request và khó bảo trì.** Pre-ping khi gõ là một completion request thật, chưa có số đo chứng minh giảm TTFT; ping dùng general limit 90/phút, chat 20/phút. Hai pipeline retrieval/prompt/output khác nhau; embedding có hai implementation, non-stream provider helpers chưa có call site, `CACHED_HOT` chưa có nhánh trả về. CMS ghi `custom_knowledge_base` nhưng query đọc `knowledge_base`: chưa thấy nối trong luồng hiện tại. [ping](../../frontend/src/app/api/v1/chat/ping/route.ts#L14), [middleware](../../frontend/src/middleware.ts#L67), [facade](../../frontend/src/lib/aiProvider.ts#L16), [CMS](../../frontend/src/app/api/v1/admin/knowledge-base/route.ts#L149). |
| F13 **P2** | **Telemetry chưa đủ dùng để tối ưu.** Stream dùng `void supabase.from(...).insert(...)` mà không consume thenable; probe với SDK thật và fetch giả ghi nhận 0 fetch, control có await ghi nhận 1. Metrics Groq đọc nhãn `groq`, trong khi usage ghi nhãn key; dashboard hardcode uptime “100% Operational”. Chưa thấy đo token/cost/TTFT đầy đủ ở hai client stream. [log](../../frontend/src/app/api/v1/chat/stream/route.ts#L89), [metrics](../../frontend/src/lib/ai/config.ts#L191), [dashboard](../../frontend/src/app/api/v1/admin/ai-metrics/route.ts#L70). |

Không tạo thêm P3 thẩm mỹ trong audit cơ chế AI; sửa P0/P1 có tác động lớn hơn đổi giọng văn/icon.

### Khả năng hỗ trợ du khách còn thiếu

- **Tiếng Việt/địa phương:** normalize không dấu và alias trước intent/search; không dựa vào regex có dấu và ID cũ `PL...` khi canonical dùng slug. Chưa có evidence đánh giá Khmer/Anh, không coi đa ngôn ngữ là bắt buộc MVP.
- **Hỏi lại và nhớ:** trạng thái chuyến đi có cấu trúc cho ngày/giờ, xuất phát, ngân sách, nhóm khách, phương tiện, giới hạn vận động, điểm đã chọn/đã loại. Hiện tại chủ yếu là văn bản history; denied/unset không giữ ngữ cảnh gửi lên theo policy hiện hành. RAM context tối thiểu là đề xuất cần đối chiếu G3 trước áp dụng.
- **Khả thi:** kiểm giờ mở cửa, thời lượng thăm, di chuyển, nghỉ, số người, đường lên núi và ràng buộc tiếp cận; thiếu dữ liệu phải hỏi lại hoặc đánh dấu chưa tính được. Dị ứng/chế độ ăn cần xử lý như ràng buộc, không suy an toàn từ tên món.
- **Hành động:** đã có mở Maps/detail và itinerary/PDF; nên trả action có ID thật và provenance, cho phép “bỏ điểm này”, “đổi giờ”, “lưu kế hoạch”. Chưa cần booking/payment tool cho MVP; không gợi ý “đặt bàn” như đã đặt được.
- **Mất mạng:** localExpertRag là code server. Cloud provider lỗi khác với điện thoại không kết nối được website; không được gọi đó là bảo đảm offline trên thiết bị.

## D. Giữ, bỏ/gộp, sửa, thêm, hoãn

| Quyết định | Thành phần |
|---|---|
| GIỮ | Next.js, canonical artifact, bounded token search, rate limit, consent/ownership contract, SSE, sequential failover theo Decision Record. |
| BỎ/GỘP | Cân nhắc tắt pre-ping đến khi có phép đo; gộp retrieval/prompt/output giữa query và stream; thu gọn helper không được dùng sau khi kiểm consumer; bỏ claim “100%”, không coi Maps/TikTok search là nguồn xác minh. |
| SỬA | SOS/rule phủ nhận sự cố, provenance, missing data, realtime downgrade, output lifecycle, ownership lỗi DB và telemetry. |
| THÊM | Trip state nhỏ, hỏi lại có mục đích, kiểm ràng buộc bằng code, source/date cho claim, bộ evaluation theo tác vụ và phép đo tối thiểu. |
| HOÃN | Multi-agent runtime, hedging/racing, thêm provider/model, cross-encoder, tăng vector stack, semantic answer cache cá nhân hóa, booking/payment và mở rộng ngôn ngữ trước khi luồng cốt lõi đạt tiêu chí. |

## E. Tối đa 5 nhóm sửa, theo thứ tự

| Nhóm | Phạm vi/phụ thuộc | Nghiệm thu đề xuất |
|---|---|---|
| 1. An toàn và quyền riêng tư | F01/F02/F10/F11. Cần owner nguồn SOS/G1/G2; giữ policy G3. | Không tự phủ nhận tin sự cố; SOS có/không dấu vào fast path trước retrieval/provider; contact tranh chấp không được nâng thành verified; lookup DB lỗi không cấp token mới và không có read/write history trái quyền; history/retrieved text không thành system instruction. |
| 2. Nguồn sự thật | F03/F05/F06/F07. Cần review/version/expiry contract cho POI và nguồn phụ; không tự sửa canonical. | POI ngoài authority hoặc hết hạn bị từ chối; không có giá/giờ/rating thì giữ unknown; zero relevant result được giữ thật; claim mới có nguồn cụ thể và thời điểm; Search lỗi phải nói chưa xác nhận. |
| 3. Một đường trả lời | F04/F09 và phần duplicate F12; dựa trên contract nhóm 2. | Query/SSE dùng cùng retrieval/validation; invalid output không được giữ ở UI; `done` thay được draft; lỗi trước/sau token và client abort có kết quả rõ; có deadline tổng và idle timeout. |
| 4. Lịch trình đủ dùng | F08 + trip state; phụ thuộc dữ liệu nhóm 2 và response contract nhóm 3. | Ca “1 ngày, trẻ nhỏ, không leo núi, xuất phát 10h, ngân sách giới hạn” không bị thay bằng preset không phù hợp; sửa một ràng buộc giữ các ràng buộc còn lại; thiếu tọa độ không tính 0 km; không đủ thời gian thì báo không khả thi/hỏi lại. |
| 5. Chi phí, tốc độ, evaluation | F12/F13 sau khi biết output có ích. | Đo provider calls, token usage nếu API trả, TTFT, tổng thời gian, retry/fallback, retrieval relevance và claim-source coverage; so cùng tập ca trước/sau. Log tuân consent, không thu thêm nội dung/vị trí nhạy cảm để đo. Chỉ giữ pre-ping/cache/model phụ nếu số đo chứng minh lợi ích. |

Đây là 5 nhóm đề xuất, chưa tự mở task implementation hoặc đóng gate. Không đặt mục tiêu latency/cost cụ thể khi chưa có baseline.

## F. Kiến trúc mục tiêu tối giản

```text
UI + trip state tối thiểu
 → shared chat service (JSON/SSE chỉ khác transport)
 → validate/consent/ownership + SOS fast path
 → intent và ràng buộc có cấu trúc
 → một retriever có authority/provenance/freshness
 → tính lịch trình bằng code; thiếu dữ liệu thì hỏi lại
 → LLM diễn đạt từ facts; một primary + fallback có budget chung
 → kiểm claim/source + typed actions + final thay được draft
 → telemetry tối thiểu, tôn trọng consent
```

Tận dụng Supabase/pgvector hiện có khi đo thấy cần; với phạm vi canonical nhỏ, lookup/alias/filter bằng code là baseline đủ đơn giản. Sắp xếp lịch, kiểm giờ/ngân sách và validation không cần thêm LLM call. Cân nhắc cache facts công khai theo canonical version/locale/thời điểm; không bật answer cache giữa người dùng khi chưa xử lý context, consent, location và freshness. Model mạnh hơn chỉ xem xét sau evaluation, không thay thế dữ liệu hoặc enforcement.

## G. Kiểm chứng và giới hạn

Chạy tại `frontend`, không gọi provider/DB live:

```powershell
node --test --test-reporter=tap --test-concurrency=1 scripts/canonical-rag-ingest.test.mjs scripts/chatbot-provider-failure-suite.test.mjs scripts/chat-citation-coverage-gate.test.mjs scripts/chat-adversarial-prompt-injection.test.mjs scripts/chat-poisoned-knowledge.test.mjs scripts/chat-embedding-single-call.test.mjs scripts/chat-consent-boundary.test.mjs scripts/chat-session-ownership.test.mjs scripts/chat-token-search-bounded.test.mjs
```

**67/67 tests pass.** Nhiều test là helper/regex/static assertions hoặc mô phỏng result, không phải end-to-end với model. Consent suite có actual route với side-effect recorder, nhưng không chứng minh mọi nhánh factual/stream/provider.

Probe bổ sung chạy in-memory bằng TypeScript transpile/loader; fetch/provider/database được thay bằng fixture, không ghi fixture vào dữ liệu dự án:

- Citation không có evidence vẫn passed/enriched; retrieval quán ăn trả canonical chùa với rating tự điền.
- Expired/inactive VERIFIED fixture vẫn được ingest; SOS không dấu bị bỏ sót, truy vấn không khẩn có thể vào SOS; rule phủ nhận sự cố không tra nguồn.
- Actual stream route phát và giữ câu có citation domain không hợp lệ.
- Gemini bỏ Search sau 400, trả done thành công và không xuất grounding metadata.
- DB ownership trả `{data:null,error}` vẫn được cấp token; không in token/secret.
- Stream dừng sau token đầu vẫn pending vượt TTFT timeout; SDK lazy log không gọi fetch nếu không consume thenable.
- Actual query route nhận fixture ngoài canonical, thêm “Miễn phí/Cả ngày”, tính 0 km; recorder không ghi nhận mutation.

Các probe là evidence tái hiện cục bộ, chưa được lưu thành regression suite vì phạm vi chỉ đánh giá. Chưa thực hiện browser/mobile mới, inference thật, benchmark chất lượng model, user study, gọi hotline, replay DB hoặc xác nhận cấu hình production. Không đo và không suy đoán chi phí/quota/TTFT thực tế; không nâng VERIFIED/release readiness.

Thay đổi của lượt này: chỉ thêm báo cáo này; không sửa code, dữ liệu, cấu hình hoặc schema.
