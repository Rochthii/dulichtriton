-- ==============================================================================
-- Test Suite: P02-012 Places Rating Range CHECK Constraint Verification
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-012 (Wave W2 - Database Replay Foundation)
-- Decision Authority: Tourism Quality Standard (Rating range 0.0 to 5.0 stars)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Structural Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_has_constraint BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'places'
          AND constraint_name = 'chk_places_rating_range'
          AND constraint_type = 'CHECK'
    ) INTO v_has_constraint;

    IF NOT v_has_constraint THEN
        RAISE EXCEPTION 'Assertion failed: chk_places_rating_range constraint does not exist';
    END IF;

    RAISE NOTICE 'P02-012: Structural assertion passed (chk_places_rating_range exists).';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Positive Tests (Valid rating & boundary limits)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Valid normal rating (4.5)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, rating)
    VALUES ('p12_valid_normal', 'p12_valid_normal', 'Valid Normal', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068, 4.5);

    -- Valid at lower boundary (0.0)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, rating)
    VALUES ('p12_valid_lower', 'p12_valid_lower', 'Valid Lower', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068, 0.0);

    -- Valid at upper boundary (5.0)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, rating)
    VALUES ('p12_valid_upper', 'p12_valid_upper', 'Valid Upper', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068, 5.0);

    -- Valid NULL rating (unrated place)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, rating)
    VALUES ('p12_valid_null', 'p12_valid_null', 'Valid Null Rating', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068, NULL);

    RAISE NOTICE 'P02-012: Positive assertions passed (valid rating values 0.0, 4.5, 5.0 & NULL allowed).';
END $$;

-- ------------------------------------------------------------------------------
-- 3. Negative Tests (Reject out-of-boundary values)
-- ------------------------------------------------------------------------------

-- 3.1. Reject below lower boundary (< 0.0)
DO $$
BEGIN
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, rating)
    VALUES ('p12_bad_negative', 'p12_bad_negative', 'Negative Rating', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068, -0.1);
    
    RAISE EXCEPTION 'Assertion failed: rating -0.1 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-012: Rating below 0.0 rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-012: Unexpected error on negative rating check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 3.2. Reject above upper boundary (> 5.0)
DO $$
BEGIN
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, rating)
    VALUES ('p12_bad_over', 'p12_bad_over', 'Over Max Rating', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068, 5.1);
    
    RAISE EXCEPTION 'Assertion failed: rating 5.1 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-012: Rating above 5.0 rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-012: Unexpected error on upper boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 3.3. Reject UPDATE of valid row to invalid rating (e.g. 9.9)
DO $$
BEGIN
    UPDATE public.places 
    SET rating = 9.9
    WHERE id = 'p12_valid_normal';
    
    RAISE EXCEPTION 'Assertion failed: update to rating 9.9 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-012: UPDATE to out-of-boundary rating rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-012: Unexpected error on update rating check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- ------------------------------------------------------------------------------
-- 4. Negative Control
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_caught BOOLEAN := false;
BEGIN
    -- Verify assertion catches if non-existent constraint name is checked
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'places'
          AND constraint_name = 'rogue_missing_rating_check'
    ) THEN
        v_caught := true;
    END IF;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'Assertion failed: Negative control failed to detect missing constraint.';
    END IF;

    RAISE NOTICE 'P02-012: Negative control passed.';
END $$;

ROLLBACK;
