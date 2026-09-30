BEGIN;

-- P02-017: Revoke anonymous INSERT on public.audit_logs
-- Prevent anonymous attackers from forging audit logs or poisoning the audit trail.
-- Preserves anonymous SELECT (handled in P02-018) and service_role audit logging.
DROP POLICY IF EXISTS audit_logs_anon_insert ON public.audit_logs;
REVOKE INSERT ON TABLE public.audit_logs FROM anon;

COMMIT;
