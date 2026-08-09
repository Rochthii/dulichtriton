-- Chat Sessions Table: lưu lịch sử hội thoại theo session
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  session_id  TEXT PRIMARY KEY,
  turns       JSONB    NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_chat_sessions_updated_at();

-- Auto-expire sessions older than 24h (cleanup via scheduled job or manual)
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON public.chat_sessions (updated_at);

-- RLS: service role only (chat API uses anon key + service role for upsert)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anon reads/writes from API (route.ts uses anon key)
DROP POLICY IF EXISTS chat_sessions_anon_all ON public.chat_sessions;
CREATE POLICY chat_sessions_anon_all ON public.chat_sessions
  FOR ALL TO anon USING (true) WITH CHECK (true);
