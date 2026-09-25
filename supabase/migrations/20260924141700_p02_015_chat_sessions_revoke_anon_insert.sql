BEGIN;

-- Deploy after the chat route has an authorized server-side session path.
-- Its current anon-key upsert cannot persist history after this migration.
DROP POLICY IF EXISTS chat_sessions_anon_insert ON public.chat_sessions;
REVOKE INSERT ON TABLE public.chat_sessions FROM anon;

COMMIT;
