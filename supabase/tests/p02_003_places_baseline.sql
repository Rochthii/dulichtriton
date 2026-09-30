-- PostgreSQL 15 fixture:
-- CREATE ROLE anon, authenticated, service_role;
-- Apply baseline migration (20260807000000_p02_003_create_places_baseline.sql);
-- Then run assertions and downstream compatibility checks.

-- 1. Static Privilege & Schema Assertions
DO $$
BEGIN
  -- Assertion 1: places table must exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
     WHERE schemaname = 'public' 
       AND tablename = 'places'
  ) THEN
    RAISE EXCEPTION 'Table public.places does not exist';
  END IF;

  -- Assertion 2: Core columns must exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'place_id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'name'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'commune'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'category'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'address'
  ) THEN
    RAISE EXCEPTION 'Table public.places is missing mandatory core columns';
  END IF;

  -- Assertion 3: RLS must be enabled on places
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'places'
       AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.places';
  END IF;

  -- Assertion 4: anon must not have INSERT, UPDATE, or DELETE on places
  IF has_table_privilege('anon', 'public.places', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.places';
  END IF;

  IF has_table_privilege('anon', 'public.places', 'UPDATE') THEN
    RAISE EXCEPTION 'anon still has UPDATE on public.places';
  END IF;

  IF has_table_privilege('anon', 'public.places', 'DELETE') THEN
    RAISE EXCEPTION 'anon still has DELETE on public.places';
  END IF;

  -- Assertion 5: No write policy may apply to anon/public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'places'
       AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A write-capable policy still applies to anon/public on places';
  END IF;

  -- Assertion 6: anon must have SELECT privilege and SELECT policy
  IF NOT has_table_privilege('anon', 'public.places', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'places'
       AND cmd = 'SELECT'
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'anon is missing SELECT privilege or read policy on public.places';
  END IF;

  -- Assertion 7: service_role must have full write privileges
  IF NOT has_table_privilege('service_role', 'public.places', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.places', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.places', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have write privileges on public.places';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Seed authentic POI under admin/postgres
INSERT INTO public.places (id, place_id, name, slug, category, address, commune, latitude, longitude, rating, is_active)
VALUES ('chua-hang', 'poi-chua-hang', 'Chùa Hang (Phước Điền Tự)', 'chua-hang', 'Tâm linh', 'Núi Sam, Tri Tôn', 'Châu Lăng', 10.45, 105.02, 4.8, true);

-- Behavioral check under anon role: mutations denied, read allowed
SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
  update_denied boolean := false;
  delete_denied boolean := false;
  read_val text;
BEGIN
  -- Test denied INSERT
  BEGIN
    INSERT INTO public.places (id, place_id, name, category, address, commune)
    VALUES ('fake-poi', 'fake-poi', 'Địa điểm giả', 'Khác', 'Đâu đó', 'Tri Tôn');
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.places SET rating = 1.0 WHERE id = 'chua-hang';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.places WHERE id = 'chua-hang';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  -- Test allowed SELECT
  SELECT name INTO read_val FROM public.places WHERE id = 'chua-hang';

  IF NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous mutation on places unexpectedly succeeded';
  END IF;

  IF read_val <> 'Chùa Hang (Phước Điền Tự)' THEN
    RAISE EXCEPTION 'Anonymous SELECT on places failed';
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline row
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.places) <> 1 THEN
    RAISE EXCEPTION 'places row count altered during anon attempts';
  END IF;

  IF EXISTS (SELECT 1 FROM public.places WHERE id = 'fake-poi') THEN
    RAISE EXCEPTION 'Unauthorized anonymous POI was persisted';
  END IF;
END;
$$;

-- Positive write check under service_role
SET LOCAL ROLE service_role;
UPDATE public.places SET rating = 4.9 WHERE id = 'chua-hang';

INSERT INTO public.places (id, place_id, name, slug, category, address, commune, is_active)
VALUES ('ho-ta-pa', 'poi-ho-ta-pa', 'Hồ Tà Pạ', 'ho-ta-pa', 'Thiên nhiên', 'Xã Núi Tô, Tri Tôn', 'Núi Tô', true);

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.places) <> 2 THEN
    RAISE EXCEPTION 'Expected 2 places after service_role insertion';
  END IF;

  IF (SELECT rating FROM public.places WHERE id = 'chua-hang') <> 4.9 THEN
    RAISE EXCEPTION 'service_role update did not persist';
  END IF;
END;
$$;

ROLLBACK;
