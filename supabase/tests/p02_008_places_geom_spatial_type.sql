-- ==============================================================================
-- Test Suite: P02-008 Places Spatial Column (GEOGRAPHY) Verification
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-008 (Wave W2 - Database Replay Foundation)
-- Decision Record: docs/technical-spec/DECISION_RECORD_SPATIAL_TYPE.md
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Structural Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_udt_name TEXT;
    v_has_gist BOOLEAN;
BEGIN
    -- 1.1. Verify column exists with udt_name = 'geography'
    SELECT udt_name INTO v_udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'places'
      AND column_name = 'geom';

    IF v_udt_name IS NULL THEN
        RAISE EXCEPTION 'Assertion failed: places.geom column does not exist';
    END IF;

    IF v_udt_name <> 'geography' THEN
        RAISE EXCEPTION 'Assertion failed: places.geom udt_name is %, expected geography', v_udt_name;
    END IF;

    -- 1.2. Verify GiST index exists
    SELECT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'places'
          AND indexname = 'places_geom_gist_idx'
    ) INTO v_has_gist;

    IF NOT v_has_gist THEN
        RAISE EXCEPTION 'Assertion failed: places_geom_gist_idx does not exist';
    END IF;

    RAISE NOTICE 'P02-008: Structural assertions passed (GEOGRAPHY type & GiST index verified).';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Behavioral & Trigger Auto-sync Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_geom_text TEXT;
    v_dist_meters FLOAT8;
    v_in_5km BOOLEAN;
    v_in_1km BOOLEAN;
    v_origin GEOGRAPHY;
BEGIN
    -- Seed test place with lat/lng (Chùa Xà Tón, Tri Tôn)
    INSERT INTO public.places (id, place_id, name, address, commune, category, latitude, longitude)
    VALUES (
        'poi_test_p02_008',
        'poi_test_p02_008',
        'Chùa Xà Tón Test',
        'Thị trấn Tri Tôn, Huyện Tri Tôn, An Giang',
        'Thị trấn Tri Tôn',
        'Chùa',
        10.4206,
        105.0003
    )
    ON CONFLICT (id) DO UPDATE 
    SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;

    -- Verify trigger automatically populated geom
    SELECT ST_AsText(geom) INTO v_geom_text
    FROM public.places
    WHERE id = 'poi_test_p02_008';

    IF v_geom_text IS NULL OR v_geom_text NOT LIKE 'POINT(105.0003%' THEN
        RAISE EXCEPTION 'Assertion failed: trigger did not synchronize geom properly, got %', v_geom_text;
    END IF;
    RAISE NOTICE 'P02-008: Auto-sync trigger INSERT passed (geom: %).', v_geom_text;

    -- Update to Hồ Tà Pạ (Lat 10.4439, Lng 105.0044)
    UPDATE public.places
    SET latitude = 10.4439, longitude = 105.0044
    WHERE id = 'poi_test_p02_008';

    SELECT ST_AsText(geom) INTO v_geom_text
    FROM public.places
    WHERE id = 'poi_test_p02_008';

    IF v_geom_text IS NULL OR v_geom_text NOT LIKE 'POINT(105.0044%' THEN
        RAISE EXCEPTION 'Assertion failed: trigger did not update geom on coordinate change, got %', v_geom_text;
    END IF;
    RAISE NOTICE 'P02-008: Auto-sync trigger UPDATE passed (geom: %).', v_geom_text;

    -- 2.2. Test Geodesic Distance (Tri Tôn Town center: 105.0068, 10.4128)
    v_origin := ST_SetSRID(ST_MakePoint(105.0068, 10.4128), 4326)::geography;

    SELECT 
        ST_Distance(geom, v_origin),
        ST_DWithin(geom, v_origin, 5000),
        ST_DWithin(geom, v_origin, 1000)
    INTO v_dist_meters, v_in_5km, v_in_1km
    FROM public.places
    WHERE id = 'poi_test_p02_008';

    -- Distance Hồ Tà Pạ -> Tri Tôn center is approx 3.4 km - 3.7 km
    IF v_dist_meters < 3000 OR v_dist_meters > 4500 THEN
        RAISE EXCEPTION 'Assertion failed: Geodesic distance out of expected range: % meters', v_dist_meters;
    END IF;

    IF NOT v_in_5km THEN
        RAISE EXCEPTION 'Assertion failed: ST_DWithin 5000m should be TRUE for distance %', v_dist_meters;
    END IF;

    IF v_in_1km THEN
        RAISE EXCEPTION 'Assertion failed: ST_DWithin 1000m should be FALSE for distance %', v_dist_meters;
    END IF;

    RAISE NOTICE 'P02-008: Geodesic distance calculation passed (% meters, DWithin 5km: %, DWithin 1km: %).', 
        round(v_dist_meters::numeric, 2), v_in_5km, v_in_1km;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Negative Control
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_caught BOOLEAN := false;
BEGIN
    -- Verify assertion catches if someone expected geometry instead of geography
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'places' 
          AND column_name = 'geom' 
          AND udt_name = 'geometry'
    ) THEN
        v_caught := true;
    END IF;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'Assertion failed: Negative control failed, geom must not be geometry';
    END IF;

    RAISE NOTICE 'P02-008: Negative control passed (confirmed geom is not geometry).';
END $$;

ROLLBACK;
