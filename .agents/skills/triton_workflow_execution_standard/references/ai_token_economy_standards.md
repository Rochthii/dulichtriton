# TECHNICAL REFERENCE: AI TOKEN ECONOMY & MULTI-LLM ORCHESTRATION

## 1. Zero-Waste Single Leader Policy:
- Tuyệt đối không bắn song song nhiều request cùng lúc.
- Chỉ gửi **DUY NHẤT 1 Request** đến Key rảnh nhất (xoay vòng Round-Robin 4 Gemini Keys).

## 2. Instant Error Failover (<150ms):
- Khi gặp mã lỗi `429` (Rate limit) hoặc `403`:
  • Đặt Cooldown 20s cho Key đó.
  • Nhảy ngay lập tức (<150ms) sang Key tiếp theo hoặc Groq Llama 3.3 70B.

## 3. 4-Tier Fallback Hierarchy (100% 0đ):
1. **Tier 1**: Google Gemini 2.5 Flash (`gemini-flash-latest` + Live Google Search Grounding).
2. **Tier 2**: Groq Cloud (`llama-3.3-70b-versatile` - siêu tốc 330ms).
3. **Tier 3**: OpenRouter (Chỉ gọi các model `:free`).
4. **Tier 4**: Local Domain Expert RAG Engine (Offline 100%).
