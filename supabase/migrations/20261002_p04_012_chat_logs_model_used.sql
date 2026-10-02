-- ============================================================================
-- Migration: 20261002_p04_012_chat_logs_model_used.sql
-- Task: P04-012 — Ghi model thực tế vào audit log (Proof: model ID khớp request đã hoàn tất)
-- Author: Chăm Rốch Thi (Lead Technical Architect)
-- Description: Bổ sung cột model_used vào bảng public.chat_logs để lưu vết chính xác
--              model ID thực tế (VD: llama-3.3-70b-versatile, gemini-2.5-flash-lite)
--              đã hoàn thành lượt suy luận, phục vụ kiểm toán AI Observability.
-- ============================================================================

-- 1. Bổ sung cột model_used nếu chưa tồn tại
ALTER TABLE public.chat_logs 
ADD COLUMN IF NOT EXISTS model_used TEXT;

-- 2. Đặt comment mô tả rõ ràng
COMMENT ON COLUMN public.chat_logs.model_used IS 
'Exact LLM model ID that completed the chat inference turn (e.g. llama-3.3-70b-versatile, gemini-2.5-flash-lite, google/gemma-2-27b-it, local-expert-rag-v1)';

-- 3. Tạo index phục vụ lọc và thống kê dashboard theo model
CREATE INDEX IF NOT EXISTS chat_logs_model_idx 
ON public.chat_logs (model_used);
