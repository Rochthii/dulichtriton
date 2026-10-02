-- ==============================================================================
-- P05-004: Migration RPC Cleanup Expired Chat Logs (Audit Retention Enforcement)
-- Tri Tôn Tourism AI Assistant System
-- 
-- Mục tiêu: Tạo Database Function (RPC) an toàn dọn dẹp các bản ghi nhật ký kiểm toán
-- chat_logs hết hạn (> 30 ngày kể từ created_at) theo chính sách lưu trữ kiểm toán.
-- Đồng thời thay thế rule chat_logs_no_delete bằng chính sách RLS bảo vệ tính bất biến:
-- Cấm tuyệt đối công khai (anon, authenticated), chỉ cấp quyền DELETE cho service_role.
-- ==============================================================================

BEGIN;

-- 1. Bãi bỏ rule no_delete cũ để cho phép tiến trình bảo trì quản trị (service_role) dọn dẹp
DROP RULE IF EXISTS chat_logs_no_delete ON public.chat_logs;

-- 2. Đảm bảo bảo vệ tính bất biến qua RLS và phân quyền hệ thống (Principle of Least Privilege)
-- Cấm tuyệt đối thao tác DELETE và UPDATE đối với người dùng thông thường và công chúng
REVOKE DELETE, UPDATE ON TABLE public.chat_logs FROM PUBLIC;
REVOKE DELETE, UPDATE ON TABLE public.chat_logs FROM anon, authenticated;

-- Chỉ cấp quyền DELETE cho service_role để thi hành chính sách dọn dẹp TTL
GRANT DELETE ON TABLE public.chat_logs TO service_role;

-- 3. Tạo Database Function (RPC) dọn dẹp theo batch có giới hạn
CREATE OR REPLACE FUNCTION public.cleanup_expired_chat_logs(p_batch_limit INT DEFAULT 1000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INT := 0;
  v_effective_limit INT;
BEGIN
  -- Giới hạn batch trong khoảng an toàn [1, 5000] để chống nghẽn I/O và lock bảng
  v_effective_limit := GREATEST(1, LEAST(COALESCE(p_batch_limit, 1000), 5000));

  WITH expired_candidates AS (
    SELECT id
    FROM public.chat_logs
    WHERE created_at < (NOW() - INTERVAL '30 days')
    ORDER BY created_at ASC
    LIMIT v_effective_limit
  ),
  deleted_rows AS (
    DELETE FROM public.chat_logs
    WHERE id IN (SELECT id FROM expired_candidates)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_chat_logs(INT) IS 
'P05-004: Dọn dẹp theo batch các bản ghi kiểm toán chat_logs hết hạn (> 30 ngày kể từ created_at). Chỉ cho phép service_role thực thi.';

-- Phân quyền bảo mật tuyệt đối cho Function
REVOKE ALL ON FUNCTION public.cleanup_expired_chat_logs(INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_chat_logs(INT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_chat_logs(INT) TO service_role;

COMMIT;
