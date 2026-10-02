# Decision Record — Quyết Định Chọn Backend Distributed Cho Rate Limiting (P05-012)

> **Mã định danh:** `DR-G3-RATELIMIT-BACKEND-001`  
> **Nhiệm vụ liên kết:** `P05-012` (Wave W5 — Privacy, User Data & Extended Observability — Sub-wave P05-B Quality & Observability)  
> **Cổng quyết định (Decision Gate):** `Decision Gate G3 (Privacy, Data Governance & Observability)`  
> **Ngày lập & Thẩm định:** 2026-10-02  
> **Trạng thái:** `APPROVED / VERIFIED`  
> **Người phê duyệt:** Chăm Rốch Thi (Lead Technical Architect & Local Cultural Auditor)  
> **Phạm vi kỹ thuật:** Kiến trúc phân tán của hệ thống Rate Limiting trên Next.js 16 (Vercel Serverless / Edge Runtime / Container), các routes `/api/v1/chat/*`, `/api/v1/admin/*`, `/api/v1/admin/auth/*`, và middleware hệ thống.

---

## 1. Bối Cảnh & Vấn Đề Kỹ Thuật (Context & Problem Statement)

Hệ thống Trợ lý Du Lịch Tri Tôn AI phục vụ người dân và du khách tra cứu thông tin địa điểm, văn hóa, ẩm thực, lịch trình và cứu nạn khẩn cấp Bảy Núi. Ứng dụng web được xây dựng trên nền tảng **Next.js 16 (React 19)** và triển khai trên môi trường điện toán đám mây hiện đại (Vercel Serverless Functions, Edge Middleware, hoặc các container replicas độc lập).

### Vấn đề tồn tại với Rate Limiter In-Memory hiện tại:
1. **Thiếu khả năng đồng bộ đa phiên bản (Cross-Instance State Isolation):**
   - Bộ giới hạn tốc độ hiện tại (`frontend/src/lib/rateLimiter.ts`) sử dụng `ipStore = new Map<string, RateLimitRecord>()` lưu trữ trực tiếp trong bộ nhớ RAM của tiến trình Node.js đơn lẻ.
   - Khi có nhiều serverless instances chạy song song hoặc scale ngang nhiều pod/container, mỗi instance có không gian bộ nhớ hoàn toàn độc lập.
   - Hậu quả: Một client hoặc bot tự động có thể phân tán các requests liên tiếp tới các instances khác nhau, vượt mặt (bypass) ngưỡng giới hạn tốc độ một cách dễ dàng.
2. **Hiện tượng mất trạng thái do Cold Starts và Vòng đời Serverless (Stateless Ephemeral Lifecycle):**
   - Các Serverless Functions tự động hủy sau khi nhàn rỗi (idle termination) và khởi động mới khi có request (cold start). Mỗi lần khởi động, `ipStore` bị reset về 0, làm mất toàn bộ lịch sử vi phạm và số đếm của client.
3. **Nguy cơ cạn kiệt ngân sách AI (LLM Quota Drain & DoS Vulnerability):**
   - Các tác vụ gọi mô hình trí tuệ nhân tạo (Groq LLaMA, Google Gemini) và các thao tác quản trị viên (Admin Mutation: tạo/sửa/xóa địa danh, upload ảnh) là các tài nguyên đắt đỏ về cả mặt tính toán lẫn chi phí API.
   - Nếu không có một kho lưu trữ tập trung phân tán (Distributed State Store) có độ trễ cực thấp và tính nguyên tử (atomic operations), hệ thống sẽ đối mặt với rủi ro bị lạm dụng quota hoặc tấn công từ chối dịch vụ (DoS).

---

## 2. Phân Tích Định Lượng & Ma Trận Đánh Đổi (Trade-off Matrix)

Hội đồng kỹ thuật đã tiến hành khảo sát và đánh giá định lượng 4 giải pháp backend phân tán tiềm năng:

| Tiêu chí đánh giá | Phương án 1: **Upstash Serverless Redis (REST API)** — **LỰA CHỌN DUY NHẤT** | Phương án 2: Self-hosted Redis (VPS / Docker Redis) | Phương án 3: Supabase PostgreSQL (Atomic RPC Table) | Phương án 4: Cloudflare KV / Durable Objects |
| :--- | :--- | :--- | :--- | :--- |
| **Giao thức & Tương thích Serverless / Edge** | **Hoàn hảo (100% Native HTTP/REST)**. Không duy trì persistent TCP sockets, không bị cạn kiệt connection pool khi scale hàng nghìn hàm. | **Kém trên Serverless**. Dùng TCP connection trực tiếp; dễ làm nghẽn Max Clients limit của Redis nếu không có proxy connection pooling (Twemproxy/Envoy). | Khá. Hỗ trợ qua HTTP PostgREST hoặc PgBouncer connection pooler (port 6543). | Tốt trên Edge, nhưng khó tích hợp trực tiếp ngoài hệ sinh thái Cloudflare. |
| **Độ trễ trung bình (p95 Latency)** | **$\approx 15 - 35\text{ms}$** (qua Edge REST API tối ưu toàn cầu). | $< 2\text{ms}$ (nếu cùng VPC/DC), nhưng $> 100\text{ms}$ nếu cross-region. | $\approx 40 - 80\text{ms}$ (overhead của SQL parser, planner, WAL writes). | $< 20\text{ms}$ tại Cloudflare Edge. |
| **Chi phí vận hành hàng tháng (Cost Overhead)** | **0 USD / tháng** (Bậc Free tier: 10,000 commands/ngày; $0.2 / 100k commands tiếp theo). | **Tối thiểu 5 - 15 USD / tháng** (tiền thuê VPS, backup volume, static IP). | **0 USD thêm** (tận dụng compute Supabase có sẵn). | Free tier có giới hạn, gói Paid từ 5 USD / tháng. |
| **Ảnh hưởng đến Cơ sở dữ liệu chính (DB Contention)** | **0% ảnh hưởng**. Tách biệt hoàn toàn khỏi PostgreSQL Supabase, bảo vệ tối đa IOPS cho dữ liệu nghiệp vụ du lịch. | **0% ảnh hưởng**. Tách biệt hoàn toàn khỏi PostgreSQL. | **Ảnh hưởng RẤT NẶNG**. Hàng nghìn write transactions mỗi phút gây lock contention, bloat WAL và cạnh tranh tài nguyên với RAG. | **0% ảnh hưởng**. |
| **Bảo trì & Vận hành (Ops / Maintenance)** | **Zero Ops (100% Fully Managed)**. Tự động sao lưu, nâng cấp phiên bản, SLA 99.99%. | **Rất cao (Self-managed Ops)**. Phải tự bảo mật firewall, vá lỗi OS, cấu hình Redis AOF/RDB snapshot, chống OOM crash. | Trung bình. Tự viết cron vacuums, dọn dẹp hàng triệu row rate limit hết hạn. | Thấp, nhưng phụ thuộc sâu vào hệ sinh thái nhà cung cấp. |
| **Hỗ trợ thuật toán trượt (Sliding Window Algorithm)** | Hỗ trợ chuẩn xác qua Atomic Lua script hoặc Token Bucket của `@upstash/ratelimit`. | Hỗ trợ qua Redis Lua script (ZSET hoặc HASH). | Hỗ trợ qua PostgreSQL Stored Procedure (plpgsql). | Hỗ trợ qua KV metadata hoặc Durable Object storage. |

---

## 3. Bảng Phân Tích Chi Phí Chi Tiết (Detailed Cost Analysis)

Dự báo lưu lượng của hệ thống Du Lịch Tri Tôn AI:
- Giai đoạn hiện tại (Production-Ready Launch): $\approx 1,500 - 3,500$ requests/ngày (gồm du khách tra cứu bản đồ, lịch trình và chatbot).
- Giai đoạn cao điểm (Lễ hội Đua Bò Bảy Núi, Chôl Chnăm Thmây): $\approx 15,000 - 30,000$ requests/ngày.

| Nhà cung cấp / Giải pháp | Bậc miễn phí (Free Tier) | Chi phí vượt ngưỡng (Over-quota Cost) | Chi phí ước tính bình quân/tháng | Chi phí ước tính mùa lễ hội/tháng | Đánh giá ngân sách dự án |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Upstash Redis (Serverless)** | **10,000 requests/ngày** (~300,000 req/tháng) | **$0.20 / 100,000 requests** | **0.00 USD / tháng** | **$\approx 1.20 - 2.50$ USD / tháng** | 🟢 **Tối ưu ngân sách tuyệt đối (99% tiết kiệm)** |
| **Self-Hosted Redis (VPS 1GB)** | Không có (tính tiền theo giờ VPS) | Chi phí cố định hàng tháng | 6.00 - 12.00 USD / tháng | 6.00 - 12.00 USD / tháng | 🟡 Tốn chi phí cố định ngay cả khi không có tải |
| **Supabase Postgres (Database)** | Tận dụng quota DB | Gây hao hụt IOPS / CPU Compute của Postgres | 0.00 USD (nhưng rủi ro nâng plan DB tốn $25/tháng) | Có thể đẩy database chạm trần CPU (Overheating) | 🔴 Rủi ro cạnh tranh IOPS với dữ liệu chính |
| **Cloudflare KV** | 100,000 reads/ngày, 1,000 writes/ngày | $0.50 / 1,000,000 writes (bị giới hạn 1,000 write/ngày ở Free) | Bị chặn giới hạn Write 1k/ngày ở Free, buộc mua Workers Paid ($5/tháng) | 5.00 USD / tháng | 🟡 Ràng buộc hạ tầng không đồng nhất |

---

## 4. Quyết Định Duy Nhất Tại Decision Gate G3 (Official Architecture Decision)

Hội đồng kỹ thuật chính thức phê duyệt quyết định kiến trúc:

### 4.1. Lựa chọn Backend Phân Tán Duy Nhất:
- **Primary Distributed Backend:** **Upstash Serverless Redis (Giao thức HTTP/REST API)**.
- **Tiêu chuẩn kết nối:** Sử dụng biến môi trường chuẩn `UPSTASH_REDIS_REST_URL` và `UPSTASH_REDIS_REST_TOKEN` (hoặc `REDIS_REST_URL` / `REDIS_REST_TOKEN`).
- **Cơ chế hoạt động:** 
  - Giao tiếp hoàn toàn qua chuẩn HTTPS REST calls nhẹ, không giữ kết nối socket TCP nhàn rỗi.
  - Sử dụng thuật toán **Sliding Window Counter** hoặc **Token Bucket** có tính nguyên tử cao (Atomic increment kèm TTL tự động hủy).

### 4.2. Cơ chế Suy Thoái Tự Động & An Toàn Cao (Graceful In-Memory Degradation Policy):
- Nhằm tuân thủ nguyên tắc **Production-Real & Fail-Safe**:
  - Nếu hệ thống chạy trong môi trường phát triển cục bộ (Local Dev) hoặc khi biến môi trường Upstash Redis chưa được nạp, hệ thống **tự động chuyển mạch an toàn sang In-Memory Sliding Window** với cảnh báo kiểm toán rõ ràng.
  - Nếu kết nối tới Upstash Redis bị lỗi mạng hoặc timeout bất thường ($\text{timeout} > 1500\text{ms}$), hệ thống **tự động suy thoái về bộ đếm RAM cục bộ**, tuyệt đối không làm gián đoạn request của du khách hoặc gây crash 500 toàn hệ thống.

### 4.3. Phân Tầng Hạn Mức Tốc Độ Chuẩn (Rate Limit Quota Tiers):

Hệ thống thiết lập 4 phân tầng giới hạn tốc độ phục vụ các mục tiêu an ninh khác biệt:

1. **Tầng 1 — Chatbot AI Query (`chat_query`):**
   - **Hạn mức:** **20 requests / 60 giây / IP**.
   - **Mục tiêu:** Ngăn chặn bot cào token LLM, chống lạm dụng Groq LLaMA và Google Gemini.
2. **Tầng 2 — Quản trị viên thay đổi dữ liệu (`admin_mutation`):**
   - **Hạn mức:** **30 requests / 60 giây / Admin Session**.
   - **Mục tiêu:** Chống bùng nổ mutation hàng loạt (tạo/sửa/xóa địa danh, bulk upload, trigger revalidate).
3. **Tầng 3 — Xác thực đăng nhập (`auth_login`):**
   - **Hạn mức:** **5 requests / 60 giây / IP**.
   - **Mục tiêu:** Chống tấn công dò mật khẩu vét cạn (Brute-force password attack) tại `/api/v1/admin/auth/login`.
4. **Tầng 4 — API công cộng chung (`public_api`):**
   - **Hạn mức:** **90 requests / 60 giây / IP**.
   - **Mục tiêu:** Cho phép du khách lướt bản đồ, danh sách POI, danh bạ cứu hộ trôi chảy nhưng chặn scraper tự động.

---

## 5. Lộ Trình Triển Khai Tiếp Theo (Implementation Roadmap)

1. **P05-012 (Hiện tại):** Ban hành Decision Record kỹ thuật chính thức `DR-G3-RATELIMIT-BACKEND-001`, thiết lập module hợp đồng cấu hình `frontend/src/lib/rateLimitConfig.ts`, và viết bộ kiểm thử nghiệm thu `frontend/scripts/rate-limit-backend-decision.test.mjs`.
2. **P05-013:** Chuyển đổi và nâng cấp `frontend/src/lib/rateLimiter.ts` hỗ trợ Distributed Backend (Upstash REST client) kèm Cross-Instance Integration Test.
3. **P05-014:** Áp dụng rate limit chuyên biệt cho chat query (`chat_query`: 20 req/60s) trả về HTTP 429 chuẩn kèm headers `Retry-After`.
4. **P05-015:** Áp dụng rate limit chuyên biệt cho admin mutations (`admin_mutation`: 30 req/60s) bảo vệ toàn diện các mutation endpoints.

---

*Tài liệu này là căn cứ pháp lý và kiến trúc duy nhất để phê duyệt Decision Gate G3 đối với hạ tầng phân tán giới hạn tốc độ của Hệ thống Du Lịch Tri Tôn AI.*
