BEGIN;

-- Anonymous chat requests can no longer load prior turns. The current route
-- falls back to empty history and its anon-key upsert of an existing session
-- also fails; deploy only after an authorized server-side path is ready.
DROP POLICY IF EXISTS chat_sessions_anon_all ON public.chat_sessions;
DROP POLICY IF EXISTS chat_sessions_anon_insert ON public.chat_sessions;

-- Keep only the write action handled by the next ordered task; do not recreate
-- an ALL policy that would make a later SELECT grant silently restore reads.
CREATE POLICY chat_sessions_anon_insert ON public.chat_sessions
  FOR INSERT TO anon WITH CHECK (true);

REVOKE SELECT ON TABLE public.chat_sessions FROM anon;

COMMIT;
