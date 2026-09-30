-- ==============================================================================
-- Test Suite: P02-007 Core Extensions Verification & Functional Smoke Test
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-007 (Wave W2 - Database Replay Foundation)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Existence Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_missing_exts TEXT[];
BEGIN
    SELECT ARRAY_AGG(ext) INTO v_missing_exts
    FROM UNNEST(ARRAY[
        'uuid-ossp',
        'pgcrypto',
        'vector',
        'postgis',
        'unaccent',
        'pg_trgm'
    ]) AS ext
    WHERE NOT EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = ext
    );

    IF v_missing_exts IS NOT NULL AND ARRAY_LENGTH(v_missing_exts, 1) > 0 THEN
        RAISE EXCEPTION 'Assertion failed: Missing core extensions: %', v_missing_exts;
    END IF;

    RAISE NOTICE 'P02-007: All 6 core extensions are installed in pg_extension.';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Functional Smoke Tests (Prove extensions actually work)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_uuid UUID;
    v_hash BYTEA;
    v_cosine_dist FLOAT8;
    v_gis_dist FLOAT8;
    v_unaccented TEXT;
    v_sim FLOAT4;
BEGIN
    -- 2.1. Test uuid-ossp
    v_uuid := uuid_generate_v4();
    IF v_uuid IS NULL THEN
        RAISE EXCEPTION 'Assertion failed: uuid_generate_v4() returned NULL';
    END IF;
    RAISE NOTICE 'P02-007: uuid-ossp smoke test passed (uuid: %)', v_uuid;

    -- 2.2. Test pgcrypto
    v_hash := digest('tri_ton_test', 'sha256');
    IF length(v_hash) <> 32 THEN
        RAISE EXCEPTION 'Assertion failed: digest(sha256) returned unexpected length';
    END IF;
    RAISE NOTICE 'P02-007: pgcrypto smoke test passed.';

    -- 2.3. Test vector
    v_cosine_dist := '[1,2,3]'::vector <=> '[1,2,3]'::vector;
    IF v_cosine_dist > 0.0001 THEN
        RAISE EXCEPTION 'Assertion failed: vector cosine distance is not 0 for identical vectors';
    END IF;
    RAISE NOTICE 'P02-007: vector smoke test passed (cosine dist: %)', v_cosine_dist;

    -- 2.4. Test postgis
    -- Distance between Núi Tô (105.006, 10.377) and Soài So (104.995, 10.380) in meters
    SELECT ST_Distance(
        ST_SetSRID(ST_Point(105.006, 10.377), 4326)::geography,
        ST_SetSRID(ST_Point(104.995, 10.380), 4326)::geography
    ) INTO v_gis_dist;
    
    IF v_gis_dist IS NULL OR v_gis_dist <= 0 THEN
        RAISE EXCEPTION 'Assertion failed: ST_Distance calculation failed';
    END IF;
    RAISE NOTICE 'P02-007: postgis smoke test passed (distance: % m)', round(v_gis_dist::numeric, 2);

    -- 2.5. Test unaccent
    v_unaccented := unaccent('Chùa Hàng Còng, Tri Tôn');
    IF v_unaccented <> 'Chua Hang Cong, Tri Ton' THEN
        RAISE EXCEPTION 'Assertion failed: unaccent returned unexpected string: %', v_unaccented;
    END IF;
    RAISE NOTICE 'P02-007: unaccent smoke test passed (result: %)', v_unaccented;

    -- 2.6. Test pg_trgm
    v_sim := similarity('Chùa Tà Pạ', 'Chùa Ta Pa');
    IF v_sim <= 0.4 THEN
        RAISE EXCEPTION 'Assertion failed: pg_trgm similarity too low: %', v_sim;
    END IF;
    RAISE NOTICE 'P02-007: pg_trgm smoke test passed (similarity: %)', v_sim;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Negative Control (Detect missing required extension)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_detected BOOLEAN := false;
BEGIN
    -- Check for an intentionally non-existent extension
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'non_existent_rogue_ext'
    ) THEN
        v_detected := true;
    END IF;

    IF NOT v_detected THEN
        RAISE EXCEPTION 'Assertion failed: Negative control failed to detect missing extension';
    END IF;

    RAISE NOTICE 'P02-007: Negative control successfully caught missing extension check.';
END $$;

ROLLBACK;
