-- ==============================================================================
-- Migration: Fix and Standardize match_places_nearby RPC with GEOGRAPHY Type
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 06:00:00 (Baseline after spatial column standardization)
-- Task: P02-009 (Wave W2 - Database Replay Foundation)
-- Decision Record: docs/technical-spec/DECISION_RECORD_SPATIAL_TYPE.md
-- ==============================================================================

BEGIN;

-- 1. Ensure verification & evidence columns exist on public.places for RPC output compatibility
ALTER TABLE public.places 
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS seasonality TEXT;

-- 2. Drop old function signatures if exist to ensure clean replacement
DROP FUNCTION IF EXISTS public.match_places_nearby(numeric, numeric, double precision, integer);
DROP FUNCTION IF EXISTS public.match_places_nearby(numeric, numeric, float8, integer);

-- 3. Create standardized PostGIS Nearby Search RPC using GEOGRAPHY
CREATE OR REPLACE FUNCTION public.match_places_nearby (
  origin_lat NUMERIC,
  origin_lng NUMERIC,
  radius_meters FLOAT DEFAULT 10000.0,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id VARCHAR,
  slug VARCHAR,
  name VARCHAR,
  commune VARCHAR,
  category VARCHAR,
  rating NUMERIC,
  image_url TEXT,
  description TEXT,
  source_url TEXT,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  distance_km FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
SECURITY DEFINER
AS $$
DECLARE
  v_origin GEOGRAPHY;
BEGIN
  -- Construct origin geography point once for optimal execution plan
  v_origin := ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geography;

  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.name,
    p.commune,
    p.category,
    p.rating,
    p.image_url,
    p.description,
    p.source_url,
    p.is_verified,
    p.verified_at,
    ROUND((ST_Distance(p.geom, v_origin) / 1000.0)::numeric, 2)::FLOAT AS distance_km,
    1.0::FLOAT AS similarity
  FROM public.places p
  WHERE p.is_active = true
    AND p.geom IS NOT NULL
    AND ST_DWithin(p.geom, v_origin, radius_meters)
  ORDER BY ST_Distance(p.geom, v_origin) ASC
  LIMIT match_count;
END;
$$;

-- 4. Permissions & Grants
-- Allow public and service role access for chatbot RAG and mobile map queries
REVOKE ALL ON FUNCTION public.match_places_nearby(numeric, numeric, float, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_places_nearby(numeric, numeric, float, integer) TO anon, authenticated, service_role;

COMMIT;
