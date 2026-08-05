# 02. KIẾN TRÚC HỆ THỐNG NÂNG CẤP (SYSTEM ARCHITECTURE)

---

## 1. Sơ đồ kiến trúc tổng quan AI Orchestration

```
[ FRONTEND PORTAL & CHAT WIDGET ] (Next.js 14 App Router - Vercel)
        │ REST API / JSON Stream
        ▼
[ BACKEND API GATEWAY ] (FastAPI Python 3.11)
        │
        ├──► [ AI ORCHESTRATION SERVICE ] (Gemini 2.5 / OpenAI / Claude Fallback)
        │       ├── Intent Detection & NER (Pydantic v2 NFC)
        │       ├── Context Builder & Session Memory
        │       └── Dynamic Prompt Engine & Output Validator
        │
        ├──► [ VECTOR & RETRIEVAL SERVICE ]
        │       ├── Document Chunking & Embedding (1536d)
        │       ├── Hybrid Retriever (BM25 + Cosine Distance)
        │       └── Cross-Encoder Reranker
        │
        ├──► [ GIS & ROUTE OPTIMIZATION SERVICE ]
        │       ├── PostGIS Spatial Queries
        │       ├── OSRM Route Optimization Engine
        │       └── MapLibre GL / Leaflet Map Renderer
        │
        └──► [ DATABASE & STORAGE LAYER ]
                ├── Master Data (tri_ton_master_cleaned.csv - 105 spots)
                ├── PostgreSQL 15 + pgvector + PostGIS (Supabase)
                └── WGS84 GeoJSON Spatial Index
```

---

## 2. Luồng Xử lý AI Chi tiết
Tham khảo tài liệu kiến trúc quy trình AI 9 bước: [docs/ai_workflow.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/ai_workflow.md).
