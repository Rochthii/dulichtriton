BEGIN;

-- P02-020: Revoke anonymous write permissions on public.system_configs
-- Prevent unauthorized modification, tampering, or deletion of system runtime configs.
-- Enables Row Level Security (RLS) and preserves public read access for runtime configuration.

-- 1. Enable Row Level Security (RLS) on system_configs
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy permissive policies if they exist
DROP POLICY IF EXISTS "system_configs_anon_write" ON public.system_configs;
DROP POLICY IF EXISTS "system_configs_anon_all" ON public.system_configs;
DROP POLICY IF EXISTS "Allow public read access to system_configs" ON public.system_configs;

-- 3. Policy for public/anonymous read-only access
CREATE POLICY "Allow public read access to system_configs" ON public.system_configs
  FOR SELECT USING (true);

-- 4. Revoke write privileges from anon
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.system_configs FROM anon;

-- 5. Ensure SELECT privilege remains granted to anon
GRANT SELECT ON TABLE public.system_configs TO anon;

-- 6. Policy and grants for service_role to ensure full administrative access
DROP POLICY IF EXISTS "service_role_all_system_configs" ON public.system_configs;
CREATE POLICY "service_role_all_system_configs" ON public.system_configs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.system_configs TO service_role;

COMMIT;
