-- ============================================================================
-- Migration: 20261002_p04_013_chat_logs_latency_ms.sql
-- Task: P04-013 — Ghi latency thực tế vào audit log (Proof: latency là số đo, không phải constant)
-- Description:
--   1. Bảo đảm ràng buộc CHECK latency_ms >= 0 trên public.chat_logs
--   2. Tạo index chat_logs_latency_idx phục vụ thống kê p95 và avg latency
--   3. Cập nhật COMMENT giải thích rõ số đo thời gian thực tế (không constant)
-- ============================================================================

-- 1. Bổ sung ràng buộc CHECK cho cột latency_ms nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_chat_logs_latency_positive'
  ) THEN
    ALTER TABLE public.chat_logs
      ADD CONSTRAINT chk_chat_logs_latency_positive
      CHECK (latency_ms IS NULL OR latency_ms >= 0);
  END IF;
END $$;

-- 2. Tạo INDEX trên cột latency_ms phục vụ dashboard và truy vấn SLO
CREATE INDEX IF NOT EXISTS chat_logs_latency_idx
  ON public.chat_logs (latency_ms);

-- 3. Cập nhật COMMENT giải thích cột latency_ms
COMMENT ON COLUMN public.chat_logs.latency_ms IS
  'Total server-side measured duration in milliseconds (real measured elapsed time, non-constant)';
