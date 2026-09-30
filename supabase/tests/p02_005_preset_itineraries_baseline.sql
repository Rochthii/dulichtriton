-- PostgreSQL 15 fixture:
-- CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
-- 1. Apply baseline: 20260807020000_p02_005_create_preset_itineraries_baseline.sql
-- 2. Run static privilege & policy assertions.
-- 3. Run behavioral runtime checks & negative controls.

-- 1. Static Privilege & Schema Assertions
DO $$
BEGIN
  -- Assertion 1: Table preset_itineraries must exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
     WHERE schemaname = 'public' 
       AND tablename = 'preset_itineraries'
  ) THEN
    RAISE EXCEPTION 'Table public.preset_itineraries does not exist';
  END IF;

  -- Assertion 2: Mandatory columns must exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'preset_itineraries' AND column_name = 'id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'preset_itineraries' AND column_name = 'slug'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'preset_itineraries' AND column_name = 'title'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'preset_itineraries' AND column_name = 'duration'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'preset_itineraries' AND column_name = 'stops'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'preset_itineraries' AND column_name = 'is_active'
  ) THEN
    RAISE EXCEPTION 'Table public.preset_itineraries is missing core columns';
  END IF;

  -- Assertion 3: RLS must be enabled on preset_itineraries
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'preset_itineraries'
       AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.preset_itineraries';
  END IF;

  -- Assertion 4: anon must not have INSERT, UPDATE, or DELETE on preset_itineraries
  IF has_table_privilege('anon', 'public.preset_itineraries', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.preset_itineraries';
  END IF;

  IF has_table_privilege('anon', 'public.preset_itineraries', 'UPDATE') THEN
    RAISE EXCEPTION 'anon still has UPDATE on public.preset_itineraries';
  END IF;

  IF has_table_privilege('anon', 'public.preset_itineraries', 'DELETE') THEN
    RAISE EXCEPTION 'anon still has DELETE on public.preset_itineraries';
  END IF;

  -- Assertion 5: No write-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'preset_itineraries'
       AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A write-capable policy still applies to anon/public on preset_itineraries';
  END IF;

  -- Assertion 6: anon must have SELECT privilege and active-only read policy
  IF NOT has_table_privilege('anon', 'public.preset_itineraries', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'preset_itineraries'
       AND cmd = 'SELECT'
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'anon is missing SELECT privilege or read policy on preset_itineraries';
  END IF;

  -- Assertion 7: service_role must have full write privileges and administrative policy
  IF NOT has_table_privilege('service_role', 'public.preset_itineraries', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.preset_itineraries', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.preset_itineraries', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have write privileges on public.preset_itineraries';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'preset_itineraries'
       AND cmd = 'ALL'
       AND roles @> ARRAY['service_role']::name[]
  ) THEN
    RAISE EXCEPTION 'service_role is missing administrative policy on preset_itineraries';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Seed authentic sample itineraries under admin/postgres
INSERT INTO public.preset_itineraries (slug, emoji, title, tagline, for_whom, duration, budget_range, is_active, sort_order)
VALUES 
  ('tour-nui-to-1-ngay', '🧭', 'Khám Phá Núi Tô 1 Ngày', 'Trải nghiệm thiên nhiên và ẩm thực', 'Gia đình, bạn bè', '1 ngày', '300k - 500k', true, 1),
  ('tour-nhap-noi-bo', '🔒', 'Lịch Trình Khảo Sát Nội Bộ', 'Dự thảo chưa công bố', 'Admin', '2 ngày', '1000k', false, 99);

-- Behavioral check under anon role: mutations denied, active read allowed, draft hidden
SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
  update_denied boolean := false;
  delete_denied boolean := false;
  active_count int := 0;
  inactive_count int := 0;
BEGIN
  -- Test denied INSERT
  BEGIN
    INSERT INTO public.preset_itineraries (slug, title, duration)
    VALUES ('fake-tour', 'Tour Giả Mạo', '1 giờ');
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.preset_itineraries SET title = 'Hacked Tour' WHERE slug = 'tour-nui-to-1-ngay';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.preset_itineraries WHERE slug = 'tour-nui-to-1-ngay';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  -- Test allowed SELECT active
  SELECT count(*) INTO active_count 
    FROM public.preset_itineraries 
   WHERE slug = 'tour-nui-to-1-ngay';

  -- Test prevented SELECT inactive
  SELECT count(*) INTO inactive_count 
    FROM public.preset_itineraries 
   WHERE slug = 'tour-nhap-noi-bo';

  IF NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous mutation on preset_itineraries unexpectedly succeeded';
  END IF;

  IF active_count <> 1 THEN
    RAISE EXCEPTION 'Anonymous SELECT on active itinerary failed';
  END IF;

  IF inactive_count <> 0 THEN
    RAISE EXCEPTION 'Anonymous SELECT on inactive itinerary leaked draft data';
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline rows
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.preset_itineraries) <> 2 THEN
    RAISE EXCEPTION 'preset_itineraries row count altered during anon attempts';
  END IF;

  IF EXISTS (SELECT 1 FROM public.preset_itineraries WHERE slug = 'fake-tour') THEN
    RAISE EXCEPTION 'Unauthorized anonymous itinerary was persisted';
  END IF;
END;
$$;

-- Positive write & admin read check under service_role
SET LOCAL ROLE service_role;
DO $$
DECLARE
  total_count int;
BEGIN
  SELECT count(*) INTO total_count FROM public.preset_itineraries;
  IF total_count <> 2 THEN
    RAISE EXCEPTION 'service_role cannot view all itineraries (expected 2, got %)', total_count;
  END IF;
END;
$$;

UPDATE public.preset_itineraries 
   SET rating = 4.9 
 WHERE slug = 'tour-nui-to-1-ngay';

INSERT INTO public.preset_itineraries (slug, emoji, title, duration, is_active)
VALUES ('tour-chua-hang-nui-sam', '🛕', 'Hành Hương Chùa Hang', 'Nửa ngày', true);

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.preset_itineraries) <> 3 THEN
    RAISE EXCEPTION 'Expected 3 itineraries after service_role insertion';
  END IF;

  IF (SELECT rating FROM public.preset_itineraries WHERE slug = 'tour-nui-to-1-ngay') <> 4.9 THEN
    RAISE EXCEPTION 'service_role update did not persist';
  END IF;
END;
$$;

ROLLBACK;
