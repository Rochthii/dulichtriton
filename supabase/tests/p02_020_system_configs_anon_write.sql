-- PostgreSQL 15 fixture: CREATE ROLE anon, authenticated, service_role;
-- apply system_configs baseline migration (20260810_system_configs.sql);
-- then apply P02-020 migration (20260924_p02_020_system_configs_revoke_anon_write.sql).

-- 1. Static Privilege & Policy Assertions
DO $$
BEGIN
  -- Assertion 1: RLS must be enabled on system_configs
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'system_configs'
       AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.system_configs';
  END IF;

  -- Assertion 2: anon must not have INSERT, UPDATE, or DELETE privileges
  IF has_table_privilege('anon', 'public.system_configs', 'INSERT') THEN
    RAISE EXCEPTION 'anon still has INSERT on public.system_configs';
  END IF;

  IF has_table_privilege('anon', 'public.system_configs', 'UPDATE') THEN
    RAISE EXCEPTION 'anon still has UPDATE on public.system_configs';
  END IF;

  IF has_table_privilege('anon', 'public.system_configs', 'DELETE') THEN
    RAISE EXCEPTION 'anon still has DELETE on public.system_configs';
  END IF;

  -- Assertion 3: No write-capable policy may apply to anon or public
  IF EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'system_configs'
       AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'A write-capable policy still applies to anon on system_configs';
  END IF;

  -- Assertion 4: anon must retain SELECT privilege and read policy for runtime config
  IF NOT has_table_privilege('anon', 'public.system_configs', 'SELECT') OR NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'system_configs'
       AND cmd IN ('ALL', 'SELECT')
       AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  ) THEN
    RAISE EXCEPTION 'P02-020 unexpectedly removed public/anon SELECT on system_configs';
  END IF;

  -- Assertion 5: service_role must retain full write privileges
  IF NOT has_table_privilege('service_role', 'public.system_configs', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.system_configs', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.system_configs', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have write privileges on public.system_configs';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Seed authentic config row under admin/postgres
INSERT INTO public.system_configs (key, value, description)
VALUES ('app_maintenance_mode', '{"enabled": false}'::jsonb, 'System maintenance flag');

-- Behavioral check under anon role: mutations must fail, read must succeed
SET LOCAL ROLE anon;
DO $$
DECLARE
  insert_denied boolean := false;
  update_denied boolean := false;
  delete_denied boolean := false;
  read_succeeded boolean := false;
  read_val jsonb;
BEGIN
  -- Test denied INSERT
  BEGIN
    INSERT INTO public.system_configs (key, value)
    VALUES ('hacked_key', '{"malicious": true}'::jsonb);
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.system_configs
       SET value = '{"enabled": true}'::jsonb
     WHERE key = 'app_maintenance_mode';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.system_configs WHERE key = 'app_maintenance_mode';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  -- Test allowed SELECT
  BEGIN
    SELECT value INTO read_val FROM public.system_configs WHERE key = 'app_maintenance_mode';
    IF (read_val->>'enabled')::boolean = false THEN
      read_succeeded := true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    read_succeeded := false;
  END;

  IF NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous mutation on system_configs unexpectedly succeeded';
  END IF;

  IF NOT read_succeeded THEN
    RAISE EXCEPTION 'Anonymous SELECT on system_configs unexpectedly failed';
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline row
RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.system_configs
     WHERE key = 'app_maintenance_mode' AND (value->>'enabled')::boolean = false
  ) THEN
    RAISE EXCEPTION 'Baseline config was modified during anonymous mutation attempts';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.system_configs WHERE key = 'hacked_key'
  ) THEN
    RAISE EXCEPTION 'Unauthorized anonymous config key was persisted';
  END IF;
END;
$$;

-- Positive write check under service_role: must succeed and persist
SET LOCAL ROLE service_role;
UPDATE public.system_configs
   SET updated_at = NOW()
 WHERE key = 'app_maintenance_mode';

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.system_configs) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly 1 row in system_configs';
  END IF;
END;
$$;

ROLLBACK;
