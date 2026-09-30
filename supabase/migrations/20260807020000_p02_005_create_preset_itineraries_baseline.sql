BEGIN;

-- ==============================================================================
-- P02-005: Baseline Table Migration for public.preset_itineraries
-- System: Du Lịch Tri Tôn AI System
-- Provides the foundation table for curated travel itineraries (27+ itineraries)
-- Enables Row Level Security (RLS) and enforces least privilege:
-- - Public / anon: read-only access (SELECT) for active itineraries
-- - service_role: full administrative management (ALL)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.preset_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    emoji VARCHAR(10) DEFAULT '🧭',
    title VARCHAR(255) NOT NULL,
    tagline TEXT,
    for_whom VARCHAR(255),
    duration VARCHAR(100),
    total_distance_km NUMERIC(6, 2),
    recommended_vehicle VARCHAR(100),
    budget_range VARCHAR(255),
    stops JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 2) DEFAULT 4.5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_preset_itineraries_slug ON public.preset_itineraries(slug);
CREATE INDEX IF NOT EXISTS idx_preset_itineraries_active ON public.preset_itineraries(is_active);
CREATE INDEX IF NOT EXISTS idx_preset_itineraries_sort ON public.preset_itineraries(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.preset_itineraries ENABLE ROW LEVEL SECURITY;

-- Drop legacy/conflicting policies if exist
DROP POLICY IF EXISTS "preset_itineraries_anon_select" ON public.preset_itineraries;
DROP POLICY IF EXISTS "Allow public read active preset_itineraries" ON public.preset_itineraries;
DROP POLICY IF EXISTS "service_role_all_preset_itineraries" ON public.preset_itineraries;

-- Public read-only policy for active itineraries
CREATE POLICY "Allow public read active preset_itineraries" ON public.preset_itineraries
    FOR SELECT
    TO anon, authenticated, service_role
    USING (is_active = true);

-- Administrative policy for service_role
CREATE POLICY "service_role_all_preset_itineraries" ON public.preset_itineraries
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Revoke write privileges from anon
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.preset_itineraries FROM anon;
GRANT SELECT ON TABLE public.preset_itineraries TO anon;
GRANT ALL ON TABLE public.preset_itineraries TO service_role;

COMMIT;
