---
name: triton-stream-b-db-governance
description: Quản lý chuyên biệt cho Session Luồng B (Database Migrations, RLS Lockdown, Master Data Governance, PostGIS & Canonical Sync). Dùng để cô lập phạm vi database và dữ liệu, ngăn chặn xung đột với Luồng A.
---

# Triton Stream B: Database & Data Governance Protocol

Tài liệu quy chuẩn độc quyền dành cho **Session Luồng B**. Luồng này chịu trách nhiệm thiết lập nền móng dữ liệu bất biến, khóa chặt các chính sách Row Level Security (RLS), xây dựng chuỗi migration tái lập được và quản trị nguồn chân lý Master Data du lịch Tri Tôn.

---

## 1. Ranh Giới File Nghiêm Ngặt (Directory Boundary)

Để tuyệt đối không giẫm chân hoặc gây conflict với Luồng A:

* **PHẠM VI ĐƯỢC PHÉP SỬA:**
  * `supabase/migrations/...` (DDL, RLS policies, table grants, extensions)
  * `supabase/tests/...` (Bộ kiểm thử SQL boundary trên PostgreSQL fixture)
  * `data/...` (Canonical datasets, cleaned CSV/JSON, GeoJSON WGS84)
  * `docs/technical-spec/...` (Decision Records G0-G3, Migration Inventory, Data Audits)
  * `scripts/sync/...` (Smart Delta Sync protocol & sync scripts)

* **VÙNG CẤM TUYỆT ĐỐI (DO NOT TOUCH):**
  * `frontend/src/...` *(Toàn bộ mã nguồn Next.js/React thuộc quyền Luồng A)*
  * `frontend/scripts/...` *(Test script của Luồng A)*
  * `frontend/src/middleware.ts` *(Edge guard thuộc quyền Luồng A)*

---

## 2. Quy Trình Vận Hành Task Nguyên Tử (Atomic Workflow)

1. **Đọc ngữ cảnh tối thiểu:**
   * Đọc trực tiếp [ACTIVE_TASK_B.md](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/provide_context/ACTIVE_TASK_B.md) để lấy task active hiện hành và acceptance criteria.
   * Đối chiếu với hàng tương ứng trong [13_TWO_STREAM_EXECUTION_BOARD.md](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/provide_context/docs/13_TWO_STREAM_EXECUTION_BOARD.md) và [12_PRODUCTION_REMEDIATION_PLAN.md](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/provide_context/docs/12_PRODUCTION_REMEDIATION_PLAN.md).
   * Đọc spec liên quan: [SECURITY_INVARIANTS.md](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/provide_context/docs/technical-spec/SECURITY_INVARIANTS.md) và [THREAT_MODEL.md](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/provide_context/docs/technical-spec/THREAT_MODEL.md).

2. **Nguyên tắc "Local-First & Negative Proof":**
   * Mọi chính sách RLS và thu hồi quyền (`REVOKE`) phải được viết kèm file kiểm thử SQL trong `supabase/tests/`.
   * Kiểm thử trên PostgreSQL 15 fixture: chứng minh role `anon` bị lỗi `insufficient_privilege`, dữ liệu nguyên vẹn không bị ghi lén và re-grant negative control bị test bắt.
   * **CẤM áp migration live lên Supabase Cloud** trước khi Luồng A có authorized path và đã test tích hợp.

3. **Cập nhật `ACTIVE_TASK_B.md`:**
   * **Cập nhật độc quyền tại `ACTIVE_TASK_B.md`**. Tuyệt đối không chạm vào `ACTIVE_TASK_A.md` của Luồng A.
   * Ghi rõ: `Task`, `Luồng: B`, `AI route đề xuất`, `AI thực dùng`, `Evidence` (file test SQL + kết quả assertion), và `Next task`.

---

## 3. Hợp Đồng Tương Thích Với Luồng A (Dependency Contract)

* **Quy tắc bảo vệ người dùng thật (Do No Harm):** Khi khóa quyền truy cập bảng nhạy cảm (như `chat_sessions`, `chat_logs`, `audit_logs`), trạng thái chỉ được chuyển sang `VERIFIED (local boundary only)`. Chỉ khi nào Luồng A xác nhận đã hoàn tất route server-side và kiểm thử đầu cuối thành công, hai luồng mới phối hợp áp migration lên production database.

---

## 4. Lộ Trình Task Hiện Tại Của Luồng B

* **Task Active:** `P02-017` — Thu hồi quyền `anon INSERT` trên bảng `audit_logs` (ngăn chặn kẻ xấu giả mạo nhật ký audit).
* **Task Liền Kề:**
  * `P02-018` — Thu hồi quyền `anon SELECT` trên bảng `audit_logs`.
  * `P02-019` $\rightarrow$ `P02-021` — Thu hồi anon write trên `golden_answers`, `system_configs`, `semantic_chat_cache`.
  * `P02-003` $\rightarrow$ `P02-012` — Dựng migration baseline sạch cho `places`, `preset_itineraries`, `videos`, PostGIS spatial type và CHECK boundary.
