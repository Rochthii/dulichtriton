-- PostgreSQL 15 + pgvector fixture: CREATE ROLE anon, authenticated, service_role;
-- apply golden_answers baseline migration (20260809_create_golden_answers.sql);
-- then apply P02-019 migration (20260924_p02_019_golden_answers_revoke_anon_write.sql).

-- 1. Static Privilege & Policy Assertions
DO $$
BEGIN
  -- Assertion 1: anon must not have INSERT, UPDATE, or DELETE on golden_answers
  IF has_table_privilege('anon', 'public.golden_answers', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.golden_answers';
  END IF;

  IF has_table_privilege('anon', 'public.golden_answers', 'UPDATE') THEN
    RAISE EXCEPTION 'anon still has UPDATE on public.golden_answers';
  END IF;

  IF has_table_privilege('anon', 'public.golden_answers', 'DELETE') THEN
    RAISE EXCEPTION 'anon still has DELETE on public.golden_answers';
  END IF;

  -- Assertion 2: No write-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'golden_answers'
       AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A write-capable policy still applies to anon on golden_answers';
  END IF;

  -- Assertion 3: anon must retain SELECT privilege and read policy for public RAG
  IF NOT has_table_privilege('anon', 'public.golden_answers', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'golden_answers'
       AND cmd IN ('ALL', 'SELECT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'P02-019 unexpectedly removed public/anon SELECT on golden_answers';
  END IF;

  -- Assertion 4: service_role must retain full write privileges
  IF NOT has_table_privilege('service_role', 'public.golden_answers', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.golden_answers', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.golden_answers', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have write privileges on public.golden_answers';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Seed authentic golden answer row under admin/postgres
INSERT INTO public.golden_answers (id, intent, question, answer_json, format)
VALUES ('Q001', 'place', 'Tri Tôn có gì đẹp?', '{"summary":"Tri Tôn có đồi Tà Pạ, chùa Xà Tón, hồ Soài So"}'::jsonb, 'json');

-- Behavioral check under anon role: all mutations must fail with insufficient_privilege, read must succeed
SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
  update_denied boolean := false;
  delete_denied boolean := false;
  read_succeeded boolean := false;
  read_val text;
BEGIN
  -- Test denied INSERT
  BEGIN
    INSERT INTO public.golden_answers (id, intent, question, answer_json)
    VALUES ('Q999', 'spam', 'Câu hỏi rác?', '{"text":"spam"}'::jsonb);
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.golden_answers
       SET question = 'Tampered question?'
     WHERE id = 'Q001';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.golden_answers WHERE id = 'Q001';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  -- Test allowed SELECT
  BEGIN
    SELECT question INTO read_val FROM public.golden_answers WHERE id = 'Q001';
    IF read_val = 'Tri Tôn có gì đẹp?' THEN
      read_succeeded := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    read_succeeded := false;
  END;

  IF NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous mutation on golden_answers unexpectedly succeeded';
  END IF;

  IF NOT read_succeeded THEN
    RAISE EXCEPTION 'Anonymous SELECT on golden_answers unexpectedly failed';
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline row
RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.golden_answers
     WHERE id = 'Q001' AND question = 'Tri Tôn có gì đẹp?'
  ) THEN
    RAISE EXCEPTION 'Golden answer Q001 was corrupted during anonymous mutation attempts';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.golden_answers WHERE id = 'Q999'
  ) THEN
    RAISE EXCEPTION 'Unauthorized anonymous row Q999 was persisted';
  END IF;
END;
$$;

-- Positive write check under service_role: must succeed and persist
SET LOCAL ROLE service_role;
UPDATE public.golden_answers
   SET updated_at = NOW()
 WHERE id = 'Q001';

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.golden_answers) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly 1 row in golden_answers';
  END IF;
END;
$$;

ROLLBACK;
