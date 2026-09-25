# THREAT MODEL

## Assets cần bảo vệ

- Master POI, itinerary, video, knowledge base, golden answer, system config và semantic cache.
- Lịch sử chat, session identifier, audit log.
- Service-role credential, provider keys, Cloudinary credential/preset.
- Tính đúng của SOS, địa giới, giờ mở cửa, giá và thông tin văn hóa.

## Trust boundaries

```text
Browser → Next public/admin API → Supabase/RLS
                           ├→ URL fetch / Cloudinary
                           └→ AI providers / RAG
Local master files → Smart Delta Sync → Supabase → static/UI/RAG
```

## Threat cases ưu tiên

| ID | Attack path | Persistent business effect cần chặn | Control target |
|---|---|---|---|
| TM-01 | Cookie giả hoặc direct POST vào admin route | POI/knowledge/config bị đổi | Server guard và RLS |
| TM-02 | Bỏ qua UI rồi gọi service-role route | Mutation thành công dù không có role | Fail-closed server client + authorization |
| TM-03 | URL nội bộ hoặc redirect chain vào scraper | Server fetch metadata/private service | URL/DNS/IP/redirect validator |
| TM-04 | Ghi golden answer/cache/KB rồi gửi prompt khác | AI trả fact bị đầu độc | RLS + provenance + verified retrieval |
| TM-05 | Đoán hoặc thay session ID qua nhiều request | Lộ chat history hoặc ghi lẫn session | Server-issued ID + ownership policy |
| TM-06 | Sửa file master, sync partial fail, vẫn báo success | DB/static/RAG divergence | Dry-run, response check, manifest comparison |
| TM-07 | Data cũ/claim mâu thuẫn được gắn verified | Du khách hành động theo SOS/POI sai | Source/expiry/reviewer gate |

## Quy tắc bypass hai bước

Mỗi control phải test ít nhất một chain nhiều request khi phù hợp: ví dụ request 1 tạo poisoned cache, request 2 hỏi chatbot; hoặc request 1 tạo session, request 2 đổi session ID; hoặc request 1 URL hợp lệ, request 2 redirect sang private host.

Không đánh giá control chỉ bằng direct endpoint happy path.
