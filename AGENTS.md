# AGENTS.md — Tri Tôn Tourism Chatbot AI

## Quick Start for AI Agents
**Read .agents/INDEX.md first**, then load files per session type.

## Project
Chatbot du lịch AI chuyên về Tri Tôn, An Giang, Việt Nam.
82 địa điểm đã xác minh | 6 nhóm danh mục | 8 module hệ thống

## Non-Negotiable Rules
1. NEVER use "Huyện Tri Tôn" — use Xã/Thị trấn only
2. NEVER fabricate place data not in data/tri_ton_master_cleaned.csv
3. NEVER produce demo/fake/placeholder code
4. ALWAYS NFC-normalize Vietnamese text before storage
5. ALWAYS validate coordinates within bounding box [10.25-10.55, 104.85-105.15]
6. ALWAYS use utf-8-sig for CSV, utf-8 for JSON
7. ALWAYS audit-log admin actions (who/what/when/from where)
8. NEVER use Emojis in UI — use clean, standard SVG icons ONLY (Lucide / Heroicons)
9. ALWAYS use Supabase (PostgreSQL + pgvector) for DB and Next.js / React deployed on Vercel for Frontend
10. ALWAYS design UI/UX User-Centric: solve pain points, build Personas, uncover user blind spots, focus on real behavior for long-term retention
11. ALWAYS update CHANGELOG.md whenever making any code changes, feature additions, or system updates
12. NEVER hardcode API keys or credentials in code — ALWAYS load dynamically from git-ignored .env / .env.local files
13. ALWAYS self-critique, cross-verify multiple times across technical dimensions, and stress-test every solution until the optimal path is agreed upon

## Architecture Summary
Intent → NER → RAG DB Query → LLM → Structured JSON → UI (Next.js/React + Supabase)

## Master Data
data/tri_ton_master_cleaned.csv (82 records, version 10.0.0)

## Changelog & Progress Track
→ [CHANGELOG.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/CHANGELOG.md)

## Full Knowledge Base & Skills
→ .agents/ (9 specialized files)
→ [.agents/skills/triton_workflow_execution_standard/SKILL.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/.agents/skills/triton_workflow_execution_standard/SKILL.md) (Standard Skill)


## Tech Stack
Next.js / React | Vercel | Supabase (PostgreSQL+pgvector) | Python 3.11 FastAPI | Pydantic v2 | Lucide SVG Icons

## Dynamic Domain Boundary Directive & System Role Contract
* **Role**: Du Lịch Tri Tôn AI Assistant — Sole purpose is supporting information directly relevant to Tri Tôn tourism and the project.
* **Strict Domain Scope**: Tri Tôn (An Giang), Tourism in Tri Tôn, 95 Verified POIs Master Data, Khmer Culture, Food, Accommodation, Attractions, TikTok/Video Discovery anchored to Tri Tôn.
* **Out-of-Scope Policy**: Refuse non-Tri Tôn queries with: `"Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."`
* **Search Policy**: Every search MUST contain Tri Tôn geographic signals (`site:tiktok.com "<POI>" "Tri Tôn"`).
* **Data Integrity**: Never fabricate data. If unverified: `"Con không có đủ dữ liệu để xác minh chính xác thông tin này."`
