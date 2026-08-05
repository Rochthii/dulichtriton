# CODING DNA — Tri Tôn Tourism AI

[PATTERNS]
1. ASYNC I/O: Use AsyncSession(engine) + async/await for all DB/network tasks.
2. DATABASE: Supabase (PostgreSQL + pgvector + Supabase Auth).
3. FRONTEND: Next.js / React deployed on Vercel.
4. ICONS: Standard SVG icons ONLY (Lucide Icons / Heroicons).
5. UI/UX: User-Centric (Pain points, Personas, User blind spots, Long-term retention).
6. DESIGN SYSTEM: Primary Emerald (#1B4D3E), Golden Palm (#D99B26), Slate Dark (#0F172A), Background (#F8F9FA).
7. SCHEMAS: Pydantic v2 with unicodedata.normalize("NFC", text) validators.
7. LOGGING: loguru with file rotation and contextual tags.
8. EXPORTS: Always utf-8-sig for CSV, utf-8 for JSON, WGS84 for GeoJSON.
9. BOUNDS: Validate lat in [10.25, 10.55], lng in [104.85, 105.15].
10. DEDUP KEY: f"{normalize(name).lower()}|{round(lat,3)}|{round(lng,3)}"

[ANTI_PATTERNS]
- NO emojis in UI, buttons, headings or text components (SVG ONLY).
- NO sync DB calls in async paths.
- NO silent try/except swallowing.
- NO hardcoded fake data or placeholder UI.
- NO address string with "Huyện Tri Tôn".
