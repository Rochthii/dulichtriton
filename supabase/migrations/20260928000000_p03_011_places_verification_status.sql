BEGIN;

-- ==============================================================================
-- Migration P03-011: Add verification_status to public.places
-- System: Du Lịch Tri Tôn AI System
-- Governance: Wave W3 - Master Data Governance & Canonical Schema
-- Enforces 5-state lifecycle: UNVERIFIED, IN_REVIEW, VERIFIED, REJECTED, EXPIRED
-- ==============================================================================

-- 1. Add column verification_status with default 'UNVERIFIED'
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'UNVERIFIED';

-- 2. Add review_id column to link to audit review records
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS review_id VARCHAR(100) NULL;

-- 3. Enforce CHECK constraint on allowed verification status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_places_verification_status'
  ) THEN
    ALTER TABLE public.places
    ADD CONSTRAINT chk_places_verification_status
    CHECK (verification_status IN ('UNVERIFIED', 'IN_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'));
  END IF;
END $$;

-- 4. Create index for fast status filtering
CREATE INDEX IF NOT EXISTS idx_places_verification_status
ON public.places(verification_status);

-- 5. Align existing verified records if any
UPDATE public.places
SET verification_status = 'VERIFIED'
WHERE is_verified = true AND (verification_status IS NULL OR verification_status = 'UNVERIFIED');

COMMIT;
