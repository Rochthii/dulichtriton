# Decision Record — Quyết Định Thời Hạn Lưu Trữ Dữ Liệu Phiên Trò Chuyện (P05-002)

> **Mã định danh:** `DR-G3-RETENTION-SESSIONS-001`  
> **Nhiệm vụ liên kết:** `P05-002` (Wave W5 — Privacy, Data Retention & Observability)  
> **Cổng quyết định (Decision Gate):** `Decision Gate G3 (Privacy, Data Governance & Observability)`  
> **Ngày lập & Thẩm định:** 2026-10-02  
> **Trạng thái:** `APPROVED / VERIFIED`  
> **Người phê duyệt:** Chăm Rốch Thi (Lead Technical Architect & Local Cultural Auditor)  
> **Phạm vi kỹ thuật:** Bảng `public.chat_sessions`, trường `session_id`, `turns`, `updated_at`, các route `/api/v1/chat/query`, `/api/v1/chat/stream`, cơ chế thanh lọc định kỳ (P05-003) và quyền xóa phiên chủ động (P05-005).

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật (Context & Problem Statement)

Hệ thống Trợ lý Du Lịch Tri Tôn AI phục vụ khách du lịch và người dân khám phá danh lam thắng cảnh, văn hóa Khmer và ẩm thực đặc trưng Bảy Núi. Để duy trì tính mạch lạc của các câu hỏi tiếp nối (ví dụ: *"Đường đi lên đó như thế nào?"* sau khi vừa hỏi về *"Chùa Tà Pạ"*), hệ thống lưu trữ lịch sử các lượt hội thoại trong bảng `public.chat_sessions` dưới dạng JSONB `turns`.

### Vấn đề cần ra quyết định:
1. **Tuân thủ pháp lý & Quyền riêng tư:** Theo Điều 17 Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân và nguyên tắc Giới hạn Lưu trữ (Storage Limitation), dữ liệu người dùng không được lưu trữ vô thời hạn mà phải có thời hạn lưu trữ rõ ràng và tự động bị tiêu hủy khi hết mục đích xử lý.
2. **Trải nghiệm thực tế của du khách tại Tri Tôn:** Du khách thường có chuyến đi trong ngày hoặc 2 ngày 1 đêm. Họ di chuyển giữa các địa điểm (Hồ Tà Pạ, Soài So, Ô Thum, Chùa Xà Tón), thường xuyên tắt màn hình điện thoại hoặc chuyển đổi ứng dụng chụp ảnh. Nếu thời hạn lưu trữ quá ngắn, phiên trò chuyện bị xóa sẽ làm gián đoạn lịch trình đang tra cứu.
3. **Hiệu năng & Tài nguyên máy chủ:** Bảng `chat_sessions` nếu không được dọn dẹp định kỳ sẽ phình to không giới hạn, gây chậm chỉ mục tìm kiếm và lãng phí dung lượng lưu trữ trên PostgreSQL / Supabase.

---

## 2. Phân Tích Định Lượng & Ma Trận Đánh Đổi (Trade-off Matrix)

Hội đồng kỹ thuật đã tiến hành phân tích định lượng 4 phương án thời hạn lưu trữ:

| Tiêu chí đánh giá | Phương án A: Rất ngắn (1 giờ TTL) | Phương án B: **24 giờ (1 ngày TTL)** — **LỰA CHỌN DUY NHẤT** | Phương án C: Trung hạn (7 ngày TTL) | Phương án D: Dài hạn (30 ngày hoặc vô thời hạn) |
| :--- | :--- | :--- | :--- | :--- |
| **Trải nghiệm du khách trong ngày (Day-trip Continuity)** | **Rất kém**. Du khách dừng ăn trưa (gà đốt Ô Thum) 1.5 giờ quay lại thì phiên đã mất, phải hỏi lại từ đầu. | **Hoàn hảo (100% phù hợp)**. Bao trọn vẹn toàn bộ chuyến đi trong ngày của du khách từ sáng sớm đến đêm muộn. | Tốt, nhưng hầu hết du khách không quay lại hỏi tiếp phiên cũ sau nhiều ngày. | Tốt cho người dùng quay lại sau 1 tháng, nhưng không cần thiết cho chatbot du lịch ẩn danh. |
| **Mức độ rủi ro quyền riêng tư (Privacy Risk)** | Rất thấp. Dữ liệu mất gần như tức thì. | **Rất thấp & An toàn tuyệt đối**. Dữ liệu tự hủy sau 24h không tương tác; triệt tiêu nguy cơ tích tụ hồ sơ du khách. | Trung bình. Tích lũy lịch sử trò chuyện trong 1 tuần. | **Rất cao (Vi phạm Nghị định 13/2023/NĐ-CP)**. Tích tụ dữ liệu vô căn cứ. |
| **Dung lượng lưu trữ PostgreSQL (Storage Quota)** | $< 5\text{MB}$. | **Tối ưu cực đại ($< 25\text{MB}$)**. Số lượng session hoạt động được giới hạn trong 24h, dung lượng tự cân bằng (steady state). | $150\text{MB} - 300\text{MB}$. | $> 1\text{GB}$ và tăng trưởng tuyến tính không giới hạn. |
| **Chi phí quét chỉ mục & I/O dọn dẹp (Cleanup Overhead)** | Quét liên tục mỗi 15 phút, gây lock nhẹ bảng. | **Tối ưu 100%**. Quét theo batch định kỳ qua chỉ mục `updated_at_idx`, 0% lock gián đoạn request người dùng. | Chấp nhận được. | Quá trình xóa hàng triệu dòng sẽ gây bloat bảng và khóa nặng PostgreSQL. |
| **Tính độc lập với nhật ký an ninh (Audit Decoupling)** | Dễ làm mất vết điều tra khẩn cấp nếu không tách log. | **Hoàn toàn độc lập**. Bảng `chat_logs` và `audit_logs` có cơ chế lưu trữ kiểm toán riêng (P05-004), không phụ thuộc `chat_sessions`. | Độc lập. | Độc lập. |

---

## 3. Quyết Định Duy Nhất Tại Decision Gate G3 (Official Decision)

Hội đồng kỹ thuật chính thức phê chuẩn: **PHƯƠNG ÁN B — THỜI HẠN LƯU TRỮ CHÍNH XÁC 24 GIỜ (1 NGÀY - EXACTLY 24 HOURS / 1 DAY)** cho toàn bộ bản ghi trong bảng `public.chat_sessions`.

### 3.1. Bốn Điều Kiện Quy Chuẩn Bắt Buộc (Mandatory Retention Conditions):

1. **Điều kiện 1 — Cửa sổ trượt gia hạn thời gian sống (Sliding Window TTL Extension Condition):**
   - Mốc thời gian tính hạn là cột `updated_at`, **không phải** `created_at`.
   - Mỗi khi du khách gửi câu hỏi hợp lệ trong phiên, trigger PostgreSQL `trg_chat_sessions_updated_at` tự động cập nhật:
     ```sql
     NEW.updated_at = NOW();
     ```
   - Điều này cấp mới thêm một chu kỳ 24 giờ trọn vẹn, bảo đảm du khách đang tích cực tương tác không bao giờ bị ngắt quãng giữa chừng.

2. **Điều kiện 2 — Ngưỡng hết hạn tất định (Deterministic Expiration Threshold Condition):**
   - Mọi bản ghi thỏa mãn điều kiện thời gian:
     $$\text{updated\_at} < (\text{NOW()} - \text{INTERVAL '24 hours'})$$
     được coi là **đã hết hạn (EXPIRED)** và đủ điều kiện để bị tiêu hủy vĩnh viễn.

3. **Điều kiện 3 — Quyền xóa bỏ tức thì của chủ thể dữ liệu (Immediate Right to Erasure Condition — P05-005):**
   - Khi du khách chủ động bấm nút "Xóa hội thoại" trên giao diện hoặc gửi request kèm token sở hữu hợp lệ (`session_token`), phiên trò chuyện bị xóa **ngay lập tức** khỏi cơ sở dữ liệu:
     ```sql
     DELETE FROM public.chat_sessions WHERE session_id = :sessionId;
     ```
     mà **không cần** chờ hết hạn 24 giờ.

4. **Điều kiện 4 — Tách biệt hoàn toàn với lưu vết khẩn cấp & kiểm toán (SOS & Audit Log Decoupling Condition):**
   - Bảng `chat_sessions` chỉ chứa nội dung trao đổi ngữ cảnh thông thường.
   - Các tương tác khẩn cấp SOS và thông tin an ninh đã được sao lưu và niêm phong bất biến tại bảng `public.chat_logs` (`places_count`, `provider_used`, `latency_ms`, `is_out_scope`) và `public.audit_logs`.
   - Do đó, việc xóa bản ghi trong `chat_sessions` sau 24 giờ **hoàn toàn an toàn**, không làm mất bất kỳ bằng chứng cứu hộ khẩn cấp nào của chính quyền địa phương.

---

## 4. Chuẩn Mực Thực Thi Hạ Nguồn (Downstream Implementation Standards)

Quyết định này là căn cứ kỹ thuật bắt buộc để triển khai các nhiệm vụ kế tiếp:

1. **Nhiệm vụ P05-003 (Tạo job xóa `chat_sessions` hết hạn):**
   - Sử dụng câu truy vấn xóa theo lô (batch execution) có giới hạn để chống nghẽn I/O:
     ```sql
     DELETE FROM public.chat_sessions 
     WHERE session_id IN (
       SELECT session_id 
       FROM public.chat_sessions 
       WHERE updated_at < (NOW() - INTERVAL '24 hours') 
       LIMIT 1000
     );
     ```
   - Tận dụng chỉ mục có sẵn: `CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON public.chat_sessions (updated_at);`.
2. **Nhiệm vụ P05-005 (Tạo endpoint xóa session của chủ sở hữu):**
   - Thẩm định `verifySessionOwnershipToken` (P04-005) trước khi thi hành lệnh xóa đơn lẻ.

---

## 5. Danh Mục Đối Chiếu Kỹ Thuật (Concordance Verification)

- **Mã nguồn Retention Policy:** [`frontend/src/lib/chatSessionRetentionPolicy.ts`](../../frontend/src/lib/chatSessionRetentionPolicy.ts)
- **Data Inventory Specification:** [`docs/technical-spec/CHAT_DATA_INVENTORY.md`](CHAT_DATA_INVENTORY.md)
- **Data Inventory Runtime:** [`frontend/src/lib/chatDataInventory.ts`](../../frontend/src/lib/chatDataInventory.ts#L83-L91)
- **Migration Bảng & Index:** [`supabase/migrations/20260809_create_chat_sessions.sql`](../../supabase/migrations/20260809_create_chat_sessions.sql#L24)
- **Test Suite Nghiệm Thu P05-002:** [`frontend/scripts/chat-sessions-retention-decision.test.mjs`](../../frontend/scripts/chat-sessions-retention-decision.test.mjs)
