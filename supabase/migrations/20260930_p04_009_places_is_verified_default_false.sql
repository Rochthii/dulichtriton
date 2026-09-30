BEGIN;

-- ==============================================================================
-- Migration P04-009: Do not default is_verified to true on public.places
-- System: Du Lịch Tri Tôn AI System
-- Governance: Wave W4 - AI Grounding, Verification Claims & Observability
-- Proof: Missing field / unverified records must fail-closed to false
-- ==============================================================================

-- 1. Alter is_verified column default on public.places from true to false
ALTER TABLE public.places 
  ALTER COLUMN is_verified SET DEFAULT false;

-- 2. Alter is_verified column default on public.videos from true to false (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'videos' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE public.videos ALTER COLUMN is_verified SET DEFAULT false;
  END IF;
END $$;

-- 3. Fail-closed: Update any NULL is_verified records in places to false
UPDATE public.places
  SET is_verified = false
  WHERE is_verified IS NULL;

-- 4. Enforce coherence: Any record whose verification_status is not 'VERIFIED'
-- must not have is_verified = true
UPDATE public.places
  SET is_verified = false
  WHERE verification_status IS DISTINCT FROM 'VERIFIED' AND is_verified = true;

COMMIT;
