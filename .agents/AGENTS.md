# AGENTS.md — Quy Chuẩn Vibe Coding & Giao Tiếp Hệ Thống

## 📜 5 Quy Tắc Bắt Buộc (Rules Directory):
- [RULE 01: Production Real, No Mock](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/01_production_real_no_mock.md)
- [RULE 02: Địa Giới Hành Chính Xã/Thị Trấn](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/02_vietnamese_geography_boundary.md)
- [RULE 03: Bảo Mật Môi Trường & 0% Hardcode](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/03_security_env_credentials.md)
- [RULE 04: Phản Biện 360 Độ & Chủ Động Hỏi Lại](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/04_critique_360_proactive_inquiry.md)
- [RULE 05: Chuẩn Xác Văn Hóa & Ẩm Thực](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/refresh_app_context/.agents/rules/05_culinary_cultural_accuracy.md)

## 💬 Format Phản Hồi Bắt Buộc 4 Phần:
1. `[TÓM TẮT KẾT QUẢ / THỰC HIỆN]` (2-3 câu ngắn gọn)
2. `[BÁO CÁO CÓ CẤU TRÚC / DỮ LIỆU / CODE]` (Bảng phân tích, code diff, dữ liệu)
3. `[LIÊN KẾT & CONTEXT LIÊN QUAN]` (Link file:///, commit)
4. `[HỎI & GỢI Ý BƯỚC TIẾP THEO]` (Luôn đặt 2-3 câu hỏi gợi ý)

## 🛠️ Danh Mục Kỹ Năng Hệ Thống (Standard Skills):
- **Workflow Standard Skill**: [`.agents/skills/triton_workflow_execution_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_workflow_execution_standard/SKILL.md)
- **Bilingual i18n Standard Skill**: [`.agents/skills/triton_bilingual_i18n_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_bilingual_i18n_standard/SKILL.md)
- **File Management & Maintenance Skill**: [`.agents/skills/triton_codebase_file_management_standard/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_codebase_file_management_standard/SKILL.md)
- **Zalo Integration Skill**: [`.agents/skills/triton_zalo_ecosystem_integration/SKILL.md`](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/skills/triton_zalo_ecosystem_integration/SKILL.md)

## ⚡ Tiêu Chuẩn Đồng Bộ Database (Smart Delta Sync Protocol):
- Mọi chỉnh sửa dữ liệu Master **bắt buộc phải push ngay lên Supabase PostgreSQL**.
- **Tuyệt đối cấm ghi đè mù quáng**: Phải chạy qua `scripts/sync/smart_delta_sync.js` để chỉ PATCH những trường/bản ghi thay đổi, bỏ qua 100% bản ghi đã khớp.

## 💻 Quy Chuẩn Chạy Lệnh PowerShell (Windows Shell Rule):
- **Tuyệt đối KHÔNG dùng `&&`**: PowerShell trên Windows sẽ báo lỗi cú pháp `ParserError`.
- **BẮT BUỘC chỉ dùng dấu chấm phẩy `;`**: Khi nối chuỗi nhiều lệnh, phải viết dạng `git add . ; git commit -m "..." ; git push origin ...`.
