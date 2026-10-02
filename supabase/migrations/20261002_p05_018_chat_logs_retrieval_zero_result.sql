-- P05-018: persist whether a retrieval attempt returned zero results.
-- NULL means the request bypassed retrieval (guards, out of scope,
-- older rows, or otherwise unclassified); true means retrieval found 0 results;
-- false means retrieval found >= 1 results.
ALTER TABLE public.chat_logs
  ADD COLUMN IF NOT EXISTS retrieval_zero_result BOOLEAN;
