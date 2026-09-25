BEGIN;

-- The schema-consolidation migration reopened anonymous chat-log reads.
-- Deploy after admin chat-log readers use an authorized server-side path.
DROP POLICY IF EXISTS chat_logs_anon_select ON public.chat_logs;
REVOKE SELECT ON TABLE public.chat_logs FROM anon;

COMMIT;
