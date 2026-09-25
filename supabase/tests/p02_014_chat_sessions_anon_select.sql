-- PostgreSQL 15 fixture: CREATE ROLE anon; apply the chat_sessions baseline;
-- grant CRUD on chat_sessions to anon; then apply the P02-014 migration.
DO $$
BEGIN
  IF has_table_privilege('anon', 'public.chat_sessions', 'SELECT') THEN
    RAISE EXCEPTION 'anon still has SELECT on public.chat_sessions';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'chat_sessions'
       AND cmd IN ('ALL', 'SELECT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A SELECT-capable policy still applies to anon';
  END IF;

  IF NOT has_table_privilege('anon', 'public.chat_sessions', 'INSERT') THEN
    RAISE EXCEPTION 'P02-014 unexpectedly revoked INSERT before P02-015';
  END IF;
END;
$$;

BEGIN;
INSERT INTO public.chat_sessions (session_id, turns)
VALUES ('p02-014-read-denial-fixture', '[]'::jsonb)
ON CONFLICT (session_id) DO NOTHING;

SET LOCAL ROLE anon;
DO $$
DECLARE
  read_denied boolean := false;
BEGIN
  BEGIN
    EXECUTE 'SELECT session_id FROM public.chat_sessions WHERE session_id = ''p02-014-read-denial-fixture''';
  EXCEPTION WHEN insufficient_privilege THEN
    read_denied := true;
  END;

  IF NOT read_denied THEN
    RAISE EXCEPTION 'Anonymous SELECT unexpectedly succeeded';
  END IF;
END;
$$;

INSERT INTO public.chat_sessions (session_id, turns)
VALUES ('p02-014-anon-insert-fixture', '[]'::jsonb);

RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.chat_sessions
     WHERE session_id = 'p02-014-read-denial-fixture'
  ) THEN
    RAISE EXCEPTION 'Read-denial fixture row changed unexpectedly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.chat_sessions
     WHERE session_id = 'p02-014-anon-insert-fixture'
  ) THEN
    RAISE EXCEPTION 'P02-014 unexpectedly denied anon INSERT before P02-015';
  END IF;
END;
$$;
ROLLBACK;
