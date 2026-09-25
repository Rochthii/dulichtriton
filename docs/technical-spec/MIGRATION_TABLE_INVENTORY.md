# Migration → table inventory

> Luồng B · P02-002 · Snapshot checkout ngày 2026-09-24
> Trạng thái: `IMPLEMENTED` — kiểm kê source migration; không xác nhận migration đã replay hoặc schema live.

## Phạm vi

Đã rà 21 file `*.sql` hiện có trong `supabase/migrations/` và các khai báo `CREATE TABLE`. Có 12 câu lệnh tạo bảng trong 11 file; tất cả dùng `CREATE TABLE IF NOT EXISTS`.

| Bảng được khai báo tạo | Migration và dòng | Ghi chú source |
|---|---|---|
| `public.system_config` | [`20260808_create_system_config.sql:8`](../../supabase/migrations/20260808_create_system_config.sql#L8) | Phân biệt với bảng số nhiều `system_configs`. |
| `public.video_discoveries` | [`20260808_create_video_discoveries.sql:9`](../../supabase/migrations/20260808_create_video_discoveries.sql#L9) | Có các migration sau đó `ALTER TABLE`/bổ sung constraint. |
| `public.audit_logs` | [`20260809_create_audit_logs.sql:2`](../../supabase/migrations/20260809_create_audit_logs.sql#L2) | |
| `public.chat_logs` | [`20260809_create_chat_logs.sql:2`](../../supabase/migrations/20260809_create_chat_logs.sql#L2) | |
| `public.chat_sessions` | [`20260809_create_chat_sessions.sql:2`](../../supabase/migrations/20260809_create_chat_sessions.sql#L2) | |
| `public.golden_answers` | [`20260809_create_golden_answers.sql:8`](../../supabase/migrations/20260809_create_golden_answers.sql#L8) | |
| `public.eval_cases` | [`20260809_seed_eval_cases.sql:4`](../../supabase/migrations/20260809_seed_eval_cases.sql#L4) | Cùng file với `eval_runs`. |
| `public.eval_runs` | [`20260809_seed_eval_cases.sql:16`](../../supabase/migrations/20260809_seed_eval_cases.sql#L16) | |
| `public.semantic_chat_cache` | [`20260810_semantic_cache.sql:10`](../../supabase/migrations/20260810_semantic_cache.sql#L10) | |
| `public.system_configs` | [`20260810_system_configs.sql:6`](../../supabase/migrations/20260810_system_configs.sql#L6) | Bảng riêng, không đồng nhất với `system_config`. |
| `public.knowledge_base` | [`20260811_create_knowledge_base.sql:8`](../../supabase/migrations/20260811_create_knowledge_base.sql#L8) | Bảng riêng với `custom_knowledge_base`. |
| `public.custom_knowledge_base` | [`20260817_create_custom_knowledge_base.sql:4`](../../supabase/migrations/20260817_create_custom_knowledge_base.sql#L4) | |

## Route inventory đối chiếu với migration chain

[Production route data inventory](PRODUCTION_ROUTE_DATA_INVENTORY.md) tham chiếu `places`, `admin_users`, `preset_itineraries`, `videos`, `feedbacks` và `conversations`. Không thấy câu lệnh `CREATE TABLE` cho các bảng này trong 21 migration file của snapshot. Riêng `places` và `admin_users` có migration dùng `ALTER TABLE`, nhưng đó không phải baseline tạo bảng.

Ý nghĩa giới hạn: đây là khoảng trống trong chain đang kiểm tra, không chứng minh các bảng không tồn tại trên Supabase hoặc chưa được tạo bằng nguồn khác. Cần P02-003 trở đi và fresh replay proof để xác định khả năng dựng database mới.

## Giới hạn bằng chứng

- Chỉ kiểm kê khai báo tĩnh trong checkout ngày nêu trên; không chạy migration, kết nối Supabase, hoặc xác minh migration history/schema live.
- `IF NOT EXISTS` mô tả hành vi khi chạy migration trên DB không có bảng, không chứng minh lệnh đã chạy thành công.
- `ALTER TABLE`/constraint trên bảng có sẵn không được tính là khai báo tạo bảng.
- Không suy diễn production state từ tên migration, code tồn tại hay route đang tham chiếu bảng.
