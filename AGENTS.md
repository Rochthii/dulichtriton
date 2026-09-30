# AGENTS.md — Tri Tôn Tourism Chatbot AI System

Hệ thống Trợ lý Du Lịch Tri Tôn AI bản địa.

> **Claim guardrail:** số lượng POI canonical, địa giới hành chính và trạng thái production chưa được suy diễn từ tài liệu cũ. Chỉ [Current State Audit](docs/technical-spec/CURRENT_STATE_AUDIT.md), Decision Gates và canonical manifest đã phê duyệt mới được quyền xác nhận chúng.

## Evidence Operating Model

- Trục trách nhiệm của hệ thống: chỉ cung cấp thông tin du lịch/SOS có nguồn và trạng thái xác minh rõ ràng; không để request không được ủy quyền làm thay đổi dữ liệu, tri thức AI hoặc cấu hình.
- Trước khi làm việc, đọc [ACTIVE_TASK.md](ACTIVE_TASK.md), sau đó [Execution Board](docs/13_TWO_STREAM_EXECUTION_BOARD.md), rồi chỉ đọc dependency trực tiếp của task.
- Phân biệt tuyệt đối `DESIGNED`, `PLANNED`, `IMPLEMENTED`, `VERIFIED`, `DISPUTED` và `RETIRED`. Code tồn tại hoặc build pass không đủ để dùng nhãn `VERIFIED`.
- Mọi thay đổi rủi ro cao phải nêu business effect và negative test: không chỉ “API trả 403”, mà phải chứng minh không có persistent mutation ở bảng, storage, cache, audit log hoặc external side effect liên quan.
- Ưu tiên enforcement point hội tụ (server-side guard, RLS, shared fetch validator, canonical ingest gate) thay vì blacklist UI/endpoint. Threat model phải xét bypass qua nhiều request hoặc nhiều boundary.
- Sau một task có thay đổi thực chất, cập nhật evidence phù hợp: task board, evaluation matrix, changelog và tài liệu kiến trúc/claim chịu tác động. Không cập nhật claim khi chưa có bằng chứng.
- Mỗi task phải ghi luồng `A` hoặc `B`, AI route đề xuất, AI thực dùng và evidence tại completion record. Chọn theo [Model Routing](docs/technical-spec/MODEL_ROUTING.md), không dùng model mạnh nhất theo mặc định.
- Luồng session do người dùng chọn trong mục `Session focus` của [ACTIVE_TASK.md](ACTIVE_TASK.md) là chỉ thị hiện hành; task khẩn hoặc completion history của luồng kia không tự chuyển hướng session.
- Khi bàn giao sau mỗi task, dùng format gọn trong [Task Completion Handoff](.agents/skills/task-completion-handoff/SKILL.md): đã làm, kiểm chứng, blocker nếu có, task tiếp theo và AI route; không thêm câu hỏi xã giao.

## 📜 5 Quy Tắc Bắt Buộc (Rules Directory):
- [RULE 01: Production Real, No Mock](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/01_production_real_no_mock.md)
- [RULE 02: Địa Giới Hành Chính Xã/Thị Trấn](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/02_vietnamese_geography_boundary.md)
- [RULE 03: Bảo Mật Môi Trường & 0% Hardcode](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/03_security_env_credentials.md)
- [RULE 04: Phản Biện 360 Độ & Chủ Động Hỏi Lại](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/04_critique_360_proactive_inquiry.md)
- [RULE 05: Chuẩn Xác Văn Hóa & Ẩm Thực](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/05_culinary_cultural_accuracy.md)

## 🛠️ Kiến Trúc & Tài Liệu Kỹ Thuật (Architecture & Tech Stack):
- **Tech Stack**: Next.js 16 (React 19) | Supabase PostgreSQL + PostGIS + pgvector | Groq + Gemini + OpenRouter
- **Master Data**: `data/tri_ton_master_cleaned.csv` (149 bản ghi đã xác minh 100%)
- **Changelog**: [`CHANGELOG.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/critique_chatbot_architecture_performance/CHANGELOG.md)
- **Standard Skill**: [`.agents/skills/triton_workflow_execution_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/critique_chatbot_architecture_performance/.agents/skills/triton_workflow_execution_standard/SKILL.md)
- **Smart Delta Sync Protocol**: [`.agents/skills/triton_workflow_execution_standard/references/smart_delta_sync_protocol.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/critique_chatbot_architecture_performance/.agents/skills/triton_workflow_execution_standard/references/smart_delta_sync_protocol.md)
- **PowerShell Rule**: Tuyệt đối **KHÔNG dùng `&&`**, BẮT BUỘC **dùng dấu chấm phẩy `;`** khi nối chuỗi lệnh trên Windows PowerShell.
