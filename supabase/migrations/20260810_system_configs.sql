-- =============================================================================
-- DU LỊCH TRI TÔN — SYSTEM CONFIGS MIGRATION
-- Table for dynamic system prompts & runtime configuration hot-reloading
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_configs TO anon, authenticated, service_role;
