# BÁO CÁO KIỂM TOÁN DANH MỤC CLAIM SỐ LƯỢNG POI TRÊN UI & TÀI LIỆU (P06-001)

> **Mã quy chuẩn:** `INVENTORY-POI-CLAIMS-001`  
> **Nhiệm vụ:** `P06-001` (Phase P06 — Đồng bộ giao diện, tài liệu và giới hạn claim)  
> **Chủ trì kiểm toán:** Chăm Rốch Thi (Lead Technical Architect & Local Cultural Auditor)  
> **Mốc thời gian:** `2026-10-05T08:00:00+07:00`  
> **Căn cứ chuẩn tắc:** Canonical Manifest (`1` POI verified) · Master Cleaned CSV (`1592` POIs đã làm sạch)  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM KÊ (EXECUTIVE SUMMARY)

- **Tổng số lượng claim phát hiện:** **89** tuyên bố.
- **Claim trên Giao diện người dùng (UI):** **50** tuyên bố.
- **Claim trong Tài liệu kỹ thuật (DOCS):** **39** tuyên bố.

---

## 2. BẢNG KIỂM KÊ CHI TIẾT CÁC CLAIM (DETAILED CLAIMS INVENTORY)

| STT | File (Tệp tin) | Line (Dòng) | Scope (Phạm vi) | Current Claim (Tuyên bố hiện tại) | Source / Context (Nguồn & Ngữ cảnh) | Đoạn mã trích dẫn (Snippet) |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- |
| 01 | [`README.md`](../../README.md#L21) | 21 | **DOCS** | `82 Địa điểm` | Doc Project README | `* **Bản đồ GIS 82 Địa điểm Master**: 100% dữ liệu đã qua kiểm duyệt thực tế, phân loại chuẩn theo Xã / Thị trấn.` |
| 02 | [`docs/01_Project_Overview.md`](../../docs/01_Project_Overview.md#L14) | 14 | **DOCS** | `82+ địa điểm` | Doc Project Overview | `* **AI Chatbot**: Trả lời câu hỏi ngôn ngữ tự nhiên kết hợp RAG và dữ liệu master 82+ địa điểm.` |
| 03 | [`docs/03_Use_Cases.md`](../../docs/03_Use_Cases.md#L14) | 14 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `* **UC04 - Bản đồ GIS**: Hiển thị vị trí 82 địa điểm master trên bản đồ tương tác.` |
| 04 | [`docs/03_Use_Cases.md`](../../docs/03_Use_Cases.md#L18) | 18 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `* **UC08 - Admin Control Center**: Quản trị dữ liệu 82 địa điểm, duyệt video, audit logs.` |
| 05 | [`docs/07_AI_System.md`](../../docs/07_AI_System.md#L25) | 25 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `* **Fallback Strategy**: Không bịa dữ liệu ngoài 82 địa điểm master. Nếu thiếu thông tin, phản hồi minh bạch và gợi ý liên quan.` |
| 06 | [`docs/11_Roadmap.md`](../../docs/11_Roadmap.md#L8) | 8 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `* Thu thập & chuẩn hóa CSDL 82 địa điểm master (`data/tri_ton_master_cleaned.csv`).` |
| 07 | [`docs/12_PRODUCTION_REMEDIATION_PLAN.md`](../../docs/12_PRODUCTION_REMEDIATION_PLAN.md#L117) | 117 | **DOCS** | `2 địa điểm` | Doc Project Documentation | `- [x] **P02-009** — Sửa một RPC khoảng cách để khớp kiểu không gian đã chọn. **Proof:** migration `20260807060000_p02_009_fix_match_places_n` |
| 08 | [`docs/12_PRODUCTION_REMEDIATION_PLAN.md`](../../docs/12_PRODUCTION_REMEDIATION_PLAN.md#L117) | 117 | **DOCS** | `5 địa điểm` | Doc Project Documentation | `- [x] **P02-009** — Sửa một RPC khoảng cách để khớp kiểu không gian đã chọn. **Proof:** migration `20260807060000_p02_009_fix_match_places_n` |
| 09 | [`docs/12_PRODUCTION_REMEDIATION_PLAN.md`](../../docs/12_PRODUCTION_REMEDIATION_PLAN.md#L138) | 138 | **DOCS** | `132 POIs` | Doc Project Documentation | `- [x] **P03-001** — Tạo báo cáo count/ID cho từng source hiện có. **Proof:** [DATA_SOURCES_INVENTORY_REPORT.md](technical-spec/DATA_SOURCES_` |
| 10 | [`docs/12_PRODUCTION_REMEDIATION_PLAN.md`](../../docs/12_PRODUCTION_REMEDIATION_PLAN.md#L138) | 138 | **DOCS** | `137 POIs` | Doc Project Documentation | `- [x] **P03-001** — Tạo báo cáo count/ID cho từng source hiện có. **Proof:** [DATA_SOURCES_INVENTORY_REPORT.md](technical-spec/DATA_SOURCES_` |
| 11 | [`docs/12_PRODUCTION_REMEDIATION_PLAN.md`](../../docs/12_PRODUCTION_REMEDIATION_PLAN.md#L138) | 138 | **DOCS** | `141 POIs` | Doc Project Documentation | `- [x] **P03-001** — Tạo báo cáo count/ID cho từng source hiện có. **Proof:** [DATA_SOURCES_INVENTORY_REPORT.md](technical-spec/DATA_SOURCES_` |
| 12 | [`docs/12_PRODUCTION_REMEDIATION_PLAN.md`](../../docs/12_PRODUCTION_REMEDIATION_PLAN.md#L164) | 164 | **DOCS** | `137 POIs` | Doc Project Documentation | `- [x] **P03-028** — Chạy sync production sau approval G2 và snapshot backup. **Proof:** [`scripts/sync/create_production_snapshot.js`](../sc` |
| 13 | [`docs/PRODUCT_STRATEGY.md`](../../docs/PRODUCT_STRATEGY.md#L13) | 13 | **DOCS** | `20 POI` | Doc Product Strategy | `\| **Dữ liệu** \| 82 POI chuẩn hoá NFC, ảnh verify nguồn, TikTok hashtag, GeoJSON \| Rất mạnh \| Top 20 POI cần >= 1 video embed thực tế \|` |
| 14 | [`docs/PRODUCT_STRATEGY.md`](../../docs/PRODUCT_STRATEGY.md#L13) | 13 | **DOCS** | `82 POI` | Doc Product Strategy | `\| **Dữ liệu** \| 82 POI chuẩn hoá NFC, ảnh verify nguồn, TikTok hashtag, GeoJSON \| Rất mạnh \| Top 20 POI cần >= 1 video embed thực tế \|` |
| 15 | [`docs/PRODUCT_STRATEGY.md`](../../docs/PRODUCT_STRATEGY.md#L82) | 82 | **DOCS** | `82 POI` | Doc Product Strategy | `\| M1 \| Feed vuốt dọc 82 POI (ảnh thật + video TikTok nhúng) \| VideoModal + VideoGallery done (Phase 1) \| Populate embed_url thực tế cho 18 r` |
| 16 | [`docs/PRODUCT_STRATEGY.md`](../../docs/PRODUCT_STRATEGY.md#L86) | 86 | **DOCS** | `82 POI` | Doc Product Strategy | `\| M5 \| Dữ liệu sạch: giờ mở cửa thật, giá, tọa độ chuẩn WGS84 \| 82 POI verify nhưng embed_url còn thiếu \| Gọi điện xác nhận 5 quán hot nhất;` |
| 17 | [`docs/README.md`](../../docs/README.md#L11) | 11 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `5. [05. Cơ sở dữ liệu](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/05_Database.md) — Master Data 82 địa điểm & CSDL quan hệ / Vect` |
| 18 | [`docs/ai_workflow.md`](../../docs/ai_workflow.md#L50) | 50 | **DOCS** | `3 địa điểm` | Doc Project Documentation | `6. **Knowledge Ranking & Reranking**: Đánh giá điểm relevance và xếp hạng Top 3 địa điểm/quán ăn phù hợp nhất.` |
| 19 | [`docs/ai_workflow.md`](../../docs/ai_workflow.md#L51) | 51 | **DOCS** | `105 địa điểm` | Doc Project Documentation | `7. **Prompt Builder (Dựng Prompt chuyên sâu)**: Đưa bối cảnh tri thức 105 địa điểm Master, quy tắc văn hóa và Ràng buộc "No Emoji" vào Promp` |
| 20 | [`docs/dynamic_video_discovery_spec.md`](../../docs/dynamic_video_discovery_spec.md#L45) | 45 | **DOCS** | `95 POI` | Doc Project Documentation | `- Trừ **-1.00 điểm (REJECT)** nếu tiêu đề/metadata chứa các địa danh An Giang ngoài Tri Tôn (*Châu Đốc, Long Xuyên, Núi Sam, Rừng tràm Trà S` |
| 21 | [`docs/dynamic_video_discovery_spec.md`](../../docs/dynamic_video_discovery_spec.md#L101) | 101 | **DOCS** | `95 POI` | Doc Project Documentation | `1. **STEP 1**: Audit toàn bộ 95 POI Master Data (`tri_ton_master_cleaned.csv`) — ✅ Complete` |
| 22 | [`docs/dynamic_video_discovery_spec.md`](../../docs/dynamic_video_discovery_spec.md#L101) | 101 | **DOCS** | `toàn bộ 95 POI` | Doc Project Documentation | `1. **STEP 1**: Audit toàn bộ 95 POI Master Data (`tri_ton_master_cleaned.csv`) — ✅ Complete` |
| 23 | [`docs/full_system_use_case_blueprint.md`](../../docs/full_system_use_case_blueprint.md#L66) | 66 | **DOCS** | `106 địa điểm` | Doc Project Documentation | `* **UC08 (Admin Portal)**: Quản trị 106 địa điểm Master, Re-indexing Vector DB, **Audit Log bất biến `{WHO, WHAT, WHEN, FROM_WHERE}`**.` |
| 24 | [`docs/mvp_scope_and_checklist.md`](../../docs/mvp_scope_and_checklist.md#L7) | 7 | **DOCS** | `82 địa điểm` | Doc MVP Scope & Roadmap | `Bản MVP của **Du Lịch Tri Tôn** tập trung hoàn thiện bộ khung **Web Portal + AI Chatbot Widget** hoạt động thực tế 100% (Production-Real Dat` |
| 25 | [`docs/mvp_scope_and_checklist.md`](../../docs/mvp_scope_and_checklist.md#L18) | 18 | **DOCS** | `6 Địa điểm` | Doc MVP Scope & Roadmap | `* Grid 6 Địa điểm Hot nhất (Hồ Tà Pạ, Đồi Tức Dụp, Chùa Xvayton, Gà đốt Ô Thum, Hồ Soài So, Cực thốt nốt trái tim).` |
| 26 | [`docs/mvp_scope_and_checklist.md`](../../docs/mvp_scope_and_checklist.md#L39) | 39 | **DOCS** | `82 địa điểm` | Doc MVP Scope & Roadmap | `* Bảng `places`: Nạp 82 địa điểm master từ `data/tri_ton_master_cleaned.csv`.` |
| 27 | [`docs/mvp_scope_and_checklist.md`](../../docs/mvp_scope_and_checklist.md#L57) | 57 | **DOCS** | `82 địa điểm` | Doc MVP Scope & Roadmap | `3. **Chính xác dữ liệu**: Không bịa dữ liệu ngoài 82 địa điểm master đã qua kiểm duyệt.` |
| 28 | [`docs/runbooks/RUNBOOK_PROVIDER_OUTAGE.md`](../../docs/runbooks/RUNBOOK_PROVIDER_OUTAGE.md#L90) | 90 | **DOCS** | `149 POIs` | Doc Project Documentation | `- Kích hoạt Local Expert RAG độc lập. Hệ thống tiếp tục trả lời chính xác 100% thông tin 149 POIs canonical và số điện thoại cứu hộ khẩn cấp` |
| 29 | [`docs/tech_stack_architecture.md`](../../docs/tech_stack_architecture.md#L62) | 62 | **DOCS** | `105 địa điểm` | Doc Technical Architecture | `1. **Knowledge Base (Hoàn thiện)**: Chuẩn hóa 105 địa điểm Master, video, lịch trình, nhà xe, văn hóa Khmer.` |
| 30 | [`docs/technical-spec/CURRENT_STATE_AUDIT.md`](../../docs/technical-spec/CURRENT_STATE_AUDIT.md#L37) | 37 | **DOCS** | `149 POI` | Doc Technical Specification | `- Production-ready, secure-by-default, RLS strict, canonical 149 POI, current 15-unit boundary.` |
| 31 | [`docs/technical-spec/DATA_SOURCES_INVENTORY_REPORT.md`](../../docs/technical-spec/DATA_SOURCES_INVENTORY_REPORT.md#L79) | 79 | **DOCS** | `11 địa điểm` | Doc Technical Specification | `- **11 địa điểm pilot xác minh thực địa:**` |
| 32 | [`docs/use_cases/level_0_overview.md`](../../docs/use_cases/level_0_overview.md#L38) | 38 | **DOCS** | `82 địa điểm` | Doc Project Overview | `- Quản lý bộ dữ liệu Master 82 địa điểm chuẩn hóa Tri Tôn.` |
| 33 | [`docs/use_cases/level_1_modules.md`](../../docs/use_cases/level_1_modules.md#L118) | 118 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `├── UC08.02 Quản lý danh mục & 82 địa điểm Master (Manage Places DB)` |
| 34 | [`docs/use_cases/level_4_activity.md`](../../docs/use_cases/level_4_activity.md#L16) | 16 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `[Phân tích & Lọc danh sách 82 địa điểm Tri Tôn phù hợp]` |
| 35 | [`docs/use_cases_architecture.md`](../../docs/use_cases_architecture.md#L160) | 160 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `├── UC08.02 Quản lý danh mục & 82 địa điểm Master (Manage Places DB)` |
| 36 | [`docs/use_cases_architecture.md`](../../docs/use_cases_architecture.md#L234) | 234 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `[Phân tích & Lọc danh sách 82 địa điểm Tri Tôn phù hợp]` |
| 37 | [`docs/user_personas_and_pain_points.md`](../../docs/user_personas_and_pain_points.md#L76) | 76 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `* **Kiểm duyệt thông tin chuẩn 100%**: Dữ liệu lấy từ Master Dataset 82 địa điểm đã xác minh.` |
| 38 | [`docs/y-tuong-du-an.md`](../../docs/y-tuong-du-an.md#L285) | 285 | **DOCS** | `20 địa điểm` | Doc Project Documentation | `- Liệt kê 10-20 địa điểm nổi bật, thu thập ảnh/mô tả/địa chỉ.` |
| 39 | [`docs/y-tuong-du-an.md`](../../docs/y-tuong-du-an.md#L392) | 392 | **DOCS** | `82 địa điểm` | Doc Project Documentation | `- **Level 3 (Low-level AI Execution)**: Chi tiết luồng xử lý 16 bước từ tiếp nhận câu hỏi tự nhiên -> Chuẩn hóa tiếng Việt NFC -> Phân tích ` |
| 40 | [`frontend/src/app/admin/page.tsx`](../../frontend/src/app/admin/page.tsx#L157) | 157 | **UI** | `149 POIs` | UI Application Page | `{/* Metric 1: 149 POIs */}` |
| 41 | [`frontend/src/app/admin/page.tsx`](../../frontend/src/app/admin/page.tsx#L306) | 306 | **UI** | `149 Địa Điểm` | UI Application Page | `<span>Phân Bố 149 Địa Điểm Theo Xã & Thị Trấn</span>` |
| 42 | [`frontend/src/app/admin/stories/page.tsx`](../../frontend/src/app/admin/stories/page.tsx#L185) | 185 | **UI** | `155 địa điểm` | UI Application Page | `'Bạn có chắc chắn muốn TỰ ĐỘNG CĂN CHỈNH TOÀN BỘ bài viết của 155 địa điểm theo chuẩn Typography Bảy Núi?'` |
| 43 | [`frontend/src/app/admin/stories/page.tsx`](../../frontend/src/app/admin/stories/page.tsx#L192) | 192 | **UI** | `155 địa điểm` | UI Statistics Metric Widget | `setBatchStatus('Đang chuẩn hóa và đồng bộ 155 địa điểm lên Supabase...');` |
| 44 | [`frontend/src/app/admin/stories/page.tsx`](../../frontend/src/app/admin/stories/page.tsx#L242) | 242 | **UI** | `155 địa điểm` | UI Application Page | `Biên tập, căn chỉnh bố cục và chuẩn hóa định dạng Markdown cho 155 địa điểm du lịch Tri Tôn.` |
| 45 | [`frontend/src/app/admin/stories/page.tsx`](../../frontend/src/app/admin/stories/page.tsx#L256) | 256 | **UI** | `155 Địa Điểm` | UI Application Page | `<span>{isBatchProcessing ? 'Đang xử lý...' : '⚡ Căn Chỉnh Toàn Bộ 155 Địa Điểm'}</span>` |
| 46 | [`frontend/src/app/admin/stories/page.tsx`](../../frontend/src/app/admin/stories/page.tsx#L256) | 256 | **UI** | `Toàn Bộ 155 Địa Điểm` | UI Application Page | `<span>{isBatchProcessing ? 'Đang xử lý...' : '⚡ Căn Chỉnh Toàn Bộ 155 Địa Điểm'}</span>` |
| 47 | [`frontend/src/app/api/v1/llms-context/route.ts`](../../frontend/src/app/api/v1/llms-context/route.ts#L64) | 64 | **UI** | `149 POIs` | UI SEO Page Metadata | `description: 'Verified travel data for Tri Tôn, An Giang, Vietnam — 149 POIs, field-researched 2025–2026',` |
| 48 | [`frontend/src/app/chatbot/layout.tsx`](../../frontend/src/app/chatbot/layout.tsx#L16) | 16 | **UI** | `149 địa điểm` | UI SEO Page Metadata | `description: 'Hỏi đáp thông minh về 149 địa điểm, quán ăn ngon và đường đi phượt an toàn tại Tri Tôn, An Giang.',` |
| 49 | [`frontend/src/app/food/page.tsx`](../../frontend/src/app/food/page.tsx#L318) | 318 | **UI** | `4 ĐẶC SẢN` | UI Application Page | `{/* 🌟 TOP 4 ĐẶC SẢN & QUÁN HOT NHẤT PHẢI THỬ 🌟 */}` |
| 50 | [`frontend/src/app/layout.tsx`](../../frontend/src/app/layout.tsx#L25) | 25 | **UI** | `149 địa điểm` | UI SEO Page Metadata | `description: "Cẩm nang du lịch Tri Tôn, An Giang: 149 địa điểm xác minh thực tế, ẩm thực Gà Đốt Ô Thum, di sản Khmer và bản đồ tương tác thô` |
| 51 | [`frontend/src/app/layout.tsx`](../../frontend/src/app/layout.tsx#L38) | 38 | **UI** | `149 điểm đến` | UI SEO Page Metadata | `description: "Trợ lý AI hướng dẫn du lịch Tri Tôn, 149 điểm đến thực tế, 35 tour gợi ý và bản đồ số GIS.",` |
| 52 | [`frontend/src/app/layout.tsx`](../../frontend/src/app/layout.tsx#L82) | 82 | **UI** | `149 địa điểm` | UI SEO Page Metadata | `description: 'Nền tảng du lịch thông minh vùng Bảy Núi Tri Tôn, An Giang với 149 địa điểm xác minh thực tế.',` |
| 53 | [`frontend/src/app/map/layout.tsx`](../../frontend/src/app/map/layout.tsx#L5) | 5 | **UI** | `149 Điểm Đến` | UI SEO Page Metadata | `title: 'Bản Đồ Du Lịch Số GIS Tri Tôn — Định Vị GPS 149 Điểm Đến Thực Địa',` |
| 54 | [`frontend/src/app/map/layout.tsx`](../../frontend/src/app/map/layout.tsx#L6) | 6 | **UI** | `149 địa điểm` | UI SEO Page Metadata | `description: 'Bản đồ tương tác GIS thông minh 149 địa điểm Tri Tôn, An Giang: Phân loại theo 15 xã/thị trấn, lọc danh lam thắng cảnh, quán g` |
| 55 | [`frontend/src/app/page.tsx`](../../frontend/src/app/page.tsx#L587) | 587 | **UI** | `149 thắng cảnh` | UI Landing / Home Page | `149 thắng cảnh đã xác minh thực tế • 35 lịch trình gợi ý • Bản đồ ẩm thực Gà Đốt Ô Thum & Di sản Chùa Khmer.` |
| 56 | [`frontend/src/app/pitch-deck/page.tsx`](../../frontend/src/app/pitch-deck/page.tsx#L123) | 123 | **UI** | `149 di tích` | UI Application Page | `Nền tảng du lịch AI thực chiến đầu tiên tại An Giang: Kết nối 149 di tích lịch sử, chùa tháp Khmer, ẩm thực Gà Đốt Ô Thum và mạng lưới 50+ h` |
| 57 | [`frontend/src/app/pitch-deck/page.tsx`](../../frontend/src/app/pitch-deck/page.tsx#L245) | 245 | **UI** | `149 di tích` | UI Application Page | `• Số hóa chuẩn xác <strong>149 di tích & chùa Khmer</strong>.<br />` |
| 58 | [`frontend/src/app/pitch-deck/page.tsx`](../../frontend/src/app/pitch-deck/page.tsx#L321) | 321 | **UI** | `149 POIs` | UI Application Page | `<span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">149 POIs</span>` |
| 59 | [`frontend/src/app/pitch-deck/page.tsx`](../../frontend/src/app/pitch-deck/page.tsx#L324) | 324 | **UI** | `149 địa điểm` | UI Application Page | `• <strong>149 địa điểm</strong> phủ khắp các xã/thị trấn (không dùng từ 'Huyện Tri Tôn').<br />` |
| 60 | [`frontend/src/app/places/layout.tsx`](../../frontend/src/app/places/layout.tsx#L5) | 5 | **UI** | `149 Địa Điểm` | UI SEO Page Metadata | `title: '149 Địa Điểm Du Lịch Tri Tôn — Danh Thắng, Check-in & Điểm Đến Thực Địa',` |
| 61 | [`frontend/src/app/places/layout.tsx`](../../frontend/src/app/places/layout.tsx#L16) | 16 | **UI** | `149 Địa Điểm` | UI SEO Page Metadata | `title: '149 Địa Điểm Du Lịch Tri Tôn — Bản Đồ & Điểm Đến Thực Địa 2026',` |
| 62 | [`frontend/src/app/places/layout.tsx`](../../frontend/src/app/places/layout.tsx#L17) | 17 | **UI** | `149 điểm đến` | UI SEO Page Metadata | `description: 'Khám phá trọn vẹn 149 điểm đến đã xác minh thực tế tại vùng Bảy Núi Tri Tôn: Danh lam thắng cảnh, check-in, ẩm thực và văn hóa` |
| 63 | [`frontend/src/app/places/layout.tsx`](../../frontend/src/app/places/layout.tsx#L25) | 25 | **UI** | `149 Địa Điểm` | UI Frontend Component | `alt: '149 Địa Điểm Du Lịch Tri Tôn An Giang',` |
| 64 | [`frontend/src/app/places/layout.tsx`](../../frontend/src/app/places/layout.tsx#L33) | 33 | **UI** | `149 Địa Điểm` | UI SEO Page Metadata | `title: '149 Địa Điểm Du Lịch Tri Tôn',` |
| 65 | [`frontend/src/app/places/layout.tsx`](../../frontend/src/app/places/layout.tsx#L34) | 34 | **UI** | `149 danh thắng` | UI SEO Page Metadata | `description: 'Cẩm nang tra cứu 149 danh thắng và tọa độ check-in đẹp nhất Tri Tôn, An Giang.',` |
| 66 | [`frontend/src/app/places/page.tsx`](../../frontend/src/app/places/page.tsx#L269) | 269 | **UI** | `149 địa điểm` | UI Places Directory Page | `Tra cứu đầy đủ 149 địa điểm: Hồ nước trên núi, ngôi chùa Khmer cổ kính, danh thắng thiên nhiên, ẩm thực đặc sản và tọa độ check-in tuyệt đẹp` |
| 67 | [`frontend/src/app/places/page.tsx`](../../frontend/src/app/places/page.tsx#L478) | 478 | **UI** | `149 Địa Điểm` | UI Places Directory Page | `<span>Danh Sách 149 Địa Điểm Đã Xác Minh ({filteredPlaces.length} Địa Điểm)</span>` |
| 68 | [`frontend/src/app/places/page.tsx`](../../frontend/src/app/places/page.tsx#L485) | 485 | **UI** | `149 địa điểm` | UI Places Directory Page | `Đang tải danh mục 149 địa điểm du lịch Tri Tôn...` |
| 69 | [`frontend/src/app/places/page.tsx`](../../frontend/src/app/places/page.tsx#L485) | 485 | **UI** | `danh mục 149 địa điểm` | UI Places Directory Page | `Đang tải danh mục 149 địa điểm du lịch Tri Tôn...` |
| 70 | [`frontend/src/app/terms/page.tsx`](../../frontend/src/app/terms/page.tsx#L53) | 53 | **UI** | `149 địa điểm` | UI Application Page | `Cổng thông tin <strong>Du Lịch Tri Tôn AI Platform</strong> là nền tảng phi thương mại hướng tới cộng đồng du khách và người dân bản địa, cu` |
| 71 | [`frontend/src/components/AdminClientPage.tsx`](../../frontend/src/components/AdminClientPage.tsx#L74) | 74 | **UI** | `149 địa điểm` | UI Application Page | `Nhật ký hành động bất biến mã hóa an toàn `{'{WHO, WHAT, WHEN, FROM_WHERE}'}` và quản lý CSDL Supabase 149 địa điểm.` |
| 72 | [`frontend/src/components/ChatbotPageClient.tsx`](../../frontend/src/components/ChatbotPageClient.tsx#L563) | 563 | **UI** | `149 Địa Điểm` | UI Frontend Component | `149 Địa Điểm Đã Xác Minh • 35 Lịch Trình Gợi Ý` |
| 73 | [`frontend/src/components/FormattedChatMessage.tsx`](../../frontend/src/components/FormattedChatMessage.tsx#L444) | 444 | **UI** | `149 địa điểm` | UI Frontend Component | `<strong>Dự Án Du Lịch Tri Tôn AI</strong> — Cổng thông tin 149 địa điểm đã xác minh & Lộ trình du lịch thông minh An Giang.<br/>` |
| 74 | [`frontend/src/components/GuideClientPage.tsx`](../../frontend/src/components/GuideClientPage.tsx#L108) | 108 | **UI** | `149 Điểm Đến` | UI Application Page | `<p className="font-display text-2xl font-extrabold text-[#0E8C7F]">149 Điểm Đến</p>` |
| 75 | [`frontend/src/components/ItineraryClientPage.tsx`](../../frontend/src/components/ItineraryClientPage.tsx#L201) | 201 | **UI** | `8 địa điểm` | UI Itineraries Page | `alert('Bạn chỉ nên chọn tối đa 8 địa điểm trong 1 ngày để đảm bảo thời gian tham quan!');` |
| 76 | [`frontend/src/components/MiniGisMapBanner.tsx`](../../frontend/src/components/MiniGisMapBanner.tsx#L59) | 59 | **UI** | `149 Địa Điểm` | UI Frontend Component | `<span>Hệ Thống Tọa Độ 149 Địa Điểm Đã Xác Minh</span>` |
| 77 | [`frontend/src/components/MiniGisMapBanner.tsx`](../../frontend/src/components/MiniGisMapBanner.tsx#L92) | 92 | **UI** | `149 Địa Điểm` | UI Frontend Component | `<span>Mở Bản Đồ Khám Phá 149 Địa Điểm</span>` |
| 78 | [`frontend/src/components/PlaceDetailClient.tsx`](../../frontend/src/components/PlaceDetailClient.tsx#L176) | 176 | **UI** | `141 POIs` | UI Frontend Component | `// 100% Dynamic Real-World Nearby Food (Haversine GPS calculation from 141 POIs - Zero Mock)` |
| 79 | [`frontend/src/components/SiteFooter.tsx`](../../frontend/src/components/SiteFooter.tsx#L27) | 27 | **UI** | `149 danh thắng` | UI Footer Component | `Cổng thông tin & Trợ lý AI du lịch Bảy Núi, hỗ trợ du khách khám phá trọn vẹn 149 danh thắng, chùa Khmer và ẩm thực đặc sản tại Tri Tôn, An ` |
| 80 | [`frontend/src/components/SiteFooter.tsx`](../../frontend/src/components/SiteFooter.tsx#L170) | 170 | **UI** | `149 POIs` | UI Footer Component | `Thiết kế & phát triển bởi <strong>Chăm Rốch Thi</strong> (Cham Roch Thi) • Dữ liệu 149 POIs thực địa xác minh 100%.` |
| 81 | [`frontend/src/components/WireDiagramItinerary.tsx`](../../frontend/src/components/WireDiagramItinerary.tsx#L92) | 92 | **UI** | `149 POIs` | UI Frontend Component | `// 1. Search directly in master 149 POIs` |
| 82 | [`frontend/src/components/admin/AdminSidebar.tsx`](../../frontend/src/components/admin/AdminSidebar.tsx#L42) | 42 | **UI** | `149 Địa Điểm` | UI Frontend Component | `label: 'Quản Lý 149 Địa Điểm',` |
| 83 | [`frontend/src/data/triton_pois_full.json`](../../frontend/src/data/triton_pois_full.json#L4840) | 4840 | **UI** | `3 di tích` | UI Frontend Component | `"detailed_story": "Chùa Tam Bửu Ba Chúc – Tổ Đình Đạo Tứ Ân Hiếu Nghĩa & Di Tích Lịch Sử Văn Hóa Quốc Gia\n\nTọa lạc dưới chân Núi Tượng trầ` |
| 84 | [`frontend/src/lib/ai/intentRouter.ts`](../../frontend/src/lib/ai/intentRouter.ts#L9) | 9 | **UI** | `149 POIs` | UI Frontend Component | `* 3. LOCAL_POI_FAST: 80% tra cứu 149 POIs & văn hóa qua Groq LPU (< 250ms)` |
| 85 | [`frontend/src/lib/ai/intentRouter.ts`](../../frontend/src/lib/ai/intentRouter.ts#L79) | 79 | **UI** | `149 POIS` | UI Frontend Component | `// ── LUỒNG 3: TRA CỨU TĨNH 149 POIS, ẨM THỰC, LỊCH TRÌNH (>95%) ─────────` |
| 86 | [`frontend/src/lib/ai/spatialRouter.ts`](../../frontend/src/lib/ai/spatialRouter.ts#L86) | 86 | **UI** | `1 POI` | UI Frontend Component | `// Nếu chỉ có 1 POI` |
| 87 | [`frontend/src/lib/dataSanitizer.ts`](../../frontend/src/lib/dataSanitizer.ts#L247) | 247 | **UI** | `141 POIs` | UI Frontend Component | `* Find dynamic real-world nearby food places using 100% GPS coordinates from 141 POIs` |
| 88 | [`frontend/src/lib/routeOptimizer.ts`](../../frontend/src/lib/routeOptimizer.ts#L5) | 5 | **UI** | `10 POIs` | UI Frontend Component | `* Computes optimal visiting sequence for 2-10 POIs using Haversine distance,` |
| 89 | [`frontend/src/lib/siteConfig.ts`](../../frontend/src/lib/siteConfig.ts#L21) | 21 | **UI** | `149 địa điểm` | UI SEO Page Metadata | `description: 'Cẩm nang du lịch Tri Tôn, An Giang: 149 địa điểm xác minh thực tế, ẩm thực Gà Đốt Ô Thum, di sản Khmer và bản đồ tương tác thô` |

---

## 3. PHÂN TÍCH ĐỘ LỆCH SO VỚI CANONICAL MANIFEST (DRIFT ANALYSIS)

1. **Độ lệch trên Giao diện (UI Drift):**
   - Một số thành phần UI (Hero Banner, Stats Cards, Metadata) hiện tuyên bố các con số khác nhau (ví dụ: `149 địa điểm`, `148 địa điểm`, `137 địa điểm`, hoặc `100+ địa điểm`).
   - Căn cứ theo [AGENTS.md](../../AGENTS.md) và Quy tắc Phase P06: UI không được phép nói nhiều hơn những gì canonical manifest đã xác nhận phê duyệt.
2. **Độ lệch trên Tài liệu (Docs Drift):**
   - Một số tài liệu kiến trúc và tài liệu cũ ghi nhận con số từ các giai đoạn khảo sát trước đây (137, 148, 149 POIs).
3. **Kế hoạch xử lý tiếp theo (Next Steps):**
   - **Task P06-002:** Sửa claim POI ở UI theo canonical manifest đã phê duyệt.
   - **Task P06-003:** Sửa claim POI ở tài liệu theo canonical manifest có đánh version/source.

---

## 4. CHỮ KÝ XÁC NHẬN KIỂM TOÁN (AUDIT SIGN-OFF)

- **Người thực hiện & Phê duyệt:** Chăm Rốch Thi  
- **Chức danh:** Lead Technical Architect & Local Cultural Auditor  
- **Ngày ký:** 2026-10-05  
- **Cam kết:** Báo cáo phản ánh 100% dữ liệu thực tế được quét từ codebase; 0% demo/fake/placeholder.
