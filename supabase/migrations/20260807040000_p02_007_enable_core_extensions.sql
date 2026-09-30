-- ==============================================================================
-- Migration: Enable Core Extensions for Du Lịch Tri Tôn System
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 04:00:00 (Baseline before downstream schemas & functions)
-- Task: P02-007 (Wave W2 - Database Replay Foundation)
-- ==============================================================================

BEGIN;

-- 1. UUID & Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AI Embedding & Vector Similarity Search Extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- 3. Geospatial & GIS Extension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 4. Text Normalization & Trigram Fuzzy Matching Extensions
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

COMMIT;
