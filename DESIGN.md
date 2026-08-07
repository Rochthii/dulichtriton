# DESIGN SYSTEM SPECIFICATION: DU LICH TRI TON

```yaml
TARGET_PARSER: "AI_CODING_AGENTS"
LANG: "EN-US"
STRICTNESS: "HIGH"
VERSION: "10.68.0"
PROJECT: "Tri Ton AI Tourism Web Portal & Chatbot System"
```

## 1. DESIGN PHILOSOPHY (ANTI-GENERIC-AI MANIFESTO)
- `AUTHENTICITY`: Honor Tri Ton local culture (Seven Mountains/Bảy Núi, Khmer pagodas, Palmyra palm trees/cánh đồng thốt nốt, local gastronomy like Gà Đốt Ô Thum, Đu Đủ Đâm, Bánh Bò Thốt Nốt).
- `NO_AI_GRADIENTS`: Strictly FORBID purple/pink/indigo AI template gradients.
- `NO_GENERIC_CARDS`: Strictly FORBID uniform 3-column template grids with lorem ipsum.
- `NO_HYPERBOLE_COPY`: FORBID generic marketing buzzwords ("Amazing", "Best choice", "Ultimate experience"). Use authentic, location-verified Vietnamese text.
- `NO_EMOJIS`: FORBID emojis anywhere in UI. Use Lucide SVG `<Icon />` components ONLY.
- `NO_STOCK_PHOTOS`: FORBID stock/ocean/salad photos. Use verified real photography (`/images/tiktok/`, Tà Pạ, Ô Thum, Cô Tô, Soài So).

## 2. COLOR TOKENS & THEMING
```json
{
  "primary_emerald": "#1B4D3E",
  "primary_emerald_hover": "#143A2F",
  "primary_emerald_light": "#E8F0EC",
  "secondary_golden_palm": "#D99B26",
  "golden_palm_hover": "#E5A93C",
  "golden_palm_light": "#FEF7E8",
  "neutral_dark_slate": "#0F172A",
  "neutral_body_text": "#334155",
  "neutral_muted_slate": "#64748B",
  "background_light": "#F8F9FA",
  "surface_white": "#FFFFFF",
  "dark_surface": "#1E293B",
  "dark_background": "#0F172A",
  "card_border": "border border-emerald-900/10 shadow-sm hover:shadow-md transition-all duration-300"
}
```

## 3. ADMINISTRATIVE NAMING CONSTRAINT
- `COMMUNES_ONLY`: Must use exact commune/town names: "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Chau Lăng", "Xã Ô Lâm", "Xã Núi Tô", "Xã An Tức", "Xã Lương Phi", "Xã An Hảo", "Xã Tà Đảnh", "Xã Lê Trì".
- `FORBIDDEN_TERM`: ABSOLUTELY NEVER use "Huyện Tri Tôn".

## 4. SVG ICON SYSTEM TOKENS (NO EMOJI POLICY)
```json
{
  "SearchAI": "Lucide <Search />",
  "MapPin": "Lucide <MapPin />",
  "InteractiveMap": "Lucide <Map />",
  "TimeHours": "Lucide <Clock />",
  "RatingStar": "Lucide <Star />",
  "CallBooking": "Lucide <Phone />",
  "VideoPlay": "Lucide <Play />",
  "VehicleParking": "Lucide <Car />",
  "DateTour": "Lucide <Calendar />",
  "ShareItinerary": "Lucide <Share2 />",
  "QRCodeModal": "Lucide <QrCode />",
  "DownloadPDF": "Lucide <Download />",
  "PagodaHeritage": "Lucide <Landmark />",
  "FoodGastronomy": "Lucide <Utensils />",
  "HomestayStay": "Lucide <Home />",
  "AIChatbotBot": "Lucide <Bot />",
  "UserAccount": "Lucide <User />",
  "ShieldAdmin": "Lucide <ShieldCheck />"
}
```

## 5. TYPOGRAPHY & SPACING SPECIFICATIONS
- `FONT_FAMILY`: Primary UI font `Inter` / Display headings `Outfit` (Sans-Serif).
- `HEADING_1`: `text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight`
- `HEADING_2`: `text-2xl lg:text-3xl font-bold text-slate-900`
- `HEADING_3`: `text-lg lg:text-xl font-semibold text-slate-900`
- `BODY_TEXT`: `text-sm lg:text-base text-slate-700 leading-relaxed`
- `BADGE_TAG`: `text-xs font-semibold px-2.5 py-1 rounded-full`
- `BORDER_RADIUS`: Cards `rounded-2xl`, Modals `rounded-3xl`, Buttons `rounded-xl` or `rounded-full`.

## 6. REAL MEDIA & VIDEO REQUIREMENTS
- `AUTHENTIC_PHOTOS`: Ta Pa Lake, Svay Ton Pagoda, O Thum Roasted Chicken, Bok Lahong Papaya Salad, Tri Ton Fish Noodle, Ba Chúc Relic.
- `TIKTOK_SHORTS`: Direct embed / links to real TikTok travel reviewers 9:16 vertical shorts (e.g. `@tungnuitravel`).

## 7. COMPONENT SPECIFICATIONS
```json
{
  "LocationCard": "Real photo + Commune badge + WGS84 coordinates + Google Maps routing link",
  "TikTokReviewSection": "9:16 vertical shorts player (5-column grid) + 5 category filter tabs",
  "ItineraryTimeline": "Morning/Afternoon/Evening timeline + Haversine distance matrix + Local meal tags",
  "QRModal": "Offline itinerary QR code generator & export",
  "HomestayBookingModal": "Real check-in/out dates, guest count, price calculation & Supabase audit logging",
  "AdminAuditLogTable": "Real-time audit log stream (Who, Did What, When, Source IP, Module)"
}
```

## 8. FULL 16-SCREEN SYSTEM CATALOG
1. `01_homepage`: Web Portal Homepage & AI Search Bar Entrance
2. `02_places_discovery`: Places Discovery & Commune Smart Filtering
3. `03_place_detail`: Hồ Tà Pạ Detail & Real TikTok Shorts Video Embed
4. `04_food_gastronomy`: Gà Đốt Ô Thum & Local Gastronomy Booking
5. `05_ai_chatbot`: AI Chatbot RAG Interface with Location & TikTok Cards
6. `06_ai_trip_planner`: Smart AI Trip Planner (2D1N Tour & WGS84 Distance)
7. `07_stay_homestay`: Authentic Local Stay & Homestay Discovery
8. `08_culture_events`: Khmer Culture & Seven Mountains Ox Racing Heritage
9. `09_interactive_gis_map`: Interactive GIS Map Portal (Tri Ton Bounding Box)
10. `10_travel_info_guide`: Travel Info, Transport Guide & FAQ
11. `11_itinerary_export_modal`: QR Code Export & Offline PDF Download Modal
12. `12_partner_portal`: Local Service Partner Registration Portal
13. `13_admin_dashboard`: Admin Control Center & Audit Logs Dashboard
14. `14_empty_state_404`: 404 & Empty State with Recommended Hotspots
15. `15_dark_mode_visual_spec`: System-Wide Dark Mode Interface Spec
16. `16_auth_login_modal`: Supabase Auth Login & RBAC Role Switcher Modal

## 9. GIS MAP & BOUNDING BOX TOKENS
- `BOUNDING_BOX`: `[10.25, 104.85]` to `[10.55, 105.15]` (WGS84 Coordinates for Tri Ton territory).
- `CENTER_COORDINATE`: `[10.4211, 105.0125]` (Thị trấn Tri Tôn).
- `DEFAULT_ZOOM`: `12` (Regional detail level).

## 10. SYSTEM PRODUCTION REALITY MANDATE
- `NO_MOCK_DATA`: Every button, API call, form submission, and approval MUST map to real backend Supabase database operations.
- `AUDIT_LOGGING`: Critical actions generate immutable audit logs recording (Who, What, When, Source IP).
