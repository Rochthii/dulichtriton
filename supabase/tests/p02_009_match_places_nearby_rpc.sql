-- ==============================================================================
-- Test Suite: P02-009 match_places_nearby RPC Verification with Real Tri Tôn POIs
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-009 (Wave W2 - Database Replay Foundation)
-- Decision Record: docs/technical-spec/DECISION_RECORD_SPATIAL_TYPE.md
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Structural & Privilege Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_func_exists BOOLEAN;
    v_is_secdef BOOLEAN;
    v_anon_exec INT;
BEGIN
    -- Verify function exists
    SELECT EXISTS (
        SELECT 1 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.proname = 'match_places_nearby'
    ) INTO v_func_exists;

    IF NOT v_func_exists THEN
        RAISE EXCEPTION 'Assertion failed: match_places_nearby RPC does not exist';
    END IF;

    -- Verify SECURITY DEFINER
    SELECT p.prosecdef INTO v_is_secdef
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.proname = 'match_places_nearby';

    IF NOT v_is_secdef THEN
        RAISE EXCEPTION 'Assertion failed: match_places_nearby must be SECURITY DEFINER';
    END IF;

    -- Verify anon execution privilege
    SELECT COUNT(*) INTO v_anon_exec
    FROM information_schema.routine_privileges
    WHERE routine_schema = 'public'
      AND routine_name = 'match_places_nearby'
      AND grantee = 'anon';

    IF v_anon_exec = 0 THEN
        RAISE EXCEPTION 'Assertion failed: anon role lacks EXECUTE privilege on match_places_nearby';
    END IF;

    RAISE NOTICE 'P02-009: Structural and privilege assertions passed.';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Seed Real Tri Tôn POIs with Known Coordinates
-- ------------------------------------------------------------------------------
-- Origin: Tri Tôn Town Center (Lat: 10.4128, Lng: 105.0068)
INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude, is_active)
VALUES 
    -- ~1.1 km from center
    ('p09_xa_ton', 'p09_xa_ton', 'Chùa Xà Tón', 'TT Tri Tôn', 'Thị trấn Tri Tôn', 'Chùa', 10.4206, 105.0003, true),
    -- ~3.5 km from center
    ('p09_ta_pa', 'p09_ta_pa', 'Hồ Tà Pạ', 'Xã Núi Tô', 'Xã Núi Tô', 'Hồ', 10.4439, 105.0044, true),
    -- ~6.2 km from center
    ('p09_tuc_dup', 'p09_tuc_dup', 'Đồi Tức Dụp', 'Xã An Tức', 'Xã An Tức', 'Khu di tích', 10.3792, 104.9603, true),
    -- ~12.5 km from center (Beyond 10km boundary)
    ('p09_tra_su', 'p09_tra_su', 'Rừng Tràm Trà Sư', 'TX Tịnh Biên', 'Văn Giáo', 'Rừng', 10.5186, 105.0450, true),
    -- Inactive place inside 1km (Must be excluded by is_active filter)
    ('p09_inactive', 'p09_inactive', 'Quán Đóng Cửa', 'TT Tri Tôn', 'Thị trấn Tri Tôn', 'Quán', 10.4130, 105.0070, false)
ON CONFLICT (id) DO UPDATE 
SET latitude = EXCLUDED.latitude, 
    longitude = EXCLUDED.longitude, 
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 3. Behavioral Testing as anon role
-- ------------------------------------------------------------------------------
SET ROLE anon;

-- 3.1. Test radius 5,000 meters (5 km)
DO $$
DECLARE
    v_count INT;
    v_first_id TEXT;
    v_first_dist FLOAT;
    v_second_dist FLOAT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.match_places_nearby(10.4128, 105.0068, 5000.0, 10);

    -- Expected: Exactly 2 active places (Chùa Xà Tón, Hồ Tà Pạ).
    -- Excluded: Đồi Tức Dụp (6.2km), Trà Sư (12.5km), and Inactive place.
    IF v_count <> 2 THEN
        RAISE EXCEPTION 'Assertion failed: expected 2 places within 5km, found %', v_count;
    END IF;

    -- Verify distance sorting (closer place must be first)
    SELECT id, distance_km INTO v_first_id, v_first_dist
    FROM public.match_places_nearby(10.4128, 105.0068, 5000.0, 10)
    LIMIT 1;

    IF v_first_id <> 'p09_xa_ton' THEN
        RAISE EXCEPTION 'Assertion failed: first place must be Chùa Xà Tón (~1.1km), got %', v_first_id;
    END IF;

    SELECT distance_km INTO v_second_dist
    FROM public.match_places_nearby(10.4128, 105.0068, 5000.0, 10)
    OFFSET 1 LIMIT 1;

    IF v_second_dist <= v_first_dist THEN
        RAISE EXCEPTION 'Assertion failed: results not sorted ascending by distance (% <= %)', v_second_dist, v_first_dist;
    END IF;

    RAISE NOTICE 'P02-009: 5km radius search passed (Found 2 places: %km, %km, correctly sorted).', 
        v_first_dist, v_second_dist;
END $$;

-- 3.2. Test radius 10,000 meters (10 km)
DO $$
DECLARE
    v_count INT;
    v_has_tra_su BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.match_places_nearby(10.4128, 105.0068, 10000.0, 10);

    -- Expected: Exactly 3 places (Chùa Xà Tón, Hồ Tà Pạ, Đồi Tức Dụp).
    IF v_count <> 3 THEN
        RAISE EXCEPTION 'Assertion failed: expected 3 places within 10km, found %', v_count;
    END IF;

    -- Verify Rừng Tràm Trà Sư (>12km) is NOT included
    SELECT EXISTS (
        SELECT 1 FROM public.match_places_nearby(10.4128, 105.0068, 10000.0, 10)
        WHERE id = 'p09_tra_su'
    ) INTO v_has_tra_su;

    IF v_has_tra_su THEN
        RAISE EXCEPTION 'Assertion failed: Trà Sư (>12km) unexpectedly included in 10km radius';
    END IF;

    RAISE NOTICE 'P02-009: 10km radius search passed (Found 3 places, excluded place >10km).';
END $$;

-- ------------------------------------------------------------------------------
-- 4. Negative Control (Extreme coordinates & zero radius)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_zero_res INT;
    v_hanoi_res INT;
BEGIN
    -- Search with 0 radius -> should return 0 rows
    SELECT COUNT(*) INTO v_zero_res
    FROM public.match_places_nearby(10.4128, 105.0068, 0.0, 5);

    IF v_zero_res <> 0 THEN
        RAISE EXCEPTION 'Assertion failed: 0m radius search should return 0 places, got %', v_zero_res;
    END IF;

    -- Search from distant city (Hanoi coordinates: 21.0285, 105.8542) with 10km radius
    SELECT COUNT(*) INTO v_hanoi_res
    FROM public.match_places_nearby(21.0285, 105.8542, 10000.0, 5);

    IF v_hanoi_res <> 0 THEN
        RAISE EXCEPTION 'Assertion failed: search from Hanoi should return 0 Tri Tôn places, got %', v_hanoi_res;
    END IF;

    RAISE NOTICE 'P02-009: Negative control passed (0 radius & distant coordinates returned 0 results cleanly).';
END $$;

RESET ROLE;
ROLLBACK;
