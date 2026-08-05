# 02. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

## 1. Sơ đồ kiến trúc tổng quan

```
[ FRONTEND PORTAL & CHAT WIDGET ] (HTML/CSS/JS or React/Next.js)
        │ REST API / WebSocket
        ▼
[ BACKEND API GATEWAY ] (FastAPI Python 3.11)
        │
        ├──► [ AI ORCHESTRATOR / RAG ENGINE ]
        │       ├── Intent Classifier & NER (Pydantic v2)
        │       ├── Vector Search (PostgreSQL + pgvector)
        │       └── Video Matcher (TikTok / YouTube Embed Service)
        │
        └──► [ DATABASE LAYER ]
                ├── Master Data (tri_ton_master_cleaned.csv - 82 records)
                ├── PostgreSQL (Relational Data & Vector Embeddings)
                └── GIS / GeoJSON (Bounding Box [10.25-10.55, 104.85-105.15])
```

## 2. Các phân lớp kỹ thuật
* **Client Layer**: Responsive Mobile-First, Web Portal & AI Chat Widget.
* **API Layer**: FastAPI Async Controllers, Pydantic v2 schemas, UTF-8/NFC Normalization.
* **AI & Service Layer**: RAG Pipeline, Semantic Search, Smart Itinerary Generator.
* **Data Layer**: Master CSV/JSON, Postgres + pgvector, GeoJSON cho Spatial Map.
