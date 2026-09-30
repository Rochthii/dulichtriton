BEGIN;

-- P02-018: Revoke anonymous SELECT on public.audit_logs
-- Prevent anonymous users from inspecting administrative audit trails, operational history, and user activity.
-- Deploy after admin audit log readers use an authorized server-side path.
DROP POLICY IF EXISTS audit_logs_anon_select ON public.audit_logs;
REVOKE SELECT ON TABLE public.audit_logs FROM anon;

COMMIT;
