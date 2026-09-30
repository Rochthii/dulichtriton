-- PostgreSQL 15 fixture: CREATE ROLE anon, service_role; apply audit_logs baseline;
-- grant anon SELECT/INSERT and sequence USAGE; grant service_role ALL;
-- apply P02-017 (revoke anon INSERT) and P02-018 (revoke anon SELECT).

-- 1. Static Privilege & Policy Assertions
DO $$
BEGIN
  -- Assertion 1: anon must not have SELECT table privilege
  IF has_table_privilege('anon', 'public.audit_logs', 'SELECT') THEN
    RAISE EXCEPTION 'anon still has SELECT on public.audit_logs';
  END IF;

  -- Assertion 2: No SELECT-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'audit_logs'
       AND cmd IN ('ALL', 'SELECT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A SELECT-capable policy still applies to anon on audit_logs';
  END IF;

  -- Assertion 3: anon must also not have INSERT (verified in P02-017)
  IF has_table_privilege('anon', 'public.audit_logs', 'INSERT') THEN
    RAISE EXCEPTION 'anon unexpectedly regained INSERT on public.audit_logs';
  END IF;

  -- Assertion 4: service_role must retain SELECT privilege
  IF NOT has_table_privilege('service_role', 'public.audit_logs', 'SELECT') THEN
    RAISE EXCEPTION 'service_role does not have SELECT on public.audit_logs';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read Test
BEGIN;

-- Positive baseline: seed a private admin audit row
INSERT INTO public.audit_logs (user_name, user_role, action, resource_type, resource_id, details, ip_address)
VALUES ('Super_Admin', 'ADMIN', 'ADMIN_PASSWORD_RESET', 'admin_users', 'adm-01', '{"status":"success"}'::jsonb, '127.0.0.1');

-- Behavioral check under anon role: all reads must fail with insufficient_privilege
SET LOCAL ROLE anon;
DO $$
DECLARE
  global_read_denied boolean := false;
  targeted_read_denied boolean := false;
BEGIN
  BEGIN
    EXECUTE 'SELECT id FROM public.audit_logs LIMIT 1';
  EXCEPTION WHEN insufficient_privilege THEN
    global_read_denied := true;
  END;

  BEGIN
    EXECUTE 'SELECT user_name FROM public.audit_logs WHERE action = ''ADMIN_PASSWORD_RESET''';
  EXCEPTION WHEN insufficient_privilege THEN
    targeted_read_denied := true;
  END;

  IF NOT global_read_denied OR NOT targeted_read_denied THEN
    RAISE EXCEPTION 'Anonymous SELECT on audit_logs unexpectedly succeeded';
  END IF;
END;
$$;

-- Reset role and assert data integrity of private audit trail
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.audit_logs WHERE action = 'ADMIN_PASSWORD_RESET') <> 1 THEN
    RAISE EXCEPTION 'Private audit row was altered or lost during anonymous read attempts';
  END IF;
END;
$$;

-- Positive check under service_role: must succeed and read accurately
SET LOCAL ROLE service_role;
DO $$
DECLARE
  log_count integer := 0;
BEGIN
  SELECT count(*) INTO log_count FROM public.audit_logs;
  IF log_count <> 1 THEN
    RAISE EXCEPTION 'Authorized service_role failed to read audit_logs row';
  END IF;
END;
$$;

ROLLBACK;
