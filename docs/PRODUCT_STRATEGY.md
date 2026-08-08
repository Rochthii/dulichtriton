# BẢN CHIẾN LƯỢC SẢN PHẨM TOÀN DIỆN
## DU LỊCH TRI TÔN AI — `dulichtriton`
> Cập nhật: 2026-08-08 | Version: STRATEGY-v1.2 | Trạng thái: PRODUCTION ACTIVE

---

## PHẦN 0: PHÂN TÍCH HIỆN TRẠNG REPO — "ĐIỂM ĐỨNG" THỰC TẾ

### Bảng đánh giá tầng kỹ thuật

| Tầng | Đã có | Chất lượng | Khoảng trống |
|---|---|---|---|
| **Dữ liệu** | 82 POI chuẩn hoá NFC, ảnh verify nguồn, TikTok hashtag, GeoJSON | Rất mạnh | Top 20 POI cần >= 1 video embed thực tế |
| **AI Engine** | tourism_ai_core: 14-step Orchestrator, LLM Router, RAG pgvector | Mạnh kỹ thuật | **Quá phức tạp cho MVP** — latency chưa đo |
| **Frontend** | Next.js 16, 13 routes, design system xanh rừng, sơ đồ node lịch trình | Đã có khung | Chưa xác nhận mobile/offline; chưa có analytics |
| **Video-First** | TikTokReviewSection -> VideoModal (Phase 1 done 08/08/2026) | Vừa hoàn thiện | Cần populate embed_url thực tế cho 18 records |
| **Crawler** | tourism_crawler: auto-update + hardened security | Production-ready | — |
| **Kiểm thử** | tests: golden dataset, 5-pillar eval | Nền tảng có | Chưa chạy Ragas baseline |
| **Người dùng thật** | — | BẰNG 0 | Không analytics, không beta user, không feedback loop |

### Phát hiện chiến lược quan trọng nhất

Repo phát triển cực nhanh nhờ AI (v10.1.0 -> v11.0.0 trong ~4 ngày).
Rủi ro số 1 KHÔNG còn là công nghệ — mà là "xây trong chân không":
phiên bản phình to nhưng chưa một người dùng thật chạm vào.

**Hệ quả:** MVP không phải là "build thêm" — mà là đóng băng tính năng + đưa bản hiện tại cho 100 GenZ thật + đo lường.

---

## PHẦN 1: GÓC NHÌN NGƯỜI DÙNG (GENZ) — USER-CENTRIC FOUNDATION

### 1.1 JTBD — "Việc Cần Làm" Trong 1 Câu

"Khi tôi thấy một video đẹp về Tri Tôn, tôi muốn trong 2 phút có một kế hoạch đi được thật — đáng check-in, không hố, không lạc, hết sóng vẫn dùng — để tôi còn kịp đi cuối tuần này."

### 1.2 Ma Trận Nhu Cầu — Điểm Đau — Giải Pháp

| Người dùng CẦN | Người dùng MUỐN | Điểm đau (Pain Points) | Giải pháp (Feature) |
|---|---|---|---|
| Quyết định nhanh | Xem 15s là chốt | Blog dài, info cũ, quán đóng cửa | Feed vuốt dọc + card giờ mở cửa & giá thật |
| Không bị hố | Biết quán authentic | Sợ tourist trap, sợ chặt chém | Giá minh bạch + review xác minh (V1) |
| Không lạc khi hết sóng | Map offline | Google Maps chết trên núi | QR offline + GeoJSON export |
| Ảnh đẹp để đăng | Góc chụp + giờ vàng | Đến nơi xấu hơn video | Thẻ góc chụp + khung giờ vàng + ảnh/video thật |
| Đi rẻ | Budget rõ ràng | Sợ phát sinh chi phí | Filter miễn phí/rẻ + giá từng món |
| Thành tựu để khoe | Badge, streak, share | Đi về không để lại gì | Achievement badge + 1-click export TikTok (V1) |

### 1.3 Chân Dung Người Dùng (Personas)

**Persona A — Phượt Thủ Săn Ảnh (18-24 tuổi)**
- Hành vi: Tìm địa điểm qua TikTok trước, ưu tiên xe máy, cần góc chụp đẹp, giờ vàng
- Pain: Đến sai giờ, ảnh mạng ảo, đường nhỏ không có GPS offline
- Metric: Session > 3 phút, QR export rate > 15%

**Persona B — Nhóm Bạn Ăn Uống (22-28 tuổi)**
- Hành vi: Tìm quán ăn ngon thật, cần xác nhận giờ mở cửa, số điện thoại đặt trước
- Pain: Đến nơi quán đóng cửa hoặc hết gà đốt, không biết chờ bao lâu
- Metric: Click "Gọi đặt trước" > 20%, Food page engagement > 4 phút

**Persona C — Gia Đình Cuối Tuần (25-35 tuổi)**
- Hành vi: Cần lịch trình rõ ràng, bãi đậu xe ô tô, homestay đủ phòng
- Pain: Đi lòng vòng tốn xăng, thiếu thông tin thực tế
- Metric: Itinerary export > 10%, homestay click rate

---

## PHẦN 2: MVP v1.0 PUBLIC — "2 PHÚT LÀ CHỐT ĐƯỢC CHUYẾN ĐI"

### 2.1 Định Nghĩa Bằng Kết Quả Người Dùng

Một GenZ mở app → < 2 phút có lịch trình cụ thể → cuối tuần đi thật → quét QR khi hết sóng → về đăng TikTok.

### 2.2 Nối Cứng 2 Nguyên Tắc Cốt Lõi Về Trải Nghiệm & Dòng Tiền (Core Principles)

> 1. **KHÔNG ĐĂNG NHẬP (Zero-Friction UI)**: Du khách sử dụng app **miễn phí 100% không rào cản**, không bắt tạo tài khoản/OTP. Lưu Wishlist & Tour bằng LocalStorage/IndexedDB; Xuất QR/PDF offline 1-click.
> 2. **KHÔNG THU TIỀN DỰ ĐẦU DU KHÁCH**: App hoàn toàn miễn phí cho du khách. Dòng tiền nuôi bộ máy được thu từ **Hệ sinh thái B2B/B2G địa phương** (Chủ quán/Homestay trả phí Tích xanh xác minh + Phí hoa hồng đặt trước + Hợp tác truyền thông văn hóa xã/thị trấn).

### 2.3 Năm MUST-HAVE (ánh xạ thẳng vào repo)

| # | Feature MVP | Trạng thái repo | Còn phải làm |
|---|---|---|---|
| M1 | Feed vuốt dọc 82 POI (ảnh thật + video TikTok nhúng) | VideoModal + VideoGallery done (Phase 1) | Populate embed_url thực tế cho 18 records trong Supabase |
| M2 | AI chat "bạn thân" 3 intent: đi đâu / ăn gì / chụp đâu → card+map, KHÔNG paragraph | Orchestrator 14 bước có | Wrap còn 3 intent; tone slang GenZ; latency < 3s |
| M3 | 3 lịch trình mẫu tối ưu (1 ngày / 2N1D / food tour) theo cụm địa lý + khung giờ | Sơ đồ node itinerary có | Render timeline mobile + nút QR export |
| M4 | Map offline + QR export lịch trình | GeoJSON có, chưa có PWA offline thật | Build service worker + QR generator |
| M5 | Dữ liệu sạch: giờ mở cửa thật, giá, tọa độ chuẩn WGS84 | 82 POI verify nhưng embed_url còn thiếu | Gọi điện xác nhận 5 quán hot nhất; populate video embed |

### 2.4 Bảy MUST-NOT (đóng băng scope)

1. **Tuyệt đối không bắt đăng nhập / tạo tài khoản** ở bản MVP/V1 (Dùng LocalStorage)
2. Multi-agent AI phức tạp (giữ 3 intent đơn giản)
3. Booking / thanh toán (dùng Zalo redirect trong V1)
4. Review UGC user upload (dùng TikTok hashtag thay thế)
5. Giao diện tiếng Anh (chỉ tiếng Việt)
6. Dashboard chủ quán (V2)
7. Mọi tính năng mới cho tới khi metric MVP đạt

---

## PHẦN 3: VERSION 1 (Tháng 2-4) — "TIN & QUAY LẠI"

**Mục tiêu người dùng:** "Lần 2 tôi đi, và tôi rủ thêm bạn."
**Metric đo:** Retention D30 > 20% — Share rate > 8%

| # | Feature | Pain point giải quyết |
|---|---|---|
| V1.1 | Review thật + xác minh bằng GPS check-in | Hết thời rating nội bộ 4.5 sao giả |
| V1.2 | Đặt gà đốt / homestay qua Zalo OA (trước 1-2h) | Đến nơi hết gà, chờ 90 phút |
| V1.3 | Cảnh báo real-time: "lúa đã gặt", "quán đang đông", "trời mưa" | Đến nơi thất vọng |
| V1.4 | Achievement badges + streak ("Bình minh Tà Pạ", "Gà đốt Master") | Khoe thành tựu -> viral organic |
| V1.5 | 1-click export TikTok (video 15s + caption + hashtag gợi ý) | Biến mỗi user thành kênh marketing |

---

## PHẦN 4: VERSION 2 (Tháng 5-9) — "TIỀN & HỆ SINH THÁI"

**Mục tiêu:** Platform tự nuôi sống bằng dòng tiền B2B/B2G địa phương
**Metric đo:** GMV > 500tr/tháng — 50 quán onboard

| # | Feature | Dòng tiền (Monetization Stream) |
|---|---|---|
| V2.1 | Phí Tích Xanh & Ưu tiên hiển thị (Featured Listing) | 200k - 500k/tháng per quán/homestay |
| V2.2 | Hoa hồng đặt bàn / giữ phòng trước (Booking Lead) | Commission 5% - 10% |
| V2.3 | Truyền thông sự kiện văn hóa Lễ hội địa phương | Ngân sách B2G Phòng Văn hóa |
| V2.4 | Dashboard chủ quán (xem giờ cao điểm, lượt xem) | Premium B2B Subscription |
| V2.5 | White-label nhượng quyền SaaS sang Tịnh Biên / Châu Đốc | B2B SaaS license fee |

---

## PHẦN 5: CHECKLIST HÀNH ĐỘNG — ÁNH XẠ TỪNG THƯ MỤC REPO

### P0 — Làm ngay, không chậm trễ

| Hạng mục | Repo | Hành động cụ thể |
|---|---|---|
| Analytics | frontend/ chưa có | Thêm Vercel Analytics + custom events |
| Populate embed_url | Supabase videos 18 records | Update embed_url TikTok thực tế; verify từng link còn sống |
| Beta 100 GenZ | Chưa có | Recruit SV An Giang/Cần Thơ; giao MVP link; phỏng vấn sâu 10 người |
| Verify dữ liệu POI | data/tri_ton_master_cleaned.csv | Gọi điện xác nhận giờ mở cửa + giá 5 quán hot nhất |

---

## PHẦN 6: CHỐT HẠ

1. **Gắn analytics** — không có cái này mọi version sau là mù tịt.
2. **Recruit 100 beta users GenZ** — kiểm chứng giả thuyết.

---
*Tai lieu nay supersede: docs/mvp_scope_and_checklist.md, docs/11_Roadmap.md*
*Cap nhat boi: Du Lich Tri Ton AI System | 2026-08-08 (v1.2)*
