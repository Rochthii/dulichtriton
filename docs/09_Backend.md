# 09. BACKEND SERVICES & DỊCH VỤ SYSTEM (BACKEND)

## 1. Công nghệ Backend
* **Language & Runtime**: Python 3.11+
* **Framework**: FastAPI (Async Native)
* **ORM**: Async SQLAlchemy 2.0 + Pydantic v2
* **Logging**: Loguru (file rotation, contextual tagging)
* **Crawler / Scraper**: Playwright Python

## 2. Cấu trúc thư mục Backend
```
dulichtriton/
├── tourism_crawler/      # Tool thu thập dữ liệu tự động
├── scripts/              # Build DB & Data Utils (NFC, Bounds Validation)
├── data/                 # CSDL Master CSV, JSON & GeoJSON
├── docs/                 # Tài liệu kỹ thuật
├── tests/                # Automated Tests (pytest async)
└── app/ (nếu phát triển API)
    ├── api/              # FastAPI Routers
    ├── core/             # Config, Security, Audit Logs
    ├── models/           # SQLAlchemy DB Models
    ├── schemas/          # Pydantic Validation Schemas
    └── services/         # RAG Engine, Itinerary, Video Matcher
```
