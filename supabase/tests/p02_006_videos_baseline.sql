-- ==============================================================================
-- Test Suite: P02-006 Videos Baseline Verification & RLS Enforcement
-- System: Du Lịch Tri Tôn AI System
-- Task: P02-006 (Wave W2 - Database Replay Foundation)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Structural Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_missing_cols TEXT[];
    v_has_rls BOOLEAN;
BEGIN
    -- Check table existence
    IF to_regclass('public.videos') IS NULL THEN
        RAISE EXCEPTION 'Assertion failed: public.videos does not exist';
    END IF;

    -- Check required columns
    SELECT ARRAY_AGG(col) INTO v_missing_cols
    FROM UNNEST(ARRAY[
        'id', 'place_id', 'title', 'platform', 'video_url', 
        'embed_url', 'thumbnail_url', 'author_name', 'view_count', 
        'is_verified', 'created_at', 'updated_at'
    ]) AS col
    WHERE NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'videos' 
          AND column_name = col
    );

    IF v_missing_cols IS NOT NULL AND ARRAY_LENGTH(v_missing_cols, 1) > 0 THEN
        RAISE EXCEPTION 'Assertion failed: missing columns in public.videos: %', v_missing_cols;
    END IF;

    -- Check RLS is enabled
    SELECT relrowsecurity INTO v_has_rls
    FROM pg_class
    WHERE relname = 'videos' AND relnamespace = 'public'::regnamespace;

    IF v_has_rls IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'Assertion failed: RLS is not enabled on public.videos';
    END IF;

    RAISE NOTICE 'P02-006: Structural assertions passed.';
END $$;

-- ------------------------------------------------------------------------------
-- 2. Privilege Audit Assertions
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_unauthorized_privs INT;
    v_anon_select_count INT;
    v_service_role_privs INT;
BEGIN
    -- anon and authenticated MUST NOT have INSERT, UPDATE, DELETE, TRUNCATE
    SELECT COUNT(*) INTO v_unauthorized_privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND table_name = 'videos'
      AND grantee IN ('anon', 'authenticated')
      AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');

    IF v_unauthorized_privs > 0 THEN
        RAISE EXCEPTION 'Assertion failed: anon/authenticated has unauthorized write privileges on public.videos';
    END IF;

    -- anon MUST have SELECT privilege
    SELECT COUNT(*) INTO v_anon_select_count
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND table_name = 'videos'
      AND grantee = 'anon'
      AND privilege_type = 'SELECT';

    IF v_anon_select_count = 0 THEN
        RAISE EXCEPTION 'Assertion failed: anon must have SELECT privilege on public.videos';
    END IF;

    -- service_role MUST have full privileges
    SELECT COUNT(*) INTO v_service_role_privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND table_name = 'videos'
      AND grantee = 'service_role'
      AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE');

    IF v_service_role_privs < 4 THEN
        RAISE EXCEPTION 'Assertion failed: service_role lacks full CRUD privileges on public.videos';
    END IF;

    RAISE NOTICE 'P02-006: Privilege audit assertions passed.';
END $$;

-- ------------------------------------------------------------------------------
-- 3. Behavioral Tests (Seed data & Role switching)
-- ------------------------------------------------------------------------------

-- Seed a place in public.places for foreign key testing
INSERT INTO public.places (id, place_id, name, address, commune, category)
VALUES ('test_poi_p02_006', 'test_poi_p02_006', 'Địa Điểm Test P02-006', 'Tri Tôn, An Giang', 'Xã Núi Tô', 'Nui')
ON CONFLICT (id) DO NOTHING;

-- Seed videos via service_role
INSERT INTO public.videos (id, place_id, title, platform, video_url, is_verified, view_count)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'test_poi_p02_006', 'Kham pha Nui To Verified', 'tiktok', 'https://www.tiktok.com/@triton/video/1', true, 50000),
    ('a0000000-0000-0000-0000-000000000002', 'test_poi_p02_006', 'Draft Video Not Verified', 'tiktok', 'https://www.tiktok.com/@triton/video/2', false, 100);

-- Test as anon: read verified video (should see 1 record)
SET ROLE anon;

DO $$
DECLARE
    v_cnt INT;
BEGIN
    SELECT COUNT(*) INTO v_cnt FROM public.videos;
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'Assertion failed: anon expected to see exactly 1 verified video, saw %', v_cnt;
    END IF;
    RAISE NOTICE 'P02-006: anon verified video visibility passed (RLS filtered unverified).';
END $$;

-- Test as anon: write must fail (INSERT)
DO $$
BEGIN
    INSERT INTO public.videos (title, video_url)
    VALUES ('Malicious Anon Video', 'https://example.com/bad');
    RAISE EXCEPTION 'Assertion failed: anon insert should have failed with insufficient_privilege';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'P02-006: anon INSERT denied as expected (insufficient_privilege).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-006: anon INSERT failed with unexpected error: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- Test as anon: write must fail (UPDATE)
DO $$
BEGIN
    UPDATE public.videos SET view_count = 99999999 WHERE id = 'a0000000-0000-0000-0000-000000000001';
    RAISE EXCEPTION 'Assertion failed: anon update should have failed with insufficient_privilege';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'P02-006: anon UPDATE denied as expected (insufficient_privilege).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-006: anon UPDATE failed with unexpected error: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- Test as anon: write must fail (DELETE)
DO $$
BEGIN
    DELETE FROM public.videos WHERE id = 'a0000000-0000-0000-0000-000000000001';
    RAISE EXCEPTION 'Assertion failed: anon delete should have failed with insufficient_privilege';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'P02-006: anon DELETE denied as expected (insufficient_privilege).';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'P02-006: anon DELETE failed with unexpected error: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- Reset role and verify integrity
RESET ROLE;

DO $$
DECLARE
    v_total_cnt INT;
BEGIN
    SELECT COUNT(*) INTO v_total_cnt FROM public.videos;
    IF v_total_cnt <> 2 THEN
        RAISE EXCEPTION 'Assertion failed: expected 2 rows in videos, found %', v_total_cnt;
    END IF;
    RAISE NOTICE 'P02-006: Data integrity intact, service_role sees all % videos.', v_total_cnt;
END $$;

-- ------------------------------------------------------------------------------
-- 4. Negative Control
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_caught BOOLEAN := false;
BEGIN
    -- Deliberately grant unauthorized write privilege
    GRANT INSERT ON TABLE public.videos TO anon;

    -- Verify assertion catches violation
    IF EXISTS (
        SELECT 1
        FROM information_schema.role_table_grants
        WHERE table_schema = 'public'
          AND table_name = 'videos'
          AND grantee = 'anon'
          AND privilege_type = 'INSERT'
    ) THEN
        v_caught := true;
    END IF;

    -- Cleanup re-grant to leave database clean
    REVOKE INSERT ON TABLE public.videos FROM anon;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'Assertion failed: Negative control failed to detect rogue privilege grant.';
    END IF;

    RAISE NOTICE 'P02-006: Negative control successfully caught rogue privilege grant.';
END $$;

ROLLBACK;
