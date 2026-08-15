# DESIGN SYSTEM SPECIFICATION: DU LICH TRI TON
## STYLE PARADIGM: "Folk-Modern Bảy Núi"

```yaml
TARGET_PARSER: "AI_CODING_AGENTS"
LANG: "EN-US"
STRICTNESS: "HIGH"
VERSION: "11.0.0"
PROJECT: "Tri Ton AI Tourism Web Portal & Chatbot System"
STYLE_ESSENCE: "Chất liệu dân dã miền núi Khmer (thốt nốt, lúa, chùa, nắng) + Ngôn ngữ app du lịch hiện đại (card, chip, metro-line, motion)"
```

## 1. DESIGN MANIFESTO & PHILOSOPHY
- `FOLK_MODERN_IDENTITY`: Grounded in authentic Seven Mountains landscape, Palmyra sugar palms, Tà Pạ emerald lake, ancient Khmer pagodas, and vibrant gastronomy.
- `NO_NEON_GRADIENTS`: Strictly FORBID neon purple/pink/indigo AI template gradients.
- `NO_GENERIC_TEMPLATES`: FORBID generic 3-column template grids with lorem ipsum.
- `WARM_SAND_CANVAS`: Nền cát sương ấm `#FAF3E7` (Nắng đồng lúa) replaces harsh pure `#FFFFFF` / pure `#000000`.
- `NO_EMOJIS`: FORBID emojis anywhere in UI. Use Lucide SVG `<Icon />` components ONLY.
- `REAL_MEDIA_ONLY`: Verified photography (`/images/tiktok/`, Tà Pạ, Ô Thum, Cô Tô, Soài So) & TikTok 9:16 reels.

---

## 2. COLOR PALETTE TOKENS (100% SOURCED FROM FIELD DATA)

```css
:root {
  --bg: #FAF3E7;            /* Nắng đồng lúa / Cát sương - Nền chính */
  --surface: #FFFDF7;       /* Bề mặt thẻ bưu thiếp */
  --ink: #26221B;           /* Đất đá núi Thất Sơn - Chữ chính */
  --ink-soft: #6B6355;      /* Đất phù sa - Chữ phụ, địa chỉ */
  --jade: #0E8C7F;          /* Nước hồ Tà Pạ - Màu chủ đạo, link, active, nature */
  --jade-deep: #0B6B60;     /* Đáy hồ Tà Pạ - Hover state */
  --palm: #F0A32F;          /* Mật trái thốt nốt chín - Nút CTA chính */
  --palm-deep: #C97F1B;     /* Đường thốt nốt cô đặc - Hover CTA */
  --sunset: #F26B3A;        /* Hoàng hôn tuyến tránh - Accent, badge hot, food */
  --terracotta: #A6503A;    /* Gạch chùa cổ - Category history */
  --saffron: #D9822B;       /* Áo cà sa - Category culture / chùa Khmer */
  --festival: #7C5CBF;      /* Lễ hội Dolta - Category festival */
  --cat-nature: #0E8C7F;    /* Category thiên nhiên */
  --cat-culture: #D9822B;   /* Category văn hóa */
  --cat-history: #A6503A;   /* Category lịch sử */
  --cat-food: #F26B3A;      /* Category ẩm thực */
  --cat-festival: #7C5CBF;  /* Category lễ hội */
  --cat-stay: #8A5A33;      /* Category homestay / lưu trú */
  --night-bg: #151B34;      /* Trời đêm Tri Tôn - Dark mode */
  --night-surface: #1E2647; /* Mặt thẻ Dark Mode */
  --firefly: #FFD37A;       /* Đom đóm / đèn chợ đêm - Accent dark mode */
  --r-s: 12px;
  --r-m: 18px;
  --r-l: 26px;
  --shadow-1: 0 2px 10px rgba(38, 34, 27, 0.08);
  --shadow-2: 0 10px 30px rgba(38, 34, 27, 0.14);
}
```

---

## 3. TYPOGRAPHY SYSTEM — 3 FONTS (VIETNAMESE OPTIMIZED)

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Patrick+Hand&display=swap" rel="stylesheet">
```

| Role | Font Family | Weights | Rationale |
|---|---|---|---|
| **Display / Heading / Logo** | `Bricolage Grotesque` | 700–800 | Bold, distinctive, modern personality, zero template vibe |
| **Body / UI Components** | `Be Vietnam Pro` | 400–700 | Native Vietnamese diacritic rendering, smooth reading |
| **Field Notes / Stamp / Tip** | `Patrick Hand` | Regular | Handwritten adventurer journal feel for field tips & stamps |

*Rule:* Maximum 3 fonts. Handwriting font only appears on small field tips/stamps, never on headings or body.

---

## 4. SIGNATURE ELEMENTS (UNMISTAKABLY TRI TÔN)

1. **Metro-Line Itinerary (Sơ đồ nối dây)**:
   - 4px line in `--jade`, station stops with sand `#FAF3E7` borders.
   - Travel duration badge centered on line as a pill capsule.
   - Draws smoothly with `stroke-dashoffset` animation on scroll.
2. **Ticket-Stub Itinerary Cards**:
   - Perforated zig-zag edges, route code `TTN→TPA→OTU`, tour code `TT-2N1Đ`.
3. **Stamp "ĐÃ XÁC MINH THỰC ĐỊA"**:
   - Rotated circular stamp (12°) popping on card appearance to build trust.
4. **Cultural Background Texture**:
   - Khmer Kbach motifs or Palmyra palm silhouettes at 3–5% opacity on section dividers.
5. **Palm-Heart Logo & Favorite Button**:
   - Palmyra tree heart motif fused with twin mountain silhouettes (Cô Tô & Tà Pạ). Used as brand mark and animated blooming bookmark button.

---

## 5. COMPONENT SPECIFICATIONS

### POI Card:
- Border radius `--r-l` (26px), 4:3 real image, 40% black gradient scrim.
- Left chip: Category color badge. Right chip: Star rating ⭐.
- Title: Bricolage Grotesque 700; Address: Be Vietnam Pro 13px `--ink-soft`.
- Actions: Outline button `[🎵 TikTok]` + Solid Pill CTA `[🗺️ Chỉ đường]` in `--palm` (`#F0A32F`).
- Hover: `--shadow-2` elevation + slow 1.05 image scale.

### Buttons & Chips:
- Pill shape (`rounded-full`).
- Primary CTA: Solid `--palm` with text `--ink`.
- Secondary: Outline `--jade` with text `--jade`.

### Hero Section:
- Full-bleed Tà Pạ or hoàng hôn tuyến tránh video/photo with slow zoom.
- Pain-point search chips: *"Sợ hết giờ"*, *"Đi với người già"*, *"Muốn ăn gà đốt"*.

### Section "Đêm Tri Tôn":
- Dark mode canvas `--night-bg` (`#151B34`) with floating `--firefly` particles (`#FFD37A`) and amber-bordered night venue cards.

---

## 6. DO / DON'T SYSTEM RULES

| ✅ DO | ❌ DON'T |
|---|---|
| Use real verified Tri Tôn photos | No generic stock photos, ocean or Sa Pa images |
| Warm sand background `#FAF3E7` | No pure `#FFF` or pure `#000` backgrounds |
| Consistent 8pt grid & radius tokens (`--r-s`, `--r-m`, `--r-l`) | No erratic corner radiuses per section |
| Consistent category colors everywhere (card, map pin, filter) | No arbitrary color swapping |
| Handwritten font ONLY for small notes/tips | No handwritten fonts for headings or body |
| 100% Lucide SVG Icons | Zero emojis in UI |
