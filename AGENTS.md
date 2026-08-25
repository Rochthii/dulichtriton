# AGENTS.md — Tri Tôn Tourism Chatbot AI System

Hệ thống Trợ lý Du Lịch Tri Tôn AI bản địa | 149 Địa điểm xác minh | 15 Xã & Thị trấn.

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
- **Standard Skill**: [`.agents/skills/triton_workflow_execution_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_workflow_execution_standard/SKILL.md)
- **Bilingual i18n Skill**: [`.agents/skills/triton_bilingual_i18n_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_bilingual_i18n_standard/SKILL.md)
- **File Management & Maintenance Skill**: [`.agents/skills/triton_codebase_file_management_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_codebase_file_management_standard/SKILL.md)
- **Zalo Integration Skill**: [`.agents/skills/triton_zalo_ecosystem_integration/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_zalo_ecosystem_integration/SKILL.md)
- **Zalo Strategy Doc**: [`docs/ZALO_ECOSYSTEM_INTEGRATION_STRATEGY.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/inject_dynamic_context/docs/ZALO_ECOSYSTEM_INTEGRATION_STRATEGY.md)
- **Smart Delta Sync Protocol**: [`.agents/skills/triton_workflow_execution_standard/references/smart_delta_sync_protocol.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/inject_dynamic_context/.agents/skills/triton_workflow_execution_standard/references/smart_delta_sync_protocol.md)
- **PowerShell Rule**: Tuyệt đối **KHÔNG dùng `&&`**, BẮT BUỘC **dùng dấu chấm phẩy `;`** khi nối chuỗi lệnh trên Windows PowerShell.
