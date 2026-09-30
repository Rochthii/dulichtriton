-- ==============================================================================
-- Test Suite: P02-010 Places Latitude Boundary CHECK Constraint Verification
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-010 (Wave W2 - Database Replay Foundation)
-- Decision Authority: Tri Tôn Geographic Boundary Rule (10.30N to 10.55N)
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
          AND constraint_name = 'chk_places_latitude_boundary'
          AND constraint_type = 'CHECK'
    ) INTO v_has_constraint;

    IF NOT v_has_constraint THEN
        RAISE EXCEPTION 'Assertion failed: chk_places_latitude_boundary constraint does not exist';
    END IF;

    RAISE NOTICE 'P02-010: Structural assertion passed (chk_places_latitude_boundary exists).';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Positive Tests (Valid in-boundary & boundary limits)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Valid inside boundary (Tri Tôn Town: 10.4128)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude)
    VALUES ('p10_valid_center', 'p10_valid_center', 'Valid Center', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4128);

    -- Valid at lower boundary (10.30)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude)
    VALUES ('p10_valid_lower', 'p10_valid_lower', 'Valid Lower', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.30);

    -- Valid at upper boundary (10.55)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude)
    VALUES ('p10_valid_upper', 'p10_valid_upper', 'Valid Upper', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.55);

    -- Valid NULL latitude (unmapped/draft place)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude)
    VALUES ('p10_valid_null', 'p10_valid_null', 'Valid Null Lat', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', NULL);

    RAISE NOTICE 'P02-010: Positive assertions passed (in-boundary values & NULL allowed).';
END $$;

-- ------------------------------------------------------------------------------
-- 3. Negative Tests (Reject out-of-boundary values)
-- ------------------------------------------------------------------------------

-- 3.1. Reject below lower boundary (< 10.30)
DO $$
BEGIN
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude)
    VALUES ('p10_bad_south', 'p10_bad_south', 'Too Far South', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.2999);
    
    RAISE EXCEPTION 'Assertion failed: latitude 10.2999 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-010: Latitude below 10.30 rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-010: Unexpected error on lower boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 3.2. Reject above upper boundary (> 10.55)
DO $$
BEGIN
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude)
    VALUES ('p10_bad_north', 'p10_bad_north', 'Too Far North', 'Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.5501);
    
    RAISE EXCEPTION 'Assertion failed: latitude 10.5501 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-010: Latitude above 10.55 rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-010: Unexpected error on upper boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- 3.3. Reject UPDATE of valid row to distant location (e.g. Hanoi: 21.0285)
DO $$
BEGIN
    UPDATE public.places 
    SET latitude = 21.0285
    WHERE id = 'p10_valid_center';
    
    RAISE EXCEPTION 'Assertion failed: update to latitude 21.0285 should have been rejected by CHECK constraint';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'P02-010: UPDATE to out-of-boundary latitude rejected as expected (check_violation).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-010: Unexpected error on update boundary check: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
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
          AND constraint_name = 'rogue_missing_lat_check'
    ) THEN
        v_caught := true;
    END IF;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'Assertion failed: Negative control failed to detect missing constraint.';
    END IF;

    RAISE NOTICE 'P02-010: Negative control passed.';
END $$;

ROLLBACK;
