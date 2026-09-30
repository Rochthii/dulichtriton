-- ==============================================================================
-- Migration: Places Spatial Column Standardized to GEOGRAPHY(Point, 4326)
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 05:00:00 (Baseline after core extensions)
-- Task: P02-008 (Wave W2 - Database Replay Foundation)
-- Decision Record: docs/technical-spec/DECISION_RECORD_SPATIAL_TYPE.md
-- ==============================================================================

BEGIN;

-- 1. Ensure PostGIS extension is available
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Add standardized GEOGRAPHY(Point, 4326) column to public.places
ALTER TABLE public.places 
  ADD COLUMN IF NOT EXISTS geom GEOGRAPHY(Point, 4326);

-- 3. Create Spatial GiST Index for high-performance geodesic proximity queries
CREATE INDEX IF NOT EXISTS places_geom_gist_idx 
  ON public.places USING gist (geom);

-- 4. Create trigger function to automatically synchronize geom from (latitude, longitude)
CREATE OR REPLACE FUNCTION public.fn_sync_places_geom()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geom := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Attach trigger to public.places for automatic point synchronization
DROP TRIGGER IF EXISTS trg_sync_places_geom ON public.places;
CREATE TRIGGER trg_sync_places_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sync_places_geom();

-- 6. Backfill existing records if any
UPDATE public.places
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND geom IS NULL;

COMMIT;
