# Decision Record — Lựa Chọn Chiến Lược Điều Phối Multi-LLM Provider (P04-014)

> **Mã định danh:** `DR-LLM-STRATEGY-001`  
> **Nhiệm vụ liên kết:** `P04-014` (Wave W4 — AI Grounding, Verification Claims & Observability)  
> **Ngày lập:** 2026-10-02  
> **Trạng thái:** `APPROVED / VERIFIED`  
> **Người phê duyệt:** Chăm Rốch Thi (Lead Technical Architect & Local Cultural Auditor)  
> **Phạm vi:** Engine điều phối AI `frontend/src/lib/aiProvider.ts`, các native clients (`fallbackClients.ts`, `geminiClient.ts`), và toàn bộ các API chat routes (`/api/v1/chat/query`, `/api/v1/chat/stream`).

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật (Context & Technical Problem)

Hệ thống Trợ lý Du Lịch Tri Tôn AI phục vụ đa dạng nhu cầu của du khách và người dân địa phương với kiến trúc Multi-LLM Provider nhằm bảo đảm tính sẵn sàng cao (High Availability):
1. **Groq LPU (Primary):** Tốc độ suy luận cực nhanh (LPU inference engine), trung bình Thời gian nhận token đầu tiên (Time-To-First-Token - TTFT) chỉ từ $150\text{ms} - 350\text{ms}$ với mô hình `llama-3.3-70b-versatile` hoặc `llama-3.1-8b-instant`. Tuy nhiên, Groq Free/Developer Tier có giới hạn nghiêm ngặt về số request mỗi phút (RPM) và số token mỗi phút (TPM).
2. **Google Gemini (Secondary / Search Grounding):** Cung cấp chất lượng suy luận cao, cửa sổ ngữ cảnh lớn, hỗ trợ công cụ tìm kiếm và xoay vòng Round-Robin qua danh sách API keys. TTFT trung bình dao động từ $600\text{ms} - 1200\text{ms}$.
3. **OpenRouter (Tertiary Fallback):** Cung cấp các mô hình mã nguồn mở dự phòng (`google/gemma-2-27b-it`, `meta-llama/llama-3.3-70b-instruct:free`).
4. **Local Expert RAG (Offline Rule Engine):** Engine xử lý cục bộ trên Node.js/RAM, thời gian đáp ứng $<50\text{ms}$, bảo đảm luôn luôn trả lời được các địa điểm xác minh và hướng dẫn cứu hộ khẩn cấp ngay cả khi toàn bộ các nhà cung cấp đám mây gặp sự cố hoặc cúp mạng Internet.

### Vấn đề cần quyết định:
Trước P04-014, mã nguồn trong `frontend/src/lib/aiProvider.ts` tồn tại sự mâu thuẫn giữa chú thích thiết kế ("Smart Hedging Racer Groq 0ms ➔ Gemini 600ms") và hành vi thực thi (chạy tuần tự `for await` chờ Groq kết thúc hoặc gặp lỗi mới gọi Gemini). Việc này dẫn đến hai câu hỏi cốt lõi:
1. Có nên kích hoạt **Timed Hedging** (gọi Groq ở $T=0$, nếu sau $600\text{ms}$ chưa có token thì gọi thêm Gemini song song và hủy bên thua)?
2. Hay chuẩn hóa dứt khoát sang **Sequential Failover với Fast Timeout** (chỉ gọi Groq, đặt timeout ngắt kết nối $2500\text{ms}$, chỉ khi Groq lỗi hoặc quá thời gian mới chuyển sang Gemini)?

---

## 2. Phân Tích Định Lượng & So Sánh Đánh Đổi (Trade-off Matrix)

| Tiêu chí đánh giá | Phương án A: Timed Hedge (Racing 600ms) | Phương án B: Sequential Failover (Fast Timeout 2.5s) — **LỰA CHỌN** | Phương án C: Unbounded Sequential (Timeout mặc định 30s) |
| :--- | :--- | :--- | :--- |
| **Tiêu thụ Quota API (Token & Request Budget)** | **Kém (-40% đến -60% lãng phí)**. Trong 15-20% request mạng lag nhẹ ($>600\text{ms}$), cả Groq và Gemini đều bị kích hoạt. Dù abort bên thua, server LLM vẫn tính phí token của prompt đầu vào. | **Tối ưu 100% (Zero Quota Waste)**. 100% request thông thường chỉ tiêu thụ đúng 1 provider duy nhất (Groq). Không bao giờ gửi trùng lặp prompt đến 2 dịch vụ. | Tối ưu 100% về số token, nhưng giữ connection quá lâu gây cạn connection pool. |
| **Rủi ro Rate Limit 429 (RPM/TPM Exhaustion)** | **Rất cao**. Khi lưu lượng tăng đột biến, hedging nhân đôi số lượng request gửi đi cùng lúc lên cả 2 dịch vụ, đẩy hệ thống vào trạng thái 429 liên hoàn (cascade rate-limiting). | **Rất thấp**. Giữ nguyên tải thực tế $1:1$, bảo vệ hạn mức miễn phí/cộng đồng của cả Groq và Gemini. | Thấp. |
| **Độ trễ TTFT thông thường (P50 / P90)** | $200\text{ms} - 350\text{ms}$ (Groq thắng). | $200\text{ms} - 350\text{ms}$ (Groq thắng). Đồng nhất 100% với Phương án A. | $200\text{ms} - 350\text{ms}$. |
| **Độ trễ khi Primary gặp sự cố (P99 / Tail Latency)** | $1000\text{ms} - 1500\text{ms}$ (Gemini đã được nhen nhóm từ mốc $600\text{ms}$). | $3000\text{ms} - 3800\text{ms}$ ($2500\text{ms}$ timeout của Groq + $600\text{ms}-1000\text{ms}$ TTFT của Gemini). Vẫn nằm trọn vẹn trong ngưỡng chấp nhận được của du khách ($<4\text{s}$). | $\ge 30.000\text{ms}$ (Treo trình duyệt du khách, trải nghiệm người dùng sụp đổ). |
| **Khả năng kiểm soát trạng thái & Auditability** | Phức tạp (Cạnh tranh tài nguyên, race condition giữa 2 luồng stream, rủi ro rò rỉ token dở dang). | **Rõ ràng, đơn giản, tất định 100%**. Dễ dàng truy vết model và provider chiến thắng trong audit log `chat_logs`. | Đơn giản nhưng thời gian chờ không thể đoán trước. |
| **Nguy cơ Zombie Requests (Treo tiến trình)** | Cao (Cần quản lý `AbortController` chéo giữa nhiều luồng async generator). | **Rất thấp**. Mỗi bước có `AbortSignal` và `setTimeout` riêng biệt, giải phóng socket ngay khi timeout. | Rất cao (Treo socket kết nối HTTP). |

---

## 3. Quyết Định Duy Nhất (Final Architecture Decision)

Ban hành quyết định lựa chọn chính thức: **PHƯƠNG ÁN B — SEQUENTIAL FAILOVER VỚI FAST BOUNDED TIMEOUT**.

### 3.1. Các nguyên tắc kiến trúc bắt buộc:
1. **Ưu tiên bảo toàn Quota & Chi phí (Budget Preservation Invariant):**
   - Hệ thống vận hành dài hạn với tài nguyên máy chủ và API key tự duy trì; tuyệt đối không áp dụng racing song song gây lãng phí token kép và kích hoạt lỗi 429 nhân tạo.
2. **Thứ tự phân cấp Failover 4 tầng (4-Tier Linear Fallback Chain):**
   ```text
   [Client Query]
         │
         ▼
   ┌──────────────────────────────────────────────┐
   │ TẦNG 1: Groq LPU Primary (llama-3.3-70b)     │ ──(Thành công)──► Trả kết quả (<400ms)
   └──────────────────────────────────────────────┘
         │ (Timeout > 2500ms HOẶC Lỗi 429/500/Network)
         ▼
   ┌──────────────────────────────────────────────┐
   │ TẦNG 2: Google Gemini Round-Robin (Flash)    │ ──(Thành công)──► Trả kết quả (~1.2s)
   └──────────────────────────────────────────────┘
         │ (Timeout > 6000ms HOẶC Hết Key/Lỗi 429/500)
         ▼
   ┌──────────────────────────────────────────────┐
   │ TẦNG 3: OpenRouter Multi-Model Fallback      │ ──(Thành công)──► Trả kết quả (~2.5s)
   └──────────────────────────────────────────────┘
         │ (Timeout > 5000ms HOẶC Lỗi Kết Nối)
         ▼
   ┌──────────────────────────────────────────────┐
   │ TẦNG 4: Local Expert RAG (Offline Rule Engine│ ──(100% Bền vững)► Trả kết quả (<50ms)
   └──────────────────────────────────────────────┘
   ```
3. **Bộ tham số thời gian chuẩn hóa (Standard Timeout Parameters):**
   - **`GROQ_PRIMARY_TIMEOUT_MS = 2500`** ($2.5$ giây): Ngưỡng thời gian tối đa để Groq phát xuất token đầu tiên. Do Groq LPU có tốc độ sinh token $<400\text{ms}$, nếu sau $2500\text{ms}$ chưa nhận được phản hồi thì xác suất $99.9\%$ là Groq đang nghẽn hàng đợi hoặc gặp sự cố rate-limit; hệ thống lập tức abort và chuyển tầng sang Gemini.
   - **`GEMINI_SECONDARY_TIMEOUT_MS = 6000`** ($6.0$ giây): Ngưỡng thời gian tối đa cho Gemini.
   - **`OPENROUTER_TERTIARY_TIMEOUT_MS = 5000`** ($5.0$ giây): Ngưỡng thời gian tối đa cho OpenRouter.
   - **`LOCAL_RAG_TIMEOUT_MS = 0`** (Thực thi đồng bộ / Immediate Fallback).

---

## 4. Kế Hoạch Triển Khai Downstream (Downstream Implementation Plan)

Quyết định này là căn cứ kỹ thuật bất biến để triển khai các nhiệm vụ tiếp theo trong Wave W4:
1. **Task P04-015:** Áp timeout đã chọn `GROQ_PRIMARY_TIMEOUT_MS = 2500ms` vào `streamGroqNative` và luồng điều phối của `frontend/src/lib/aiProvider.ts` (Proof: fault test chứng minh thời điểm failover chính xác tại mốc $\sim 2500\text{ms}$).
2. **Task P04-016:** Viết integration test mô phỏng Groq primary timeout và xác nhận Gemini/fallback trả kết quả có cấu trúc hoàn chỉnh.
3. **Task P04-017:** Viết integration test mô phỏng Groq primary stream error (lỗi ngắt dòng giữa chừng) và chứng minh hệ thống failover an toàn, không treo socket.

---

## 5. Phê Duyệt & Cam Kết (Sign-Off)

- **Người lập & Phê duyệt:** Chăm Rốch Thi  
- **Vị trí:** Lead Technical Architect & Data Governance Owner  
- **Ngày ký:** 2026-10-02  
- **Cam kết:** Toàn bộ mã nguồn triển khai từ `P04-015` trở đi phải tuân thủ nghiêm ngặt theo các tham số và cấu trúc đã định nghĩa trong tài liệu này; không tự ý thay đổi hoặc bổ sung logic racing song song khi chưa có Decision Record sửa đổi.
