-- ====================================================================
-- SUPABASE POSTGRESQL + PGVECTOR + POSTGIS DDL SCHEMA FOR DU LỊCH TRI TÔN
-- Production Enterprise Architecture (v10.13.0-CRITIQUE-HARDENED)
-- ====================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Master Places Table (106 Locations Master Table)
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
    embedding VECTOR(1536), -- Vector embedding for RAG Hybrid Search
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Hard DB Constraints (Rule-02 & Data Integrity Enforcement)
    CONSTRAINT chk_places_bounding_box CHECK (latitude BETWEEN 10.25 AND 10.55 AND longitude BETWEEN 104.85 AND 105.15),
    CONSTRAINT chk_places_rating CHECK (rating BETWEEN 0.0 AND 5.0),
    CONSTRAINT chk_places_confidence CHECK (confidence_score BETWEEN 0.0 AND 100.0)
);

-- Partial Indexes for High Concurrency Queries
CREATE INDEX IF NOT EXISTS idx_places_commune ON public.places(commune) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_tourism_category ON public.places(tourism_category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category) WHERE is_active = true;

-- GIS Spatial Index
CREATE INDEX IF NOT EXISTS idx_places_geom ON public.places USING GIST(geom);

-- Vector HNSW Index with explicit tuning (m=16, ef_construction=64)
CREATE INDEX IF NOT EXISTS idx_places_embedding_hnsw ON public.places USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Unaccent Trigram GIN Indexes for High-Speed Vietnamese Fuzzy Search
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text AS $$
SELECT public.unaccent($1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

CREATE INDEX IF NOT EXISTS idx_places_name_trgm ON public.places USING gin (public.f_unaccent(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_places_address_trgm ON public.places USING gin (public.f_unaccent(address) gin_trgm_ops);

-- 3. Videos Table (TikTok / YouTube Embed Cache)
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id VARCHAR(50) REFERENCES public.places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform VARCHAR(50) DEFAULT 'tiktok' CHECK (platform IN ('tiktok', 'youtube', 'facebook', 'youtube_shorts')),
    video_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    thumbnail_url TEXT,
    author_name VARCHAR(100),
    view_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_videos_place_id ON public.videos(place_id);

-- 4. Chat Sessions & Messages (AI Chatbot Memory)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);

-- 5. Audit Logs Table (Immutable Admin Trail - Rule 09)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_table, target_id);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Fix Supabase Linter 0013_rls_disabled_in_public for PostGIS spatial_ref_sys table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys') THEN
        BEGIN
            REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated, public;
            GRANT SELECT ON TABLE public.spatial_ref_sys TO postgres, service_role;
            ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
            DROP POLICY IF EXISTS "Public Read Spatial Ref Sys" ON public.spatial_ref_sys;
            CREATE POLICY "Public Read Spatial Ref Sys" ON public.spatial_ref_sys FOR SELECT USING (true);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipped spatial_ref_sys RLS: extension owned by supabase_admin';
        END;
    END IF;
END $$;

-- Allow Public Read Access for active places and videos
DROP POLICY IF EXISTS "Public Read Active Places" ON public.places;
CREATE POLICY "Public Read Active Places" ON public.places FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Verified Videos" ON public.videos;
CREATE POLICY "Public Read Verified Videos" ON public.videos FOR SELECT USING (is_verified = true);

-- 7. Trigger Function to Update Point Geometry & Timestamp Safely
CREATE OR REPLACE FUNCTION update_place_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_place_geom ON public.places;
CREATE TRIGGER trg_update_place_geom
BEFORE INSERT OR UPDATE ON public.places
FOR EACH ROW EXECUTE FUNCTION update_place_geom();
