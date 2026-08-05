QUY TẮC VIBE CODING

1. Khi bắt đầu cuộc trò chuyện mới, phải đọc và nắm toàn bộ bối cảnh dự án liên quan trước khi trả lời.

2. Trước mọi hành động nâng cấp, cải thiện hay sửa lỗi, phải phân tích nguyên nhân và lập kế hoạch thực hiện rõ ràng.

3. Chỉ biên dịch hoặc chạy chương trình khi đã có giả thuyết kỹ thuật cụ thể để kiểm chứng, không thử ngẫu nhiên.

4. Tuân thủ yêu cầu của người dùng, trừ trường hợp yêu cầu mâu thuẫn logic, sai bản chất kỹ thuật hoặc gây lỗi nghiêm trọng.

5. Ưu tiên hiệu quả, chính xác và tập trung vào mục tiêu, không lan man.

6. Thực hiện công việc đúng theo kế hoạch đã thống nhất; nếu cần thay đổi, phải nêu rõ lý do.

7. Khi được yêu cầu báo cáo, phải trình bày bằng tiếng Việt, rõ ràng, có cấu trúc.



GLOBAL RULE: THIS IS A PRODUCTION-REAL SYSTEM. NO DEMO LOGIC IS ALLOWED.

All buttons, screens, APIs, services, and workflows in this system
MUST perform real actions with real data and real side effects.

ABSOLUTE REQUIREMENTS:

1. No Mock / No Fake / No Placeholder
   - No demo buttons.
   - No hard-coded responses.
   - No fake success messages.
   - No simulated flows.
   - No TODO logic left in production paths.

2. Every UI Action Must Map to a Real Backend Operation
   - Every button → calls a real API.
   - Every form submit → writes to database.
   - Every approval → changes real system state.
   - Every configuration change → persists and affects runtime behavior.

3. Data Integrity Is Mandatory
   - All data must be stored, validated, and retrievable.
   - Transactions must be atomic.
   - Failures must rollback state correctly.
   - No silent failures.

4. Permissions Are Enforced in Code, Not UI
   - RBAC must be validated server-side.
   - UI hiding is NOT considered security.
   - Unauthorized actions must be rejected by backend.

5. Auditability Is Required
   - Every critical action must generate audit logs:
     • Who
     • Did what
     • When
     • From where
   - Logs must be immutable.

6. Admin Actions Are REAL AND DANGEROUS
   - Backup = real backup
   - Restore = real restore
   - Lock user = real lock
   - Config change = real system behavior change
   - No “preview-only” admin features

7. Error Handling Must Reflect Reality
   - Show real error causes.
   - No fake success when backend fails.
   - No bypassing validations for convenience.

8. This System Is Designed For:
   - Long-term institutional use
   - Legal, academic, and monastic accountability
   - Real people, real data, real consequences

FINAL RULE:
If a feature cannot be implemented fully and safely,
IT MUST NOT EXIST IN THE UI.


# VIBE CODING & AGENT COMMUNICATION CONTRACT

[FORMAT_PHẢN_HỒI_BẮT_BUỘC]
Mọi câu trả lời của AI dành cho User trong quá trình Vibe Coding PHẢI tuân theo đúng 4 phần sau:

1. [TÓM TẮT KẾT QUẢ / THỰC HIỆN]
   - Ngắn gọn 2-3 câu bằng tiếng Việt.
   - Báo cáo rõ đã làm xong gì hoặc phân tích nguyên nhân/giả thuyết kỹ thuật ngắn gọn.

2. [BÁO CÁO CÓ CẤU TRÚC / DỮ LIỆU / CODE]
   - Bảng / Bullets / File diffs / Danh sách dữ liệu / Báo cáo kỹ thuật rõ ràng.

3. [LIÊN KẾT & CONTEXT LIÊN QUAN]
   - Link file đã sửa, đường dẫn `file:///...`, video TikTok/YouTube hoặc kết quả lệnh verification.

4. [HỎI & GỢI Ý BƯỚC TIẾP THEO]
   - Luôn luôn đặt 2-3 câu hỏi gợi ý hành động, ý tưởng thiết kế hoặc giải pháp kỹ thuật tiếp theo để User chọn.
