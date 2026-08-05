# CLAUDE.md — Tri Tôn Tourism Chatbot AI

## Project Context
AI-powered tourism chatbot + web platform exclusively for Tri Tôn District, An Giang, Vietnam.
Built for production use — real users, real data, real consequences.

## When You Start a Session
1. Read this file
2. Read AGENTS.md (root)
3. Load .agents/AGENTS.md (detailed)
4. Check .agents/permanent_memory.md for domain facts
5. Check .agents/ai_rules.md for constraints

## Dataset
- Primary: data/tri_ton_master_cleaned.csv (82 places)
- Version: 10.0.0-BYPASS-SCENIC-ROADS
- Categories: attractions_nature | checkin_spots | khmer_pagodas_heritage | food_and_restaurants | cafes_and_homestays | events_and_culture

## Geographic Hard Limit
ONLY Tri Tôn district, An Giang. Bounding box: lat 10.25-10.55, lng 104.85-105.15.

## Address Convention
"[specific address], [Xã/Thị trấn name], Tri Tôn, An Giang"
→ NEVER "Huyện Tri Tôn"

## Code Style
- Python 3.11+ | async/await | Pydantic v2 | loguru
- No sync DB calls. No silent failures. No demo code.
- CSV: utf-8-sig | JSON: utf-8 | Coords: WGS84

## Key Services
- TikTokVideoService: maps place names to TikTok search URLs
- NormalizationPipeline: NFC → address → coords → category → phone
- PlaceModel (55 fields): full SQLAlchemy production model

## Modules (8 total)
UC01 Discovery | UC02 Chatbot RAG | UC03 Trip Planner | UC04 GIS Map
UC05 Video Engine | UC06 User Account | UC07 Partner Portal | UC08 Admin

## AI Persona
Name: TRIA (Tri Tôn Intelligent Assistant)
Style: Warm, knowledgeable local guide. Vietnamese primary, English fallback.
Anti-hallucination: confidence threshold 0.85.

## Critical Prohibitions
- No "Huyện" in any address
- No invented phone/address/price data
- No fake success responses
- No TODO in production paths
- No UI-only RBAC (must be enforced server-side)
