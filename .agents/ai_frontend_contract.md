# SYSTEM PROMPT: DULICHTRITON FRONTEND ENGINE

```yaml
PRODUCT: "Tri Ton Tourism AI Web Portal"
TARGET_AGENT: "Aider / Cline / OpenHands / Antigravity"
PARSER_MODE: "STRICT_ENFORCEMENT"
LANG: "EN-US"
```

## 1. AGENT IDENTITY & TECHNICAL CONSTRAINTS
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript (Strict)",
  "styling": "TailwindCSS (Vanilla / Custom tokens)",
  "database": "Supabase (PostgreSQL + pgvector + PostGIS)",
  "icons": "Lucide SVG ONLY",
  "emoji_policy": "ZERO_EMOJI_ALLOWED",
  "data_integrity": "PRODUCTION_REAL_ONLY (No mock/fake/TODO/lorem ipsum)"
}
```

## 2. BRAND COLOR TOKENS
```json
{
  "primary_emerald": "#1B4D3E",
  "secondary_golden_palm": "#D99B26",
  "neutral_dark_slate": "#0F172A",
  "background_light": "#F8F9FA",
  "dark_surface": "#1E293B"
}
```

## 3. STRICT ANTI-GENERIC-AI UI RULES
- `RULE_01`: NEVER use purple/pink/indigo AI gradients. Use Emerald-to-Golden-Palm local palette.
- `RULE_02`: NEVER use generic 3-column rounded template cards with lorem ipsum. Use real place data.
- `RULE_03`: NEVER use emojis in titles, buttons, badges, or copy. Use SVG `<LucideIcon />`.
- `RULE_04`: NEVER use stock/salads/ocean photos. Use verified photography (`public/images/tiktok/`, Tà Pạ, Ô Thum).
- `RULE_05`: NEVER use "Huyện Tri Tôn". MUST use exact commune names: "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Chau Lăng", "Xã Ô Lâm", "Xã Núi Tô", "Xã An Tức", "Xã Lương Phi", "Xã An Hảo", "Xã Tà Đảnh", "Xã Lê Trì".
- `RULE_06`: Bounding Box strict check: `[10.25 - 10.55 Lat, 104.85 - 105.15 Lng]`.

## 4. SYSTEM STACK & WORKFLOW PATTERN
```text
Primary Tool Choice: Aider (CLI Git-Native Agent) + DESIGN.md
Alternative: abi/screenshot-to-code (Design → Code conversion)

Execution Protocol:
1. Load DESIGN.md & .agents/ai_frontend_contract.md
2. Parse target TSX/Component file
3. Enforce Tailwind tokens & Lucide icons
4. Hydrate with real Supabase DB data
5. Verify build (`npm run build`) -> 0 errors
```
