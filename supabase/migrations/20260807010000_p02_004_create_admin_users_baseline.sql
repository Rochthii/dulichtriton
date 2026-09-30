BEGIN;

-- ==============================================================================
-- P02-004: Baseline Table Migration for public.admin_users
-- System: Du Lịch Tri Tôn AI System
-- Creates the initial schema for admin_users required for fresh database replay.
-- Mirrors historical pre-lockdown state so downstream migration
-- 20260924083656_admin_users_rls_lockdown and 20260924_admin_credential_session_fields
-- can successfully execute their safety assertions, lockdown, and session schema extensions.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    email TEXT PRIMARY KEY,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Initial historical policies expected by 20260924083656_admin_users_rls_lockdown
DROP POLICY IF EXISTS admin_users_anon_select ON public.admin_users;
CREATE POLICY admin_users_anon_select ON public.admin_users
    FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS admin_users_anon_insert ON public.admin_users;
CREATE POLICY admin_users_anon_insert ON public.admin_users
    FOR INSERT TO anon WITH CHECK (true);

-- Initial permissions
GRANT SELECT, INSERT ON TABLE public.admin_users TO anon;
GRANT ALL ON TABLE public.admin_users TO service_role;

COMMIT;
