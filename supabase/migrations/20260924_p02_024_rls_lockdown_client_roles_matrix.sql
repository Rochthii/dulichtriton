BEGIN;

-- ==============================================================================
-- P02-024: Comprehensive RLS Matrix Lockdown for Client Roles (anon, authenticated)
-- System: Du Lịch Tri Tôn AI Assistant System
-- Wave W2: Database Governance & Zero Trust Matrix
--
-- Invariants:
-- 1. Sensitive internal tables (admin_users, audit_logs, chat_sessions, chat_logs,
--    eval_cases, eval_runs):
--    - ZERO access for anon & authenticated (SELECT, INSERT, UPDATE, DELETE denied).
--    - Full management reserved strictly for service_role.
--
-- 2. Business data tables (places, videos, video_discoveries, preset_itineraries,
--    custom_knowledge_base, knowledge_base, golden_answers, system_configs,
--    system_config, semantic_chat_cache):
--    - Read-only (SELECT) for anon & authenticated, strictly filtered by RLS policies
--      (active / verified rows only where applicable).
--    - ZERO mutation privileges for anon & authenticated (INSERT, UPDATE, DELETE,
--      TRUNCATE, REFERENCES, TRIGGER denied).
--    - Full management reserved strictly for service_role.
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Enable RLS on all 16 user tables & Drop legacy rewrite rules
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eval_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eval_runs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preset_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golden_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semantic_chat_cache ENABLE ROW LEVEL SECURITY;

-- Drop legacy rewrite rules that interfere with permission checks on audit/chat logs
DROP RULE IF EXISTS audit_logs_no_update ON public.audit_logs;
DROP RULE IF EXISTS audit_logs_no_delete ON public.audit_logs;
DROP RULE IF EXISTS chat_logs_no_update ON public.chat_logs;
DROP RULE IF EXISTS chat_logs_no_delete ON public.chat_logs;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. REVOKE ALL privileges from anon, authenticated, and PUBLIC on ALL tables
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.chat_sessions FROM anon, authenticated;
REVOKE ALL ON TABLE public.chat_logs FROM anon, authenticated;
REVOKE ALL ON TABLE public.eval_cases FROM anon, authenticated;
REVOKE ALL ON TABLE public.eval_runs FROM anon, authenticated;

REVOKE ALL ON TABLE public.places FROM anon, authenticated;
REVOKE ALL ON TABLE public.videos FROM anon, authenticated;
REVOKE ALL ON TABLE public.video_discoveries FROM anon, authenticated;
REVOKE ALL ON TABLE public.preset_itineraries FROM anon, authenticated;
REVOKE ALL ON TABLE public.custom_knowledge_base FROM anon, authenticated;
REVOKE ALL ON TABLE public.knowledge_base FROM anon, authenticated;
REVOKE ALL ON TABLE public.golden_answers FROM anon, authenticated;
REVOKE ALL ON TABLE public.system_configs FROM anon, authenticated;
REVOKE ALL ON TABLE public.system_config FROM anon, authenticated;
REVOKE ALL ON TABLE public.semantic_chat_cache FROM anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. GRANT SELECT ONLY to anon and authenticated on public read tables
-- ─────────────────────────────────────────────────────────────────────────────
GRANT SELECT ON TABLE public.places TO anon, authenticated;
GRANT SELECT ON TABLE public.videos TO anon, authenticated;
GRANT SELECT ON TABLE public.video_discoveries TO anon, authenticated;
GRANT SELECT ON TABLE public.preset_itineraries TO anon, authenticated;
GRANT SELECT ON TABLE public.custom_knowledge_base TO anon, authenticated;
GRANT SELECT ON TABLE public.knowledge_base TO anon, authenticated;
GRANT SELECT ON TABLE public.golden_answers TO anon, authenticated;
GRANT SELECT ON TABLE public.system_configs TO anon, authenticated;
GRANT SELECT ON TABLE public.system_config TO anon, authenticated;
GRANT SELECT ON TABLE public.semantic_chat_cache TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. GRANT ALL to service_role on ALL tables
-- ─────────────────────────────────────────────────────────────────────────────
GRANT ALL ON TABLE public.admin_users TO service_role;
GRANT ALL ON TABLE public.audit_logs TO service_role;
GRANT ALL ON TABLE public.chat_sessions TO service_role;
GRANT ALL ON TABLE public.chat_logs TO service_role;
GRANT ALL ON TABLE public.eval_cases TO service_role;
GRANT ALL ON TABLE public.eval_runs TO service_role;

GRANT ALL ON TABLE public.places TO service_role;
GRANT ALL ON TABLE public.videos TO service_role;
GRANT ALL ON TABLE public.video_discoveries TO service_role;
GRANT ALL ON TABLE public.preset_itineraries TO service_role;
GRANT ALL ON TABLE public.custom_knowledge_base TO service_role;
GRANT ALL ON TABLE public.knowledge_base TO service_role;
GRANT ALL ON TABLE public.golden_answers TO service_role;
GRANT ALL ON TABLE public.system_configs TO service_role;
GRANT ALL ON TABLE public.system_config TO service_role;
GRANT ALL ON TABLE public.semantic_chat_cache TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Standardize Row Level Security Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- 5.1 places: anon/authenticated only read active places; service_role has ALL
DROP POLICY IF EXISTS "places_anon_select" ON public.places;
DROP POLICY IF EXISTS "Allow public read active places" ON public.places;
DROP POLICY IF EXISTS "service_role_all_places" ON public.places;

CREATE POLICY "Allow public read active places" ON public.places
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "service_role_all_places" ON public.places
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.2 videos: anon/authenticated only read verified videos; service_role has ALL
DROP POLICY IF EXISTS "videos_anon_select" ON public.videos;
DROP POLICY IF EXISTS "videos_service_role_all" ON public.videos;

CREATE POLICY "videos_anon_select" ON public.videos
  FOR SELECT TO anon, authenticated
  USING (is_verified = true);

CREATE POLICY "videos_service_role_all" ON public.videos
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.3 video_discoveries: anon/authenticated only read verified & non-expired; service_role has ALL
DROP POLICY IF EXISTS "Public Read Access for Video Discoveries" ON public.video_discoveries;
DROP POLICY IF EXISTS "Service Role Full Access for Video Discoveries" ON public.video_discoveries;
DROP POLICY IF EXISTS "video_discoveries_anon_select" ON public.video_discoveries;

CREATE POLICY "video_discoveries_anon_select" ON public.video_discoveries
  FOR SELECT TO anon, authenticated
  USING (verification_status IN ('VERIFIED', 'RELEVANT') AND expires_at > NOW());

CREATE POLICY "Service Role Full Access for Video Discoveries" ON public.video_discoveries
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.4 preset_itineraries: anon/authenticated only read active tours; service_role has ALL
DROP POLICY IF EXISTS "Allow public read active preset_itineraries" ON public.preset_itineraries;
DROP POLICY IF EXISTS "service_role_all_preset_itineraries" ON public.preset_itineraries;

CREATE POLICY "Allow public read active preset_itineraries" ON public.preset_itineraries
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "service_role_all_preset_itineraries" ON public.preset_itineraries
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.5 custom_knowledge_base: anon/authenticated only read active articles; service_role has ALL
DROP POLICY IF EXISTS "Allow public read active knowledge" ON public.custom_knowledge_base;
DROP POLICY IF EXISTS "service_role_all_custom_knowledge_base" ON public.custom_knowledge_base;

CREATE POLICY "Allow public read active knowledge" ON public.custom_knowledge_base
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "service_role_all_custom_knowledge_base" ON public.custom_knowledge_base
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.6 knowledge_base: anon/authenticated read; service_role has ALL
DROP POLICY IF EXISTS "Allow public read access to knowledge_base" ON public.knowledge_base;
DROP POLICY IF EXISTS "service_role_all_knowledge_base" ON public.knowledge_base;

CREATE POLICY "Allow public read access to knowledge_base" ON public.knowledge_base
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_all_knowledge_base" ON public.knowledge_base
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.7 golden_answers: anon/authenticated read; service_role has ALL
DROP POLICY IF EXISTS "Allow public read access to golden_answers" ON public.golden_answers;
DROP POLICY IF EXISTS "service_role_all_golden_answers" ON public.golden_answers;

CREATE POLICY "Allow public read access to golden_answers" ON public.golden_answers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_all_golden_answers" ON public.golden_answers
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.8 system_configs: anon/authenticated read; service_role has ALL
DROP POLICY IF EXISTS "Allow public read access to system_configs" ON public.system_configs;
DROP POLICY IF EXISTS "service_role_all_system_configs" ON public.system_configs;

CREATE POLICY "Allow public read access to system_configs" ON public.system_configs
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_all_system_configs" ON public.system_configs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.9 system_config: anon/authenticated read; service_role has ALL
DROP POLICY IF EXISTS "Public Read Access for System Config" ON public.system_config;
DROP POLICY IF EXISTS "Service Role Full Access for System Config" ON public.system_config;

CREATE POLICY "Public Read Access for System Config" ON public.system_config
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service Role Full Access for System Config" ON public.system_config
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.10 semantic_chat_cache: anon/authenticated read; service_role has ALL
DROP POLICY IF EXISTS "Allow public read access to semantic_chat_cache" ON public.semantic_chat_cache;
DROP POLICY IF EXISTS "service_role_all_semantic_chat_cache" ON public.semantic_chat_cache;

CREATE POLICY "Allow public read access to semantic_chat_cache" ON public.semantic_chat_cache
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_all_semantic_chat_cache" ON public.semantic_chat_cache
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5.11 Drop any residual permissive policies on sensitive tables
DROP POLICY IF EXISTS "chat_logs_anon_insert" ON public.chat_logs;
DROP POLICY IF EXISTS "Public read for eval_cases" ON public.eval_cases;
DROP POLICY IF EXISTS "Public read for eval_runs" ON public.eval_runs;

COMMIT;
