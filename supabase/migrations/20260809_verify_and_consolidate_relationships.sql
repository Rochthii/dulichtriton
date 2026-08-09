-- Master Schema Integrity & Relationship Consolidation Migration
-- 1. Ensure Foreign Key on video_discoveries -> places(id)
ALTER TABLE public.video_discoveries
DROP CONSTRAINT IF EXISTS video_discoveries_matched_poi_id_fkey;

ALTER TABLE public.video_discoveries
ADD CONSTRAINT video_discoveries_matched_poi_id_fkey
FOREIGN KEY (matched_poi_id) REFERENCES public.places(id)
ON DELETE SET NULL;

-- 2. Ensure RLS SELECT Policies on places, video_discoveries, videos, chat_logs, admin_users, audit_logs
DROP POLICY IF EXISTS places_anon_select ON public.places;
CREATE POLICY places_anon_select ON public.places FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS video_discoveries_anon_select ON public.video_discoveries;
CREATE POLICY video_discoveries_anon_select ON public.video_discoveries FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS videos_anon_select ON public.videos;
CREATE POLICY videos_anon_select ON public.videos FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS chat_logs_anon_select ON public.chat_logs;
CREATE POLICY chat_logs_anon_select ON public.chat_logs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_logs_anon_select ON public.audit_logs;
CREATE POLICY audit_logs_anon_select ON public.audit_logs FOR SELECT TO anon USING (true);

-- 3. Create Performance Indexes for RAG & Admin queries
CREATE INDEX IF NOT EXISTS idx_places_commune ON public.places(commune);
CREATE INDEX IF NOT EXISTS idx_places_is_hot ON public.places(is_hot);
CREATE INDEX IF NOT EXISTS idx_video_discoveries_status ON public.video_discoveries(verification_status);
CREATE INDEX IF NOT EXISTS idx_video_discoveries_poi ON public.video_discoveries(matched_poi_id);
