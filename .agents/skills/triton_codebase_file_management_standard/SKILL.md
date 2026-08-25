---
name: triton-codebase-file-management-standard
description: Comprehensive architecture standards, file organization protocols, component decomposition limits (<300 lines), naming conventions, and long-term maintenance lifecycles for the Tri Ton Tourism platform.
---

# DU LỊCH TRI TÔN — CODEBASE FILE MANAGEMENT & MAINTENANCE STANDARD (v1.0)

## 📌 Tổng Quan (Overview)
Kỹ năng quy chuẩn toàn diện về **tổ chức cây thư mục**, **quản lý file**, **giới hạn kích thước component (<300 dòng)**, **quy tắc đặt tên nhất quán** và **quy trình bảo trì lâu dài** cho Hệ thống Trợ lý Du Lịch Tri Tôn AI bản địa.

---

## 📜 5 Quy Tắc Bắt Buộc (Rules Directory):
- [RULE 01: Production Real, No Mock](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/01_production_real_no_mock.md)
- [RULE 02: Địa Giới Hành Chính Xã/Thị Trấn](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/02_vietnamese_geography_boundary.md)
- [RULE 03: Bảo Mật Môi Trường & 0% Hardcode](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/03_security_env_credentials.md)
- [RULE 04: Phản Biện 360 Độ & Chủ Động Hỏi Lại](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/04_critique_360_proactive_inquiry.md)
- [RULE 05: Chuẩn Xác Văn Hóa & Ẩm Thực](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/05_culinary_cultural_accuracy.md)

---

## 🏗️ Cấu Trúc Cây Thư Mục Chuẩn (Canonical Directory Layout)

```text
dulichtriton/
├── frontend/src/
│   ├── app/                         # 🧭 Next.js App Router (Pages, Routes, Layouts)
│   │   ├── layout.tsx               # Root Layout, Fonts, Providers, Metadata
│   │   ├── page.tsx                 # Trang chủ tinh gọn (<250 dòng)
│   │   ├── places/                  # Danh mục khám phá & Chi tiết địa điểm ([id]/page.tsx)
│   │   ├── food/                    # Khám phá ẩm thực Bảy Núi
│   │   ├── stay/                    # Danh bạ lưu trú & homestay
│   │   ├── culture/                 # 37 Chùa Khmer & 6 Đại lễ hội
│   │   ├── itinerary/               # Chi tiết & điều hướng tour khép vòng
│   │   ├── planner/                 # Công cụ tạo lịch trình thông minh
│   │   ├── map/                     # Bản đồ GIS thực địa
│   │   ├── emergency/               # Danh bạ cứu hộ SOS 24/7
│   │   ├── guide/                   # Cẩm nang di chuyển & an toàn
│   │   ├── partner/                 # Cổng liên kết đối tác O2O
│   │   └── api/                     # Backend Serverless Route Handlers (Chatbot, Analytics, Sync)
│   │
│   ├── components/                  # 🧩 Reusable & Domain-Specific UI Components
│   │   ├── home/                    # 🌟 Sub-components của Trang Chủ
│   │   │   ├── HomeHeroSection.tsx
│   │   │   ├── HomeTimeSlotSection.tsx
│   │   │   ├── HomeClustersSection.tsx
│   │   │   ├── HomeItinerariesSection.tsx
│   │   │   └── HomeEmergencyBanner.tsx
│   │   │
│   │   ├── places/                  # Sub-components của Trang Khám Phá Địa Điểm
│   │   ├── food/                    # Sub-components của Trang Ẩm Thực
│   │   ├── culture/                 # Sub-components của Trang Lễ Hội & Văn Hóa
│   │   ├── itinerary/               # Sub-components của Trang Lịch Trình
│   │   │
│   │   ├── SiteNav.tsx              # Thanh điều hướng toàn cục (Header)
│   │   ├── Footer.tsx               # Chân trang toàn cục
│   │   ├── PlaceCard.tsx            # Thẻ hiển thị địa điểm chuẩn hóa
│   │   ├── ChatbotWidget.tsx        # Widget Trợ lý AI Du Lịch Tri Tôn nổi
│   │   ├── TriTonWeatherWidget.tsx  # Widget vi khí hậu thực địa
│   │   ├── SmartTripBuilderMini.tsx # Widget gợi ý tour nhanh
│   │   ├── SearchAutocomplete.tsx   # Thanh tìm kiếm thông minh
│   │   └── FeedbackSection.tsx      # Form đóng góp ý kiến & phản hồi thực địa
│   │
│   ├── lib/                         # 🛠️ Shared Utilities, API Clients & Business Logic
│   │   ├── supabase.ts              # Supabase Client Singleton
│   │   ├── fastCache.ts             # SWR In-Memory & LocalStorage Fast Cache
│   │   ├── dataSanitizer.ts         # Xử lý text, fallback ảnh, normalize chuỗi
│   │   ├── externalLinks.ts         # Sinh liên kết Google Maps, TikTok Video
│   │   ├── imageOptimizer.ts        # Tối ưu hóa ảnh qua Cloudinary CDN (w, q, dpr)
│   │   ├── ragEngine.ts             # Bộ máy AI RAG & Context Enrichment
│   │   └── i18n/                    # Hệ thống đa ngôn ngữ & từ điển module
│   │       ├── LanguageContext.tsx  # Provider & useLanguage hook
│   │       └── dictionaries/        # 12 modules VI & EN (Khớp 1-to-1)
│   │
│   └── data/                        # 📦 Client Fallback Data (hero_images.json, local_pois.json)
│
├── data/                            # 🗄️ Master Datasets (tri_ton_master_cleaned.csv, verified POIs)
├── scripts/                         # ⚡ DevOps, Ingestion & Database Sync Automation
│   └── sync/                        # smart_delta_sync.js, seed_database.js
├── tests/                           # 🧪 QA Test Suites (test_*.py, test_*.ts)
├── docs/                            # 📚 Tài liệu kỹ thuật, chiến lược Zalo, kiến trúc hệ thống
└── .agents/                         # 🤖 Agent Skills, Rules, Prompts & Coding DNA
```

---

## ⚡ 6 Quy Chuẩn Quản Lý File & Component (Code Quality Protocols)

### 1. Quy Tắc Giới Hạn Kích Thước Component (Max 300 Lines Rule)
- **Tuyệt đối cấm**: Một file `.tsx` (page hoặc component) dài vượt quá **300 dòng code**.
- **Quy tắc phân rã**: Khi một component phình to do chứa nhiều Section, bộ lọc, bảng Spotlight hoặc Form $\rightarrow$ **Bắt buộc phân tách thành các sub-components con** đặt trong thư mục `components/[domain]/`.
- **Ví dụ**:
  - `app/page.tsx` (>1.160 dòng) $\rightarrow$ Phân rã thành `components/home/HomeHeroSection.tsx`, `HomeTimeSlotSection.tsx`, `HomeClustersSection.tsx`, `HomeItinerariesSection.tsx`, `HomeEmergencyBanner.tsx`.

### 2. Phân Tách Rõ Ràng Data Logic & UI Presentation
- **Không viết inline helper dài**: Các hàm lọc mảng phức tạp, định dạng tiền tệ, xử lý URL hoặc làm sạch mô tả phải chuyển vào `src/lib/` (như `dataSanitizer.ts`, `externalLinks.ts`).
- **Data Fetching Pattern**:
  - Sử dụng `fetchWithCache` từ `src/lib/fastCache.ts` với cơ chế SWR (Stale-While-Revalidate) để đạt 0ms Initial Paint.
  - Luôn có fallback dữ liệu cục bộ từ `data/triton_pois_full.json` khi mạng gián đoạn.

### 3. Quy Chuẩn Đặt Tên File & Thư Mục (Strict Naming Conventions)

| Loại Tệp (File Type) | Cú Pháp Đặt Tên (Convention) | Ví Dụ Chuẩn |
| :--- | :--- | :--- |
| **React Components** | `PascalCase.tsx` | `PlaceCard.tsx`, `HomeHeroSection.tsx`, `SiteNav.tsx` |
| **Next.js Pages** | `page.tsx`, `layout.tsx` | `app/page.tsx`, `app/places/page.tsx` |
| **Shared Libraries** | `camelCase.ts` | `fastCache.ts`, `dataSanitizer.ts`, `ragEngine.ts` |
| **Modular Dictionaries** | `lowercase.ts` | `common.ts`, `home.ts`, `places.ts`, `food.ts` |
| **Data Files** | `snake_case.json / .csv` | `triton_pois_full.json`, `hero_images.json` |
| **Automation Scripts** | `snake_case.js / .py` | `smart_delta_sync.js`, `audit_images.py` |
| **QA Test Files** | `test_*.py` hoặc `*.test.ts`| `test_modular_i18n_dictionaries.py`, `test_bilingual_data_integrity.py` |

### 4. Quy Chuẩn Xử Lý Tệp Dữ Liệu & Asset Ảnh
- **Dữ liệu Master**: Duy nhất tệp `data/tri_ton_master_cleaned.csv` và `data/triton_pois_full.json` là nguồn chân lý thực địa.
- **Tối ưu hóa ảnh Cloudinary**:
  - Không tải ảnh dung lượng gốc từ mạng xã hội hoặc Unsplash không kiểm soát.
  - Sử dụng hàm `getOptimizedImageUrl(url, { width, quality, dpr })` để phục vụ định dạng `.avif` / `.webp` nén tối ưu.

### 5. Quy Chuẩn Dọn Dẹp Code Chết & Tệp Rác (Dead Code Elimination)
- Khi thay thế hoặc refactor một component cũ:
  1. Kiểm tra tất cả các import liên quan trong dự án qua grep search.
  2. Cập nhật các nơi sử dụng component mới.
  3. Xóa bỏ hoàn toàn file cũ, không lưu trữ các file tạm như `page_old.tsx`, `temp.js`, `test.tsx`.
- Thư mục `git` phải luôn sạch sẽ, không commit các file `dist`, `.next`, `node_modules` hay `.env.local`.

### 6. Quy Chuẩn Đồng Bộ & Đẩy Code (Git CI/CD Protocol)
- **PowerShell Rule**: Tuyệt đối **KHÔNG dùng `&&`**, BẮT BUỘC **dùng dấu chấm phẩy `;`** khi nối chuỗi lệnh trên Windows PowerShell:
  ```powershell
  python tests/test_modular_i18n_dictionaries.py ; python tests/test_bilingual_data_integrity.py ; git add . ; git commit -m "refactor(home): decompose page into modular components" ; git push origin populate_runtime_context:main ; git push origin populate_runtime_context
  ```
- **Commit Message Standard**:
  - `feat(...)`: Thêm tính năng / màn hình / widget mới.
  - `refactor(...)`: Tái cấu trúc, tách file, module hóa không đổi logic nghiệp vụ.
  - `fix(...)`: Sửa lỗi build, lỗi type, lỗi hiển thị.
  - `chore(...)`: Cập nhật cấu hình, dependencies, tài liệu Agent.

---

## 🧪 Quy Trình Kiểm Thử & Bảo Trì Định Kỳ (Maintenance Checklist)

Mỗi khi thực hiện bảo trì định kỳ hoặc nâng cấp module mới:
1. **Kiểm tra độ dài file**: Đảm bảo không có file nào vượt quá 300 dòng.
2. **Kiểm tra song ngữ**: Rà soát xem có chữ tiếng Việt cứng nào chưa qua `useLanguage()` không.
3. **Chạy QA Test Suites**:
   ```powershell
   python tests/test_modular_i18n_dictionaries.py ; python tests/test_bilingual_data_integrity.py
   ```
4. **Kiểm tra Git Status**: Đảm bảo không còn file rác và nhánh `main` luôn ở trạng thái sẵn sàng deploy trên Vercel.
