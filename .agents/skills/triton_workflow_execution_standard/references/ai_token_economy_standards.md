# TECHNICAL REFERENCE: AI TOKEN ECONOMY & MULTI-LLM ORCHESTRATION v2.0

## 1. Zero-Waste Smart Adaptive Racing Policy:
- **Tối ưu Quota 1x**: Tuyệt đối không gọi 2 LLM song song tốn 2x quota vô ích.
- **Model Warm-up Pre-ping (Cơ chế C)**: Khi người dùng gõ ký tự thứ 3 (debounce 300ms), gửi ping nhẹ `max_tokens=1` để làm nóng kết nối Groq LPU (~0đ chi phí).
- **Adaptive Timeout 900ms (Cơ chế B)**: Groq LPU chạy với timeout 900ms. Nếu Groq phản hồi chậm hoặc lỗi ➔ Lập tức failover sang Gemini Flash Lite mà không bắt người dùng chờ 3-5s.

## 2. Gemini Flash-Lite Max Quota Protocol (1,500 RPD / Key):
- **Ưu tiên Model có hạn mức Free cao nhất**:
  1. `gemini-flash-lite-latest` (1,500 RPD, 30 RPM, 1,000,000 TPM)
  2. `gemini-2.5-flash-lite` (1,500 RPD, 30 RPM)
  3. `gemini-3.1-flash-lite` (1,500 RPD, 15 RPM)
  4. `gemini-flash-latest` (Backup Search Grounding)
- **Công suất miễn phí 100%**: 4 Gemini Keys $\times$ 1,500 RPD = **6,000 requests/ngày**.

## 3. Groq Multi-Key Round-Robin Pool:
- Hỗ trợ mảng xoay vòng đến 4 keys (`GROQ_API_KEY`, `GROQ_API_KEY_2`, `_3`, `_4`).
- Tự động bắt lỗi 429 ➔ kích hoạt Cooldown 30s và chuyển sang Key tiếp theo trong <50ms.

## 4. 4-Tier High-Availability Hierarchy (100% 0đ Chi Phí):
1. **Tier 1 (Realtime Search)**: Gemini Flash Lite (`tools: [{ googleSearch: {} }]`).
2. **Tier 2 (80% Static POIs)**: Groq LPU Pool (`llama-3.3-70b-versatile` - TTFT ~150-200ms).
3. **Tier 3 (Shield Dự phòng)**: OpenRouter duy nhất 1 model tiếng Việt tốt nhất (`google/gemma-4-31b-it:free`, timeout 2000ms).
4. **Tier 4 (Offline Guarantee)**: Local Domain Expert RAG Engine (100% không bao giờ sập).

## 5. Semantic Truth Anchor & Boundary Sanitation:
- Lọc 100% biến thể ẩm thực sai: "gà nướng than hồng Ô Thum" ➔ "Gà đốt Ô Thum".
- Chuẩn hóa công thức bún cá Khmer (nghệ tươi & ngải bún, không dùng mắm cá linh).
- Chuẩn hóa địa giới hành chính (Quán gà đốt hồ Ô Thum thuộc Xã Ô Lâm, không phải TT. Tri Tôn).
