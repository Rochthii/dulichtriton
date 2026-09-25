-- PostgreSQL 15 fixture: CREATE ROLE anon; then run the migration and this file with psql.
-- This task verifies the RLS flag only. It does not prove anonymous access is denied;
-- that is covered by the following P02-014/P02-015 tasks.
DO $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT c.relrowsecurity
    INTO rls_enabled
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname = 'chat_sessions'
     AND c.relkind IN ('r', 'p');

  IF rls_enabled IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Expected public.chat_sessions to exist with RLS enabled; got %', rls_enabled;
  END IF;
END;
$$;
