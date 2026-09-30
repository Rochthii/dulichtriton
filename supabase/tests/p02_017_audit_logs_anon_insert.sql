-- PostgreSQL 15 fixture: CREATE ROLE anon, service_role; apply audit_logs baseline;
-- grant anon SELECT/INSERT and sequence USAGE; grant service_role ALL;
-- apply P02-017 migration.

-- 1. Static Privilege & Policy Assertions
DO $$
BEGIN
  -- Assertion 1: anon must not have INSERT table privilege
  IF has_table_privilege('anon', 'public.audit_logs', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.audit_logs';
  END IF;

  -- Assertion 2: No INSERT-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'audit_logs'
       AND cmd IN ('ALL', 'INSERT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'An INSERT-capable policy still applies to anon on audit_logs';
  END IF;

  -- Assertion 3: anon must still retain SELECT privilege and policy until P02-018
  IF NOT has_table_privilege('anon', 'public.audit_logs', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'audit_logs'
       AND cmd IN ('ALL', 'SELECT')
       AND roles @> ARRAY['anon']::name[]
  ) THEN
    RAISE EXCEPTION 'P02-017 unexpectedly revoked anonymous SELECT before P02-018';
  END IF;

  -- Assertion 4: service_role must retain INSERT privilege
  IF NOT has_table_privilege('service_role', 'public.audit_logs', 'INSERT') THEN
    RAISE EXCEPTION 'service_role does not have INSERT on public.audit_logs';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Persistence Test
BEGIN;

-- Positive baseline: seed a pre-existing audit row
INSERT INTO public.audit_logs (user_name, user_role, action, resource_type, resource_id, details)
VALUES ('System_Admin', 'ADMIN', 'SYSTEM_INIT', 'system', 'sys-01', '{"init":true}'::jsonb);

-- Behavioral check under anon role: must be rejected with insufficient_privilege
SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.audit_logs (user_name, user_role, action, resource_type, resource_id, details)
    VALUES ('Anonymous_Hacker', 'ADMIN', 'FORGED_AUDIT_LOG', 'security', 'hack-01', '{"forged":true}'::jsonb);
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  IF NOT insert_denied THEN
    RAISE EXCEPTION 'Anonymous INSERT into audit_logs unexpectedly succeeded';
  END IF;
END;
$$;

-- Reset role and assert no row was persisted by anon
RESET ROLE;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.audit_logs
     WHERE action = 'FORGED_AUDIT_LOG'
  ) THEN
    RAISE EXCEPTION 'Denied anonymous INSERT unexpectedly persisted a row in audit_logs';
  END IF;
END;
$$;

-- Positive check under service_role: must succeed and persist
SET LOCAL ROLE service_role;
INSERT INTO public.audit_logs (user_name, user_role, action, resource_type, resource_id, details)
VALUES ('ServiceRole_Worker', 'SYSTEM', 'AUTHORIZED_LOG', 'cron', 'cron-01', '{"status":"ok"}'::jsonb);

RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.audit_logs
     WHERE action = 'AUTHORIZED_LOG' AND resource_id = 'cron-01'
  ) THEN
    RAISE EXCEPTION 'Authorized service_role audit insert was not persisted';
  END IF;

  IF (SELECT count(*) FROM public.audit_logs) <> 2 THEN
    RAISE EXCEPTION 'Expected exactly 2 rows in audit_logs (init + service_role)';
  END IF;
END;
$$;

ROLLBACK;
