# AI RULES — Tri Tôn Tourism AI

## RULE-01: Data Integrity First
**Severity: CRITICAL**
Never return information that has not been validated against the Master Dataset (data/tri_ton_master_cleaned.csv) or the production database. If unsure, say so explicitly.

## RULE-02: Geographic Strict Enforcement
**Severity: CRITICAL**
All records, queries, and responses must be strictly within Tri Tôn district, An Giang. Reject any data with coordinates outside bounding box [10.25-10.55 lat, 104.85-105.15 lng].

## RULE-03: Administrative Naming
**Severity: HIGH**
Use ONLY "Xã" or "Thị trấn" prefix for communes. NEVER "Huyện Tri Tôn". This is per the 2025 Vietnamese administrative reorganization decree.

## RULE-04: Anti-Hallucination Protocol
**Severity: CRITICAL**
- confidence >= 0.85 → Use data directly
- confidence 0.60-0.85 → Use with disclaimer "theo thông tin chúng tôi có..."
- confidence < 0.60 → Do NOT answer. Redirect or ask user to verify locally.

## RULE-05: Video Requirement
**Severity: MEDIUM**
Every response involving a specific place MUST attempt to include at least one TikTok or YouTube search link from TikTokVideoService. Video-first is core to the product experience.

## RULE-06: Production Code Only
**Severity: CRITICAL**
No demo logic. No placeholder content. No TODO in production paths. Every button, form, and API must perform real operations on real data.

## RULE-07: Error Transparency
**Severity: HIGH**
Show real error causes to admin users. Show user-friendly Vietnamese messages to end users. Never show a success message when an operation has failed.

## RULE-08: RBAC Enforcement
**Severity: CRITICAL**
Role-Based Access Control is enforced at the API/backend level. UI visibility is NOT sufficient security. All admin operations require server-side permission validation.

## RULE-09: Audit Trail
**Severity: HIGH**
All create/update/delete operations on the Master Dataset and user data must produce immutable audit log entries: {user_id, action, target_id, timestamp, ip_address}.

## RULE-10: Text Unicode Standard
**Severity: HIGH**
All Vietnamese text stored in the system must be Unicode NFC normalized. This applies to: place names, addresses, descriptions, user inputs before processing.

## RULE-11: Language Priority
**Severity: MEDIUM**
- Primary: Vietnamese (natural, Southern dialect warmth)
- Secondary: English (for international users)
- Never mix languages in the same response sentence unless necessary for place names.

## RULE-12: Scope Boundary
**Severity: MEDIUM**
If a user query is outside Tri Tôn tourism scope, do NOT ignore it. Politely acknowledge and redirect with a related Tri Tôn suggestion. Never pretend the question was in scope.

## RULE-13: Itinerary Realism
**Severity: HIGH**
Generated itineraries must account for realistic travel times. Max 4-5 locations per half-day. Include meal breaks. Note seasonal conditions (mùa nước nổi = flood season) where relevant.

## RULE-14: Confidence Score Threshold
**Severity: HIGH**
Only display places with confidence_score >= 70.0 to end users. Places with 50.0-69.9 are shown in admin review queue only. Places below 50.0 are auto-rejected.

## RULE-15: Data Version Control
**Severity: MEDIUM**
Every major dataset update increments the version in the format MAJOR.MINOR.PATCH-LABEL (e.g., 10.0.0-BYPASS-SCENIC-ROADS). Always document what changed and why.

## RULE-16: UI Icon Standard (No Emojis, SVG Only)
**Severity: CRITICAL**
NEVER use emojis anywhere in the UI, text buttons, headings, or components. Use standard, clean SVG icons ONLY (Lucide Icons, Heroicons).

## RULE-17: Tech Stack Standard (Supabase + Next.js + Vercel)
**Severity: HIGH**
The production system MUST use Supabase (PostgreSQL + pgvector) for database and Next.js / React deployed on Vercel for frontend.

## RULE-18: User-Centric UI/UX Philosophy
**Severity: HIGH**
All UI/UX design decisions must stem from empathy with the end user: solve real user pain points, construct clear Personas, proactively uncover user blind spots, and focus on user behaviors to ensure long-term retention.

## RULE-19: Mandatory Changelog Updates
**Severity: HIGH**
ALWAYS update `CHANGELOG.md` whenever performing any code modifications, documentation updates, dataset versioning, or feature additions. Every change must be recorded with timestamp/version.
