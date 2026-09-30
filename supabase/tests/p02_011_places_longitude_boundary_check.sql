-- ==============================================================================
-- Test Suite: P02-011 Places Longitude Boundary CHECK Constraint Verification
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-011 (Wave W2 - Database Replay Foundation)
-- Decision Authority: Tri Tôn Geographic Boundary Rule (104.80E to 105.15E)
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
          AND constraint_name = 'chk_places_longitude_boundary'
          AND constraint_type = 'CHECK'
    ) INTO v_has_constraint;

    IF NOT v_has_constraint THEN
        RAISE EXCEPTION 'Assertion failed: chk_places_longitude_boundary constraint does not exist';
    END IF;

    RAISE NOTICE 'P02-011: Structural assertion passed (chk_places_longitude_boundary exists).';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Positive Tests (Valid in-boundary & boundary limits)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Valid inside boundary (Tri Tôn Town: 105.0068, lat: 10.4128)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES ('p11_valid_center', 'p11_valid_center', 'Valid Center', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.0068);

    -- Valid at lower boundary (104.80)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES ('p11_valid_lower', 'p11_valid_lower', 'Valid Lower', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 104.80);

    -- Valid at upper boundary (105.15)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES ('p11_valid_upper', 'p11_valid_upper', 'Valid Upper', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.15);

    -- Valid NULL longitude (unmapped/draft place)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES ('p11_valid_null', 'p11_valid_null', 'Valid Null Long', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, NULL);

    RAISE NOTICE 'P02-011: Positive assertions passed (in-boundary values & NULL allowed).';
END $$;

-- ------------------------------------------------------------------------------
-- 3. Negative Tests (Reject out-of-boundary values)
-- ------------------------------------------------------------------------------

-- 3.1. Reject below lower boundary (< 104.80)
DO $$
BEGIN
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES ('p11_bad_west', 'p11_bad_west', 'Too Far West', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 104.7999);
    
    RAISE EXCEPTION 'Assertion failed: longitude 104.7999 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-011: Longitude below 104.80 rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-011: Unexpected error on lower boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 3.2. Reject above upper boundary (> 105.15)
DO $$
BEGIN
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES ('p11_bad_east', 'p11_bad_east', 'Too Far East', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128, 105.1501);
    
    RAISE EXCEPTION 'Assertion failed: longitude 105.1501 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-011: Longitude above 105.15 rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-011: Unexpected error on upper boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 3.3. Reject UPDATE of valid row to distant location (e.g. TP.HCM: 106.6601)
DO $$
BEGIN
    UPDATE public.places 
    SET longitude = 106.6601
    WHERE id = 'p11_valid_center';
    
    RAISE EXCEPTION 'Assertion failed: update to longitude 106.6601 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-011: UPDATE to out-of-boundary longitude rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-011: Unexpected error on update boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
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
          AND constraint_name = 'rogue_missing_long_check'
    ) THEN
        v_caught := true;
    END IF;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'Assertion failed: Negative control failed to detect missing constraint.';
    END IF;

    RAISE NOTICE 'P02-011: Negative control passed.';
END $$;

ROLLBACK;
