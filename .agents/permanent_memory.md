# PERMANENT MEMORY — Tri Tôn Tourism AI

[GEOGRAPHY]
- District: Tri Tôn, An Giang (Bảy Núi / Seven Mountains)
- Bounding Box: [10.25-10.55 Lat, 104.85-105.15 Lng]
- Communes: Thị trấn Tri Tôn, Thị trấn Ba Chúc, Xã Núi Tô, Chau Lăng, An Tức, Ô Lâm, Lương Phi, An Hảo, Tà Đảnh, Lê Trì

[CULTURE & HERITAGE]
- Khmer Krom community, temples (Chùa Xvayton, Tà Miệt), Festivals (Đôl Ta, Ok Om Bok)
- History: Ba Chúc Memorial, Đồi Tức Dụp resistance base
- Scenic Routes: Con đường tơ lụa, Tuyến tránh Tri Tôn, Hồ Thủy Liêm, Soài Chek

[FOOD SPECIALTIES]
- Bánh tráng nướng Tri Tôn, Thốt nốt (bánh bò, kem), Mắm bồ hóc, Bún mắm, Cơm nị

[SYSTEM DATA]
- Master dataset: data/tri_ton_master_cleaned.csv (82 records v10.0.0)
- Categories: attractions_nature (20), checkin_spots (20), khmer_pagodas_heritage (10), food_and_restaurants (17), cafes_and_homestays (13), events_and_culture (2)
- Videos table: Supabase public.videos (18 real video records verified)

[CURRENT STATE & STRATEGY (v25.0.0 - 2026-08-09)]
- Master Strategy Doc: docs/PRODUCT_STRATEGY.md
- RAG Architecture: 3-Layer System (Facts RAG + Golden Behavior Cache/Few-shot + Fine-tune)
- Golden Answers DB: Supabase `golden_answers` (148+ Q&A Vector Embeddings 768d, HNSW Index, RPC `match_golden`)
- LLM Engine: Gemini 2.0/2.5 Flash + Multi-LLM Race Parallel Execution
- Next Task: SFT Fine-Tuning Tone Gen Z (khi thu thập đủ >= 500 chat_logs thực tế)

