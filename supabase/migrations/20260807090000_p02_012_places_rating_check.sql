-- ==============================================================================
-- Migration: Add Rating Range CHECK Constraint on public.places
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 09:00:00 (Baseline boundary constraints)
-- Task: P02-012 (Wave W2 - Database Replay Foundation)
-- Decision Authority: Tourism Quality Standard (Rating range 0.0 to 5.0 stars)
-- ==============================================================================

BEGIN;

-- 1. Clean existing constraint if replaying
ALTER TABLE public.places 
  DROP CONSTRAINT IF EXISTS chk_places_rating_range;

-- 2. Add CHECK constraint enforcing rating range [0.0, 5.0]
-- Nullable values are permitted for unrated places
ALTER TABLE public.places 
  ADD CONSTRAINT chk_places_rating_range 
  CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 5.0));

COMMIT;
