-- ============================================================================
-- Migration: 20260930_p04_010_match_places_verified_retrieval.sql
-- Task: P04-010 — Lọc retrieval theo verification_status đã duyệt
-- Description:
--   Updates pgvector vector search RPC `match_places` and PostGIS nearby RPC
--   `match_places_nearby` to strictly enforce fail-closed retrieval filtering:
--   - ONLY places with `verification_status = 'VERIFIED'` and `is_verified = true`
--     are eligible for RAG and proximity retrieval.
--   - Excludes unverified, pending, rejected, and expired fixtures from AI context.
-- ============================================================================

BEGIN;

-- 1. Upgrade match_places (Vector Similarity Search)
DROP FUNCTION IF EXISTS public.match_places(vector, double precision, integer);
DROP FUNCTION IF EXISTS public.match_places(vector(768), double precision, integer);

CREATE OR REPLACE FUNCTION public.match_places(
    query_embedding vector(768),
    match_threshold double precision DEFAULT 0.3,
    match_count integer DEFAULT 5
)
RETURNS TABLE(
    id text,
    slug text,
    name text,
    commune text,
    category text,
    rating numeric,
    image_url text,
    description text,
    golden_time_windows text[],
    similarity double precision,
    is_verified boolean,
    verification_status text,
    verified_at timestamptz
)
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    places.id::text,
    places.slug::text,
    places.name::text,
    places.commune::text,
    places.category::text,
    places.rating,
    places.image_url::text,
    places.description::text,
    places.golden_time_windows,
    (1 - (places.embedding <=> query_embedding))::float AS similarity,
    places.is_verified,
    places.verification_status::text,
    places.verified_at
  FROM public.places
  WHERE places.is_active = true
    AND places.is_verified = true
    AND places.verification_status = 'VERIFIED'
    AND places.embedding IS NOT NULL
    AND (1 - (places.embedding <=> query_embedding)) > match_threshold
  ORDER BY places.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Upgrade match_places_nearby (PostGIS Proximity Search)
DROP FUNCTION IF EXISTS public.match_places_nearby(numeric, numeric, float8, integer);

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
  verification_status VARCHAR,
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
    p.verification_status::VARCHAR,
    p.verified_at,
    ROUND((ST_Distance(p.geom, v_origin) / 1000.0)::numeric, 2)::FLOAT AS distance_km,
    1.0::FLOAT AS similarity
  FROM public.places p
  WHERE p.is_active = true
    AND p.is_verified = true
    AND p.verification_status = 'VERIFIED'
    AND p.geom IS NOT NULL
    AND ST_DWithin(p.geom, v_origin, radius_meters)
  ORDER BY ST_Distance(p.geom, v_origin) ASC
  LIMIT match_count;
END;
$$;

-- 3. Grants
REVOKE ALL ON FUNCTION public.match_places(vector(768), double precision, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_places(vector(768), double precision, integer) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.match_places_nearby(numeric, numeric, float, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_places_nearby(numeric, numeric, float, integer) TO anon, authenticated, service_role;

COMMIT;
