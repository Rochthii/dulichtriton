-- ==============================================================================
-- Migration: Add Latitude Boundary CHECK Constraint on public.places
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 07:00:00 (Baseline boundary constraints)
-- Task: P02-010 (Wave W2 - Database Replay Foundation)
-- Decision Authority: Tri Tôn Geographic Boundary Rule (10.30N to 10.55N)
-- ==============================================================================

BEGIN;

-- 1. Clean existing constraint if replaying
ALTER TABLE public.places 
  DROP CONSTRAINT IF EXISTS chk_places_latitude_boundary;

-- 2. Add CHECK constraint enforcing Tri Tôn latitude range [10.30, 10.55]
-- Nullable values are permitted for unmapped or draft points
ALTER TABLE public.places 
  ADD CONSTRAINT chk_places_latitude_boundary 
  CHECK (latitude IS NULL OR (latitude >= 10.30 AND latitude <= 10.55));

COMMIT;
