-- PostgreSQL 15 + pgvector fixture: CREATE ROLE anon, authenticated, service_role;
-- apply semantic_cache baseline migration (20260810_semantic_cache.sql);
-- then apply P02-021 migration (20260924_p02_021_semantic_chat_cache_revoke_anon_write.sql).

-- 1. Static Privilege & Policy Assertions
DO $$
BEGIN
  -- Assertion 1: RLS must be enabled on semantic_chat_cache
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'semantic_chat_cache'
       AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.semantic_chat_cache';
  END IF;

  -- Assertion 2: anon must not have INSERT, UPDATE, or DELETE on semantic_chat_cache
  IF has_table_privilege('anon', 'public.semantic_chat_cache', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.semantic_chat_cache';
  END IF;

  IF has_table_privilege('anon', 'public.semantic_chat_cache', 'UPDATE') THEN
    RAISE EXCEPTION 'anon still has UPDATE on public.semantic_chat_cache';
  END IF;

  IF has_table_privilege('anon', 'public.semantic_chat_cache', 'DELETE') THEN
    RAISE EXCEPTION 'anon still has DELETE on public.semantic_chat_cache';
  END IF;

  -- Assertion 3: No write-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'semantic_chat_cache'
       AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A write-capable policy still applies to anon on semantic_chat_cache';
  END IF;

  -- Assertion 4: anon must retain SELECT privilege and read policy for public RAG / cache query
  IF NOT has_table_privilege('anon', 'public.semantic_chat_cache', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'semantic_chat_cache'
       AND cmd IN ('ALL', 'SELECT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'P02-021 unexpectedly removed public/anon SELECT on semantic_chat_cache';
  END IF;

  -- Assertion 5: service_role must retain full write privileges
  IF NOT has_table_privilege('service_role', 'public.semantic_chat_cache', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.semantic_chat_cache', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.semantic_chat_cache', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have write privileges on public.semantic_chat_cache';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Seed authentic cache row under admin/postgres
INSERT INTO public.semantic_chat_cache (query_text, query_embedding, answer_text, hit_count)
VALUES (
  'Tri Tôn ở đâu?',
  ('[' || (SELECT string_agg('0.01', ',') FROM generate_series(1, 768)) || ']')::vector(768),
  'Tri Tôn là một huyện thuộc tỉnh An Giang.',
  1
);

-- Behavioral check under anon role: all mutations must fail, read must succeed
SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
  update_denied boolean := false;
  delete_denied boolean := false;
  read_succeeded boolean := false;
  rpc_succeeded boolean := false;
  read_val text;
  rpc_count int;
  dummy_vec vector(768);
BEGIN
  dummy_vec := ('[' || (SELECT string_agg('0.01', ',') FROM generate_series(1, 768)) || ']')::vector(768);

  -- Test denied INSERT
  BEGIN
    INSERT INTO public.semantic_chat_cache (query_text, query_embedding, answer_text)
    VALUES ('Poison query', dummy_vec, 'Fake poisoned response');
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.semantic_chat_cache
       SET answer_text = 'Tampered answer'
     WHERE query_text = 'Tri Tôn ở đâu?';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.semantic_chat_cache WHERE query_text = 'Tri Tôn ở đâu?';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  -- Test allowed SELECT
  BEGIN
    SELECT answer_text INTO read_val FROM public.semantic_chat_cache WHERE query_text = 'Tri Tôn ở đâu?';
    IF read_val = 'Tri Tôn là một huyện thuộc tỉnh An Giang.' THEN
      read_succeeded := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    read_succeeded := false;
  END;

  -- Test allowed RPC function match_semantic_cache
  BEGIN
    SELECT count(*) INTO rpc_count FROM public.match_semantic_cache(dummy_vec, 0.5);
    IF rpc_count >= 1 THEN
      rpc_succeeded := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    rpc_succeeded := false;
  END;

  IF NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous mutation on semantic_chat_cache unexpectedly succeeded';
  END IF;

  IF NOT read_succeeded THEN
    RAISE EXCEPTION 'Anonymous SELECT on semantic_chat_cache unexpectedly failed';
  END IF;

  IF NOT rpc_succeeded THEN
    RAISE EXCEPTION 'Anonymous RPC match_semantic_cache unexpectedly failed';
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline row
RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.semantic_chat_cache
     WHERE query_text = 'Tri Tôn ở đâu?' AND answer_text = 'Tri Tôn là một huyện thuộc tỉnh An Giang.'
  ) THEN
    RAISE EXCEPTION 'Semantic cache baseline row was corrupted during anonymous mutation attempts';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.semantic_chat_cache WHERE query_text = 'Poison query'
  ) THEN
    RAISE EXCEPTION 'Unauthorized anonymous cache row was persisted';
  END IF;
END;
$$;

-- Positive write check under service_role: must succeed and persist
SET LOCAL ROLE service_role;
UPDATE public.semantic_chat_cache
   SET hit_count = hit_count + 1,
       last_hit_at = NOW()
 WHERE query_text = 'Tri Tôn ở đâu?';

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.semantic_chat_cache) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly 1 row in semantic_chat_cache';
  END IF;

  IF (SELECT hit_count FROM public.semantic_chat_cache WHERE query_text = 'Tri Tôn ở đâu?') <> 2 THEN
    RAISE EXCEPTION 'Authorized service_role update on semantic_chat_cache did not persist';
  END IF;
END;
$$;

ROLLBACK;
