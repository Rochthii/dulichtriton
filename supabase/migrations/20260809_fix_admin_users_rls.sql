-- Fix Admin Users RLS Policy for Authentication Queries
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_users_anon_select ON public.admin_users;
CREATE POLICY admin_users_anon_select ON public.admin_users FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS admin_users_anon_insert ON public.admin_users;
CREATE POLICY admin_users_anon_insert ON public.admin_users FOR INSERT TO anon WITH CHECK (true);

-- Re-ensure rochthi59@gmail.com exists and is active
INSERT INTO public.admin_users (email, password, full_name, role, is_active)
VALUES ('rochthi59@gmail.com', 'Admin123@', 'Roch Thi (Super Admin)', 'SUPER_ADMIN', true)
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, role = 'SUPER_ADMIN', is_active = TRUE;
