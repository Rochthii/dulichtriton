# P02-001 — Production route → Supabase inventory

> Luồng B · W0 · Snapshot source: checkout hiện tại ngày 2026-09-24  
> Trạng thái: `IMPLEMENTED` — source inventory hoàn tất. Đây là bằng chứng về tham chiếu trong source, không chứng minh route đã được deploy hoặc chạy trên production.

## Phạm vi và cách đọc

- Đã rà 33 Next.js `route.ts` dưới `frontend/src/app/api/**`, method export, lời gọi `.from()`/`.rpc()` và helper được route import trực tiếp (`dataCache`, `aiProvider`).
- G0 xác nhận website public ở Vercel; Vercel dashboard/deployed commit chưa được kiểm tra. Vì vậy các dòng dưới là **production-intended source paths**, không phải request trace từ runtime.
- Python backend/core không đưa vào inventory production vì [Current State Audit](CURRENT_STATE_AUDIT.md) chưa có deployment evidence cho runtime đó.
- Method/table mapping là từ code gọi Supabase. Không suy ra bảng nội bộ bên dưới RPC; cần đối chiếu migration/function definitions ở P02-002 và task sau.

## API handlers truy cập Supabase

| Route + method | Table / RPC tham chiếu | Thao tác quan sát trong source | Evidence |
|---|---|---|---|
| `GET /api/v1/food`, `GET /api/v1/stays`, `GET /api/v1/culture` | `places` | Đọc qua cache helper; có fallback local POI JSON khi Supabase lỗi/rỗng | [food](../../frontend/src/app/api/v1/food/route.ts#L7), [stays](../../frontend/src/app/api/v1/stays/route.ts#L7), [culture](../../frontend/src/app/api/v1/culture/route.ts#L7), [dataCache](../../frontend/src/lib/dataCache.ts#L64) |
| `GET /api/v1/videos/triton` | `video_discoveries` | Đọc qua cache helper, lọc/sắp xếp video | [route](../../frontend/src/app/api/v1/videos/triton/route.ts#L7), [dataCache](../../frontend/src/lib/dataCache.ts#L230) |
| `GET /api/v1/videos/trending` | `videos` | Đọc danh sách trending | [route](../../frontend/src/app/api/v1/videos/trending/route.ts#L11) |
| `GET /api/v1/videos` | `video_discoveries` | Đọc; có truy vấn fallback theo location khi kết quả rỗng | [route](../../frontend/src/app/api/v1/videos/route.ts#L10) |
| `GET /api/v1/search` | `places` | Đọc tìm kiếm; source còn có fallback local master JSON | [route](../../frontend/src/app/api/v1/search/route.ts#L52) |
| `GET /api/v1/places/[id]/videos` | `video_discoveries` | Đọc video theo POI | [route](../../frontend/src/app/api/v1/places/[id]/videos/route.ts#L11) |
| `POST /api/v1/chat/stream` | `conversations`, `chat_logs` | Đọc/ghi lịch sử hội thoại; ghi chat log fire-and-forget | [route](../../frontend/src/app/api/v1/chat/stream/route.ts#L43) |
| `POST /api/v1/chat/query` | `chat_sessions`, `chat_logs`, `video_discoveries`, `places`; RPC `match_golden`, `match_places`, `match_kb`, `match_places_nearby` | Đọc/ghi session và log; truy vấn video/POI; gọi các retrieval RPC có điều kiện | [route](../../frontend/src/app/api/v1/chat/query/route.ts#L174), [retrieval calls](../../frontend/src/app/api/v1/chat/query/route.ts#L352) |
| `GET /api/v1/chat/itinerary` | `places`, `preset_itineraries` | Đọc POI và itinerary; một số nhánh fallback từ JSON/file | [route](../../frontend/src/app/api/v1/chat/itinerary/route.ts#L69), [itinerary query](../../frontend/src/app/api/v1/chat/itinerary/route.ts#L214) |
| `GET /api/v1/feedback` | `feedbacks` | Đọc count | [route](../../frontend/src/app/api/v1/feedback/route.ts#L122) |
| `POST /api/v1/feedback` | `feedbacks`, `audit_logs` | Ghi feedback; ghi audit event | [route](../../frontend/src/app/api/v1/feedback/route.ts#L66) |
| `GET /api/v1/admin/feedback`, `POST /api/v1/admin/feedback`, `PATCH /api/v1/admin/feedback` | `audit_logs` | Đọc, thêm, rồi đọc/cập nhật correction log | [route](../../frontend/src/app/api/v1/admin/feedback/route.ts#L11) |
| `GET /api/v1/admin/feedbacks`, `PATCH /api/v1/admin/feedbacks` | `feedbacks` | Đọc danh sách; cập nhật status/metadata | [route](../../frontend/src/app/api/v1/admin/feedbacks/route.ts#L6) |
| `GET /api/v1/admin/audit-logs` | `audit_logs` | Đọc log | [route](../../frontend/src/app/api/v1/admin/audit-logs/route.ts#L10) |
| `POST /api/v1/admin/auth/login` | `admin_users`, `audit_logs` | Đọc user; ghi audit log cho login thành công/thất bại | [route](../../frontend/src/app/api/v1/admin/auth/login/route.ts#L10) |
| `GET /api/v1/admin/ai-metrics` | `semantic_chat_cache`, `chat_logs` | Đọc hit count/latency metrics | [route](../../frontend/src/app/api/v1/admin/ai-metrics/route.ts#L11) |
| `GET /api/v1/admin/stats` | `places`, `video_discoveries`, `chat_logs`, `feedbacks`, `audit_logs` | Đọc count, recent logs và POI summary | [route](../../frontend/src/app/api/v1/admin/stats/route.ts#L10) |
| `GET /api/v1/admin/places` | `places` | Đọc danh sách | [route](../../frontend/src/app/api/v1/admin/places/route.ts#L48) |
| `POST`, `PATCH`, `DELETE /api/v1/admin/places` | `places`, `audit_logs` | Insert/update/deactivate POI; ghi audit log | [route](../../frontend/src/app/api/v1/admin/places/route.ts#L123) |
| `POST /api/v1/admin/gmaps-scraper` | `places` | Chỉ update khi `autoSync=true` và có `placeId`; trước đó fetch dữ liệu bên ngoài | [route](../../frontend/src/app/api/v1/admin/gmaps-scraper/route.ts#L13) |
| `POST /api/v1/admin/scrape-images` | `places` | Đọc ảnh hiện có để loại trùng; không thấy write DB trong handler | [route](../../frontend/src/app/api/v1/admin/scrape-images/route.ts#L57) |
| `GET /api/v1/admin/itineraries` | `preset_itineraries` | Đọc danh sách | [route](../../frontend/src/app/api/v1/admin/itineraries/route.ts#L43) |
| `POST`, `PATCH`, `DELETE /api/v1/admin/itineraries` | `preset_itineraries`, `audit_logs` | Insert/update/delete itinerary; ghi audit log | [route](../../frontend/src/app/api/v1/admin/itineraries/route.ts#L91) |
| `GET /api/v1/admin/videos` | `video_discoveries` | Đọc danh sách | [route](../../frontend/src/app/api/v1/admin/videos/route.ts#L23) |
| `POST`, `PATCH`, `DELETE /api/v1/admin/videos` | `video_discoveries`, `audit_logs` | Insert/update/delete video; ghi audit log | [route](../../frontend/src/app/api/v1/admin/videos/route.ts#L50) |
| `POST /api/v1/admin/videos/ai-scan` | `video_discoveries`, `audit_logs` | Upsert video scan results; ghi audit log | [route](../../frontend/src/app/api/v1/admin/videos/ai-scan/route.ts#L76) |
| `GET /api/v1/admin/knowledge-base` | `custom_knowledge_base` | Đọc knowledge records | [route](../../frontend/src/app/api/v1/admin/knowledge-base/route.ts#L22) |
| `POST /api/v1/admin/knowledge-base` | `custom_knowledge_base`, `audit_logs` | Insert knowledge record; ghi audit log | [route](../../frontend/src/app/api/v1/admin/knowledge-base/route.ts#L66) |
| `PUT`, `DELETE /api/v1/admin/knowledge-base/[id]` | `custom_knowledge_base`, `audit_logs` | Update/delete record; ghi audit log | [route](../../frontend/src/app/api/v1/admin/knowledge-base/[id]/route.ts#L9) |

## API handlers không tham chiếu bảng/RPC trong source

| Route + method | Quan sát |
|---|---|
| `GET /api/v1/llms-context` | Đọc context từ source/local content; không thấy Supabase call. |
| `GET /api/v1/videos/oembed` | Gọi nguồn oEmbed bên ngoài; không thấy Supabase call. |
| `POST /api/v1/chat/ping` | Gửi prewarm request tới Groq; không thấy Supabase call. |
| `GET /api/v1/chat/query` | Trả trạng thái service; DB work nằm ở `POST` cùng route. |
| `GET /api/v1/admin/auth/me`, `POST /api/v1/admin/auth/logout` | Đọc/xóa cookie; không thấy DB call. |
| `POST /api/v1/admin/revalidate` | Invalidate server/data cache; không query DB. Đây vẫn là side effect cache. |
| `POST /api/v1/admin/upload` | Upload Cloudinary; không ghi Supabase trong handler. Đây là external write. |

## Supabase trực tiếp từ page/component

Các đường sau không phải API handler nên được tách riêng; chúng vẫn là production client access và cần được xét trong RLS inventory:

| Page/component | Table | Evidence |
|---|---|---|
| `/` và `/places` | `places` | [home page](../../frontend/src/app/page.tsx#L273), [places page](../../frontend/src/app/places/page.tsx#L128) |
| `/map` và `/places/[id]` | `places` qua `lib/places` | [map page](../../frontend/src/app/map/page.tsx#L3), [place page](../../frontend/src/app/places/[id]/page.tsx#L3), [places helper](../../frontend/src/lib/places.ts#L34) |
| `/admin/chat-logs` | `chat_logs` | [page](../../frontend/src/app/admin/chat-logs/page.tsx#L44) |
| UI components: `HotPlacesSection`, `GoldenTimeWidget`, `MiniGisMapBanner`, `ItineraryClientPage`, `PlaceDetailClient` | `places` | [HotPlacesSection](../../frontend/src/components/HotPlacesSection.tsx#L48), [GoldenTimeWidget](../../frontend/src/components/GoldenTimeWidget.tsx#L50), [MiniGisMapBanner](../../frontend/src/components/MiniGisMapBanner.tsx#L25), [ItineraryClientPage](../../frontend/src/components/ItineraryClientPage.tsx#L114), [PlaceDetailClient](../../frontend/src/components/PlaceDetailClient.tsx#L47) |
| UI components: `AdminClientPage`, `FoodClientPage`, `StayClientPage`, `PlaceDetailClient`, `PartnerClientPage` | `audit_logs` | Direct client reads/inserts; see [AdminClientPage](../../frontend/src/components/AdminClientPage.tsx#L33), [FoodClientPage](../../frontend/src/components/FoodClientPage.tsx#L77), [StayClientPage](../../frontend/src/components/StayClientPage.tsx#L81), [PlaceDetailClient](../../frontend/src/components/PlaceDetailClient.tsx#L330), [PartnerClientPage](../../frontend/src/components/PartnerClientPage.tsx#L39) |

## Phát hiện về coverage

- API/admin `feedback` dùng `audit_logs` làm correction queue; API/admin `feedbacks` dùng bảng `feedbacks`. Đây là hai luồng dữ liệu khác nhau trong source.
- `GET /api/v1/videos/trending` tham chiếu `videos`, còn các endpoint video khác chủ yếu dùng `video_discoveries`; không gộp hai tên thành một bảng.
- `dataCache` có local JSON fallback cho POI; các route dùng helper không phải lúc nào cũng cần Supabase thành công để trả response.
- `system_configs` và helper `lookupSemanticCache`/`storeSemanticCache` có query trong thư viện nhưng không tìm thấy callsite từ 33 API handler trong snapshot này. `semantic_chat_cache` vẫn được query bởi admin metrics.
- Không kiểm tra schema tồn tại, grants/RLS, runtime traffic, deployed commit hoặc kết quả query. Các phần đó không thuộc P02-001.
- Không sửa code, gọi production DB, chạy sync hoặc thay policy; Luồng A files/code không được chỉnh.
