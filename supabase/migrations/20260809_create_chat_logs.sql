-- Chat Logs: immutable audit log of every AI query
CREATE TABLE IF NOT EXISTS public.chat_logs (
  id             BIGSERIAL PRIMARY KEY,
  session_id     TEXT        NOT NULL,
  query          TEXT        NOT NULL,
  response_preview TEXT,          -- first 300 chars of AI response
  provider_used  TEXT,            -- 'gemini-key1' | 'groq' | 'openrouter' | 'streaming'
  rag_method     TEXT,            -- 'vector' | 'ilike' | 'hot_fallback' | 'none'
  places_count   SMALLINT    DEFAULT 0,
  latency_ms     INTEGER,         -- total server-side duration in ms
  is_out_scope   BOOLEAN     DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable: disallow UPDATE and DELETE
CREATE OR REPLACE RULE chat_logs_no_update AS ON UPDATE TO public.chat_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE chat_logs_no_delete AS ON DELETE TO public.chat_logs DO INSTEAD NOTHING;

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS chat_logs_session_idx    ON public.chat_logs (session_id);
CREATE INDEX IF NOT EXISTS chat_logs_created_at_idx ON public.chat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_logs_provider_idx   ON public.chat_logs (provider_used);

-- RLS: allow anon INSERT only (API key used for write, no reads from client)
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_logs_anon_insert ON public.chat_logs;
CREATE POLICY chat_logs_anon_insert ON public.chat_logs
  FOR INSERT TO anon WITH CHECK (true);

-- No SELECT policy for anon: read only via service_role (admin dashboard)
