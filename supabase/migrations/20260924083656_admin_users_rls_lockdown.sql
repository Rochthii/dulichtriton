-- Emergency admin_users client-role lockdown. Applied to Supabase on 2026-09-24.
-- This migration changes no account rows. Do not restore the old anon policies as
-- an operational rollback; repair server-side service-role configuration instead.

BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
BEGIN
    IF to_regclass('public.admin_users') IS NULL THEN
        RAISE EXCEPTION 'admin_users lockdown requires public.admin_users';
    END IF;
    IF (SELECT count(*) FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'admin_users') <> 2
       OR NOT EXISTS (SELECT 1 FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'admin_users'
             AND policyname = 'admin_users_anon_select'
             AND cmd = 'SELECT' AND roles = ARRAY['anon']::name[] AND qual = 'true')
       OR NOT EXISTS (SELECT 1 FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'admin_users'
             AND policyname = 'admin_users_anon_insert'
             AND cmd = 'INSERT' AND roles = ARRAY['anon']::name[] AND with_check = 'true') THEN
        RAISE EXCEPTION 'admin_users policies drifted; inspect before lockdown';
    END IF;
END
$$;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY admin_users_anon_select ON public.admin_users;
DROP POLICY admin_users_anon_insert ON public.admin_users;
REVOKE ALL PRIVILEGES ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
    IF has_table_privilege('anon', 'public.admin_users', 'SELECT')
       OR has_table_privilege('anon', 'public.admin_users', 'INSERT')
       OR has_table_privilege('anon', 'public.admin_users', 'UPDATE')
       OR has_table_privilege('anon', 'public.admin_users', 'DELETE')
       OR has_table_privilege('authenticated', 'public.admin_users', 'SELECT')
       OR has_table_privilege('authenticated', 'public.admin_users', 'INSERT')
       OR has_table_privilege('authenticated', 'public.admin_users', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.admin_users', 'DELETE')
       OR NOT has_table_privilege('service_role', 'public.admin_users', 'SELECT')
       OR NOT has_table_privilege('service_role', 'public.admin_users', 'UPDATE') THEN
        RAISE EXCEPTION 'admin_users lockdown privilege postcondition failed';
    END IF;
END
$$;

COMMIT;
