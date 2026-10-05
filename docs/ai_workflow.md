# LUỒNG XỬ LÝ AI & KIẾN TRÚC AI ORCHESTRATION THỰC TẾ (DU LỊCH TRI TÔN AI)

> **Căn cứ xác thực:** [Decision Record Multi-LLM Strategy DR-LLM-STRATEGY-001](technical-spec/DECISION_RECORD_MULTI_LLM_PROVIDER_STRATEGY.md) (P04-014) · [SRE Runbook Provider Outage](runbooks/RUNBOOK_PROVIDER_OUTAGE.md) (P05-024) · [Deployment Path Inventory](technical-spec/DEPLOYMENT_PATH_INVENTORY.md) (P00-003 / P06-010).  
> **Nguyên tắc bất biến:** Production-Real, 0% Mock/Demo. Toàn bộ hành vi suy luận AI, rào chắn an ninh và cơ chế failover đều phản ánh chính xác 100% bộ kiểm thử hành vi thực tế (Behavior Tests Phase P04).

---

## 🚀 1. KIẾN TRÚC MULTI-LLM SEQUENTIAL FAILOVER (ZERO PROVIDER RACE)

Trái ngược với các giả định ban đầu về việc chạy đua song song (Parallel Race / Timed Hedge) giữa nhiều nhà cung cấp LLM gây lãng phí định ngạch token (Quota Waste) và rủi ro rate-limit kép 429, hệ thống áp dụng chính thức **Kiến trúc Sequential Failover với Fast Bounded Timeouts** theo quyết định `DR-LLM-STRATEGY-001`:

```
                                  [ YÊU CẦU TRÒ CHUYỆN CỦA DU KHÁCH ]
                                                   │
                                                   ▼
                       [ RÀO CHẮN AN NINH GATEWAY FAIL-CLOSED ]
                       ├── Chặn Prompt Injection Firewall (P04-020)
                       ├── Chặn Poisoned Knowledge Firewall (P04-021)
                       └── Giới hạn độ dài Query <= 1000 ký tự (P04-001)
                                                   │
                                                   ▼
                         ┌──────────────────────────────────────────────────┐
                         │   TẦNG 1: GROQ PRIMARY STREAMING ENGINE          │
                         │   Model: llama-3.3-70b-versatile                 │
                         │   Ngưỡng timeout: GROQ_PRIMARY_TIMEOUT_MS = 2.5s │
                         │   Độ trễ TTFT: < 500ms (SSE Stream trực tiếp)    │
                         └─────────────────────────┬────────────────────────┘
                                                   │
                                                   │ Timeout (> 2.5s) hoặc Lỗi 5xx/429
                                                   ▼ (Failover tuần tự an toàn)
                         ┌──────────────────────────────────────────────────┐
                         │   TẦNG 2: GOOGLE GEMINI SYNTHESIS ENGINE         │
                         │   Model: gemini-2.5-flash (Fallback: 1.5 Flash)  │
                         │   Ngưỡng timeout: GEMINI_SECONDARY_TIMEOUT_MS=6s │
                         │   Vai trò: Phân tích sâu ngữ cảnh lớn & tổng hợp │
                         └─────────────────────────┬────────────────────────┘
                                                   │
                                                   │ Timeout (> 6.0s) hoặc Gián đoạn mạng
                                                   ▼ (Failover tuần tự an toàn)
                         ┌──────────────────────────────────────────────────┐
                         │   TẦNG 3: OPENROUTER REDUNDANCY ENGINE           │
                         │   Model: meta-llama/llama-3.3-70b-instruct       │
                         │   Ngưỡng timeout: OPENROUTER_TERTIARY_TIMEOUT=5s │
                         │   Vai trò: Dự phòng thảm họa (Disaster Recovery)  │
                         └─────────────────────────┬────────────────────────┘
                                                   │
                                                   │ Mọi kết nối Cloud đều tê liệt (Total Outage)
                                                   ▼
                         ┌──────────────────────────────────────────────────┐
                         │   TẦNG 4: LOCAL EXPERT RAG OFFLINE ENGINE        │
                         │   Runtime: Deterministic Smart Domain Response   │
                         │   Ngưỡng timeout: LOCAL_RAG_TIMEOUT_MS = 0ms     │
                         │   Dữ liệu: Canonical Verified POIs + Static DB   │
                         └──────────────────────────────────────────────────┘
```

### Nguyên tắc Bất Biến Về Provider:
1. **0% Provider Race**: Tuyệt đối không gửi đồng thời 2 request cùng lúc tới các LLMs khác nhau; chỉ gọi Tầng tiếp theo khi Tầng trước thất bại hoặc timeout.
2. **0% Zombie Requests / Token Waste**: Khi Tầng 1 bị timeout (sau 2500ms), hàm `orchestrateGroqWithFailover` phát lệnh `abort()` ngắt ngay lập tức kết nối HTTP để giải phóng tài nguyên.
3. **Quan Sát Thực Tế (Observability)**: Không dùng giá trị mock/hằng số giả định. 100% lượt gọi đều ghi nhận chính xác `model_used` (P04-012) và `latency_ms` đo lường bằng timer độ chính xác cao (P04-013) vào `public.chat_logs`.

---

## 🔄 2. QUY TRÌNH XỬ LÝ TRUY VẤN AI THỰC TẾ 10 BƯỚC (FACTUAL RAG PIPELINE)

Quy trình vận hành thực tế đã được kiểm chứng qua bộ kiểm thử tự động của Phase P04:

```
[1. User Input] ──► [2. Query Guard] ──► [3. Session Ownership HMAC] ──► [4. Security Firewalls]
                                                                                  │
[7. Verified POI Retrieval] ◄── [6. Bounded Token Search] ◄── [5. Single Embedding] ◄┘
         │
         ├──► (Nếu Intent == SOS) ──► [FAST-PATH: Zero-Delay SOS Payload < 5ms]
         │
         ▼
[8. Multi-LLM Sequential Execution] ──► [9. Output Schema & Citation Gate] ──► [10. Immutable Audit Logging]
```

### Chi tiết 10 bước thực thi:

1. **User Input**: Tiếp nhận câu hỏi qua API `/api/v1/chat/query` hoặc `/api/v1/chat/stream`.
2. **Query Input Guard (P04-001)**: `validateChatQuery` chặn đứng truy vấn rỗng (HTTP 400 `MISSING_QUERY`) hoặc vượt quá 1000 ký tự (HTTP 413 `QUERY_TOO_LONG`).
3. **Session Identifier & Ownership Contract (P04-002, P04-005)**:
   - Session ID bắt buộc tuân thủ chuẩn UUID v4 RFC 4122 (loại trừ hoàn toàn `Math.random()`).
   - Kiểm tra quyền sở hữu phiên bằng chữ ký mật mã HMAC-SHA256 (`x-chat-session-token`), từ chối client không hợp lệ bằng HTTP 403 `INVALID_SESSION_OWNERSHIP`.
4. **Adversarial Security Firewalls (P04-020, P04-021)**:
   - **Prompt Injection Firewall**: Nhận diện và chặn đứng các mẫu tấn công bẻ khóa (Jailbreak, DAN mode, ép rò rỉ system prompt, sửa rating/dữ liệu).
   - **Poisoned Knowledge Firewall**: Chặn bẫy tiền đề sai sự thật (ví dụ: bịa đặt Hồ Tà Pạ cạn nước hay Chùa Xà Tón bị cháy), bảo toàn 100% dữ liệu thực địa.
5. **Single Embedding Execution (P04-006)**: Tạo vector embedding chính xác **đúng 1 lần duy nhất** trong toàn bộ vòng đời request qua `generateQueryEmbedding` (tái sử dụng chung cho pgvector và downstream tasks).
6. **Bounded Token Search & PostgREST Sanitizer (P04-007, P04-008)**:
   - Thay thế vòng lặp N+1 queries bằng một truy vấn PostgREST có giới hạn duy nhất (`.or().limit(8)`), giảm >= 90% số lượng round-trip tới DB.
   - Làm sạch toàn bộ chuỗi người dùng qua `postgrestFilterSanitizer.ts`, ngăn chặn 100% nguy cơ Filter Injection.
7. **Verified-Only Retrieval Gate (P04-009, P04-010)**:
   - **Không có chuyện suy diễn**: Mọi điểm đến nạp vào context bắt buộc phải có `is_verified = true` và `verification_status = 'VERIFIED'`.
   - RPC `match_places` (pgvector) và `match_places_nearby` (PostGIS) khóa cứng điều kiện kiểm định, loại trừ 100% dữ liệu nháp, từ chối hoặc hết hạn.
8. **SOS Emergency Fast-Path (P04-022, P04-023)**:
   - Khi phát hiện ý định khẩn cấp cứu nạn (`SOS_EMERGENCY`), hệ thống kích hoạt Fast-path: **bỏ hoàn toàn sleep/delay nhân tạo (< 5ms)**.
   - 100% số hotline cứu nạn đều bắt buộc có trích dẫn nguồn cơ quan nhà nước (`https://triton.angiang.gov.vn`) và timestamp thực địa `verified_at`.
9. **Output Schema Validation & Citation Coverage Gate (P04-018, P04-019)**:
   - `chatOutputSchemaValidator` chặn đứng mọi phản hồi rác, chữ ký lỗi provider 500/503/429, hoặc markdown fences bị gãy.
   - `chatCitationCoverageGate` thẩm định câu trả lời sự kiện (factual response): bắt buộc phải có trích dẫn địa điểm hoặc video thực địa đã kiểm chứng; nếu không đạt, tự động kích hoạt fallback an toàn về Local Expert RAG.
10. **Immutable Observability & Audit Logging (P04-012, P04-013)**:
    - Ghi nhận nhật ký bất biến vào `public.chat_logs`: ghi `provider_used`, `model_used` thực tế, và `latency_ms` đo lường thực tế.

---

## 📚 3. RÀNG BUỘC DỮ LIỆU & GIỚI HẠN TUYÊN BỐ (DATA GOVERNANCE & CLAIM INVARIANTS)

1. **Không Tuyên Bố Reranker Chưa Tồn Tại**: Hệ thống trên môi trường production hiện tại không sử dụng Cross-Encoder Reranker hay Hybrid BM25 nặng nề của Python, mà sử dụng kết hợp **PostGIS Spatial RPCs + pgvector Similarity + Bounded Token Search** được tối ưu hóa trực tiếp trên Supabase PostgreSQL.
2. **Tuân Thủ Tuyệt Đối Canonical Manifest**:
   - Mọi câu trả lời khẳng định "đã xác minh" chỉ được áp dụng cho các điểm đến nằm trong Canonical Manifest `v1.0.0` (Schema: `CANONICAL-POI-SCHEMA-V1`, [`CANONICAL_DATASET_MANIFEST.md`](technical-spec/CANONICAL_DATASET_MANIFEST.md)).
   - Các điểm đến khảo sát sơ bộ khác chỉ được cung cấp dưới dạng thông tin tham khảo kèm cảnh báo thực địa rõ ràng.
3. **Phân Định Module Offline**: Thư mục `backend/` và các scripts crawler thô là công cụ nghiên cứu nội bộ chạy offline bằng Python CLI, không đóng vai trò gateway trực tiếp của luồng chat production.
