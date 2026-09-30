-- ==============================================================================
-- Migration: Add Longitude Boundary CHECK Constraint on public.places
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 08:00:00 (Baseline boundary constraints)
-- Task: P02-011 (Wave W2 - Database Replay Foundation)
-- Decision Authority: Tri Tôn Geographic Boundary Rule (104.80E to 105.15E)
-- ==============================================================================

BEGIN;

-- 1. Clean existing constraint if replaying
ALTER TABLE public.places 
  DROP CONSTRAINT IF EXISTS chk_places_longitude_boundary;

-- 2. Add CHECK constraint enforcing Tri Tôn longitude range [104.80, 105.15]
-- Nullable values are permitted for unmapped or draft points
ALTER TABLE public.places 
  ADD CONSTRAINT chk_places_longitude_boundary 
  CHECK (longitude IS NULL OR (longitude >= 104.80 AND longitude <= 105.15));

COMMIT;
