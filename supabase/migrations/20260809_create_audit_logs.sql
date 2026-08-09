-- Audit Logs: Immutable audit trail for all admin operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id             BIGSERIAL PRIMARY KEY,
  user_name      VARCHAR(100) NOT NULL DEFAULT 'Admin_System',
  user_role      VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
  action         VARCHAR(100) NOT NULL,              -- e.g. 'APPROVE_VIDEO', 'DELETE_VIDEO', 'IMPORT_TIKTOK'
  resource_type  VARCHAR(50)  NOT NULL,              -- e.g. 'video_discoveries', 'places', 'system_config'
  resource_id    TEXT,                               -- target ID
  details        JSONB        NOT NULL DEFAULT '{}'::jsonb,
  ip_address     VARCHAR(50),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Disallow UPDATE and DELETE to guarantee audit immutability
CREATE OR REPLACE RULE audit_logs_no_update AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_logs_no_delete AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

-- Index for admin audit log querying
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx     ON public.audit_logs (action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_anon_insert ON public.audit_logs;
CREATE POLICY audit_logs_anon_insert ON public.audit_logs FOR INSERT TO anon WITH CHECK (true);
