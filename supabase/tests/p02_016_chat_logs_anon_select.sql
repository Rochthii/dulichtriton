-- PostgreSQL 15 fixture: CREATE ROLE anon; apply chat_logs baseline;
-- grant anon SELECT/INSERT and sequence USAGE; apply the consolidation's
-- chat_logs_anon_select policy; then apply P02-016.
DO $$
BEGIN
  IF has_table_privilege('anon', 'public.chat_logs', 'SELECT') THEN
    RAISE EXCEPTION 'anon still has SELECT on public.chat_logs';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'chat_logs'
       AND cmd IN ('ALL', 'SELECT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A SELECT-capable policy still applies to anon';
  END IF;

  IF NOT has_table_privilege('anon', 'public.chat_logs', 'INSERT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'chat_logs'
       AND cmd = 'INSERT'
       AND roles @> ARRAY['anon']::name[]
  ) THEN
    RAISE EXCEPTION 'P02-016 unexpectedly removed anonymous INSERT';
  END IF;
END;
$$;

BEGIN;
INSERT INTO public.chat_logs (session_id, query)
VALUES ('p02-016-private-session', 'private fixture');

SET LOCAL ROLE anon;
DO $$
DECLARE
  all_denied boolean := false;
  guessed_session_denied boolean := false;
BEGIN
  BEGIN
    EXECUTE 'SELECT id FROM public.chat_logs LIMIT 1';
  EXCEPTION WHEN insufficient_privilege THEN
    all_denied := true;
  END;

  BEGIN
    EXECUTE 'SELECT query FROM public.chat_logs WHERE session_id = ''p02-016-private-session''';
  EXCEPTION WHEN insufficient_privilege THEN
    guessed_session_denied := true;
  END;

  IF NOT all_denied OR NOT guessed_session_denied THEN
    RAISE EXCEPTION 'Anonymous chat-log read unexpectedly succeeded';
  END IF;
END;
$$;

INSERT INTO public.chat_logs (session_id, query)
VALUES ('p02-016-allowed-insert', 'write preserved');

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.chat_logs
       WHERE session_id = 'p02-016-private-session' AND query = 'private fixture') <> 1 THEN
    RAISE EXCEPTION 'Private fixture changed during anonymous read attempts';
  END IF;

  IF (SELECT count(*) FROM public.chat_logs
       WHERE session_id = 'p02-016-allowed-insert' AND query = 'write preserved') <> 1 THEN
    RAISE EXCEPTION 'Anonymous INSERT unexpectedly failed';
  END IF;
END;
$$;
ROLLBACK;
