# CHANGELOG — DU LỊCH TRI TÔN AI

Tất cả những thay đổi, nâng cấp và cập nhật phiên bản của hệ thống **Du Lịch Tri Tôn** sẽ được ghi vết chi tiết tại tài liệu này.

Định dạng nhật ký dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) và tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [10.2.0-MASTER-CONSOLIDATED] — 2026-08-05

### 📊 Dữ liệu Master Chuẩn Hóa & Hợp Nhất (Master Consolidation)
* **Tăng trưởng Dataset**: Hợp nhất toàn bộ dữ liệu cào 19 nhóm từ khóa, Google Maps Scraper, quán ăn chuyên sâu và cà phê đồi núi vào bộ Master Dataset chính thức $\rightarrow$ **105 Địa điểm Đã Qua Kiểm Duyệt**.
* **Chuẩn Hóa 100%**:
  * Kiểm duyệt tọa độ nghiêm ngặt trong Bounding Box $[10.25 - 10.55 \text{ Lat}, 104.85 - 105.15 \text{ Lng}]$.
  * Áp dụng mã hóa tiếng Việt Unicode NFC cho 100% dữ liệu tên, mô tả, địa chỉ, xã/thị trấn.
  * Xóa bỏ hoàn toàn từ cấm *"Huyện Tri Tôn"* trên địa chỉ (chỉ ghi cấp Xã / Thị trấn).
* **Cập nhật Đồng bộ 4 File Master**:
  * [data/tri_ton_master_cleaned.csv](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_master_cleaned.csv) (`utf-8-sig`) — 105 bản ghi.
  * [data/tri_ton_master_cleaned.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_master_cleaned.json) (`utf-8`) — 105 bản ghi.
  * [data/tri_ton_master_cleaned.geojson](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_master_cleaned.geojson) (`WGS84`) — 105 ghim tọa độ số.
  * [data/tri_ton_database.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_database.json) (`utf-8`) — Multi-table master database.

---

## [10.1.0-DESIGN-SYSTEM-RELEASE] — 2026-08-05

### Nâng cấp & Tính năng mới (Added)
* **Tên thương hiệu chính thức**: Chốt tên hệ thống chính thức **Du Lịch Tri Tôn** (`dulichtriton.vn`) — *Trợ lý AI & Cổng Thông tin Du lịch Tri Tôn*.
* **Hệ thống Thiết kế (Design System Tokens)**: Khởi tạo [docs/design_system_specification.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/design_system_specification.md) quy định 100% màu sắc (`#1B4D3E` Emerald Green, `#D99B26` Golden Palm), kiểu chữ (`Inter`/`Outfit`), SVG Lucide Icons và quy cách linh kiện UI.
* **Quy chuẩn NO EMOJI (Strict Policy)**: Cấm 100% Emoji trên UI và toàn bộ tài liệu Markdown, chuyển hoàn toàn sang SVG Lucide Icons chuẩn.
* **Bộ Màn hình Prototype (16 Screens System)**:
  * Khởi tạo bộ 13 ảnh thiết kế Prototype thực tế showcased tại [docs/ui_prototype_showcase.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/ui_prototype_showcase.md).
  * Đã bao phủ 100% tất cả các luồng: Du khách, Chatbot RAG, Lập lịch trình 2D1N, QR Export, Homestay, Văn hóa Khmer, Bản đồ GIS, Partner Portal & Admin Dashboard.
* **User Personas & Pain Points**: Khởi tạo [docs/user_personas_and_pain_points.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/user_personas_and_pain_points.md) phân tích 4 chân dung du khách & Ma trận điểm mù UI/UX.
* **Bộ Tài liệu Kỹ thuật Cô đọng**: Tách 12 file tài liệu kỹ thuật trong `docs/` (`01_Project_Overview.md` đến `11_Roadmap.md` & `README.md`).
* **AI Agent Skill**: Khởi tạo [.agents/skills/triton_product_design/SKILL.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/.agents/skills/triton_product_design/SKILL.md) đóng gói bộ quy tắc thiết kế & Tech Stack (Next.js + Supabase + Vercel).
* **Crawl & Làm Sạch Dữ Liệu Theo 19 Nhóm Chuyên Sản (19-Group Cleaning Pipeline)**:
  * Khởi tạo và chạy thành công [scripts/crawl_and_clean_by_groups.py](file:///e:/Projects/Project_ca_nhan/dulichtriton/scripts/crawl_and_clean_by_groups.py) cào dữ liệu và phân loại làm sạch độc lập theo 19 nhóm từ khóa: *Restaurants, Quán ăn, Đặc sản, Cafe, Coffee, Homestay, Khách sạn, Chùa, Núi, Hồ, Điểm du lịch, Check in, Địa điểm sống ảo, Chợ, Chợ đêm, Gà đốt Ô Thum, Đu đủ đâm, Bò Bảy Núi, Bánh dân gian Khmer*.
  * Kiểm duyệt tọa độ Bounding Box $[10.25 - 10.55, 104.85 - 105.15]$, chuẩn hóa tiếng Việt NFC, loại bỏ từ cấm *"Huyện Tri Tôn"* và lưu kết quả phân nhóm tại [data/crawled_by_groups_cleaned.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/crawled_by_groups_cleaned.json).
* **Công cụ Crawl Data Google Maps (Food & Specialty Scraper)**:
  * Khởi tạo và chạy thành công script [scripts/build_full_google_maps_crawler.py](file:///e:/Projects/Project_ca_nhan/dulichtriton/scripts/build_full_google_maps_crawler.py) cào sạch dữ liệu các quán ăn, gà đốt Ô Thum, bún nước lèo, bánh canh lò rèn, bò nướng Ba Chúc, lò đường thốt nốt Châu Lăng & cà phê view đồi toàn cảnh Tri Tôn từ Google Maps.
  * Xuất dữ liệu đã kiểm duyệt Bounding Box & chuẩn hóa NFC vào [data/crawled_tri_ton.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/crawled_tri_ton.json).
* **Quy Chuẩn Công Nghệ Tối Ưu (Optimal Tech Stack Architecture)**:
  * Khởi tạo tài liệu [docs/tech_stack_architecture.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/tech_stack_architecture.md) hoạch định bộ công nghệ tối ưu cho 6 lớp kỹ thuật (Next.js 14, Supabase PostgreSQL + pgvector, FastAPI Python 3.11, Google Gemini AI, Leaflet GIS & Vercel).
* **Phạm vi Bản phát hành MVP (MVP Release Scope)**:
  * Khởi tạo tài liệu [docs/mvp_scope_and_checklist.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/mvp_scope_and_checklist.md) quy định rõ ràng danh mục chức năng Frontend (Trang chủ, Địa điểm, Chi tiết Hồ Tà Pạ nhúng TikTok, Ẩm thực Gà đốt & AI Chatbot Widget), CSDL Supabase, API FastAPI Core và tiêu chí hoàn thành MVP.
* **Nghiên cứu Dữ liệu Chuyên sâu (Deep Data Research)**:
  * Khởi tạo tài liệu [docs/tri_ton_comprehensive_data_research.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/tri_ton_comprehensive_data_research.md) nghiên cứu sâu 7 trụ cột dữ liệu (Hành chính 15 Xã/Thị trấn, Địa lý Thất Sơn Bảy Núi, Di sản Đồi Tức Dụp & Ba Chúc, Văn hóa 3 Đại lễ Khmer & Đua bò, Ẩm thực Gà đốt & Bún nước lèo, Mùa du lịch & Cảnh báo đường xá).
* **Dữ liệu Hệ thống Chi tiết (Extended Datasets)**:
  * Khởi tạo 5 bộ dữ liệu chuyên biệt trong `data/`: [tri_ton_itineraries.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_itineraries.json) (Lịch trình mẫu 1D & 2D1N), [tri_ton_videos.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_videos.json) (Embed Video TikTok/Shorts đã duyệt), [tri_ton_transportation.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_transportation.json) (Phương tiện & Nhà xe), [tri_ton_khmer_culture_etiquette.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_khmer_culture_etiquette.json) (Văn hóa & Lễ nghi Khmer) và [tri_ton_faqs.json](file:///e:/Projects/Project_ca_nhan/dulichtriton/data/tri_ton_faqs.json) (Hỏi đáp kinh nghiệm du lịch).
* **Chiến lược Kinh doanh & Marketing**:
  * Khởi tạo tài liệu [docs/monetization_and_marketing_strategy.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/monetization_and_marketing_strategy.md) hoạch định 4 nguồn doanh thu (Partner Listing, Affiliate Booking, Local Ads, Tour Guide) và 4 kênh quảng bá thương hiệu (TikTok/Shorts, SEO Top 1 Google, Sticker QR Offline, Viral Lịch trình).
* **Hạ tầng & Bảo mật (Security & Git)**:
  * Khởi tạo file [.gitignore](file:///e:/Projects/Project_ca_nhan/dulichtriton/.gitignore) loại bỏ 100% các file nhạy cảm (`.env`, `.env.local`), virtualenv (`venv/`), `node_modules/`, `.next/`, `logs/`.
  * Khởi tạo repository Git, commit 140 files mã nguồn/tài liệu và đẩy trực tiếp lên GitHub: `https://github.com/Rochthii/dulichtriton.git` trên nhánh `main`.
* **Chuyện Kể & Thương hiệu**:
  * Viết mới file [README.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/README.md) cô đọng, chuyên nghiệp với câu chuyện cảm hứng từ tác giả **Chăm Rốch Thi** (*Người con Tri Tôn, An Giang*).
* **AI Agent Rules & Protocol**:
  * Đóng gói **RULE-19 (Mandatory Changelog Updates)** vào [AGENTS.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/AGENTS.md) và [.agents/ai_rules.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/.agents/ai_rules.md).
  * Bắt buộc AI Agent tự động ghi vết mọi hành động sửa code, cập nhật tính năng hoặc chỉnh sửa dữ liệu vào `CHANGELOG.md` trong tương lai.

---

## [10.0.0-MASTER-DATA-VERIFIED] — 2026-08-05

### Dữ liệu & Hệ thống (Initial Master Release)
* **Master Dataset 82 Địa điểm**: Xác minh và làm sạch 82 bản ghi địa điểm tại `data/tri_ton_master_cleaned.csv`.
* **Giới hạn Địa lý (Bounding Box)**: Ràng buộc tọa độ nghiêm ngặt trong Latitude [10.25, 10.55] và Longitude [104.85, 105.15].
* **Chuẩn hóa Hành chính**: Tuyệt đối không dùng từ "Huyện Tri Tôn" trong địa chỉ — chỉ ghi cấp Xã / Thị trấn.
* **Chuẩn hóa Văn bản**: Áp dụng mã hóa Unicode NFC cho toàn bộ dữ liệu tiếng Việt.
* **Xuất Dữ liệu Multi-format**: Cung cấp định dạng CSV (`utf-8-sig`), JSON (`utf-8`), và GeoJSON (`WGS84`).
