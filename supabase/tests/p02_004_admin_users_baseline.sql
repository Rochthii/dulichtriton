-- PostgreSQL 15 fixture:
-- CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
-- 1. Apply baseline: 20260807010000_p02_004_create_admin_users_baseline.sql
-- 2. Apply downstream lockdown: 20260924083656_admin_users_rls_lockdown.sql
-- 3. Apply downstream session extension: 20260924_admin_credential_session_fields.sql
-- 4. Run comprehensive schema & authorization assertions.

-- 1. Static Privilege & Schema Assertions after lockdown and session extension
DO $$
BEGIN
  -- Assertion 1: admin_users table must exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
     WHERE schemaname = 'public' 
       AND tablename = 'admin_users'
  ) THEN
    RAISE EXCEPTION 'Table public.admin_users does not exist';
  END IF;

  -- Assertion 2: All essential columns must exist (baseline + session extension)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'email'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'full_name'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'role'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'password_hash'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'session_hash'
  ) THEN
    RAISE EXCEPTION 'Table public.admin_users is missing mandatory columns';
  END IF;

  -- Assertion 3: RLS must be enabled on admin_users
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'admin_users'
       AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on public.admin_users';
  END IF;

  -- Assertion 4: anon and authenticated must have NO table privileges
  IF has_table_privilege('anon', 'public.admin_users', 'SELECT')
     OR has_table_privilege('anon', 'public.admin_users', 'INSERT')
     OR has_table_privilege('anon', 'public.admin_users', 'UPDATE')
     OR has_table_privilege('anon', 'public.admin_users', 'DELETE')
     OR has_table_privilege('authenticated', 'public.admin_users', 'SELECT')
     OR has_table_privilege('authenticated', 'public.admin_users', 'INSERT')
     OR has_table_privilege('authenticated', 'public.admin_users', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.admin_users', 'DELETE') THEN
    RAISE EXCEPTION 'anon or authenticated unexpectedly has privileges on public.admin_users';
  END IF;

  -- Assertion 5: service_role must have full privileges
  IF NOT has_table_privilege('service_role', 'public.admin_users', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.admin_users', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.admin_users', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.admin_users', 'DELETE') THEN
    RAISE EXCEPTION 'service_role does not have full write privileges on public.admin_users';
  END IF;
END;
$$;

-- 2. Behavioral Negative Test & Positive Read/Write Test
BEGIN;

-- Seed authentic admin under admin/postgres
INSERT INTO public.admin_users (email, full_name, role, password_hash, is_active)
VALUES ('admin@triton.test', 'Quản Trị Viên', 'SUPER_ADMIN', '$2b$12$dummyhashforverificationtest', true);

-- Behavioral check under anon role: all queries must fail
SET LOCAL ROLE anon;
DO $$
DECLARE
  select_denied boolean := false;
  insert_denied boolean := false;
  update_denied boolean := false;
  delete_denied boolean := false;
  dummy_val text;
BEGIN
  -- Test denied SELECT
  BEGIN
    SELECT full_name INTO dummy_val FROM public.admin_users WHERE email = 'admin@triton.test';
  EXCEPTION WHEN insufficient_privilege THEN
    select_denied := true;
  END;

  -- Test denied INSERT
  BEGIN
    INSERT INTO public.admin_users (email, full_name, role)
    VALUES ('hacker@evil.com', 'Hacker', 'SUPER_ADMIN');
  EXCEPTION WHEN insufficient_privilege THEN
    insert_denied := true;
  END;

  -- Test denied UPDATE
  BEGIN
    UPDATE public.admin_users SET role = 'MEMBER' WHERE email = 'admin@triton.test';
  EXCEPTION WHEN insufficient_privilege THEN
    update_denied := true;
  END;

  -- Test denied DELETE
  BEGIN
    DELETE FROM public.admin_users WHERE email = 'admin@triton.test';
  EXCEPTION WHEN insufficient_privilege THEN
    delete_denied := true;
  END;

  IF NOT select_denied OR NOT insert_denied OR NOT update_denied OR NOT delete_denied THEN
    RAISE EXCEPTION 'Anonymous operation on admin_users unexpectedly succeeded';
  END IF;
END;
$$;

-- Reset role and assert data integrity of baseline row
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.admin_users) <> 1 THEN
    RAISE EXCEPTION 'admin_users row count altered during anon attempts';
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'hacker@evil.com') THEN
    RAISE EXCEPTION 'Unauthorized anonymous admin user was persisted';
  END IF;
END;
$$;

-- Positive write check under service_role (using valid 64-hex char SHA-256 hash per constraint)
SET LOCAL ROLE service_role;
UPDATE public.admin_users 
   SET session_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
       session_created_at = NOW(),
       session_expires_at = NOW() + INTERVAL '8 hours'
 WHERE email = 'admin@triton.test';

RESET ROLE;
DO $$
BEGIN
  IF (SELECT session_hash FROM public.admin_users WHERE email = 'admin@triton.test') <> 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' THEN
    RAISE EXCEPTION 'service_role session update did not persist';
  END IF;
END;
$$;

ROLLBACK;
