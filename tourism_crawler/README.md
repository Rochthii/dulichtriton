# TRI TON GOOGLE MAPS TOURISM DATA PIPELINE

---

## 🎯 1. OBJECTIVE & ARCHITECTURE

Hạ tầng cào và xử lý dữ liệu du lịch Google Maps chuẩn Production dành cho **Du Lịch Tri Tôn AI Assistant**.

```
[ Apify Google Maps Scraper ]
             │
             ▼
[ Keyword Generator (Hundreds of Queries across 15 Communes) ]
             │
             ▼
[ Pydantic v2 NFC Normalization & Validation ]
             │
             ▼
[ Enrichment Service (Slug, Tags, Best Visit Time, Duration) ]
             │
             ▼
[ Deduplication Service (Place ID + Haversine 50m Proximity) ]
             │
             ├──► export/places.json
             ├──► export/places.csv
             └──► export/seed_places.sql (Supabase PostgreSQL + pgvector + PostGIS)
```

---

## 🛠️ 2. PROJECT DIRECTORY STRUCTURE

```
tourism_crawler/
├── crawler/
│   └── apify_scraper.py      # Apify Google Maps Client & Keyword Generator
├── database/
│   └── schema.sql            # Supabase PostgreSQL + pgvector + PostGIS DDL
├── export/
│   └── exporter.py           # Data Exporter (places.json, places.csv, seed_places.sql)
├── models/
│   └── place.py              # Pydantic v2 Schemas (PlaceRawModel, PlaceEnrichedModel)
├── services/
│   ├── enrichment_service.py # Auto-Enrichment & Tag Generator
│   └── deduplication_service.py # Haversine Distance & Name Deduplicator
├── logs/                     # Loguru Log Outputs
├── main.py                   # Async CLI Runner Pipeline
└── README.md                 # Technical Documentation
```

---

## 🚀 3. EXECUTION INSTRUCTIONS

```bash
# Run the pipeline
python -m tourism_crawler.main
```

Output assets generated in `export/`:
* `export/places.json` (Structured JSON for AI RAG System)
* `export/places.csv` (UTF-8-SIG CSV Dataset)
* `export/seed_places.sql` (PostgreSQL SQL Seed Data)
