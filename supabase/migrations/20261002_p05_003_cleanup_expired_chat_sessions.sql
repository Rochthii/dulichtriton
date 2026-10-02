-- ==============================================================================
-- P05-003: Migration RPC Cleanup Expired Chat Sessions (Retention Enforcement)
-- Tri Tôn Tourism AI Assistant System
-- 
-- Mục tiêu: Tạo Database Function (RPC) an toàn dọn dẹp các phiên trò chuyện
-- hết hạn (> 24 giờ kể từ updated_at) theo Decision Record G3 (DR-G3-RETENTION-SESSIONS-001).
-- Phân quyền nghiêm ngặt: Chỉ cho phép service_role thực thi (Fail-Closed).
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.cleanup_expired_chat_sessions(p_batch_limit INT DEFAULT 1000)
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
    SELECT session_id
    FROM public.chat_sessions
    WHERE updated_at < (NOW() - INTERVAL '24 hours')
    ORDER BY updated_at ASC
    LIMIT v_effective_limit
  ),
  deleted_rows AS (
    DELETE FROM public.chat_sessions
    WHERE session_id IN (SELECT session_id FROM expired_candidates)
    RETURNING session_id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_chat_sessions(INT) IS 
'P05-003: Dọn dẹp theo batch các phiên trò chuyện hết hạn (> 24 giờ kể từ tương tác cuối cùng updated_at) theo Decision Record G3 (DR-G3-RETENTION-SESSIONS-001). Chỉ cho phép service_role thực thi.';

-- Phân quyền bảo mật tuyệt đối (Zero Trust / Principle of Least Privilege):
-- Tước bỏ quyền thực thi của mọi vai trò công khai và người dùng thông thường
REVOKE ALL ON FUNCTION public.cleanup_expired_chat_sessions(INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_chat_sessions(INT) FROM anon, authenticated;

-- Chỉ cấp quyền EXECUTE duy nhất cho service_role (máy chủ backend)
GRANT EXECUTE ON FUNCTION public.cleanup_expired_chat_sessions(INT) TO service_role;

COMMIT;
