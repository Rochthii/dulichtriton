# SYSTEM PROMPT: DULICHTRITON FRONTEND ENGINE

```yaml
PRODUCT: "Tri Ton Tourism AI Web Portal"
STYLE: "Folk-Modern Bảy Núi"
TARGET_AGENT: "Aider / Cline / OpenHands / Antigravity"
PARSER_MODE: "STRICT_ENFORCEMENT"
LANG: "EN-US"
```

## 1. AGENT IDENTITY & TECHNICAL CONSTRAINTS
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript (Strict)",
  "styling": "TailwindCSS (Vanilla tokens + Folk-Modern variables)",
  "database": "Supabase (PostgreSQL + pgvector + PostGIS)",
  "icons": "Lucide SVG ONLY",
  "emoji_policy": "ZERO_EMOJI_ALLOWED",
  "data_integrity": "PRODUCTION_REAL_ONLY (No mock/fake/TODO/lorem ipsum)"
}
```

## 2. BRAND COLOR TOKENS ("Folk-Modern Bảy Núi")
```json
{
  "bg_sand": "#FAF3E7",
  "surface_card": "#FFFDF7",
  "ink_main": "#26221B",
  "ink_soft": "#6B6355",
  "jade_primary": "#0E8C7F",
  "jade_deep": "#0B6B60",
  "palm_cta": "#F0A32F",
  "palm_deep": "#C97F1B",
  "sunset_accent": "#F26B3A",
  "terracotta_history": "#A6503A",
  "saffron_culture": "#D9822B",
  "festival_purple": "#7C5CBF",
  "cat_stay": "#8A5A33",
  "night_bg": "#151B34",
  "night_surface": "#1E2647",
  "firefly": "#FFD37A"
}
```

## 3. TYPOGRAPHY SYSTEM (TRIPLE FONT)
- `Display / Heading / Logo`: **Bricolage Grotesque** (700-800)
- `Body / UI`: **Be Vietnam Pro** (400-700)
- `Field Notes / Tips / Stamp`: **Patrick Hand** (Regular)

## 4. STRICT UI/UX PRODUCTION RULES
- `RULE_01`: NEVER use purple/pink/indigo AI neon gradients or pure `#FFF`/`#000`. Use `#FAF3E7` warm sand background.
- `RULE_02`: NEVER use generic 3-column template cards with lorem ipsum. Use real place data with 26px radius (`--r-l`).
- `RULE_03`: NEVER use emojis in titles, buttons, badges, or copy. Use SVG `<LucideIcon />`.
- `RULE_04`: NEVER use stock/salads/ocean photos. Use verified photography (`/images/tiktok/`, Tà Pạ, Ô Thum).
- `RULE_05`: NEVER use "Huyện Tri Tôn". MUST use exact commune names: "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Chau Lăng", "Xã Ô Lâm", "Xã Núi Tô", "Xã An Tức", "Xã Lương Phi", "Xã An Hảo", "Xã Tà Đảnh", "Xã Lê Trì".
- `RULE_06`: Bounding Box strict check: `[10.25 - 10.55 Lat, 104.85 - 105.15 Lng]`.
- `RULE_07`: CTA Primary Button MUST be solid Palm `#F0A32F` with text `#26221B`. Secondary buttons are outline Jade `#0E8C7F`.
- `RULE_08`: Signature elements (Metro-line, Ticket-stub, "Đã xác minh" stamp, Palm Heart button) MUST follow animation & styling tokens.

## 5. SYSTEM STACK & WORKFLOW PATTERN
```text
Execution Protocol:
1. Load DESIGN.md & .agents/ai_frontend_contract.md
2. Parse target TSX/Component file
3. Enforce Tailwind tokens, 3 fonts & Lucide icons
4. Hydrate with real Supabase DB data
5. Verify build (`npm run build`) -> 0 errors
```
