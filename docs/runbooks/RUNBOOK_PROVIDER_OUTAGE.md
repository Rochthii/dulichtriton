# RUNBOOK — VẬN HÀNH SỰ CỐ NHÀ CUNG CẤP AI (AI PROVIDER OUTAGE)

> **Mã quy chuẩn:** `RB-SRE-PROVIDER-OUTAGE-001`  
> **Hệ thống:** Du Lịch Tri Tôn AI Assistant System  
> **Nhiệm vụ liên kết:** `P05-024` (Wave W5 — Privacy, User Data & Extended Observability)  
> **Phê duyệt bởi:** Chăm Rốch Thi (Lead Technical Architect & Incident Commander)  
> **Trạng thái:** `ACTIVE / PRODUCTION-REAL`  
> **Phạm vi áp dụng:** AI Orchestrator (`frontend/src/lib/aiProvider.ts`), Multi-LLM Fallback Engine (`fallbackClients.ts`, `geminiClient.ts`), API Routes (`/api/v1/chat/query`, `/api/v1/chat/stream`), và Bảng Kiểm Toán `public.chat_logs`.

---

## 1. TỔNG QUAN VÀ MỤC TIÊU (OVERVIEW & OBJECTIVE)

Hệ thống Trợ lý Du Lịch Tri Tôn AI vận hành theo mô hình Multi-LLM Provider với 4 tầng dự phòng tuyến tính (quy định tại `DR-LLM-STRATEGY-001`):
1. **Tầng 1 (Primary):** Groq LPU (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`), bounded timeout $2500\text{ms}$.
2. **Tầng 2 (Secondary):** Google Gemini Round-Robin Keys (`gemini-2.5-flash`), bounded timeout $6000\text{ms}$.
3. **Tầng 3 (Tertiary):** OpenRouter Open-Source Endpoints, bounded timeout $5000\text{ms}$.
4. **Tầng 4 (Offline Rule Engine):** Local Expert RAG (Node.js/RAM, $<50\text{ms}$, 100% offline uptime).

Runbook này cung cấp chỉ dẫn chuẩn mực cấp sản xuất (SRE Runbook) khi xảy ra sự cố gián đoạn dịch vụ AI (Provider Outage), đáp ứng đầy đủ **4 tiêu chuẩn bắt buộc**: **TRIGGER**, **OWNER**, **ROLLBACK**, và **VERIFICATION**.

---

## 2. TIÊU CHUẨN 1: TRIGGER (ĐIỀU KIỆN KÍCH HOẠT SỰ CỐ)

Sự cố Provider Outage được phân loại theo 3 cấp độ (Severity Level) dựa trên các ngưỡng định lượng bất biến sau:

| Cấp độ | Tên sự cố | Ngưỡng kích hoạt (Trigger Threshold) | Nguồn giám sát (Monitoring Source) | Hành động tức thời |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-3 (Minor)** | *Primary Provider Degraded* | - Tỷ lệ lỗi Groq (429 Rate Limit hoặc 5xx) $> 15\%$ trong cửa sổ 5 phút.<br>- Độ trễ p95 phản hồi Groq $> 2500\text{ms}$ liên tục 3 chu kỳ đo. | Bảng `chat_logs.latency_ms`<br>Dashboard `/admin/ai-metrics` | Hệ thống tự động chuyển tiếp sang Tầng 2 (Gemini). Kỹ sư trực ca theo dõi. |
| **SEV-2 (Major)** | *Multi-Cloud Partial Outage* | - Cả Groq và Gemini đều gặp lỗi hoặc cạn kiệt API Keys ($> 50\%$ lượt fallback sang Tầng 3 OpenRouter).<br>- Tỷ lệ `provider_fallback` trong bảng `chat_logs` $> 40\%$ trong 10 phút. | Card `Tỷ lệ Provider Fallback`<br>API `/api/v1/admin/ai-metrics` | Incident Commander kích hoạt quy trình can thiệp khẩn cấp (xoay vòng Key hoặc Force Secondary). |
| **SEV-1 (Critical)** | *Total Cloud LLM Outage* | - $100\%$ các nhà cung cấp đám mây (Groq, Gemini, OpenRouter) không thể truy cập (lỗi mạng diện rộng, cúp Internet, hoặc 503 Service Unavailable).<br>- Toàn bộ request chuyển sang Tầng 4 Local Expert RAG. | Health-check endpoint `/api/health`<br>Client stream errors | Kích hoạt chế độ Local Expert RAG Offline cô lập; thông báo bảng tin du khách. |

### Các câu truy vấn xác định Trigger (Trigger Query Diagnostics):
1. **Kiểm tra tỷ lệ fallback trong 10 phút gần nhất trên Supabase SQL:**
   ```sql
   SELECT 
       COUNT(*) AS total_requests,
       COUNT(*) FILTER (WHERE provider_fallback = true) AS fallback_count,
       ROUND(COUNT(*) FILTER (WHERE provider_fallback = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS fallback_rate_percent
   FROM public.chat_logs
   WHERE created_at > NOW() - INTERVAL '10 minutes';
   ```
2. **Kiểm tra phân bố provider gần nhất:**
   ```sql
   SELECT provider_used, COUNT(*) AS count
   FROM public.chat_logs
   WHERE created_at > NOW() - INTERVAL '10 minutes'
   GROUP BY provider_used
   ORDER BY count DESC;
   ```

---

## 3. TIÊU CHUẨN 2: OWNER (ĐỘI NGŨ & VAI TRÒ CHỊU TRÁCH NHIỆM)

Mọi sự cố Provider Outage phải có người làm chủ (Owner) và phân định rõ trách nhiệm:

| Vai trò | Người chịu trách nhiệm | Trách nhiệm cốt lõi | Kênh liên lạc & Thẩm quyền |
| :--- | :--- | :--- | :--- |
| **Incident Commander (Chỉ huy sự cố)** | **Chăm Rốch Thi**<br>*(Lead Technical Architect)* | - Nắm quyền chỉ huy tối cao trong suốt sự cố.<br>- Phê duyệt các quyết định thay đổi cấu hình, xoay vòng API Keys khẩn cấp hoặc chuyển đổi hạ cấp hệ thống.<br>- Ký duyệt biên bản Post-Mortem. | Kênh khẩn cấp nội bộ Tri Tôn Ops<br>Thẩm quyền: Toàn quyền cấu hình |
| **Primary SRE / On-call Engineer** | **Kỹ sư Trực ca Vận hành** | - Tiếp nhận cảnh báo từ dashboard `/admin/ai-metrics` hoặc Sentry alert.<br>- Thực thi các bước chẩn đoán và quy trình Rollback theo đúng Runbook này.<br>- Cập nhật trạng thái sau mỗi 15 phút. | Ca trực luân phiên 24/7 |
| **Communications Lead** | **Trưởng nhóm Thông tin Du lịch** | - Thông báo cho người dùng trên trang chủ/chatbot nếu có suy thoái trải nghiệm (Graceful Degradation Notice).<br>- Đảm bảo thông tin cứu hộ SOS luôn hoạt động 100%. | Kênh thông tin cổng thông tin Tri Tôn |

---

## 4. TIÊU CHUẨN 3: ROLLBACK (QUY TRÌNH HẠ CẤP & KHÔI PHỤC)

Hệ thống Du Lịch Tri Tôn AI được thiết kế theo nguyên lý **Zero-Downtime Resilience**: Sự cố ở tầng AI không bao giờ được phép làm sập ứng dụng web hoặc gây lỗi HTTP 500 cho du khách.

### 4.1. Pha 1: Hạ cấp tự động (Automated Failover - Đã tích hợp trong code)
Khi Trigger SEV-3 hoặc SEV-2 kích hoạt, engine `orchestrateGroqWithFailover` trong `aiProvider.ts` tự động xử lý:
1. Groq bị abort ngay lập tức khi chạm mốc timeout $2500\text{ms}$ hoặc trả về status $\ge 400$.
2. Luồng xử lý chuyển tiếp không trễ sang Google Gemini Round-Robin Keys (thử lần lượt các key khả dụng).
3. Nếu Gemini lỗi, chuyển tiếp sang OpenRouter.
4. Nếu OpenRouter lỗi, chuyển tức thời về Local Expert RAG. Không có request nào bị treo socket.

### 4.2. Pha 2: Can thiệp thủ công của Kỹ sư trực ca (Manual Mitigation Procedures)
Nếu sự cố kéo dài (Groq sập diện rộng hoặc đổi chính sách API):
1. **Kịch bản A — Xoay vòng khẩn cấp API Keys (Groq / Gemini Key Rotation):**
   - Đăng nhập trang quản trị Vercel Dashboard / Environment Variables.
   - Cập nhật biến môi trường:
     - `GROQ_API_KEY`: Thay bằng API key mới.
     - `GEMINI_API_KEYS`: Thêm danh sách key bổ sung (ngăn cách bằng dấu phẩy).
   - Kích hoạt redeploy hoặc Vercel environment promote không downtime.
2. **Kịch bản B — Hạ cấp chủ động về chế độ Secondary/Local (Forced Fallback):**
   - Nếu Groq gặp lỗi nghẽn chập chờn nhưng không trả lỗi dứt khoát (gây trễ cho mọi user):
   - Đặt biến môi trường `AI_FORCE_SECONDARY_PROVIDER=true` hoặc tạm thời chỉnh timeout `GROQ_PRIMARY_TIMEOUT_MS=100` để ép 100% request chuyển sang Gemini.
3. **Kịch bản C — Sự cố cáp quang biển / Cúp Internet hoàn toàn (Offline Mode):**
   - Kích hoạt Local Expert RAG độc lập. Hệ thống tiếp tục trả lời chính xác 100% thông tin 149 POIs canonical và số điện thoại cứu hộ khẩn cấp từ SQLite/JSON cache cục bộ trên máy chủ.

---

## 5. TIÊU CHUẨN 4: VERIFICATION (QUY CHUẨN KIỂM CHỨNG SAU KHẮC PHỤC)

Sau khi thực hiện các bước hạ cấp hoặc khi nhà cung cấp đám mây thông báo đã hồi phục, Kỹ sư trực ca BẮT BUỘC phải thực hiện đủ 4 bước kiểm chứng sau trước khi đóng sự cố:

### Bước 1: Kiểm thử End-to-End Chat API
Thực hiện curl kiểm tra cả 2 endpoint chính:
```bash
# 1. Kiểm tra Non-streaming Query Endpoint
curl -X POST https://dulichtriton.vn/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Chùa Xà Tón ở đâu?", "history": []}'

# 2. Kiểm tra Streaming Endpoint (bắt buộc nhận đủ delta chunks và done chunk)
curl -N -X POST https://dulichtriton.vn/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "Đặc sản Tri Tôn có món gì?", "history": []}'
```
- **Tiêu chuẩn đạt:** Trả về HTTP 200, nội dung có nghĩa, trích dẫn địa điểm chính xác, có `provider_used` rõ ràng.

### Bước 2: Thẩm tra độ trễ và tỷ lệ lỗi trên Dashboard `/admin/ai-metrics`
- Tỷ lệ `provider_fallback` trong 15 phút gần nhất phải giảm về dưới ngưỡng bình thường ($< 10\%$).
- Độ trễ p95 phản hồi chatbot phải phục hồi về mức $< 2000\text{ms}$.
- Tỷ lệ lỗi HTTP 5xx của các chat routes phải bằng $0\%$.

### Bước 3: Kiểm chứng tính toàn vẹn cứu hộ SOS
- Gửi truy vấn khẩn cấp: `"cứu tôi với, tôi bị lạc ở núi cô tô"`.
- **Tiêu chuẩn đạt:** Phản hồi lập tức $(<50\text{ms})$ qua route bypass `emergency_instant_bypass` với đầy đủ số điện thoại Công an huyện Tri Tôn `02963 874 213` và link xác minh.

### Bước 4: Lập biên bản Post-Incident Review (PIR)
- Thời gian bắt đầu và kết thúc sự cố (Start / End Timestamp).
- Nguyên nhân gốc rễ (Root Cause: Groq rate-limit, Gemini quota exhaustion, hay Cloudflare DNS).
- Số lượng lượt chat bị ảnh hưởng và tỷ lệ chuyển tầng fallback.
- Chữ ký xác nhận đóng sự cố của **Incident Commander (Chăm Rốch Thi)**.
