-- =============================================================================
-- MIGRATION: 20260825_dms_optimal_schema.sql
-- Destination Management System (DMS) Optimal Architecture for Tri Tôn Tourism
-- Features: PostGIS Spatial Queries, pgvector HNSW 768d, GIN Search, Foreign Keys,
--           Trigger-based Timestamps, and RPC Functions for Hybrid & Proximity Search.
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TRIGGER HELPER: Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 3. BẢNG ĐỊA ĐIỂM MASTER (places — 149 Verified Coordinates)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    commune TEXT NOT NULL,           -- Đúng 15 Xã / Thị trấn (Rule 02)
    district TEXT DEFAULT 'Tri Tôn',
    province TEXT DEFAULT 'An Giang',
    category TEXT NOT NULL,
    tourism_category TEXT,
    subcategory TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    image_url TEXT NOT NULL,         -- Ảnh đại diện chính
    photos TEXT[] DEFAULT '{}',      -- Album ảnh WebP chất lượng cao
    checkin_spots JSONB DEFAULT '[]'::jsonb, -- Tọa độ & góc check-in
    description TEXT,
    short_description TEXT,
    detailed_story TEXT,             -- Sự tích di sản & văn hóa bản địa
    detailed_story_en TEXT,
    field_tips_en TEXT,
    opening_hours TEXT DEFAULT '07:00 - 18:00 (Hàng ngày)',
    open_late BOOLEAN DEFAULT FALSE,
    night_hours TEXT DEFAULT '17:00 - 22:00',
    golden_time_windows TEXT[] DEFAULT '{}',
    price_level TEXT DEFAULT 'Miễn phí',
    phone TEXT,
    address TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    embedding VECTOR(768),           -- Gemini 768d Semantic Embedding
    video_url TEXT,
    is_hot BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ mục Tối Ưu cho Bảng places
CREATE INDEX IF NOT EXISTS idx_places_geom ON places USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_places_commune ON places (commune);
CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON places (is_active);
CREATE INDEX IF NOT EXISTS idx_places_is_hot ON places (is_hot);
CREATE INDEX IF NOT EXISTS idx_places_embedding_hnsw ON places USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_places_search_gin ON places USING GIN (to_tsvector('simple', unaccent(name || ' ' || COALESCE(description, '') || ' ' || commune)));

DROP TRIGGER IF EXISTS trg_places_updated_at ON places;
CREATE TRIGGER trg_places_updated_at
BEFORE UPDATE ON places
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 4. BẢNG LỊCH TRÌNH (preset_itineraries) & ĐIỂM DỪNG (itinerary_stops)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preset_itineraries (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_en TEXT,
    emoji TEXT DEFAULT '🧭',
    duration TEXT NOT NULL,
    total_distance_km NUMERIC(5, 1) DEFAULT 25.0,
    recommended_vehicle TEXT DEFAULT 'Xe máy / Ô tô',
    suitable_for TEXT DEFAULT 'Tất cả du khách',
    budget_estimate TEXT DEFAULT 'Bình dân',
    description TEXT,
    tagline TEXT,
    stops JSONB DEFAULT '[]'::jsonb, -- Cache danh sách stops để đọc nhanh
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itineraries_slug ON preset_itineraries (slug);
CREATE INDEX IF NOT EXISTS idx_itineraries_active ON preset_itineraries (is_active, sort_order);

DROP TRIGGER IF EXISTS trg_preset_itineraries_updated_at ON preset_itineraries;
CREATE TRIGGER trg_preset_itineraries_updated_at
BEFORE UPDATE ON preset_itineraries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bảng quan hệ chuẩn hóa cho điểm dừng
CREATE TABLE IF NOT EXISTS itinerary_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id TEXT NOT NULL REFERENCES preset_itineraries(id) ON DELETE CASCADE,
    place_id TEXT REFERENCES places(id) ON DELETE SET NULL,
    stop_order INT NOT NULL DEFAULT 1,
    time_slot TEXT NOT NULL,          -- '07:30 - 08:30'
    custom_name TEXT,                 -- Tên tùy biến nếu là điểm dừng tự do
    custom_tip TEXT,
    duration_min INT DEFAULT 60,
    travel_to_next_km NUMERIC(4, 1) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_stops_itin ON itinerary_stops (itinerary_id, stop_order);

-- -----------------------------------------------------------------------------
-- 5. BẢNG TRI THỨC RAG CHUYÊN SÂU (custom_knowledge_base)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_knowledge_base (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('food', 'place', 'festival', 'transport', 'emergency', 'general')),
    keywords TEXT[] DEFAULT '{}',
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 10,
    author TEXT DEFAULT 'Ban Quản Trị Tri Tôn',
    embedding VECTOR(768),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON custom_knowledge_base (category);
CREATE INDEX IF NOT EXISTS idx_knowledge_active ON custom_knowledge_base (is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding_hnsw ON custom_knowledge_base USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_search_gin ON custom_knowledge_base USING GIN (to_tsvector('simple', unaccent(title || ' ' || content)));

DROP TRIGGER IF EXISTS trg_knowledge_updated_at ON custom_knowledge_base;
CREATE TRIGGER trg_knowledge_updated_at
BEFORE UPDATE ON custom_knowledge_base
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. BẢNG VIDEO TIKTOK & REVIEW ĐA PHƯƠNG TIỆN (video_discoveries)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_discoveries (
    id TEXT PRIMARY KEY,
    place_id TEXT REFERENCES places(id) ON DELETE SET NULL, -- Khóa ngoại chuẩn
    external_video_id TEXT UNIQUE,
    video_url TEXT NOT NULL,
    embed_url TEXT,
    thumbnail_url TEXT,
    title TEXT NOT NULL,
    author_name TEXT,
    author_username TEXT,
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    matched_location TEXT,
    quality_score NUMERIC(3, 2) DEFAULT 0.95,
    verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('VERIFIED', 'PENDING', 'REJECTED')),
    hashtags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_place_id ON video_discoveries (place_id);
CREATE INDEX IF NOT EXISTS idx_video_status ON video_discoveries (verification_status, view_count DESC);

DROP TRIGGER IF EXISTS trg_video_updated_at ON video_discoveries;
CREATE TRIGGER trg_video_updated_at
BEFORE UPDATE ON video_discoveries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 7. BẢNG HỘP THƯ PHẢN HỒI DU KHÁCH (feedbacks)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT REFERENCES places(id) ON DELETE SET NULL, -- Gắn với điểm đến nếu có
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL CHECK (category IN ('place_contribution', 'place_correction', 'photo_contribution', 'photo_report', 'feature_request', 'general')),
    subject TEXT,
    message TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    metadata JSONB DEFAULT '{}'::jsonb, -- { admin_notes, ip, photo_url }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks (category);
CREATE INDEX IF NOT EXISTS idx_feedbacks_place_id ON feedbacks (place_id);

DROP TRIGGER IF EXISTS trg_feedbacks_updated_at ON feedbacks;
CREATE TRIGGER trg_feedbacks_updated_at
BEFORE UPDATE ON feedbacks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 8. BẢNG NHẬT KÝ KIỂM TOÁN (audit_logs — Append-Only Bất Biến)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT DEFAULT 'Admin',
    user_email TEXT,
    user_role TEXT DEFAULT 'ADMIN',
    action TEXT NOT NULL,            -- CREATE, UPDATE, DELETE, SYNC_VECTOR, REVALIDATE
    resource_type TEXT NOT NULL,     -- places, itineraries, feedbacks, videos
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

-- -----------------------------------------------------------------------------
-- 9. POSTGIS RPC: TÌM ĐỊA ĐIỂM GẦN NHẤT THEO TỌA ĐỘ GPS (Proximity Search)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_nearby_places(
    user_lat NUMERIC,
    user_lng NUMERIC,
    radius_km NUMERIC DEFAULT 5.0,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    commune TEXT,
    category TEXT,
    image_url TEXT,
    rating NUMERIC,
    latitude NUMERIC,
    longitude NUMERIC,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.commune,
        p.category,
        p.image_url,
        p.rating,
        p.latitude,
        p.longitude,
        ST_Distance(
            p.geom::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) AS distance_meters
    FROM places p
    WHERE p.is_active = TRUE
      AND ST_DWithin(
          p.geom::geography,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
          radius_km * 1000
      )
    ORDER BY distance_meters ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------------------------------------
-- 10. PGVECTOR RPC: TÌM KIẾM NGỮ NGHĨA HYBRID CHO CHATBOT AI RAG
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_places_and_knowledge(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    source_type TEXT,
    id TEXT,
    title TEXT,
    content TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    (
        SELECT 
            'place'::TEXT AS source_type,
            p.id,
            p.name AS title,
            (p.commune || ' • ' || p.category || ' • ' || COALESCE(p.description, '') || ' • ' || COALESCE(p.detailed_story, '')) AS content,
            1 - (p.embedding <=> query_embedding) AS similarity
        FROM places p
        WHERE p.is_active = TRUE 
          AND p.embedding IS NOT NULL
          AND 1 - (p.embedding <=> query_embedding) > match_threshold
        ORDER BY p.embedding <=> query_embedding
        LIMIT match_count
    )
    UNION ALL
    (
        SELECT 
            'knowledge'::TEXT AS source_type,
            k.id,
            k.title,
            k.content,
            1 - (k.embedding <=> query_embedding) AS similarity
        FROM custom_knowledge_base k
        WHERE k.is_active = TRUE 
          AND k.embedding IS NOT NULL
          AND 1 - (k.embedding <=> query_embedding) > match_threshold
        ORDER BY k.embedding <=> query_embedding
        LIMIT match_count
    )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;
