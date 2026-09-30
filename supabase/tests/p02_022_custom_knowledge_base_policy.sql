-- PostgreSQL 15 fixture: CREATE ROLE anon, authenticated, service_role;
-- apply custom_knowledge_base baseline migration (20260817_create_custom_knowledge_base.sql);
-- then apply P02-022 migration (20260924_p02_022_custom_knowledge_base_restrict_policy.sql).

-- 1. Static Privilege & Policy Assertions
DO $$
BEGIN
  -- Assertion 1: RLS must be enabled on custom_knowledge_base
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'custom_knowledge_base'
       AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.custom_knowledge_base';
  END IF;

  -- Assertion 2: anon must not have INSERT, UPDATE, or DELETE on custom_knowledge_base
  IF has_table_privilege('anon', 'public.custom_knowledge_base', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.custom_knowledge_base';
  END IF;

  IF has_table_privilege('anon', 'public.custom_knowledge_base', 'UPDATE') THEN
    RAISE EXCEPTION 'anon still has UPDATE on public.custom_knowledge_base';
  END IF;

  IF has_table_privilege('anon', 'public.custom_knowledge_base', 'DELETE') THEN
    RAISE EXCEPTION 'anon still has DELETE on public.custom_knowledge_base';
  END IF;

  -- Assertion 3: No write-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'custom_knowledge_base'
       AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A write-capable policy still applies to anon/public on custom_knowledge_base';
  END IF;

  -- Assertion 4: The legacy permissive policy "Allow service role all on custom_knowledge_base" without role restriction must not exist
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'custom_knowledge_base'
       AND policyname = 'Allow service role all on custom_knowledge_base'
  ) THEN
    RAISE EXCEPTION 'Legacy permissive policy "Allow service role all on custom_knowledge_base" still exists';
  END IF;

  -- Assertion 5: anon must retain SELECT privilege and active-only read policy
  IF NOT has_table_privilege('anon', 'public.custom_knowledge_base', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'custom_knowledge_base'
       AND cmd = 'SELECT'
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'anon is missing SELECT privilege or active read policy on custom_knowledge_base';
  END IF;

  -- Assertion 6: service_role must retain full write privileges and administrative policy
  IF NOT has_table_privilege('service_role', 'public.custom_knowledge_base', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.custom_knowledge_base', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.custom_knowledge_base', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have write privileges on public.custom_knowledge_base';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'custom_knowledge_base'
       AND cmd = 'ALL'
       AND roles @> ARRAY['service_role']::name[]
  ) THEN
    RAISE EXCEPTION 'service_role is missing administrative policy on custom_knowledge_base';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Clean existing sample data for deterministic behavioral tests
DELETE FROM public.custom_knowledge_base;

-- Seed authentic knowledge entries under admin/postgres
INSERT INTO public.custom_knowledge_base (title, category, keywords, content, is_active, priority, author)
VALUES 
  ('Quán Gà Đốt Thành Đạt', 'food', ARRAY['gà đốt'], 'Ngon đặc sản Tri Tôn', true, 9, 'Admin'),
  ('Tài liệu nội bộ chưa duyệt', 'general', ARRAY['nội bộ'], 'Thông tin bảo mật chưa công bố', false, 1, 'Draft');

-- Behavioral check under anon role: mutations denied, active read allowed, inactive hidden
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
    INSERT INTO public.custom_knowledge_base (title, category, content, is_active)
    VALUES ('Fake entry', 'food', 'Poisoned content', true);
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.custom_knowledge_base
       SET content = 'Tampered content'
     WHERE title = 'Quán Gà Đốt Thành Đạt';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.custom_knowledge_base WHERE title = 'Quán Gà Đốt Thành Đạt';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  -- Test allowed SELECT for active entry
  SELECT count(*) INTO active_count 
    FROM public.custom_knowledge_base 
   WHERE title = 'Quán Gà Đốt Thành Đạt';

  -- Test prevented SELECT for inactive entry (must be 0 rows due to is_active = true policy)
  SELECT count(*) INTO inactive_count 
    FROM public.custom_knowledge_base 
   WHERE title = 'Tài liệu nội bộ chưa duyệt';

  IF NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous mutation on custom_knowledge_base unexpectedly succeeded';
  END IF;

  IF active_count <> 1 THEN
    RAISE EXCEPTION 'Anonymous SELECT for active knowledge entry failed (expected 1, got %)', active_count;
  END IF;

  IF inactive_count <> 0 THEN
    RAISE EXCEPTION 'Anonymous SELECT for inactive knowledge leaked private data (expected 0, got %)', inactive_count;
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline rows
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.custom_knowledge_base) <> 2 THEN
    RAISE EXCEPTION 'custom_knowledge_base row count changed unexpectedly';
  END IF;

  IF EXISTS (SELECT 1 FROM public.custom_knowledge_base WHERE title = 'Fake entry') THEN
    RAISE EXCEPTION 'Unauthorized anonymous entry was persisted';
  END IF;
END;
$$;

-- Positive write & admin read check under service_role
SET LOCAL ROLE service_role;
-- service_role should see both active and inactive entries
DO $$
DECLARE
  total_count int;
BEGIN
  SELECT count(*) INTO total_count FROM public.custom_knowledge_base;
  IF total_count <> 2 THEN
    RAISE EXCEPTION 'service_role cannot see all custom_knowledge_base rows (expected 2, got %)', total_count;
  END IF;
END;
$$;

-- service_role can update
UPDATE public.custom_knowledge_base
   SET priority = 10
 WHERE title = 'Quán Gà Đốt Thành Đạt';

-- service_role can insert
INSERT INTO public.custom_knowledge_base (title, category, content, is_active, author)
VALUES ('Bài viết mới từ Admin', 'place', 'Hồ Tà Pạ tuyệt đẹp', true, 'service_role');

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.custom_knowledge_base) <> 3 THEN
    RAISE EXCEPTION 'Expected 3 rows in custom_knowledge_base after service_role operations';
  END IF;

  IF (SELECT priority FROM public.custom_knowledge_base WHERE title = 'Quán Gà Đốt Thành Đạt') <> 10 THEN
    RAISE EXCEPTION 'service_role update did not persist correctly';
  END IF;
END;
$$;

ROLLBACK;
