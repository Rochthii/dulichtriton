---
name: triton-bilingual-i18n-standard
description: Production standards, architectural protocols, modular dictionary patterns, and developer workflows for bilingual (Vietnamese & English) localized tourism systems with zero hardcoded text, type-safe Next.js dictionaries, and bilingual AI RAG engines.
---

# DU LỊCH TRI TÔN — BILINGUAL i18n & MODULAR DICTIONARY STANDARD (v1.0)

## 📌 Tổng Quan (Overview)
Kỹ năng quy chuẩn toàn diện về kiến trúc đa ngôn ngữ (Bilingual English - Vietnamese), quản lý từ điển module hóa theo trang (Modular Dictionaries), làm sạch 100% hardcode và cơ chế phản hồi AI RAG đa ngữ cho Hệ thống Trợ lý Du Lịch Tri Tôn AI bản địa.

---

## 📜 5 Quy Tắc Bắt Buộc (Rules Directory):
- [RULE 01: Production Real, No Mock](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/01_production_real_no_mock.md)
- [RULE 02: Địa Giới Hành Chính Xã/Thị Trấn](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/02_vietnamese_geography_boundary.md)
- [RULE 03: Bảo Mật Môi Trường & 0% Hardcode](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/03_security_env_credentials.md)
- [RULE 04: Phản Biện 360 Độ & Chủ Động Hỏi Lại](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/04_critique_360_proactive_inquiry.md)
- [RULE 05: Chuẩn Xác Văn Hóa & Ẩm Thực](file:///C:/Users/Admin/.gemini/antigravity/worktrees/dulichtriton/populate_runtime_context/.agents/rules/05_culinary_cultural_accuracy.md)

---

## 🏗️ Kiến Trúc Từ Điển Module Theo Trang (12 Modules)

Toàn bộ từ điển được lưu trữ tập trung tại `frontend/src/lib/i18n/dictionaries/`:

```text
frontend/src/lib/i18n/
├── LanguageContext.tsx              # React Context Provider + useLanguage() hook
└── dictionaries/
    ├── vi/                          # 🇻🇳 12 Module Từ Điển Tiếng Việt
    │   ├── common.ts                # Header, Footer, Actions, Badges, Units, Search
    │   ├── home.ts                  # Hero Banner, 4 Cụm Thắng Cảnh, Pain-Point Chips, Sections
    │   ├── places.ts                # Danh mục 149 POIs, 15 Xã & Thị trấn, Chi tiết địa điểm
    │   ├── food.ts                  # Đặc sản Bảy Núi, Quy chuẩn ẩm thực, Menu chữ ký
    │   ├── stay.ts                  # Homestay, Khách sạn, Tiện ích, Hướng dẫn đặt phòng
    │   ├── culture.ts               # 37 Chùa Khmer, 6 Đại lễ hội, Quy chuẩn viếng, Di sản, Sampheah
    │   ├── itinerary.ts             # 27 Tour khép vòng, Bộ lọc thời lượng, Xuất lịch trình
    │   ├── map.ts                   # Lớp bản đồ GIS, Định vị GPS thực địa, Chú giải
    │   ├── guide.ts                 # Tuyến xe khách, Thuê xe máy, Cảnh báo an toàn đèo dốc
    │   ├── emergency.ts             # Danh bạ cứu hộ khẩn cấp 15 Xã & Thị trấn (SOS 24/7)
    │   ├── partner.ts               # Cổng đối tác kinh doanh, Biểu mẫu đăng ký O2O
    │   └── chatbot.ts               # Lời chào AI, Câu hỏi gợi ý thực địa, Disclaimer
    │
    ├── en/                          # 🇬🇧 12 Module Từ Điển Tiếng Anh (Khớp Cấu Trúc 1-to-1)
    │   └── [common.ts, home.ts, places.ts, food.ts, stay.ts, culture.ts, ...]
    │
    ├── vi.ts                        # Master Dictionary Aggregator (Tiếng Việt)
    └── en.ts                        # Master Dictionary Aggregator (Tiếng Anh)
```

---

## ⚡ 5 Quy Chuẩn Kỹ Thuật Bắt Buộc (Core Technical Protocols):

### 1. Tuyệt Đối 0% Hardcode Trong Component UI
- **Cấm**: Khai báo chuỗi văn bản tĩnh, mảng danh sách (như danh bạ cứu hộ, danh sách lễ hội, quy chuẩn viếng chùa) trực tiếp trong file `.tsx`.
- **Bắt buộc**: Đưa vào file module tương ứng trong `vi/*.ts` và `en/*.ts`.
- **Cách dùng chuẩn**:
  ```tsx
  const { language, dict, t } = useLanguage();
  const cu = dict.culture;
  const isEn = language === 'en';
  ```

### 2. Chuẩn Hóa Dữ Liệu POIs Song Ngữ (Database & Schema)
Mọi bản ghi địa điểm (138+ POIs) bắt buộc phải có đầy đủ trường tiếng Anh song song:
- `name` $\rightarrow$ `name_en`
- `category` $\rightarrow$ `category_en`
- `description` $\rightarrow$ `description_en`
- `detailed_story` $\rightarrow$ `detailed_story_en`
- `field_tips` $\rightarrow$ `field_tips_en`
- `travel_guide_json` $\rightarrow$ `travel_guide_json_en`
- `checkin_spots_json` $\rightarrow$ `checkin_spots_json_en`
- `highlights_json` $\rightarrow$ `highlights_json_en`

### 3. Chuẩn Hóa Địa Danh & Văn Hóa Bản Địa (RULE 02 & RULE 05)
- **Địa giới hành chính 15 Xã & Thị trấn**:
  - Dịch chuẩn: *Chau Lang Commune*, *O Lam Commune*, *Nui To Commune*, *Co To Commune*, *Luong Phi Commune*, *Ba Chuc Town*, *Tri Ton Town*, v.v.
  - Không dùng cụm từ "Huyện Tri Tôn" trên giao diện mới.
- **Ẩm thực đặc thù**:
  - Gà đốt Ô Thum: *O Thum Clay-Pot Kaffir Lime Roasted Chicken*.
  - Bún cá củ ngải: *Khmer Fish Noodle Soup with Fingerroot & Kaffir Lime* (Không dùng mắm).
  - Cháo bò trái chúc: *Tri Ton Beef Porridge with Kaffir Lime & Beef Garnish*.
  - Di sản: *Palm-Leaf Manuscripts (Satra Slarkrit)*, *Pinpeat Orchestra*, *Sampheah Greeting*.

### 4. AI RAG Engine Nhận Diện Đa Ngôn Ngữ Tự Động
- **Engine Logic (`ragEngine.ts`)**:
  ```ts
  const isEnglishQuery = /^[a-zA-Z0-9\s,?.!'"-_]+$/.test(userQuestion.trim()) && !containsVietnameseAccents(userQuestion);
  ```
- Khi phát hiện câu hỏi tiếng Anh:
  - Sử dụng System Prompt tiếng Anh chuyên sâu về Bảy Núi.
  - Trích xuất dữ liệu tiếng Anh (`poi.name_en`, `poi.detailed_story_en`, `poi.field_tips_en`).
  - Sinh phản hồi 100% bằng tiếng Anh tự nhiên, kèm liên kết Google Maps và gợi ý tiếp theo.

### 5. Kiểm Chuẩn Toàn Vẹn Tự Động (Automated QA Test Suites)
Sau mọi thao tác chỉnh sửa từ điển hoặc dữ liệu, **bắt buộc chạy 2 bộ test**:
```powershell
python tests/test_modular_i18n_dictionaries.py ; python tests/test_bilingual_data_integrity.py
```
- `test_modular_i18n_dictionaries.py`: Kiểm tra sự tồn tại và khớp key 1-1 giữa 12 tệp `vi/` và `en/`.
- `test_bilingual_data_integrity.py`: Kiểm tra 100% POIs trong `triton_pois_full.json` có trường tiếng Anh.

---

## 💻 Quy Chuẩn Shell Windows PowerShell:
- **Tuyệt đối KHÔNG dùng `&&`**: PowerShell sẽ báo lỗi cú pháp.
- **BẮT BUỘC chỉ dùng dấu chấm phẩy `;`**: Khi nối chuỗi lệnh: `git add . ; git commit -m "..." ; git push origin ...`.
