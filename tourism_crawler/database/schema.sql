-- ====================================================================
-- SUPABASE POSTGRESQL + PGVECTOR + POSTGIS DDL SCHEMA FOR DU LICH TRI TON
-- ====================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Places Master Table
CREATE TABLE IF NOT EXISTS public.places (
    id VARCHAR(50) PRIMARY KEY,
    place_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    tourism_category VARCHAR(100) NOT NULL,
    description TEXT,
    short_description TEXT,
    address TEXT NOT NULL,
    commune VARCHAR(100) NOT NULL,
    district VARCHAR(100) DEFAULT 'Tri Tôn',
    province VARCHAR(100) DEFAULT 'An Giang',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    google_maps_url TEXT,
    phone VARCHAR(50),
    website TEXT,
    business_status VARCHAR(50) DEFAULT 'OPERATIONAL',
    opening_hours VARCHAR(100) DEFAULT '07:00 - 18:00',
    price_level VARCHAR(50) DEFAULT 'Miễn phí',
    rating NUMERIC(3, 2) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    photos JSONB DEFAULT '[]'::jsonb,
    review_samples JSONB DEFAULT '[]'::jsonb,
    search_keywords TEXT[],
    travel_tags TEXT[],
    recommended_duration VARCHAR(50),
    best_visit_time VARCHAR(100),
    family_friendly BOOLEAN DEFAULT true,
    couple_friendly BOOLEAN DEFAULT true,
    kids_friendly BOOLEAN DEFAULT true,
    parking BOOLEAN DEFAULT true,
    wifi BOOLEAN DEFAULT true,
    ticket_required BOOLEAN DEFAULT false,
    confidence_score NUMERIC(5, 2) DEFAULT 95.0,
    embedding VECTOR(1536), -- Vector embedding for RAG
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_places_commune ON public.places(commune);
CREATE INDEX IF NOT EXISTS idx_places_tourism_category ON public.places(tourism_category);
CREATE INDEX IF NOT EXISTS idx_places_geom ON public.places USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_places_embedding ON public.places USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
