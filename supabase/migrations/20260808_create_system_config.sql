-- ==============================================================================
-- Migration: Create system_config Table for AI Rules & Domain Boundary Contracts
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-08
-- ==============================================================================

-- 1. Create table public.system_config
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'admin_system'
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_sys_cfg_key ON public.system_config(config_key);

-- 3. Row Level Security
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for System Config" ON public.system_config;
DROP POLICY IF EXISTS "Service Role Full Access for System Config" ON public.system_config;

CREATE POLICY "Public Read Access for System Config"
    ON public.system_config
    FOR SELECT
    USING (true);

CREATE POLICY "Service Role Full Access for System Config"
    ON public.system_config
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Seed Real Domain Boundary & AI System Rules
INSERT INTO public.system_config (config_key, config_value, description)
VALUES 
(
    'ai_domain_boundary_directive',
    jsonb_build_object(
        'role', 'Trợ lý AI chuyên sâu về Du Lịch Tri Tôn, An Giang',
        'scope', jsonb_build_array('Tri Tôn, An Giang', 'Du lịch Tri Tôn', '95 Master POIs', 'Văn hóa Khmer Bảy Núi', 'Ẩm thực & Chỗ ở Tri Tôn', 'TikTok Video Discovery Tri Tôn'),
        'out_of_scope_policy', 'Refuse non-Tri Tôn questions explicitly',
        'out_of_scope_message', 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.',
        'data_integrity_policy', 'Never fabricate POI names, coordinates, prices, ratings or TikTok videos. Say: Tôi không có đủ dữ liệu để xác minh chính xác thông tin này.'
    ),
    'Quy chuẩn Vai trò & Phạm vi Phân vùng Nghiệp vụ của Trợ lý AI Du Lịch Tri Tôn'
),
(
    'out_of_scope_message',
    jsonb_build_object('text', 'Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.'),
    'Thông điệp từ chối chuẩn khi du khách hỏi ngoài phạm vi Tri Tôn'
),
(
    'system_prompt_version',
    jsonb_build_object('version', '3.1.0', 'updated_at', NOW()),
    'Phiên bản System Prompt v3.1 (Tôi/Bạn)'
)
ON CONFLICT (config_key) DO UPDATE 
SET config_value = EXCLUDED.config_value,
    updated_at = NOW();
