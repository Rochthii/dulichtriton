# TECHNICAL REFERENCE: DATABASE SCHEMA & SPATIAL INDEXES

## 1. PostgreSQL Extensions:
- `uuid-ossp`, `vector`, `postgis`, `unaccent`, `pg_trgm`.

## 2. Core Tables:
- `public.places`: 149 địa điểm xác minh (tên, xã, tọa độ `geometry(Point, 4326)`, `embedding vector(768)`).
- `public.videos`: Video TikTok/YouTube có tọa độ và POI link.
- `public.chat_sessions` & `public.chat_messages`: Lưu phiên trò chuyện.
- `public.semantic_chat_cache`: Đệm ngữ nghĩa cosine similarity >= 0.90.
- `public.audit_logs`: Nhật ký kiểm toán admin bất biến.

## 3. Hard DB Constraints:
- Bounding box GPS: `CHECK (latitude BETWEEN 10.25 AND 10.55 AND longitude BETWEEN 104.85 AND 105.15)`.
- Rating: `CHECK (rating BETWEEN 0.0 AND 5.0)`.

## 4. Indexing:
- HNSW Vector: `idx_places_embedding_hnsw` on `embedding` with `(m = 16, ef_construction = 64)`.
- PostGIS GiST: `idx_places_geom` on `geom`.
- GIN Trigram tiếng Việt: `idx_places_name_trgm` on `f_unaccent(name)`.
