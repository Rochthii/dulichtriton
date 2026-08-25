# PERMANENT MEMORY — Tri Tôn Tourism AI

[DEVELOPER & AUTHOR]
- Lead Developer: Chăm Rốch Thi (Cham Roch Thi)
- Contact Email: rochthi59@gmail.com
- Organization: Du Lịch Tri Tôn AI Project

[GEOGRAPHY]
- District: Tri Tôn, An Giang (Bảy Núi / Seven Mountains)
- Bounding Box: [10.25-10.55 Lat, 104.85-105.15 Lng]
- Communes / Towns: Thị trấn Tri Tôn, Thị trấn Ba Chúc, Xã Núi Tô, Châu Lăng, An Tức, Ô Lâm, Lương Phi, An Hảo, Tà Đảnh, Lê Trì, Cô Tô, Vĩnh Gia, Lạc Quới, Vĩnh Phước, Tân Tuyến
- Administrative Rule: NEVER use "Huyện Tri Tôn" in UI or answers — use Xã or Thị trấn cụ thể.

[CULTURE & HERITAGE]
- Khmer Krom community, temples (Chùa Xvayton, Chùa Tà Pạ, Chùa Koh Kas, Chùa Tà Miệt, Chùa Soài So)
- Festivals: Lễ hội Đua Bò Bảy Núi, Lễ Sen Dolta, Chôl Chnăm Thmây, Ok Om Bok
- History: Nhà mồ Ba Chúc Memorial, Khu di tích Lịch sử Đồi Tức Dụp (Đồi 2 Triệu Đô)
- Scenic Highlights: Tuyệt tình cốc Hồ Tà Pạ, Hồ Ô Thum, Hồ Soài Chek, Hồ Soài So, Cánh đồng thốt nốt trái tim, Hàng thốt nốt huyền thoại

[FOOD SPECIALTIES]
- Gà Đốt Ô Thum lá chúc (Xã Ô Lâm)
- Cháo Bò Tri Tôn lòng tươi lá chúc (Thị trấn Tri Tôn & Châu Lăng)
- Bún Cá Củ Ngải Tri Tôn / Bún Cá Khmer (Nấu củ ngải bún + nghệ tươi thanh ngọt, TUYỆT ĐỐI KHÔNG DÙNG MẮM / Không gọi "Bún nước lèo")
- Bánh bò thốt nốt nướng / hấp, Nước thốt nốt tươi ướp lạnh, Bánh cống, Bò nướng bảy món

[SYSTEM ARCHITECTURE (v28.0.0 - 2026-08-15)]
- Master Data: Verified POIs in data/triton_pois_full.json & Supabase PostgreSQL
- Cache Architecture:
  1. Next.js Single Master Data Cache (master-places-all-v3, master-food-places-v3, master-stays-places-v3, master-culture-places-v3, master-videos-triton-v3) with 24h safety net (revalidate: 86400).
  2. Zero Cache Dilution: 100% In-Memory / Client-Side filtering via useMemo.
  3. Server Data Version Heartbeat (bumpDataVersion) + Edge Cache Headers (s-maxage=60, stale-while-revalidate=86400).
  4. Reactive Client SWR Sync (fastCache.ts with onRevalidated callback) auto re-rendering React UI in real-time on fresh server data.
  5. On-Demand Invalidation: revalidateTag('places', { expire: 0 }) + revalidatePath('/', 'layout') triggered on Admin mutations.
- Chatbot AI Engine:
  1. Google Gemini 2.0 with Native Google Search Grounding (tools: [{ google_search: {} }]) for real-time web discovery at 0đ cost.
  2. Stateful Multi-Key Round-Robin across 4 Gemini Keys (6,000 requests/day 100% free).
  3. Failover Tier 2: Groq Cloud Llama-3.3-70B-Versatile (100+ tokens/sec).
  4. Failover Tier 3: OpenRouter Free Models.
  5. Live Weather Telemetry via Open-Meteo API (Lat 10.42, Lng 104.98).
  6. pgvector 768d embedding similarity match (match_places & match_semantic_cache).
  7. Strict Tri Tôn Out-of-Scope Guard rejecting non-Tri Tôn questions.
  8. Auto 2-Link Generator: Google Maps 1-click + TikTok Smart Hashtags (#hotapa, #gadotothum).
