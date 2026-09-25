-- PostgreSQL 15 fixture: CREATE ROLE anon; apply chat_sessions baseline;
-- grant anon CRUD; apply P02-014 and then P02-015 migrations.
DO $$
BEGIN
  IF has_table_privilege('anon', 'public.chat_sessions', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.chat_sessions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'chat_sessions'
       AND cmd IN ('ALL', 'INSERT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'An INSERT-capable policy still applies to anon';
  END IF;
END;
$$;

BEGIN;
INSERT INTO public.chat_sessions (session_id, turns)
VALUES ('p02-015-existing-session', '[{"role":"user","content":"original"}]'::jsonb);

SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
  upsert_denied boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.chat_sessions (session_id, turns)
    VALUES ('p02-015-unauthorized-new', '[]'::jsonb);
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  BEGIN
    INSERT INTO public.chat_sessions (session_id, turns)
    VALUES ('p02-015-existing-session', '[{"role":"user","content":"tampered"}]'::jsonb)
    ON CONFLICT (session_id) DO UPDATE SET turns = EXCLUDED.turns;
  EXCEPTION WHEN insufficient_privilege THEN
    upsert_denied := true;
  END;

  IF NOT insert_denied OR NOT upsert_denied THEN
    RAISE EXCEPTION 'Anonymous INSERT or upsert unexpectedly succeeded';
  END IF;
END;
$$;

RESET ROLE;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.chat_sessions
     WHERE session_id = 'p02-015-unauthorized-new'
  ) THEN
    RAISE EXCEPTION 'Denied anonymous INSERT persisted a row';
  END IF;

  IF (SELECT turns FROM public.chat_sessions
       WHERE session_id = 'p02-015-existing-session')
     IS DISTINCT FROM '[{"role":"user","content":"original"}]'::jsonb THEN
    RAISE EXCEPTION 'Denied anonymous upsert changed existing history';
  END IF;
END;
$$;
ROLLBACK;
