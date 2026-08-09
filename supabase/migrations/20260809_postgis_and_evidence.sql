-- Migration: 20260809_postgis_and_evidence.sql
-- Description: Enable PostGIS, add geometry, evidence source, and freshness verification columns to places table

-- 1. Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add spatial, evidence source, and verification columns to places table
ALTER TABLE public.places 
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS geom GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS seasonality TEXT;

-- 3. Create Spatial GIST Index for ultra-fast geographical proximity queries
CREATE INDEX IF NOT EXISTS places_geom_gist_idx ON public.places USING gist (geom);

-- 4. Create RPC Stored Procedure for PostGIS Nearby Geo-Search
DROP FUNCTION IF EXISTS match_places_nearby(numeric,numeric,double precision,integer);
CREATE OR REPLACE FUNCTION match_places_nearby (
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
AS $$
BEGIN
  RETURN QUERY
  SELECT
    places.id,
    places.slug,
    places.name,
    places.commune,
    places.category,
    places.rating,
    places.image_url,
    places.description,
    places.source_url,
    places.is_verified,
    places.verified_at,
    (ST_Distance(places.geom, ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geometry) / 1000.0)::FLOAT AS distance_km,
    1.0::FLOAT AS similarity
  FROM public.places
  WHERE places.is_active = true
    AND places.geom IS NOT NULL
    AND ST_DWithin(places.geom, ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geometry, radius_meters)
  ORDER BY ST_Distance(places.geom, ST_SetSRID(ST_MakePoint(origin_lng, origin_lat), 4326)::geometry) ASC
  LIMIT match_count;
END;
$$;

-- 5. Permissions & RLS Policy Grants
GRANT EXECUTE ON FUNCTION match_places_nearby TO anon, authenticated, service_role;
