# BÁO CÁO KIỂM TOÁN INVENTORY EMOJI THEO COMPONENT (P06-006)

> **Tiêu chuẩn kiểm toán:** `INVENTORY-EMOJI-001`  
> **Thời điểm xuất bản:** `2026-10-05T01:50:59.893778+00:00`  
> **Chủ trì kiểm toán:** `Chăm Rốch Thi (Lead Technical Architect & Design System Owner)`  
> **Nhiệm vụ:** Task `P06-006` — Tạo inventory emoji theo component (Proof: mỗi occurrence có file/component).  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM KÊ (EXECUTIVE SUMMARY)

- **Tổng số lượt xuất hiện (Occurrences):** **358** lượt.
- **Số lượng emoji độc bản (Unique Emojis):** **90** ký tự emoji riêng biệt.
- **Số lượng component / module liên quan:** **48** components/modules.
- **Phân bổ theo Scope:**
  - **UI Components:** **211** lượt (trọng tâm cần chuẩn hóa sang Lucide Icon).
  - **API & Libs:** **147** lượt (chủ yếu là AI RAG prompts, PDF template, time status).

### Top 10 Components có nhiều Emoji nhất:

| STT | Component / Module | Số lượng Emoji | Phạm vi (Scope) |
| :--- | :--- | :--- | :--- |
| 1 | `LibModule: ai.localExpertRag` | **42** | API / Lib |
| 2 | `ApiRoute: /api/v1/chat/query` | **29** | API / Lib |
| 3 | `AdminItinerariesPage` | **22** | UI Component |
| 4 | `PitchDeckPage` | **22** | UI Component |
| 5 | `ApiRoute: /api/v1/chat/itinerary` | **21** | API / Lib |
| 6 | `GuideClientPage` | **17** | UI Component |
| 7 | `ItineraryPresetPicker` | **17** | UI Component |
| 8 | `AdminFeedbacksPage` | **14** | UI Component |
| 9 | `LibModule: pdfExporter` | **14** | API / Lib |
| 10 | `FormattedChatMessage` | **13** | UI Component |

### Top Gợi Ý Icon Lucide Thay Thế Theo Design System (Chuẩn bị P06-007):

| Icon Lucide | Số lượt ứng cử | Ví dụ Emoji nguồn |
| :--- | :--- | :--- |
| `<Sparkles />` | **157** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<MapPin />` | **54** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Compass />` | **16** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Lightbulb />` | **10** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Zap />` | **9** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<CheckCircle2 />` | **9** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Utensils />` | **8** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Moon />` | **8** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Map />` | **7** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |
| `<Landmark />` | **6** | Thay thế biểu tượng cảm xúc bằng SVG vector chuẩn |

---

## 2. BẢNG KIỂM KÊ CHI TIẾT EMOJI THEO COMPONENT (PROOF CONTRACT)

> **Hợp đồng Proof bắt buộc:** Mỗi bản ghi sở hữu đầy đủ `file`, `component`, `line`, `emoji`, `codepoints`, `category`, và `recommended_lucide`.

| ID | File (Tệp tin) | Component | Dòng | Emoji | Unicode | Phân loại | Lucide Icon | Đoạn mã (Snippet) |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| `EMOJI-0001` | `frontend/src/app/page.tsx` | **`HomePage`** | 150 | 🌅 | `U+1F305` | UI_CONTENT_EMBELLISHMENT | `Sunrise` | `emoji: "🌅",` |
| `EMOJI-0002` | `frontend/src/app/page.tsx` | **`HomePage`** | 159 | 🏕️ | `U+1F3D5 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Tent` | `emoji: "🏕️",` |
| `EMOJI-0003` | `frontend/src/app/page.tsx` | **`HomePage`** | 168 | 🍗 | `U+1F357` | UI_CONTENT_EMBELLISHMENT | `Utensils` | `emoji: "🍗",` |
| `EMOJI-0004` | `frontend/src/app/page.tsx` | **`HomePage`** | 177 | 🛕 | `U+1F6D5` | UI_CONTENT_EMBELLISHMENT | `Landmark` | `emoji: "🛕",` |
| `EMOJI-0005` | `frontend/src/app/page.tsx` | **`HomePage`** | 650 | 📸 | `U+1F4F8` | UI_FILTER_OR_CHIP | `Camera` | `{ key: "youth", label: "📸 Sống Ảo" },` |
| `EMOJI-0006` | `frontend/src/app/page.tsx` | **`HomePage`** | 651 | 👨‍👩‍👧‍👦 | `U+1F468 U+200D U+1F469 U+200D U+1F467 U+200D U+1F466` | UI_FILTER_OR_CHIP | `Users` | `{ key: "family", label: "👨‍👩‍👧‍👦 Gia Đình" },` |
| `EMOJI-0007` | `frontend/src/app/page.tsx` | **`HomePage`** | 652 | 🥾 | `U+1F97E` | UI_FILTER_OR_CHIP | `Footprints` | `{ key: "trekking", label: "🥾 Săn Mây" },` |
| `EMOJI-0008` | `frontend/src/app/page.tsx` | **`HomePage`** | 653 | 🙏 | `U+1F64F` | UI_FILTER_OR_CHIP | `HeartHandshake` | `{ key: "spiritual", label: "🙏 Tâm Linh" },` |
| `EMOJI-0009` | `frontend/src/app/page.tsx` | **`HomePage`** | 868 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `<span>{isSelected ? "⚡ Đang lọc xem danh sách" : `Lọc xem (${cluster.placeCount} điểm)`}</span>` |
| `EMOJI-0010` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 169 | ⏳ | `U+23F3` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<option value="pending">⏳ Chờ xử lý</option>` |
| `EMOJI-0011` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 170 | 👀 | `U+1F440` | UI_CONTENT_EMBELLISHMENT | `Eye` | `<option value="reviewed">👀 Đang kiểm duyệt</option>` |
| `EMOJI-0012` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 171 | ✅ | `U+2705` | UI_CONTENT_EMBELLISHMENT | `CheckCircle2` | `<option value="resolved">✅ Đã giải quyết</option>` |
| `EMOJI-0013` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 180 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<option value="place_contribution">📍 Đóng góp địa điểm</option>` |
| `EMOJI-0014` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 181 | ✏️ | `U+270F U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<option value="place_correction">✏️ Báo sai sót</option>` |
| `EMOJI-0015` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 182 | 📸 | `U+1F4F8` | UI_CONTENT_EMBELLISHMENT | `Camera` | `<option value="photo_contribution">📸 Gửi tặng ảnh</option>` |
| `EMOJI-0016` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 183 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `<option value="feature_request">💡 Đề xuất tính năng</option>` |
| `EMOJI-0017` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 184 | 💬 | `U+1F4AC` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<option value="general">💬 Góp ý chung</option>` |
| `EMOJI-0018` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 234 | ✅ | `U+2705` | UI_CONTENT_EMBELLISHMENT | `CheckCircle2` | `? '✅ Đã giải quyết'` |
| `EMOJI-0019` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 236 | 👀 | `U+1F440` | UI_CONTENT_EMBELLISHMENT | `Eye` | `? '👀 Đang duyệt'` |
| `EMOJI-0020` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 237 | ⏳ | `U+23F3` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `: '⏳ Chờ xử lý'}` |
| `EMOJI-0021` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 335 | ⏳ | `U+23F3` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `⏳ Chờ xử lý` |
| `EMOJI-0022` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 347 | 👀 | `U+1F440` | UI_CONTENT_EMBELLISHMENT | `Eye` | `👀 Đang duyệt` |
| `EMOJI-0023` | `frontend/src/app/admin/feedbacks/page.tsx` | **`AdminFeedbacksPage`** | 359 | ✅ | `U+2705` | UI_CONTENT_EMBELLISHMENT | `CheckCircle2` | `✅ Đã xử lý` |
| `EMOJI-0024` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 241 | ⚡ | `U+26A1` | STATUS_OR_INDICATOR | `Zap` | `setStatusMsg(`⚡ Đã tự động tính khoảng cách GPS: Tổng ~${totalKm} km cho ${updatedStops.length} chặn` |
| `EMOJI-0025` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 254 | ⚡ | `U+26A1` | STATUS_OR_INDICATOR | `Zap` | `setStatusMsg(`⚡ Đã tự động tính khoảng cách GPS: Tổng ~${totalKm} km cho ${updatedStops.length} chặn` |
| `EMOJI-0026` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 345 | ✅ | `U+2705` | STATUS_OR_INDICATOR | `CheckCircle2` | `setStatusMsg(`✅ Đã cập nhật tour "${editingTour.title}" thành công!`);` |
| `EMOJI-0027` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 348 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Không thể lưu: ${data.error \|\| 'Lỗi hệ thống'}`);` |
| `EMOJI-0028` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 353 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Lỗi kết nối: ${err.message \|\| 'Lỗi mạng'}`);` |
| `EMOJI-0029` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 373 | ✅ | `U+2705` | STATUS_OR_INDICATOR | `CheckCircle2` | `setStatusMsg(`✅ Đã tạo lịch trình mới thành công!`);` |
| `EMOJI-0030` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 376 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Không thể tạo: ${data.error \|\| 'Lỗi hệ thống'}`);` |
| `EMOJI-0031` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 381 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Lỗi kết nối: ${err.message \|\| 'Lỗi mạng'}`);` |
| `EMOJI-0032` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 395 | ✅ | `U+2705` | STATUS_OR_INDICATOR | `CheckCircle2` | `setStatusMsg(`✅ Đã xóa tour "${title}" thành công!`);` |
| `EMOJI-0033` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 398 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Lỗi xóa: ${data.error \|\| 'Không thể xóa'}`);` |
| `EMOJI-0034` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 403 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Lỗi kết nối: ${err.message}`);` |
| `EMOJI-0035` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 570 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `<span className="text-xl shrink-0 mt-0.5">{tour.emoji \|\| '🧭'}</span>` |
| `EMOJI-0036` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 660 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `<span className="text-2xl">{editingTour.emoji \|\| '🧭'}</span>` |
| `EMOJI-0037` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 694 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `value={editingTour.emoji \|\| '🧭'}` |
| `EMOJI-0038` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 784 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `<span>⚡ Tự Động Đo GPS & Quãng Đường</span>` |
| `EMOJI-0039` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 906 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `➔ ~{stop.travel_to_next_km} km ({stop.travel_to_next_min \|\| 15} phút di chuyển)` |
| `EMOJI-0040` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 910 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `➔ Chặng di chuyển tiếp theo...` |
| `EMOJI-0041` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 948 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `<span className="text-2xl">{newTour.emoji \|\| '🧭'}</span>` |
| `EMOJI-0042` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 983 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `value={newTour.emoji \|\| '🧭'}` |
| `EMOJI-0043` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 1073 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `<span>⚡ Tự Động Đo GPS & Quãng Đường</span>` |
| `EMOJI-0044` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 1185 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `➔ ~{stop.travel_to_next_km} km ({stop.travel_to_next_min \|\| 15} phút)` |
| `EMOJI-0045` | `frontend/src/app/admin/itineraries/page.tsx` | **`AdminItinerariesPage`** | 1189 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `➔ Chặng tiếp theo...` |
| `EMOJI-0046` | `frontend/src/app/admin/knowledge-base/page.tsx` | **`AdminKnowledgeBasePage`** | 553 | 🍗 | `U+1F357` | UI_CONTENT_EMBELLISHMENT | `Utensils` | `<option value="food">🍗 Ẩm Thực & Đặc Sản</option>` |
| `EMOJI-0047` | `frontend/src/app/admin/knowledge-base/page.tsx` | **`AdminKnowledgeBasePage`** | 554 | 🏛️ | `U+1F3DB U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Landmark` | `<option value="place">🏛️ Địa Điểm & Chùa Tháp</option>` |
| `EMOJI-0048` | `frontend/src/app/admin/knowledge-base/page.tsx` | **`AdminKnowledgeBasePage`** | 555 | 🎈 | `U+1F388` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<option value="festival">🎈 Lễ Hội & Sự Kiện</option>` |
| `EMOJI-0049` | `frontend/src/app/admin/knowledge-base/page.tsx` | **`AdminKnowledgeBasePage`** | 556 | 🛵 | `U+1F6F5` | UI_CONTENT_EMBELLISHMENT | `Bike` | `<option value="transport">🛵 Giao Thông & Đường Đi</option>` |
| `EMOJI-0050` | `frontend/src/app/admin/knowledge-base/page.tsx` | **`AdminKnowledgeBasePage`** | 557 | 🚨 | `U+1F6A8` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<option value="emergency">🚨 Cứu Hộ / SOS Khẩn Cấp</option>` |
| `EMOJI-0051` | `frontend/src/app/admin/knowledge-base/page.tsx` | **`AdminKnowledgeBasePage`** | 558 | 📋 | `U+1F4CB` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<option value="general">📋 Lưu Ý & Văn Hóa Chung</option>` |
| `EMOJI-0052` | `frontend/src/app/admin/places/page.tsx` | **`AdminPlacesPage`** | 132 | ✅ | `U+2705` | STATUS_OR_INDICATOR | `CheckCircle2` | `setStatusMsg(`✅ Đã cập nhật thành công "${editingPlace.name}"!`);` |
| `EMOJI-0053` | `frontend/src/app/admin/places/page.tsx` | **`AdminPlacesPage`** | 135 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Không thể lưu: ${data.error \|\| 'Lỗi hệ thống'}`);` |
| `EMOJI-0054` | `frontend/src/app/admin/places/page.tsx` | **`AdminPlacesPage`** | 140 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Lỗi mạng: ${err.message \|\| 'Không thể kết nối máy chủ'}`);` |
| `EMOJI-0055` | `frontend/src/app/admin/places/page.tsx` | **`AdminPlacesPage`** | 164 | ✅ | `U+2705` | STATUS_OR_INDICATOR | `CheckCircle2` | `setStatusMsg(`✅ Đã thêm địa điểm mới & sinh Vector Embeddings thành công!`);` |
| `EMOJI-0056` | `frontend/src/app/admin/places/page.tsx` | **`AdminPlacesPage`** | 167 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Không thể tạo: ${data.error \|\| 'Lỗi hệ thống'}`);` |
| `EMOJI-0057` | `frontend/src/app/admin/places/page.tsx` | **`AdminPlacesPage`** | 172 | ❌ | `U+274C` | STATUS_OR_INDICATOR | `Sparkles` | `setStatusMsg(`❌ Lỗi mạng: ${err.message \|\| 'Không thể kết nối máy chủ'}`);` |
| `EMOJI-0058` | `frontend/src/app/admin/places/components/PhotoGalleryStudio.tsx` | **`PhotoGalleryStudio`** | 82 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `setCompressionSavings(`Đã nén tiết kiệm ${savedPct}% dung lượng (${origMB}MB ➔ ${compKB}KB WebP)`);` |
| `EMOJI-0059` | `frontend/src/app/admin/places/components/PhotoGalleryStudio.tsx` | **`PhotoGalleryStudio`** | 313 | ✓ | `U+2713` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `✓ Đã có` |
| `EMOJI-0060` | `frontend/src/app/admin/places/components/PlaceTable.tsx` | **`PlaceTable`** | 127 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `{c === 'ALL' ? '📍 Tất Cả Xã / Thị Trấn' : c}` |
| `EMOJI-0061` | `frontend/src/app/admin/places/components/PlaceTable.tsx` | **`PlaceTable`** | 139 | 🏷️ | `U+1F3F7 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Tag` | `{cat === 'ALL' ? '🏷️ Tất Cả Danh Mục' : cat}` |
| `EMOJI-0062` | `frontend/src/app/admin/stories/page.tsx` | **`AdminStoriesPage`** | 213 | 🎉 | `U+1F389` | STATUS_OR_INDICATOR | `PartyPopper` | `setBatchStatus(`🎉 Đã căn chỉnh và cập nhật thành công ${count} bài viết!`);` |
| `EMOJI-0063` | `frontend/src/app/admin/stories/page.tsx` | **`AdminStoriesPage`** | 256 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `<span>{isBatchProcessing ? 'Đang xử lý...' : '⚡ Căn Chỉnh Toàn Bộ 155 Địa Điểm'}</span>` |
| `EMOJI-0064` | `frontend/src/app/admin/stories/page.tsx` | **`AdminStoriesPage`** | 476 | 🪄 | `U+1FA84` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span>🪄 Tự Động Căn Chỉnh Typography</span>` |
| `EMOJI-0065` | `frontend/src/app/api/v1/admin/itineraries/route.ts` | **`ApiRoute: /api/v1/admin/itineraries`** | 98 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `emoji: row.emoji \|\| '🧭',` |
| `EMOJI-0066` | `frontend/src/app/api/v1/admin/itineraries/route.ts` | **`ApiRoute: /api/v1/admin/itineraries`** | 172 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `emoji: emoji \|\| '🧭',` |
| `EMOJI-0067` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 27 | 📸 | `U+1F4F8` | UI_CONTENT_EMBELLISHMENT | `Camera` | `if (/sống ảo\|tiktok\|check-in/.test(name)) return '📸';` |
| `EMOJI-0068` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 28 | 🍗 | `U+1F357` | UI_CONTENT_EMBELLISHMENT | `Utensils` | `if (/food\|ẩm thực/.test(name)) return '🍗';` |
| `EMOJI-0069` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 29 | 🙏 | `U+1F64F` | UI_CONTENT_EMBELLISHMENT | `HeartHandshake` | `if (/tâm linh/.test(name)) return '🙏';` |
| `EMOJI-0070` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 30 | 🥾 | `U+1F97E` | UI_CONTENT_EMBELLISHMENT | `Footprints` | `if (/trek\|leo/.test(name)) return '🥾';` |
| `EMOJI-0071` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 31 | 💑 | `U+1F491` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/couple\|đôi\|lãng mạn\|sunset/.test(name)) return '💑';` |
| `EMOJI-0072` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 32 | 📜 | `U+1F4DC` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/lịch sử\|tưởng niệm\|về nguồn/.test(name)) return '📜';` |
| `EMOJI-0073` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 33 | 👨‍👩‍👧 | `U+1F468 U+200D U+1F469 U+200D U+1F467` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/gia đình\|family/.test(name)) return '👨‍👩‍👧';` |
| `EMOJI-0074` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 34 | 🕰️ | `U+1F570 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/nửa ngày\|express/.test(name)) return '🕰️';` |
| `EMOJI-0075` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 35 | 🏆 | `U+1F3C6` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/3n2d\|3 ngày\|full exp/.test(name)) return '🏆';` |
| `EMOJI-0076` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 36 | 🗺️ | `U+1F5FA U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Map` | `if (/2n1d\|2 ngày/.test(name)) return '🗺️';` |
| `EMOJI-0077` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 37 | 🌙 | `U+1F319` | UI_CONTENT_EMBELLISHMENT | `Moon` | `if (/về đêm\|đêm\|cafe hopping/.test(name)) return '🌙';` |
| `EMOJI-0078` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 38 | 📷 | `U+1F4F7` | UI_CONTENT_EMBELLISHMENT | `Camera` | `if (/photographer\|nhiếp ảnh\|lúa chín/.test(name)) return '📷';` |
| `EMOJI-0079` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 39 | 💰 | `U+1F4B0` | UI_CONTENT_EMBELLISHMENT | `Coins` | `if (/backpacker\|budget/.test(name)) return '💰';` |
| `EMOJI-0080` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 40 | ✨ | `U+2728` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/luxury\|sang trọng/.test(name)) return '✨';` |
| `EMOJI-0081` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 41 | 🎒 | `U+1F392` | UI_CONTENT_EMBELLISHMENT | `Briefcase` | `if (/solo/.test(name)) return '🎒';` |
| `EMOJI-0082` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 42 | 🐃 | `U+1F403` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/đua bò/.test(name)) return '🐃';` |
| `EMOJI-0083` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 43 | 🎭 | `U+1F3AD` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `if (/lễ hội\|khmer\|nước nổi/.test(name)) return '🎭';` |
| `EMOJI-0084` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 44 | 🌅 | `U+1F305` | UI_CONTENT_EMBELLISHMENT | `Sunrise` | `if (/hoàng hôn\|sunset\|bbq/.test(name)) return '🌅';` |
| `EMOJI-0085` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 45 | 🛵 | `U+1F6F5` | UI_CONTENT_EMBELLISHMENT | `Bike` | `if (/chạy xe\|xe đêm/.test(name)) return '🛵';` |
| `EMOJI-0086` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 46 | ☕ | `U+2615` | UI_CONTENT_EMBELLISHMENT | `Coffee` | `if (/cafe/.test(name)) return '☕';` |
| `EMOJI-0087` | `frontend/src/app/api/v1/chat/itinerary/route.ts` | **`ApiRoute: /api/v1/chat/itinerary`** | 47 | 🔥 | `U+1F525` | UI_CONTENT_EMBELLISHMENT | `Flame` | `return '🔥';` |
| `EMOJI-0088` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 43 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=<Tên_Địa_Điểm>,+<Tên_Xã_hoặc_Thị_trấn>,+An+Gian` |
| `EMOJI-0089` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 43 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=<Tên_Địa_Điểm>,+<Tên_Xã_hoặc_Thị_trấn>,+An+Gian` |
| `EMOJI-0090` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 49 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=Hồ+Tà+Pạ,+Xã+Núi+Tô,+An+Giang) • [▶ Xem TikTok ` |
| `EMOJI-0091` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 49 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=Hồ+Tà+Pạ,+Xã+Núi+Tô,+An+Giang) • [▶ Xem TikTok ` |
| `EMOJI-0092` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 53 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=Quán+Gà+Đốt+Thảo+Nguyên,+Xã+Ô+Lâm,+An+Giang) • ` |
| `EMOJI-0093` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 53 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=Quán+Gà+Đốt+Thảo+Nguyên,+Xã+Ô+Lâm,+An+Giang) • ` |
| `EMOJI-0094` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 80 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Nhà xe Huệ Nghĩa (Hotline 1900 636497)*: Xe Limousine VIP & Giường nằm chạy tuyến thẳng TP.HCM (B` |
| `EMOJI-0095` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 81 | ➔ | `U+2794` | UI_FILTER_OR_CHIP | `Sparkles` | `• *Nhà xe Phương Trang FUTA (Hotline 1900 6067 - Văn phòng Tri Tôn: 51 Đường 3 Tháng 2, TT. Tri Tôn)` |
| `EMOJI-0096` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 83 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP.HCM*: Cao tốc TP.HCM - Trung Lương - Mỹ Thuận ➔ Cầu Vàm Cống ➔ TP. Long Xuyên ➔ Rẽ trái vào` |
| `EMOJI-0097` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 83 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP.HCM*: Cao tốc TP.HCM - Trung Lương - Mỹ Thuận ➔ Cầu Vàm Cống ➔ TP. Long Xuyên ➔ Rẽ trái vào` |
| `EMOJI-0098` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 83 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP.HCM*: Cao tốc TP.HCM - Trung Lương - Mỹ Thuận ➔ Cầu Vàm Cống ➔ TP. Long Xuyên ➔ Rẽ trái vào` |
| `EMOJI-0099` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 83 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP.HCM*: Cao tốc TP.HCM - Trung Lương - Mỹ Thuận ➔ Cầu Vàm Cống ➔ TP. Long Xuyên ➔ Rẽ trái vào` |
| `EMOJI-0100` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 84 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Cần Thơ*: QL91 ➔ TP. Long Xuyên ➔ ĐT941 ➔ Tri Tôn (khoảng 110km, 2.5 tiếng).` |
| `EMOJI-0101` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 84 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Cần Thơ*: QL91 ➔ TP. Long Xuyên ➔ ĐT941 ➔ Tri Tôn (khoảng 110km, 2.5 tiếng).` |
| `EMOJI-0102` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 84 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Cần Thơ*: QL91 ➔ TP. Long Xuyên ➔ ĐT941 ➔ Tri Tôn (khoảng 110km, 2.5 tiếng).` |
| `EMOJI-0103` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 85 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Châu Đốc*: QL91 ➔ Rẽ vào Tỉnh lộ ĐT948 (qua Rừng tràm Trà Sư, KDL Núi Cấm) ➔ Men theo sườn` |
| `EMOJI-0104` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 85 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Châu Đốc*: QL91 ➔ Rẽ vào Tỉnh lộ ĐT948 (qua Rừng tràm Trà Sư, KDL Núi Cấm) ➔ Men theo sườn` |
| `EMOJI-0105` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 85 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Châu Đốc*: QL91 ➔ Rẽ vào Tỉnh lộ ĐT948 (qua Rừng tràm Trà Sư, KDL Núi Cấm) ➔ Men theo sườn` |
| `EMOJI-0106` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 86 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Rạch Giá (Kiên Giang)*: QL80 ➔ Kênh Tám Ngàn ➔ Xã Cô Tô ➔ TT. Tri Tôn (khoảng 75km, 1.8 ti` |
| `EMOJI-0107` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 86 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Rạch Giá (Kiên Giang)*: QL80 ➔ Kênh Tám Ngàn ➔ Xã Cô Tô ➔ TT. Tri Tôn (khoảng 75km, 1.8 ti` |
| `EMOJI-0108` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 86 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Từ TP. Rạch Giá (Kiên Giang)*: QL80 ➔ Kênh Tám Ngàn ➔ Xã Cô Tô ➔ TT. Tri Tôn (khoảng 75km, 1.8 ti` |
| `EMOJI-0109` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 93 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Cung Đường Ô Tà Sóc & Rừng Tre Tầm Vông (Xã Lương Phi)*: Từ TT. Tri Tôn theo ĐT948 về hướng Ba Ch` |
| `EMOJI-0110` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 103 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Cung Đường Chinh Phục Chữ "TRI TÔN" Trên Núi Cô Tô (Khu vực Sân Tiên, Xã Núi Tô)*: Biểu tượng chữ` |
| `EMOJI-0111` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 106 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• *Đường vào Hồ Ô Thum (Xã Ô Lâm)*: Từ TT. Tri Tôn theo đường ĐT955B đi Xã Ô Lâm ➔ Rẽ vào đường bờ h` |
| `EMOJI-0112` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 663 | 📊 | `U+1F4CA` | STATUS_OR_INDICATOR | `Sparkles` | `routeSummarySnippet = `\n📊 TỔNG HÀNH TRÌNH TÍNH TOÁN POSTGIS (${numDays} NGÀY):\n- Tổng quãng đường:` |
| `EMOJI-0113` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 664 | 💰 | `U+1F4B0` | UI_CONTENT_EMBELLISHMENT | `Coins` | `costSnippet = `\n💰 CHI TIẾT NGÂN SÁCH DỰ KIẾN:\n- Ăn uống: ~${Math.round((costData.breakfastEst + co` |
| `EMOJI-0114` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 670 | 🗺️ | `U+1F5FA U+FE0F` | TAG_OR_PRESET | `Map` | `return `- [ID: ${p.id}] ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}. Đánh giá: ${p.rating` |
| `EMOJI-0115` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 670 | 🎵 | `U+1F3B5` | TAG_OR_PRESET | `Sparkles` | `return `- [ID: ${p.id}] ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}. Đánh giá: ${p.rating` |
| `EMOJI-0116` | `frontend/src/app/api/v1/chat/query/route.ts` | **`ApiRoute: /api/v1/chat/query`** | 670 | 🔎 | `U+1F50E` | TAG_OR_PRESET | `Search` | `return `- [ID: ${p.id}] ${p.name} (Thuộc ${p.commune}): Thể loại ${p.category}. Đánh giá: ${p.rating` |
| `EMOJI-0117` | `frontend/src/app/api/v1/chat/stream/route.ts` | **`ApiRoute: /api/v1/chat/stream`** | 35 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=<Tên_Địa_Điểm>,+<Tên_Xã_hoặc_Thị_trấn>,+An+Gian` |
| `EMOJI-0118` | `frontend/src/app/api/v1/chat/stream/route.ts` | **`ApiRoute: /api/v1/chat/stream`** | 35 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://maps.google.com/?q=<Tên_Địa_Điểm>,+<Tên_Xã_hoặc_Thị_trấn>,+An+Gian` |
| `EMOJI-0119` | `frontend/src/app/auth/page.tsx` | **`AuthPage`** | 34 | ✕ | `U+2715` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `✕` |
| `EMOJI-0120` | `frontend/src/app/culture/page.tsx` | **`CulturePage`** | 512 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `📍 {spotlightFestival.location}` |
| `EMOJI-0121` | `frontend/src/app/culture/page.tsx` | **`CulturePage`** | 625 | 🔥 | `U+1F525` | UI_CONTENT_EMBELLISHMENT | `Flame` | `🔥 TIÊU ĐIỂM` |
| `EMOJI-0122` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 38 | 🍽️ | `U+1F37D U+FE0F` | UI_FILTER_OR_CHIP | `UtensilsCrossed` | `{ key: 'all' as FoodSpecialtyCategory, label: 'Tất Cả Đặc Sản', icon: '🍽️' },` |
| `EMOJI-0123` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 39 | 🍗 | `U+1F357` | UI_FILTER_OR_CHIP | `Utensils` | `{ key: 'ga_dot' as FoodSpecialtyCategory, label: 'Gà Đốt Ô Thum', icon: '🍗' },` |
| `EMOJI-0124` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 40 | 🥩 | `U+1F969` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: 'bo_7_mon' as FoodSpecialtyCategory, label: 'Bò 7 Món Ba Chúc', icon: '🥩' },` |
| `EMOJI-0125` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 41 | 🍲 | `U+1F372` | UI_FILTER_OR_CHIP | `Soup` | `{ key: 'chao_bo' as FoodSpecialtyCategory, label: 'Cháo Bò & Bún Cá', icon: '🍲' },` |
| `EMOJI-0126` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 42 | 🥞 | `U+1F95E` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: 'banh_bo' as FoodSpecialtyCategory, label: 'Bánh Bò & Ăn Vặt', icon: '🥞' },` |
| `EMOJI-0127` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 43 | ☕ | `U+2615` | UI_FILTER_OR_CHIP | `Coffee` | `{ key: 'cafe' as FoodSpecialtyCategory, label: 'Cà Phê View Núi Hồ', icon: '☕' },` |
| `EMOJI-0128` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 44 | 🌙 | `U+1F319` | UI_FILTER_OR_CHIP | `Moon` | `{ key: 'night' as FoodSpecialtyCategory, label: 'Ăn Đêm Sau 21h', icon: '🌙' },` |
| `EMOJI-0129` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 291 | 🍗 | `U+1F357` | UI_CONTENT_EMBELLISHMENT | `Utensils` | `🍗 Đặt Gà Đốt Trước 35–45 Phút:` |
| `EMOJI-0130` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 300 | 🍲 | `U+1F372` | UI_CONTENT_EMBELLISHMENT | `Soup` | `🍲 Giờ Vàng Ăn Sáng (06:00 – 10:00):` |
| `EMOJI-0131` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 309 | 🥞 | `U+1F95E` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `🥞 Bánh Bò Thốt Nốt Nóng Hổi:` |
| `EMOJI-0132` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 318 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 TOP 4 ĐẶC SẢN & QUÁN HOT NHẤT PHẢI THỬ 🌟 */}` |
| `EMOJI-0133` | `frontend/src/app/food/page.tsx` | **`FoodPage`** | 318 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 TOP 4 ĐẶC SẢN & QUÁN HOT NHẤT PHẢI THỬ 🌟 */}` |
| `EMOJI-0134` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 307 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `<h3 className="font-heading font-bold text-lg text-[#0F172A]">⚡ Hạ Tầng Kỹ Thuật Chuẩn Enterprise</h` |
| `EMOJI-0135` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 320 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<h3 className="font-heading font-bold text-lg text-[#0A6B61]">📍 CSDL Thực Địa Độc Quyền</h3>` |
| `EMOJI-0136` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 449 | 🏆 | `U+1F3C6` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<th className="py-3 px-4 text-[#0E8C7F] bg-emerald-50 font-bold rounded-t-lg">DU LỊCH TRI TÔN AI 🏆</` |
| `EMOJI-0137` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 458 | ✓ | `U+2713` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ 100% Chuẩn Xã/Thực tế</td>` |
| `EMOJI-0138` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 459 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Lẫn lộn gà nướng/bún mắm</td>` |
| `EMOJI-0139` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 460 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có quán nhỏ</td>` |
| `EMOJI-0140` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 461 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Review nhận tiền</td>` |
| `EMOJI-0141` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 465 | ✓ | `U+2713` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ Phản hồi &lt; 900ms</td>` |
| `EMOJI-0142` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 466 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có AI</td>` |
| `EMOJI-0143` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 467 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Chỉ bán tour trọn gói</td>` |
| `EMOJI-0144` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 468 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có</td>` |
| `EMOJI-0145` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 472 | ✓ | `U+2713` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ Nút gọi 1 chạm trực tiếp</td` |
| `EMOJI-0146` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 473 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Số điện thoại sai</td>` |
| `EMOJI-0147` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 474 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không hỗ trợ</td>` |
| `EMOJI-0148` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 475 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có</td>` |
| `EMOJI-0149` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 479 | ✓ | `U+2713` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/60">✓ CA, Y Tế, Cứu hộ xe máy</td>` |
| `EMOJI-0150` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 480 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có</td>` |
| `EMOJI-0151` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 481 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có</td>` |
| `EMOJI-0152` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 482 | ✗ | `U+2717` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<td className="py-3 px-4 text-red-600">✗ Không có</td>` |
| `EMOJI-0153` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 596 | ➡️ | `U+27A1 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span>Dùng phím ⬅️ ➡️ để lật slide • Nhấn N để mở Ghi chú</span>` |
| `EMOJI-0154` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 607 | ✕ | `U+2715` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<button onClick={() => setShowNotes(false)} className="text-slate-400 hover:text-slate-600 font-bold` |
| `EMOJI-0155` | `frontend/src/app/pitch-deck/page.tsx` | **`PitchDeckPage`** | 630 | 🏁 | `U+1F3C1` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{currentSlide === totalSlides ? 'Kết thúc 🏁' : 'Trang sau'} <ChevronRight size={16} />` |
| `EMOJI-0156` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 274 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 TOP 4 KỲ QUAN & TỌA ĐỘ CHECK-IN HOT NHẤT (HOT SPOTLIGHT) 🌟 */}` |
| `EMOJI-0157` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 274 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 TOP 4 KỲ QUAN & TỌA ĐỘ CHECK-IN HOT NHẤT (HOT SPOTLIGHT) 🌟 */}` |
| `EMOJI-0158` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 398 | 🌙 | `U+1F319` | UI_FILTER_OR_CHIP | `Moon` | `{ id: "night", label: "Tri Tôn Về Đêm 🌙" },` |
| `EMOJI-0159` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 399 | 📸 | `U+1F4F8` | UI_FILTER_OR_CHIP | `Camera` | `{ id: "youth", label: "Giới Trẻ Check-in 📸" },` |
| `EMOJI-0160` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 400 | 👨‍👩‍👧 | `U+1F468 U+200D U+1F469 U+200D U+1F467` | UI_FILTER_OR_CHIP | `Sparkles` | `{ id: "family", label: "Gia Đình & Nghỉ Dưỡng 👨‍👩‍👧" },` |
| `EMOJI-0161` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 401 | 🏔️ | `U+1F3D4 U+FE0F` | UI_FILTER_OR_CHIP | `MountainSnow` | `{ id: "trekking", label: "Leo Núi Săn Mây 🏔️" },` |
| `EMOJI-0162` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 402 | 🛕 | `U+1F6D5` | UI_FILTER_OR_CHIP | `Landmark` | `{ id: "spiritual", label: "Hành Hương Tâm Linh 🛕" },` |
| `EMOJI-0163` | `frontend/src/app/places/page.tsx` | **`PlacesPage`** | 470 | ✕ | `U+2715` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span>✕ Xóa lọc cụm (Xem tất cả 149 điểm)</span>` |
| `EMOJI-0164` | `frontend/src/app/stay/page.tsx` | **`StayPage`** | 187 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 BỘ LỌC PHÂN NHÓM CHUYÊN NGHIỆP 🌟 */}` |
| `EMOJI-0165` | `frontend/src/app/stay/page.tsx` | **`StayPage`** | 187 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 BỘ LỌC PHÂN NHÓM CHUYÊN NGHIỆP 🌟 */}` |
| `EMOJI-0166` | `frontend/src/app/stay/page.tsx` | **`StayPage`** | 238 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 SPOTLIGHT: TOP 3 LỰA CHỌN ĐẶC SẮC NHẤT 🌟 */}` |
| `EMOJI-0167` | `frontend/src/app/stay/page.tsx` | **`StayPage`** | 238 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 SPOTLIGHT: TOP 3 LỰA CHỌN ĐẶC SẮC NHẤT 🌟 */}` |
| `EMOJI-0168` | `frontend/src/components/ChatbotPageClient.tsx` | **`ChatbotPageClient`** | 172 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `'🧭 27 Lịch Trình',` |
| `EMOJI-0169` | `frontend/src/components/ChatbotPageClient.tsx` | **`ChatbotPageClient`** | 193 | 🧭 | `U+1F9ED` | TAG_OR_PRESET | `Compass` | `if (preset === '🧭 27 Lịch Trình') {` |
| `EMOJI-0170` | `frontend/src/components/ChatbotPageClient.tsx` | **`ChatbotPageClient`** | 638 | 🧭 | `U+1F9ED` | TAG_OR_PRESET | `Compass` | `preset === '🧭 27 Lịch Trình'` |
| `EMOJI-0171` | `frontend/src/components/ChatbotWidget.tsx` | **`ChatbotWidget`** | 185 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `'🧭 27 Lịch Trình',` |
| `EMOJI-0172` | `frontend/src/components/ChatbotWidget.tsx` | **`ChatbotWidget`** | 629 | 🧭 | `U+1F9ED` | TAG_OR_PRESET | `Compass` | `if (preset === '🧭 27 Lịch Trình') {` |
| `EMOJI-0173` | `frontend/src/components/ChatbotWidget.tsx` | **`ChatbotWidget`** | 805 | 🧭 | `U+1F9ED` | TAG_OR_PRESET | `Compass` | `preset === '🧭 27 Lịch Trình'` |
| `EMOJI-0174` | `frontend/src/components/DeploymentAutoRecovery.tsx` | **`DeploymentAutoRecovery`** | 28 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `console.warn('⚡ Detected deployment chunk skew. Auto-refreshing to latest version...');` |
| `EMOJI-0175` | `frontend/src/components/DeploymentAutoRecovery.tsx` | **`DeploymentAutoRecovery`** | 53 | ⚡ | `U+26A1` | UI_CONTENT_EMBELLISHMENT | `Zap` | `console.warn('⚡ Detected stale bundle promise rejection. Seamlessly reloading...');` |
| `EMOJI-0176` | `frontend/src/components/FoodClientPage.tsx` | **`FoodClientPage`** | 193 | ★ | `U+2605` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span className="font-semibold text-[#26221B]">★ {item.rating \|\| 4.8} / 5.0</span>` |
| `EMOJI-0177` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 39 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `const titleMatch = (content \|\| '').match(/###?\s*🌟?\s*(.+)/);` |
| `EMOJI-0178` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 65 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `const titleMatch = (content \|\| '').match(/###?\s*🌟?\s*(.+)/);` |
| `EMOJI-0179` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 69 | 🧭 | `U+1F9ED` | UI_CONTENT_EMBELLISHMENT | `Compass` | `emoji: '🧭',` |
| `EMOJI-0180` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 149 | 🗺️ | `U+1F5FA U+FE0F` | STATUS_OR_INDICATOR | `Map` | `<h2 class="timeline-title">🗺️ SƠ ĐỒ LỊCH TRÌNH & CÁC TRẠM DỪNG THỰC ĐỊA</h2>` |
| `EMOJI-0181` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 155 | ⏰ | `U+23F0` | STATUS_OR_INDICATOR | `Clock` | `<span class="stop-time">⏰ ${st.time_start \|\| ''} – ${st.time_end \|\| ''}</span>` |
| `EMOJI-0182` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 160 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<div class="stop-commune">📍 Xã/Thị trấn: <strong>${st.commune \|\| 'Tri Tôn'}</strong></div>` |
| `EMOJI-0183` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 161 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `${st.tip ? `<div class="stop-tip">💡 <em>Lời khuyên:</em> ${st.tip}</div>` : ''}` |
| `EMOJI-0184` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 162 | 💵 | `U+1F4B5` | UI_CONTENT_EMBELLISHMENT | `Banknote` | `${st.cost_vnd ? `<div class="stop-cost">💵 Chi phí ước tính: <strong>${st.cost_vnd}</strong></div>` :` |
| `EMOJI-0185` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 165 | 🛵 | `U+1F6F5` | UI_CONTENT_EMBELLISHMENT | `Bike` | `🛵 Di chuyển đến trạm tiếp theo: <strong>${st.travel_to_next_km} km</strong> (${st.travel_to_next_min` |
| `EMOJI-0186` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 410 | 🌾 | `U+1F33E` | UI_CONTENT_EMBELLISHMENT | `Wheat` | `<h1 class="header-title">🌾 ${title}</h1>` |
| `EMOJI-0187` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 414 | 🛵 | `U+1F6F5` | UI_CONTENT_EMBELLISHMENT | `Bike` | `<span>🛵 ~${typeof totalKm === 'number' ? totalKm.toFixed(0) : totalKm} km</span>` |
| `EMOJI-0188` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 415 | 💵 | `U+1F4B5` | UI_CONTENT_EMBELLISHMENT | `Banknote` | `<span>💵 ${budget}</span>` |
| `EMOJI-0189` | `frontend/src/components/FormattedChatMessage.tsx` | **`FormattedChatMessage`** | 436 | 🚨 | `U+1F6A8` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<strong>🚨 Hotline Hỗ Trợ Khẩn Cấp Bảy Núi:</strong> Công An: 0296.3874.113 • Y Tế / Cấp Cứu: 0296.38` |
| `EMOJI-0190` | `frontend/src/components/GoldenTimeWidget.tsx` | **`GoldenTimeWidget`** | 119 | ✨ | `U+2728` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span>✨ ĐANG TRONG KHUNG GIỜ VÀNG TRẢI NGHIỆM</span>` |
| `EMOJI-0191` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 360 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• <strong>Nhà xe Phương Trang (FUTA Bus Lines)</strong> (Hotline: <strong>1900 6067</strong> - VP Tr` |
| `EMOJI-0192` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 478 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Xã Núi Tô • Check-in lúc 06:00 & 16:` |
| `EMOJI-0193` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 489 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#D9822B]">📍 Nối ĐT941 - ĐT948 • View 360 độ</p>` |
| `EMOJI-0194` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 500 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Xã Núi Tô • Mùa trâm tháng 4 - 6</p>` |
| `EMOJI-0195` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 511 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Cầu Cây Me, Xã Châu Lăng</p>` |
| `EMOJI-0196` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 522 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#A6503A]">📍 Nội ô mở rộng TT. Tri Tôn</p>` |
| `EMOJI-0197` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 533 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Xã Lương Phi • Ô tô & xe máy vào tận` |
| `EMOJI-0198` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 544 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#A6503A]">📍 Xã Lê Trì - An Hảo • Đi phượt xe máy` |
| `EMOJI-0199` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 555 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Xã Cô Tô • Cách TT. Tri Tôn 4km</p>` |
| `EMOJI-0200` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 566 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#D9822B]">📍 Xã Châu Lăng • Rẽ từ Ngã 3 Cây Me</p` |
| `EMOJI-0201` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 577 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Tuyến Tỉnh lộ ĐT948</p>` |
| `EMOJI-0202` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 588 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#A6503A]">📍 Xã Núi Tô • Cách trung tâm 1.5km</p>` |
| `EMOJI-0203` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 599 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Ấp Tô Hạ, Xã Núi Tô</p>` |
| `EMOJI-0204` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 610 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#D9822B]">📍 ĐT948, Xã An Tức</p>` |
| `EMOJI-0205` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 621 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#7C5CBF]">📍 Ấp Phnôm Pi, Xã Châu Lăng</p>` |
| `EMOJI-0206` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 632 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#A6503A]">📍 ĐT955A, Xã Vĩnh Gia</p>` |
| `EMOJI-0207` | `frontend/src/components/GuideClientPage.tsx` | **`GuideClientPage`** | 643 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<p className="font-body text-[10px] font-bold text-[#0E8C7F]">📍 Sân Tiên, Núi Cô Tô • Rực sáng đèn L` |
| `EMOJI-0208` | `frontend/src/components/ItineraryClientPage.tsx` | **`ItineraryClientPage`** | 172 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `name: '📍 Vị trí GPS của tôi (Thiết bị)',` |
| `EMOJI-0209` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 160 | 💰 | `U+1F4B0` | TAG_OR_PRESET | `Coins` | `💰 {itinerary.budget_range}` |
| `EMOJI-0210` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 164 | 👥 | `U+1F465` | TAG_OR_PRESET | `Sparkles` | `👥 {itinerary.for_whom}` |
| `EMOJI-0211` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 245 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `📍 {stop.commune}` |
| `EMOJI-0212` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 255 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `<strong style={{ color: '#B45309' }}>💡 Mẹo & Hoạt động: </strong>` |
| `EMOJI-0213` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 262 | 💰 | `U+1F4B0` | UI_CONTENT_EMBELLISHMENT | `Coins` | `💰 Chi phí: {stop.cost_vnd}` |
| `EMOJI-0214` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 291 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 LƯU Ý THỰC ĐỊA QUAN TRỌNG:` |
| `EMOJI-0215` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 305 | 🚨 | `U+1F6A8` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `🚨 THÔNG TIN CỨU HỘ & KHẨN CẤP 24/7 (TRI TÔN, AN GIANG)` |
| `EMOJI-0216` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 310 | 🚔 | `U+1F694` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<p style={{ margin: 0, fontWeight: 700, color: '#9F1239' }}>🚔 Công An Tri Tôn</p>` |
| `EMOJI-0217` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 314 | 🚑 | `U+1F691` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<p style={{ margin: 0, fontWeight: 700, color: '#9F1239' }}>🚑 Y Tế Tri Tôn</p>` |
| `EMOJI-0218` | `frontend/src/components/ItineraryExportModal.tsx` | **`ItineraryExportModal`** | 318 | 🏛️ | `U+1F3DB U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Landmark` | `<p style={{ margin: 0, fontWeight: 700, color: '#9F1239' }}>🏛️ Hỗ Trợ Du Lịch</p>` |
| `EMOJI-0219` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 74 | 🧭 | `U+1F9ED` | UI_FILTER_OR_CHIP | `Compass` | `{ key: 'all',      label: 'Tất cả (27)',     icon: '🧭' },` |
| `EMOJI-0220` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 75 | ☀️ | `U+2600 U+FE0F` | UI_FILTER_OR_CHIP | `Sun` | `{ key: '1-day',    label: '1 Ngày',          icon: '☀️' },` |
| `EMOJI-0221` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 76 | 🗺️ | `U+1F5FA U+FE0F` | UI_FILTER_OR_CHIP | `Map` | `{ key: '2-day',    label: '2N1Đ',            icon: '🗺️' },` |
| `EMOJI-0222` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 77 | 🏆 | `U+1F3C6` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: '3-day',    label: '3N2Đ',            icon: '🏆' },` |
| `EMOJI-0223` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 78 | 🌙 | `U+1F319` | UI_FILTER_OR_CHIP | `Moon` | `{ key: 'evening',  label: 'Buổi Tối & Đêm',  icon: '🌙' },` |
| `EMOJI-0224` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 84 | ✨ | `U+2728` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: 'all',       label: 'Tất cả (27)',       icon: '✨' },` |
| `EMOJI-0225` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 85 | 🔥 | `U+1F525` | UI_FILTER_OR_CHIP | `Flame` | `{ key: 'classic',   label: 'Kinh Điển & Check-in', icon: '🔥' },` |
| `EMOJI-0226` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 86 | 🍗 | `U+1F357` | UI_FILTER_OR_CHIP | `Utensils` | `{ key: 'food',      label: 'Ẩm Thực & Cafe',    icon: '🍗' },` |
| `EMOJI-0227` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 87 | 🙏 | `U+1F64F` | UI_FILTER_OR_CHIP | `HeartHandshake` | `{ key: 'spiritual', label: 'Tâm Linh & Khmer',   icon: '🙏' },` |
| `EMOJI-0228` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 88 | 🥾 | `U+1F97E` | UI_FILTER_OR_CHIP | `Footprints` | `{ key: 'trekking',  label: 'Trekking & Phượt',  icon: '🥾' },` |
| `EMOJI-0229` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 89 | 💑 | `U+1F491` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: 'relax',     label: 'Nghỉ Dưỡng & Gia Đình', icon: '💑' },` |
| `EMOJI-0230` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 289 | ✨ | `U+2728` | TAG_OR_PRESET | `Sparkles` | `✨ Tour đề xuất cho bạn • {smartMatchedPreset.budget_range \|\| 'Chi phí hợp lý'}` |
| `EMOJI-0231` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 322 | ✕ | `U+2715` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `✕` |
| `EMOJI-0232` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 388 | 🔥 | `U+1F525` | UI_CONTENT_EMBELLISHMENT | `Flame` | `<span className="text-base shrink-0 leading-none mt-0.5">{p.emoji \|\| '🔥'}</span>` |
| `EMOJI-0233` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 398 | 👥 | `U+1F465` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `👥 {p.for_whom \|\| 'Mọi lứa tuổi'}` |
| `EMOJI-0234` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 410 | 💰 | `U+1F4B0` | UI_CONTENT_EMBELLISHMENT | `Coins` | `💰 {p.budget_range.replace('/người', '').replace('/gia đình', '/GĐ')}` |
| `EMOJI-0235` | `frontend/src/components/ItineraryPresetPicker.tsx` | **`ItineraryPresetPicker`** | 421 | ✅ | `U+2705` | UI_CONTENT_EMBELLISHMENT | `CheckCircle2` | `<span>✅ Đã tối ưu cự ly Kilomet & thứ tự ghé thăm</span>` |
| `EMOJI-0236` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 74 | 🌙 | `U+1F319` | UI_FILTER_OR_CHIP | `Moon` | `{ key: 'night_spots', label: '🌙 Tri Tôn Về Đêm' },` |
| `EMOJI-0237` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 189 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 GPS & RADAR RADIUS SCAN BAR 🌟 */}` |
| `EMOJI-0238` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 189 | 🌟 | `U+1F31F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `{/* 🌟 GPS & RADAR RADIUS SCAN BAR 🌟 */}` |
| `EMOJI-0239` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 198 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<span>{userLocation ? '📍 Đang Bật GPS Vị Trí Của Bạn' : '📍 Bật GPS Quét Điểm Gần Tôi'}</span>` |
| `EMOJI-0240` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 198 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<span>{userLocation ? '📍 Đang Bật GPS Vị Trí Của Bạn' : '📍 Bật GPS Quét Điểm Gần Tôi'}</span>` |
| `EMOJI-0241` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 256 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span className="text-[10px] text-[#6B6355] font-mono sm:hidden">Vuốt ngang ➔</span>` |
| `EMOJI-0242` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 370 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `{/* 📍 NÚT MỞ APP GOOGLE MAPS DẪN ĐƯỜNG 1 CHẠM 📍 */}` |
| `EMOJI-0243` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 370 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `{/* 📍 NÚT MỞ APP GOOGLE MAPS DẪN ĐƯỜNG 1 CHẠM 📍 */}` |
| `EMOJI-0244` | `frontend/src/components/MapClientPage.tsx` | **`MapClientPage`** | 378 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `<span>📍 Mở App Google Maps Dẫn Đường</span>` |
| `EMOJI-0245` | `frontend/src/components/MapComponent.tsx` | **`MapComponent`** | 132 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `📍 Vị trí hiện tại của Bạn` |
| `EMOJI-0246` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 541 | 📸 | `U+1F4F8` | UI_CONTENT_EMBELLISHMENT | `Camera` | `📸 {selectedPhotoIndex + 1} / {photos.length} ảnh` |
| `EMOJI-0247` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 747 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 <strong>Mẹo chụp ảnh & Trải nghiệm:</strong> {goldenHourTip.photoTip}` |
| `EMOJI-0248` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 789 | 📌 | `U+1F4CC` | STATUS_OR_INDICATOR | `Pin` | `📌 {KHMER_TEMPLE_RULES.goldenHours}` |
| `EMOJI-0249` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 920 | 🕒 | `U+1F552` | UI_CONTENT_EMBELLISHMENT | `Clock` | `🕒 Giờ Mở Cửa & Vé` |
| `EMOJI-0250` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 928 | 🚗 | `U+1F697` | UI_CONTENT_EMBELLISHMENT | `Car` | `🚗 Bãi Đỗ Xe & Cảnh Báo` |
| `EMOJI-0251` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 936 | 🗓️ | `U+1F5D3 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `🗓️ Mùa Đẹp Nhất` |
| `EMOJI-0252` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 979 | 🚗 | `U+1F697` | UI_CONTENT_EMBELLISHMENT | `Car` | `<span className="font-bold text-[#0E8C7F]">🚗 Ô tô 4 – 7 chỗ:</span>` |
| `EMOJI-0253` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 983 | 🚐 | `U+1F690` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span className="font-bold text-[#D9822B]">🚐 Xe 16 – 29 chỗ:</span>` |
| `EMOJI-0254` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 987 | 🚌 | `U+1F68C` | UI_CONTENT_EMBELLISHMENT | `Bus` | `<span className="font-bold text-[#A6503A]">🚌 Xe lớn 45 chỗ:</span>` |
| `EMOJI-0255` | `frontend/src/components/PlaceDetailClient.tsx` | **`PlaceDetailClient`** | 991 | 🛵 | `U+1F6F5` | UI_CONTENT_EMBELLISHMENT | `Bike` | `<span className="font-bold text-[#26221B]">🛵 Xe máy / Xe ôm:</span>` |
| `EMOJI-0256` | `frontend/src/components/ReviewSentimentWidget.tsx` | **`ReviewSentimentWidget`** | 71 | ✓ | `U+2713` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `✓ {kw}` |
| `EMOJI-0257` | `frontend/src/components/ReviewSentimentWidget.tsx` | **`ReviewSentimentWidget`** | 90 | ⚠️ | `U+26A0 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `AlertTriangle` | `⚠️ {ck}` |
| `EMOJI-0258` | `frontend/src/components/SecurityConsoleShield.tsx` | **`SecurityConsoleShield`** | 17 | 🛡️ | `U+1F6E1 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Shield` | `console.log('%c🛡️ HỆ THỐNG DU LỊCH TRI TÔN AI', titleStyle);` |
| `EMOJI-0259` | `frontend/src/components/SecurityConsoleShield.tsx` | **`SecurityConsoleShield`** | 19 | ⚠️ | `U+26A0 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `AlertTriangle` | `'%c⚠️ CẢNH BÁO BẢO MẬT & BẢN QUYỀN HỆ THỐNG (SECURITY WARNING)',` |
| `EMOJI-0260` | `frontend/src/components/SmartTripBuilder.tsx` | **`SmartTripBuilder`** | 51 | 🏕️ | `U+1F3D5 U+FE0F` | UI_FILTER_OR_CHIP | `Tent` | `{ key: 'solo' as Group, label: 'Solo / 1 Mình', icon: '🏕️' },` |
| `EMOJI-0261` | `frontend/src/components/SmartTripBuilder.tsx` | **`SmartTripBuilder`** | 52 | 💑 | `U+1F491` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: 'couple' as Group, label: 'Cặp Đôi', icon: '💑' },` |
| `EMOJI-0262` | `frontend/src/components/SmartTripBuilder.tsx` | **`SmartTripBuilder`** | 53 | 👨‍👩‍👧 | `U+1F468 U+200D U+1F469 U+200D U+1F467` | UI_FILTER_OR_CHIP | `Sparkles` | `{ key: 'family' as Group, label: 'Gia Đình', icon: '👨‍👩‍👧' },` |
| `EMOJI-0263` | `frontend/src/components/SmartTripBuilder.tsx` | **`SmartTripBuilder`** | 54 | 🎒 | `U+1F392` | UI_FILTER_OR_CHIP | `Briefcase` | `{ key: 'friends' as Group, label: 'Nhóm Bạn', icon: '🎒' },` |
| `EMOJI-0264` | `frontend/src/components/TikTokFeedSection.tsx` | **`TikTokFeedSection`** | 99 | 🎵 | `U+1F3B5` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `🎵 TikTok Reels` |
| `EMOJI-0265` | `frontend/src/components/VideoChatCard.tsx` | **`VideoChatCard`** | 58 | ▶ | `U+25B6` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span className="text-[10px] text-rose-400 font-bold uppercase block mb-0.5">▶ Video Review</span>` |
| `EMOJI-0266` | `frontend/src/lib/aiProvider.ts` | **`LibModule: aiProvider`** | 9 | ➔ | `U+2794` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `* 3. Smart Hedging Racer (Groq LPU First 0ms ➔ Gemini Failover 600ms): TTFT < 300ms, tiết kiệm 85% q` |
| `EMOJI-0267` | `frontend/src/lib/aiProvider.ts` | **`LibModule: aiProvider`** | 10 | ➔ | `U+2794` | AI_PROMPT_TEMPLATE | `Sparkles` | `* 4. Resilient Fallback (OpenRouter Free SSE ➔ Local Expert RAG 100% Offline)` |
| `EMOJI-0268` | `frontend/src/lib/chatCitationCoverageGate.ts` | **`LibModule: chatCitationCoverageGate`** | 349 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `const citationBlock = `\n[📍 Chỉ đường Google Maps](https://maps.google.com/?q=${item.mapsQuery}) • [` |
| `EMOJI-0269` | `frontend/src/lib/chatCitationCoverageGate.ts` | **`LibModule: chatCitationCoverageGate`** | 349 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `const citationBlock = `\n[📍 Chỉ đường Google Maps](https://maps.google.com/?q=${item.mapsQuery}) • [` |
| `EMOJI-0270` | `frontend/src/lib/dataSanitizer.ts` | **`LibModule: dataSanitizer`** | 335 | 🥗 | `U+1F957` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `categoryName: '🥗 Món Ăn Kèm Bản Địa (Gọi Riêng)',` |
| `EMOJI-0271` | `frontend/src/lib/dataSanitizer.ts` | **`LibModule: dataSanitizer`** | 343 | 🥤 | `U+1F964` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `categoryName: '🥤 Đồ Uống & Tráng Miệng',` |
| `EMOJI-0272` | `frontend/src/lib/dataSanitizer.ts` | **`LibModule: dataSanitizer`** | 364 | 🥗 | `U+1F957` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `categoryName: '🥗 Món Ăn Kèm & Rau Rừng',` |
| `EMOJI-0273` | `frontend/src/lib/dataSanitizer.ts` | **`LibModule: dataSanitizer`** | 404 | ☕ | `U+2615` | UI_CONTENT_EMBELLISHMENT | `Coffee` | `categoryName: '☕ Đồ Uống & Tráng Miệng',` |
| `EMOJI-0274` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 54 | ⏰ | `U+23F0` | STATUS_OR_INDICATOR | `Clock` | `⏰ ${st.time_start \|\| ''} ${st.time_end ? '– ' + st.time_end : ''}` |
| `EMOJI-0275` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 67 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `📍 Địa bàn: <strong>${st.commune \|\| 'Huyện Tri Tôn, An Giang'}</strong>` |
| `EMOJI-0276` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 72 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 <em>Mẹo thực địa:</em> ${st.tip}` |
| `EMOJI-0277` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 78 | 💵 | `U+1F4B5` | UI_CONTENT_EMBELLISHMENT | `Banknote` | `${st.cost_vnd ? `💵 Chi phí: <strong style="color: #0E8C7F;">${st.cost_vnd}</strong>` : ''}` |
| `EMOJI-0278` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 79 | 🛵 | `U+1F6F5` | UI_CONTENT_EMBELLISHMENT | `Bike` | `${st.travel_to_next_km ? ` • 🛵 Chặng kế tiếp: <strong>${st.travel_to_next_km} km</strong> (${st.trav` |
| `EMOJI-0279` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 90 | 🗺️ | `U+1F5FA U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Map` | `🗺️ MỞ GOOGLE MAPS DẪN ĐƯỜNG` |
| `EMOJI-0280` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 106 | 🧭 | `U+1F9ED` | TAG_OR_PRESET | `Compass` | `${itinerary.emoji \|\| '🧭'} ${itinerary.title}` |
| `EMOJI-0281` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 126 | 💰 | `U+1F4B0` | UI_CONTENT_EMBELLISHMENT | `Coins` | `<span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppe` |
| `EMOJI-0282` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 130 | 👥 | `U+1F465` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppe` |
| `EMOJI-0283` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 134 | 🌤️ | `U+1F324 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<span style="display: block; font-size: 10px; color: #6B6355; font-weight: 700; text-transform: uppe` |
| `EMOJI-0284` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 153 | 🛡️ | `U+1F6E1 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Shield` | `🛡️ THÔNG TIN KHẨN CẤP & HỖ TRỢ DU KHÁCH TẠI TRI TÔN` |
| `EMOJI-0285` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 156 | 🚨 | `U+1F6A8` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<div>🚨 Công an Huyện: <strong>0296 3874 113</strong></div>` |
| `EMOJI-0286` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 157 | 🏥 | `U+1F3E5` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<div>🏥 Trung tâm Y Tế: <strong>0296 3874 115</strong></div>` |
| `EMOJI-0287` | `frontend/src/lib/pdfExporter.ts` | **`LibModule: pdfExporter`** | 158 | 🛠️ | `U+1F6E0 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `<div>🛠️ Cứu hộ xe máy: <strong>0296 3771 999</strong></div>` |
| `EMOJI-0288` | `frontend/src/lib/siteConfig.ts` | **`LibModule: siteConfig`** | 7 | 👉 | `U+1F449` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `* 👉 KHI MUA TÊN MIỀN MỚI (ví dụ dulichtriton.vn / dulichtriton.com):` |
| `EMOJI-0289` | `frontend/src/lib/sosPayloadValidator.ts` | **`LibModule: sosPayloadValidator`** | 263 | 🚨 | `U+1F6A8` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `return `### 🚨 ĐƯỜNG DÂY NÓNG CỨU HỘ & KHẨN CẤP TRI TÔN (24/7)` |
| `EMOJI-0290` | `frontend/src/lib/sosPayloadValidator.ts` | **`LibModule: sosPayloadValidator`** | 267 | 📞 | `U+1F4DE` | UI_CONTENT_EMBELLISHMENT | `Phone` | `### 📞 Danh Bạ Trực Ban Khẩn Cấp (Đã Xác Minh Có Nguồn):` |
| `EMOJI-0291` | `frontend/src/lib/sosPayloadValidator.ts` | **`LibModule: sosPayloadValidator`** | 284 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `📍 **Trụ sở Trung tâm Y tế**: Đường 3/2, Khóm 6, Thị trấn Tri Tôn, Tỉnh An Giang.` |
| `EMOJI-0292` | `frontend/src/lib/sosPayloadValidator.ts` | **`LibModule: sosPayloadValidator`** | 285 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `[📍 Mở vị trí TTYT Tri Tôn trên Google Maps](https://www.google.com/maps/search/?api=1&query=Trung+tâ` |
| `EMOJI-0293` | `frontend/src/lib/sosPayloadValidator.ts` | **`LibModule: sosPayloadValidator`** | 287 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 *Lưu ý an toàn: Nếu đang ở các khu vực đèo núi hiểm trở hoặc vùng lõm mất sóng, hãy tìm vị trí cao` |
| `EMOJI-0294` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 30 | 🍗 | `U+1F357` | UI_FILTER_OR_CHIP | `Utensils` | `badgeText = '🍗 Giờ cao điểm ẩm thực Bảy Núi';` |
| `EMOJI-0295` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 34 | 🌇 | `U+1F307` | UI_FILTER_OR_CHIP | `Sunset` | `badgeText = '🌇 Hoàng hôn buông - Giờ vàng chụp ảnh';` |
| `EMOJI-0296` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 38 | 🌙 | `U+1F319` | UI_FILTER_OR_CHIP | `Moon` | `badgeText = '🌙 Chợ đêm & Dạo phố Tri Tôn';` |
| `EMOJI-0297` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 41 | ⚪ | `U+26AA` | UI_FILTER_OR_CHIP | `Sparkles` | `badgeText = '⚪ Đã đóng cửa - Nên đến vào sáng mai';` |
| `EMOJI-0298` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 46 | ☀️ | `U+2600 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sun` | `let seasonText = '☀️ Mùa khô nắng ấm - Thời tiết thuận lợi';` |
| `EMOJI-0299` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 50 | 🌾 | `U+1F33E` | UI_CONTENT_EMBELLISHMENT | `Wheat` | `seasonText = '🌾 Đang mùa lúa chín vàng Tà Pạ';` |
| `EMOJI-0300` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 52 | 🌾 | `U+1F33E` | UI_FILTER_OR_CHIP | `Wheat` | `badgeText = '🌾 Mùa lúa chín vàng - Đẹp nhất trong năm';` |
| `EMOJI-0301` | `frontend/src/lib/timeStatus.ts` | **`LibModule: timeStatus`** | 56 | 🌧️ | `U+1F327 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `seasonText = '🌧️ Mùa mưa Bảy Núi - Cây cối xanh tươi';` |
| `EMOJI-0302` | `frontend/src/lib/ai/config.ts` | **`LibModule: ai.config`** | 61 | 🥇 | `U+1F947` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `'gemini-flash-lite-latest',    // 🥇 Hạn mức Free cao nhất: 1,500 RPD / 30 RPM` |
| `EMOJI-0303` | `frontend/src/lib/ai/config.ts` | **`LibModule: ai.config`** | 62 | 🥈 | `U+1F948` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `'gemini-2.5-flash-lite',       // 🥈 1,500 RPD, phản hồi siêu nhanh <300ms` |
| `EMOJI-0304` | `frontend/src/lib/ai/config.ts` | **`LibModule: ai.config`** | 63 | 🥉 | `U+1F949` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `'gemini-3.1-flash-lite',       // 🥉 Flash Lite thế hệ mới` |
| `EMOJI-0305` | `frontend/src/lib/ai/config.ts` | **`LibModule: ai.config`** | 102 | ⛔ | `U+26D4` | UI_FILTER_OR_CHIP | `Sparkles` | `console.warn(`[AI Circuit Breaker] ⛔ Key '${keyLabel}' placed on ${Math.round(durationMs / 1000)}s c` |
| `EMOJI-0306` | `frontend/src/lib/ai/intentRouter.ts` | **`LibModule: ai.intentRouter`** | 157 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `text += `\n\n[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=${matchedSpot` |
| `EMOJI-0307` | `frontend/src/lib/ai/intentRouter.ts` | **`LibModule: ai.intentRouter`** | 157 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `text += `\n\n[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=${matchedSpot` |
| `EMOJI-0308` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 21 | 🎈 | `U+1F388` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `return `### 🎈 Cẩm Nang Lễ Hội Khinh Khí Cầu & Dù Lượn Thất Sơn (Tri Tôn, An Giang)` |
| `EMOJI-0309` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 34 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps Sân Tà Pạ](https://www.google.com/maps/search/?api=1&query=Sân+Đua+Bò+Tà+Pạ` |
| `EMOJI-0310` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 34 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps Sân Tà Pạ](https://www.google.com/maps/search/?api=1&query=Sân+Đua+Bò+Tà+Pạ` |
| `EMOJI-0311` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 45 | 🌅 | `U+1F305` | UI_CONTENT_EMBELLISHMENT | `Sunrise` | `• 🌅 **06:00 – 08:30 sáng**: Gió êm nhất, khinh khí cầu bay đẹp nhất và dù lượn bắt đầu cất cánh.` |
| `EMOJI-0312` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 46 | 🌤️ | `U+1F324 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `• 🌤️ **15:30 – 17:30 chiều**: Đón gió chiều mát mẻ, xem dù lượn hạ cánh liên tục.` |
| `EMOJI-0313` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 47 | 🌙 | `U+1F319` | UI_CONTENT_EMBELLISHMENT | `Moon` | `• 🌙 **18:30 – 21:00 tối**: Xem Đêm hoa đăng thổi lửa lung linh.` |
| `EMOJI-0314` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 54 | 🐂 | `U+1F402` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `return `### 🐂 Cẩm Nang Lễ Hội Đua Bò Bảy Núi Truyền Thống & Lễ Sêne Đônta` |
| `EMOJI-0315` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 63 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Sân+Đua+Bò+Tri+Tôn+Xã+Núi+` |
| `EMOJI-0316` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 63 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Sân+Đua+Bò+Tri+Tôn+Xã+Núi+` |
| `EMOJI-0317` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 77 | 🛕 | `U+1F6D5` | UI_CONTENT_EMBELLISHMENT | `Landmark` | `return `### 🛕 Các Đại Lễ Hội Phật Giáo & Dân Gian Khmer Tri Tôn` |
| `EMOJI-0318` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 92 | 🍗 | `U+1F357` | UI_CONTENT_EMBELLISHMENT | `Utensils` | `return `### 🍗 Cẩm Nang Gà Đốt Lá Chúc Ô Thum Tri Tôn (Chuẩn Bản Địa 100%)` |
| `EMOJI-0319` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 100 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Thành+Đạt+Ô+Thum+Xã` |
| `EMOJI-0320` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 100 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Thành+Đạt+Ô+Thum+Xã` |
| `EMOJI-0321` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 105 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Siêu+Gà+Đốt+Ô+Thum+Xã` |
| `EMOJI-0322` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 105 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Siêu+Gà+Đốt+Ô+Thum+Xã` |
| `EMOJI-0323` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 110 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Ô+Thum+Kim+Suổl+Xã+` |
| `EMOJI-0324` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 110 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Gà+Đốt+Ô+Thum+Kim+Suổl+Xã+` |
| `EMOJI-0325` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 114 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Kiều+Tiên+Gà+Đốt+Ô+Th` |
| `EMOJI-0326` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 114 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Kiều+Tiên+Gà+Đốt+Ô+Th` |
| `EMOJI-0327` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 125 | 🍲 | `U+1F372` | UI_CONTENT_EMBELLISHMENT | `Soup` | `return `### 🍲 Địa Chỉ & Cẩm Nang Thưởng Thức Cháo Bò Bảy Núi — Tri Tôn` |
| `EMOJI-0328` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 132 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Thủy+Đen+Cầu+` |
| `EMOJI-0329` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 132 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Thủy+Đen+Cầu+` |
| `EMOJI-0330` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 136 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Tư+Xuyên+58+H` |
| `EMOJI-0331` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 136 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Tư+Xuyên+58+H` |
| `EMOJI-0332` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 140 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Dì+Hai+Thị+tr` |
| `EMOJI-0333` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 140 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Quán+Cháo+Bò+Dì+Hai+Thị+tr` |
| `EMOJI-0334` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 150 | 🛕 | `U+1F6D5` | UI_CONTENT_EMBELLISHMENT | `Landmark` | `return `### 🛕 Khám Phá Chùa Xvayton (Wat Xvayton — Chùa Xà Tón)` |
| `EMOJI-0335` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 162 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Chùa+Xvayton+Wat+Xvayton+T` |
| `EMOJI-0336` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 162 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Chùa+Xvayton+Wat+Xvayton+T` |
| `EMOJI-0337` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 164 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 **Lưu ý khi viếng chùa**: Mặc trang phục lịch sự qua gối và có tay, tháo giày dép ngoài thềm Chánh` |
| `EMOJI-0338` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 169 | ⛩️ | `U+26E9 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `return `### ⛩️ Cổng Trời Chùa Koh Kas (Cổng Thời Gian Bảy Núi)` |
| `EMOJI-0339` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 180 | 📍 | `U+1F4CD` | TAG_OR_PRESET | `MapPin` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Cổng+Trời+Chùa+Koh+Kas+Xã+` |
| `EMOJI-0340` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 180 | ▶ | `U+25B6` | TAG_OR_PRESET | `Sparkles` | `[📍 Chỉ đường Google Maps](https://www.google.com/maps/search/?api=1&query=Cổng+Trời+Chùa+Koh+Kas+Xã+` |
| `EMOJI-0341` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 185 | 🗺️ | `U+1F5FA U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Map` | `return `### 🗺️ Gợi Ý Lịch Trình 1 Ngày Khám Phá Tri Tôn Tối Ưu Nhất (Sáng – Trưa – Chiều – Tối)` |
| `EMOJI-0342` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 187 | 🌅 | `U+1F305` | UI_CONTENT_EMBELLISHMENT | `Sunrise` | `### 🌅 Buổi Sáng (06:00 – 11:30): Cảnh Đẹp Đón Nắng & Chùa Tháp Cổ Kính` |
| `EMOJI-0343` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 193 | ☀️ | `U+2600 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sun` | `### ☀️ Buổi Trưa (11:30 – 14:00): Đại Tiệc Ẩm Thực Ven Hồ` |
| `EMOJI-0344` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 196 | 🌤️ | `U+1F324 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `### 🌤️ Buổi Chiều (14:30 – 18:00): Chinh Phục Núi Non & Săn Hoàng Hôn` |
| `EMOJI-0345` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 200 | 🌙 | `U+1F319` | UI_CONTENT_EMBELLISHMENT | `Moon` | `### 🌙 Buổi Tối (18:30 – 21:30): Ẩm Thực Phố & Cà Phê Thư Giãn` |
| `EMOJI-0346` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 207 | 🌤️ | `U+1F324 U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `return `### 🌤️ Dự Báo & Đặc Trưng Thời Tiết Tri Tôn, An Giang` |
| `EMOJI-0347` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 220 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 **Mẹo du lịch bỏ túi**: Khung giờ đẹp nhất để xuất phát tham quan ngoài trời là **06:00 – 08:30 sá` |
| `EMOJI-0348` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 224 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `return `### 📍 Thông Tin & Cẩm Nang Hướng Dẫn Du Lịch Tri Tôn, An Giang` |
| `EMOJI-0349` | `frontend/src/lib/ai/localExpertRag.ts` | **`LibModule: ai.localExpertRag`** | 236 | 💡 | `U+1F4A1` | UI_CONTENT_EMBELLISHMENT | `Lightbulb` | `💡 Bạn hãy gửi thêm câu hỏi chi tiết về bất kỳ địa điểm, quán ăn hay tuyến đường nào để tôi hỗ trợ Bạ` |
| `EMOJI-0350` | `frontend/src/lib/ai/ragEngine.ts` | **`LibModule: ai.ragEngine`** | 500 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `return `* **${p.name}** (Địa phận: ${p.commune}${distText}): Thể loại ${p.category}, Đánh giá: ${p.r` |
| `EMOJI-0351` | `frontend/src/lib/ai/ragEngine.ts` | **`LibModule: ai.ragEngine`** | 500 | ▶ | `U+25B6` | UI_CONTENT_EMBELLISHMENT | `Sparkles` | `return `* **${p.name}** (Địa phận: ${p.commune}${distText}): Thể loại ${p.category}, Đánh giá: ${p.r` |
| `EMOJI-0352` | `frontend/src/lib/ai/ragEngine.ts` | **`LibModule: ai.ragEngine`** | 553 | 🗓️ | `U+1F5D3 U+FE0F` | TAG_OR_PRESET | `Sparkles` | `itinerarySnippet += `\n  🗓️ ${day.title} (Tổng cự ly ngày: ~${day.day_total_distance_km} km):\n`;` |
| `EMOJI-0353` | `frontend/src/lib/ai/spatialRouter.ts` | **`LibModule: ai.spatialRouter`** | 94 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `diagramText: `[📍 ${p.name} (${p.commune})]`,` |
| `EMOJI-0354` | `frontend/src/lib/ai/spatialRouter.ts` | **`LibModule: ai.spatialRouter`** | 171 | 🗺️ | `U+1F5FA U+FE0F` | UI_CONTENT_EMBELLISHMENT | `Map` | `let diagramText = `🗺️ SƠ ĐỒ CUNG ĐƯỜNG KHÉP VÒNG LIÊN HOÀN (TỰ ĐỘNG TỐI ƯU KM):\n`;` |
| `EMOJI-0355` | `frontend/src/lib/ai/spatialRouter.ts` | **`LibModule: ai.spatialRouter`** | 175 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `diagramText += `[📍 Chặng ${i + 1}: ${p.name} (${p.commune})]\n`;` |
| `EMOJI-0356` | `frontend/src/lib/ai/spatialRouter.ts` | **`LibModule: ai.spatialRouter`** | 180 | 📍 | `U+1F4CD` | UI_CONTENT_EMBELLISHMENT | `MapPin` | `diagramText += `[📍 Kết thúc: ${ordered[0].name} / Trung tâm Tri Tôn]\n`;` |
| `EMOJI-0357` | `frontend/src/lib/ai/spatialRouter.ts` | **`LibModule: ai.spatialRouter`** | 185 | 🎯 | `U+1F3AF` | UI_CONTENT_EMBELLISHMENT | `Crosshair` | `diagramText += `\n🎯 TỔNG CỰ LY TOÀN VÒNG: ~${roundedTotalKm} km \| Tổng thời gian di chuyển: ~${total` |
| `EMOJI-0358` | `frontend/src/lib/ai/spatialRouter.ts` | **`LibModule: ai.spatialRouter`** | 194 | ➔ | `U+2794` | STATUS_OR_INDICATOR | `Sparkles` | `contextText += `  ${idx + 1}. ${p.name} (${p.commune}) ➔ Chặng kế tiếp: ~${leg.distanceKm}km (${leg.` |

---

## 3. ĐÁNH GIÁ DESIGN SYSTEM & LỘ TRÌNH THAY THẾ (P06-007)

1. **Tuân thủ Folk-Modern Bảy Núi Design System:** Emoji nguyên bản của hệ điều hành (Apple, Google, Windows) thường có màu sắc rực rỡ không đồng nhất, phá vỡ tông màu đất Trầm Lắng và Xanh Thốt Nốt của bộ nhận diện thương hiệu Du Lịch Tri Tôn.
2. **Đề xuất cho Task P06-007:** Thay thế tuần tự 1 emoji tại component giao diện chính (ví dụ tab Audience Filter trong Trang chủ hoặc Icon trong Cụm thắng cảnh) bằng Lucide SVG Icon với styling Tailwind chính xác (`w-4 h-4 text-[#0E8C7F]`), đảm bảo component render đúng và không phát sinh asset placeholder.

---

## 4. CHỮ KÝ XÁC NHẬN KIỂM TOÁN (AUDIT SIGN-OFF)

- **Chủ trì kiểm toán:** Chăm Rốch Thi
- **Chức danh:** Lead Technical Architect & Design System Owner
- **Mã xác thực bản ghi:** `INVENTORY-EMOJI-001-1791165059`
- **Trạng thái:** `VERIFIED & SIGNED`
