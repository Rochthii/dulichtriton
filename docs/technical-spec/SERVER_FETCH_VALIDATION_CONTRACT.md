# Server-Side Fetch URL Validation Contract — P01-020

**State:** `IMPLEMENTED` · **Scope:** All outbound server-side HTTP fetches in Next.js App Router (especially `scrape-images`, `gmaps-scraper`, and background sync) · **Owner:** Tri Ton Platform Security Engineering

Tài liệu này xác lập quy chuẩn kỹ thuật bắt buộc (**Contract Authority**) cho toàn bộ các thao tác `fetch()` hướng ra bên ngoài xuất phát từ server (Next.js server-side / Node.js runtime). Mọi module thực hiện gửi HTTP request với dữ liệu đầu vào do người dùng hoặc bên thứ ba cung cấp (**untrusted input**) bắt buộc phải tuân thủ nghiêm ngặt các ranh giới kiểm soát được định nghĩa tại đây nhằm triệt tiêu hoàn toàn các bề mặt tấn công SSRF (Server-Side Request Forgery).

---

## 1. Mô hình Đe dọa (Threat Model)

Hệ thống cung cấp các chức năng quản trị và công cộng có tiếp nhận URL từ người dùng hoặc quản trị viên:
1. `/api/v1/admin/scrape-images`: Quản trị viên nhập URL bài viết, liên kết ảnh hoặc Google Maps để hệ thống tự động tải HTML và trích xuất hình ảnh.
2. `/api/v1/admin/gmaps-scraper`: Quản trị viên nhập URL Google Maps hoặc từ khóa để thu thập tọa độ GPS và hình ảnh từ Google Places/CDN.

Nếu thiếu cơ chế kiểm duyệt chặt chẽ ở tầng network/fetch, kẻ tấn công có thể khai thác để:
- **Cloud Metadata Exfiltration**: Gửi request tới địa chỉ IMDS của AWS/GCP/Azure (`169.254.169.254`, `metadata.google.internal`) để đánh cắp access token, credential tạm thời của máy chủ.
- **Internal Network Scanning & Pivoting**: Quét và truy cập các dịch vụ nội bộ (VPC, Docker network, localhost, Redis `6379`, PostgreSQL `5432`, Elasticsearch `9200`, Next.js internal endpoints).
- **Protocol Smuggling / Scheme Abuse**: Khai thác các scheme nguy hiểm như `file:///etc/passwd`, `gopher://`, `data:`, `ftp:` để đọc file cục bộ hoặc gửi payload nhị phân.
- **DNS Rebinding Attack**: Cấu hình tên miền trỏ về IP công khai khi kiểm tra ban đầu, nhưng trả về IP nội bộ (`127.0.0.1`) khi request thực tế diễn ra.
- **Open Redirect SSRF**: Đưa ra một URL công khai hợp lệ ban đầu nhưng máy chủ từ xa phản hồi HTTP 301/302 chuyển hướng về `http://127.0.0.1` hoặc `http://169.254.169.254`.

---

## 2. Nguyên tắc Bất biến (Security Invariants)

| STT | Nguyên tắc | Hành vi bắt buộc |
|---|---|---|
| **INV-01** | **Fail-Closed** | Mọi trường hợp phân tích cú pháp URL lỗi, DNS lookup timeout/failure, hoặc không xác định được tính hợp lệ của IP đều **từ chối ngay lập tức** (throw error / reject). |
| **INV-02** | **HTTPS-Only** | Chỉ chấp nhận scheme duy nhất là `https:`. Mọi scheme khác (`http:`, `file:`, `data:`, `gopher:`, `ftp:`, `javascript:`, v.v.) bị từ chối 100%. |
| **INV-03** | **Zero Private/Loopback/Metadata IP** | Tuyệt đối không gửi request tới dải IP loopback, private RFC 1918, link-local, multicast, broadcast, cloud metadata (cả IPv4 và IPv6). |
| **INV-04** | **Anti-DNS Rebinding (Pre-resolution)** | Đối với mọi domain name, phải phân giải DNS (toàn bộ A và AAAA records) trước khi kết nối; nếu **bất kỳ** IP nào nằm trong dải cấm, request bị hủy bỏ ngay lập tức. |
| **INV-05** | **Zero Blind Redirect Follow** | Tuyệt đối không dùng `redirect: 'follow'` mặc định. Bắt buộc chặn redirect (`redirect: 'manual'`) và thẩm định lại toàn bộ chuỗi kiểm tra trên từng hop redirect trước khi tiếp tục. Tối đa 3 hops. |
| **INV-06** | **Default Port 443 Only** | Mặc định chỉ cho phép cổng HTTPS chuẩn (port 443 hoặc không khai báo port). Không cho phép port tùy ý trừ khi có cấu hình cho phép rõ ràng. |
| **INV-07** | **Response & Resource Limits** | Áp đặt timeout chặt chẽ (mặc định 6000ms) và giới hạn kích thước phản hồi tối đa (mặc định 10MB) để ngăn chặn tấn công từ chối dịch vụ (DoS / Zip bomb / Memory exhaustion). |

---

## 3. Quy chuẩn Kiểm duyệt Chi tiết (Detailed Validation Specification)

### 3.1. Ràng buộc Scheme
- **Cho phép duy nhất**: `https:` (không phân biệt hoa thường).
- **Từ chối**:
  - `http:` (Ngăn chặn eavesdropping, rò rỉ dữ liệu và tấn công downgrade).
  - `file:` (Ngăn chặn Local File Inclusion - LFI).
  - `data:`, `blob:` (Ngăn chặn in-memory payload execution).
  - `gopher:`, `ftp:`, `tftp:`, `ldap:`, `dict:` (Ngăn chặn protocol smuggling).
  - `javascript:`, `vbscript:` (Ngăn chặn script injection).

### 3.2. Danh sách Đen Dải Địa chỉ IP (CIDR Blacklist)

Hệ thống kiểm tra mọi địa chỉ IP (dù được cung cấp dưới dạng IP literal hay kết quả phân giải DNS) đối chiếu với danh sách các dải mạng không công cộng:

#### IPv4 Blacklist:
- `0.0.0.0/8` — Current network ("this" host)
- `10.0.0.0/8` — Private-Use Networks (RFC 1918)
- `100.64.0.0/10` — Shared Address Space / Carrier-Grade NAT (RFC 6598)
- `127.0.0.0/8` — Loopback (RFC 1122)
- `169.254.0.0/16` — Link-Local / Cloud Instance Metadata Service (RFC 3927)
- `172.16.0.0/12` — Private-Use Networks (RFC 1918)
- `192.0.0.0/24` — IETF Protocol Assignments (RFC 6890)
- `192.0.2.0/24` — Documentation / TEST-NET-1 (RFC 5737)
- `192.88.99.0/24` — 6to4 Relay Anycast (RFC 3068)
- `192.168.0.0/16` — Private-Use Networks (RFC 1918)
- `198.18.0.0/15` — Benchmarking (RFC 2544)
- `198.51.100.0/24` — Documentation / TEST-NET-2 (RFC 5737)
- `203.0.113.0/24` — Documentation / TEST-NET-3 (RFC 5737)
- `224.0.0.0/4` — Multicast (RFC 5771)
- `240.0.0.0/4` — Reserved for Future Use (RFC 1112)
- `255.255.255.255/32` — Limited Broadcast (RFC 919)

#### IPv6 Blacklist:
- `::/128` — Unspecified
- `::1/128` — Loopback
- `::ffff:0:0/96` — IPv4-mapped IPv6 (phải bóc tách IPv4 bên trong và kiểm tra theo danh sách IPv4)
- `64:ff9b::/96` — IPv4/IPv6 translation (RFC 6052)
- `2001:db8::/32` — Documentation (RFC 3849)
- `fc00::/7` — Unique Local Addresses (ULA / RFC 4193)
- `fe80::/10` — Link-Local Unicast (RFC 4291)
- `ff00::/8` — Multicast (RFC 4291)

#### Tên miền Đặc biệt bị Chặn (Reserved/Metadata Hostnames):
- `localhost`, `*.localhost`
- `*.local`, `*.internal`, `*.lan`
- `metadata.google.internal`, `metadata.goog`
- `instance-data` (AWS metadata alias)
- Tên miền không có dấu chấm (dotless domains) trừ khi được cấu hình đặc biệt.

### 3.3. Ràng buộc Port
- Mặc định chỉ cho phép `443` (hoặc cổng rỗng = ngầm định 443).
- Bất kỳ URL nào chỉ định port khác (ví dụ: `:80`, `:8080`, `:3000`, `:5432`, `:6379`, `:22`) đều bị từ chối với mã lỗi `INVALID_PORT`.

### 3.4. Hồ sơ Domain (Domain Profiles)

Hệ thống hỗ trợ 3 hồ sơ kiểm duyệt dựa trên ngữ cảnh nghiệp vụ:
1. **`PUBLIC_INTERNET` (Mặc định cho web scraping bài viết du lịch)**:
   - Cho phép bất kỳ domain công khai nào trên Internet, miễn là vượt qua toàn bộ các kiểm tra: HTTPS, cổng 443, DNS phân giải ra IP công khai hợp lệ, không dính IP/Hostname blacklist.
2. **`GOOGLE_MAPS` (Dành riêng cho `gmaps-scraper`)**:
   - Bắt buộc domain phải thuộc danh sách tin cậy của Google Maps:
     - `google.com`, `www.google.com`, `maps.google.com`
     - `*.google.com`, `*.googleusercontent.com`
     - `goo.gl`, `maps.app.goo.gl`
3. **`STRICT` (Allowlist Tường minh)**:
   - Chỉ cho phép các domain được khai báo tường minh trong `allowedDomains`.

### 3.5. Quy trình Xử lý Redirect An toàn (Safe Redirect Protocol)
Khi gọi `safeServerFetch`:
1. Gửi request ban đầu với cấu hình `redirect: 'manual'`.
2. Nếu mã phản hồi là `301`, `302`, `303`, `307`, `308`:
   - Đọc header `Location`.
   - Nếu `Location` là relative path, giải quyết relative path theo URL hiện tại: `new URL(location, currentUrl)`.
   - Chạy hàm `validateSafeFetchUrl` trên URL đích.
   - Nếu URL đích vi phạm (ví dụ: chuyển hướng sang `http://`, sang `127.0.0.1`, hoặc domain không được phép), hủy request và trả về lỗi SSRF ngay lập tức.
   - Đếm số lần chuyển hướng; nếu vượt quá `maxRedirects` (mặc định: 3), ném lỗi `MAX_REDIRECTS_EXCEEDED`.
3. Lặp lại cho đến khi nhận được response non-redirect hoặc lỗi.

---

## 4. Đặc tả Interface & Module Code

Module thực thi: [`frontend/src/lib/serverFetchValidator.ts`](file:///e:/Projects/Project_ca_nhan/dulichtriton/frontend/src/lib/serverFetchValidator.ts).

### TypeScript Types
```typescript
export type SafeFetchErrorCode =
  | 'INVALID_URL'
  | 'INVALID_SCHEME'
  | 'INVALID_PORT'
  | 'BLOCKED_HOSTNAME'
  | 'BLOCKED_IP'
  | 'DNS_RESOLUTION_FAILED'
  | 'DISALLOWED_DOMAIN'
  | 'MAX_REDIRECTS_EXCEEDED'
  | 'RESPONSE_TOO_LARGE'
  | 'FETCH_TIMEOUT';

export type DomainValidationProfile = 'PUBLIC_INTERNET' | 'GOOGLE_MAPS' | 'STRICT';

export interface SafeFetchValidationOptions {
  profile?: DomainValidationProfile;
  allowedDomains?: string[];
  allowedPorts?: number[];
  maxRedirects?: number;
  timeoutMs?: number;
  maxBodySizeBytes?: number;
  dnsLookupFn?: (hostname: string) => Promise<string[]>; // Cho phép mock trong unit test
}

export interface SafeUrlValidationSuccess {
  isValid: true;
  url: URL;
  resolvedIps: string[];
  hostname: string;
}

export interface SafeUrlValidationFailure {
  isValid: false;
  error: string;
  code: SafeFetchErrorCode;
  rejectedTarget?: string;
}

export type SafeUrlValidationResult = SafeUrlValidationSuccess | SafeUrlValidationFailure;
```

### Core Functions
- `validateSafeFetchUrl(rawUrl: string, options?: SafeFetchValidationOptions): Promise<SafeUrlValidationResult>`
- `assertSafeFetchUrl(rawUrl: string, options?: SafeFetchValidationOptions): Promise<URL>`
- `safeServerFetch(rawUrl: string, init?: RequestInit, options?: SafeFetchValidationOptions): Promise<Response>`

---

## 5. Bằng chứng Kiểm chứng & Kịch bản Kiểm thử Âm tính (Negative Test Suite)

Bộ kiểm thử [`frontend/scripts/server-fetch-validator.test.mjs`](file:///e:/Projects/Project_ca_nhan/dulichtriton/frontend/scripts/server-fetch-validator.test.mjs) kiểm chứng 100% các kịch bản sau:
1. **Scheme Tests**: Chấp nhận `https:`; từ chối `http:`, `file:`, `data:`, `gopher:`, `ftp:`, `javascript:`.
2. **IPv4 Blacklist Tests**: Từ chối `127.0.0.1`, `10.0.0.1`, `172.16.0.1`, `192.168.1.1`, `169.254.169.254`, `0.0.0.0`, `100.64.0.1`.
3. **IPv6 Blacklist Tests**: Từ chối `::1`, `fe80::1`, `fc00::1`, `::ffff:127.0.0.1`, `::ffff:169.254.169.254`.
4. **Hostname Blacklist Tests**: Từ chối `localhost`, `metadata.google.internal`, `instance-data`.
5. **Port Tests**: Chấp nhận 443; từ chối 80, 8080, 22, 5432.
6. **DNS Anti-Rebinding Tests**: Domain phân giải ra IP nội bộ lập tức bị từ chối; NXDOMAIN bị từ chối fail-closed.
7. **Profile Tests**:
   - `GOOGLE_MAPS` chỉ cho phép Google domains (`maps.google.com`, `lh3.googleusercontent.com`, `goo.gl`), từ chối domain khác.
   - `STRICT` chỉ cho phép domains trong allowlist.
8. **Redirect Tests**: Cho phép redirect HTTPS hợp lệ; chặn đứng redirect sang HTTP, localhost, hoặc metadata IP. Chặn vòng lặp redirect (> 3 hops).
9. **Body Size Tests**: Từ chối response vượt ngưỡng `maxBodySizeBytes`.

---

## 6. Lộ trình Triển khai Kế tiếp (Downstream Rollout Roadmap)

- **`P01-021`**: Chặn scheme không phải HTTPS tại `frontend/src/app/api/v1/admin/scrape-images/route.ts`.
- **`P01-022`**: Chặn private/loopback/link-local IP tại `scrape-images`.
- **`P01-023`**: Chỉ cho redirect sang allowlist tại `scrape-images`.
- **`P01-024`**: Áp dụng URL validation contract vào `frontend/src/app/api/v1/admin/gmaps-scraper/route.ts`.
- **`P01-025`**: Đặt request body-size limit cho `upload`.
- **`P01-026`**: Đặt MIME allowlist cho `upload`.
- **`P01-027`**: Bỏ Unsplash fallback khỏi `upload`.
- **`P01-028`**: Bỏ Unsplash fallback khỏi admin place creation.
