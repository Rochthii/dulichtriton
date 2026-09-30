BEGIN;

-- ==============================================================================
-- P02-003: Baseline Table Migration for public.places
-- System: Du Lịch Tri Tôn AI System
-- Provides the foundation table required by subsequent migrations (vector_search,
-- video_discoveries foreign keys, postgis geo-search, etc.)
-- Enables Row Level Security (RLS) and enforces least privilege:
-- - Public / anon: read-only access (SELECT)
-- - service_role: full administrative management (ALL)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.places (
    id VARCHAR(100) PRIMARY KEY,
    place_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    tourism_category VARCHAR(100),
    description TEXT,
    short_description TEXT,
    address TEXT NOT NULL,
    commune VARCHAR(100) NOT NULL,
    district VARCHAR(100) DEFAULT 'Tri Tôn',
    province VARCHAR(100) DEFAULT 'An Giang',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone VARCHAR(50),
    website TEXT,
    business_status VARCHAR(50) DEFAULT 'OPERATIONAL',
    opening_hours VARCHAR(100) DEFAULT '07:00 - 18:00',
    price_level VARCHAR(50) DEFAULT 'Miễn phí',
    rating NUMERIC(3, 2) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    confidence_score NUMERIC(5, 2) DEFAULT 95.0,
    image_url TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    review_samples JSONB DEFAULT '[]'::jsonb,
    search_keywords TEXT[] DEFAULT '{}',
    travel_tags TEXT[] DEFAULT '{}',
    golden_time_windows TEXT[] DEFAULT '{}',
    recommended_duration VARCHAR(50),
    best_visit_time VARCHAR(100),
    family_friendly BOOLEAN DEFAULT true,
    couple_friendly BOOLEAN DEFAULT true,
    kids_friendly BOOLEAN DEFAULT true,
    parking BOOLEAN DEFAULT true,
    wifi BOOLEAN DEFAULT true,
    ticket_required BOOLEAN DEFAULT false,
    is_hot BOOLEAN DEFAULT false,
    hot_rank INT,
    open_late BOOLEAN DEFAULT false,
    night_hours VARCHAR(100),
    field_tips TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Partial and standard indexes
CREATE INDEX IF NOT EXISTS idx_places_commune ON public.places(commune);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON public.places(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Drop legacy/permissive policies if exist
DROP POLICY IF EXISTS "places_anon_select" ON public.places;
DROP POLICY IF EXISTS "Allow public read active places" ON public.places;
DROP POLICY IF EXISTS "service_role_all_places" ON public.places;

-- Public read-only policy
CREATE POLICY "Allow public read active places" ON public.places
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Administrative full access policy for service_role
CREATE POLICY "service_role_all_places" ON public.places
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Revoke write privileges from anon
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.places FROM anon;
GRANT SELECT ON TABLE public.places TO anon;
GRANT ALL ON TABLE public.places TO service_role;

COMMIT;
