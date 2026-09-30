-- ==============================================================================
-- Migration: Create videos Baseline Table
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-07 03:00:00 (Baseline before dependent discovery & trending routes)
-- Task: P02-006 (Wave W2 - Database Replay Foundation)
-- ==============================================================================

BEGIN;

-- 1. Create table public.videos if not exists
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id VARCHAR(100) REFERENCES public.places(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'tiktok',
    video_url TEXT NOT NULL,
    embed_url TEXT,
    thumbnail_url TEXT,
    author_name VARCHAR(150),
    view_count BIGINT DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for High Performance Querying & Sorting
CREATE INDEX IF NOT EXISTS idx_videos_place_id ON public.videos(place_id);
CREATE INDEX IF NOT EXISTS idx_videos_trending ON public.videos(is_verified, view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON public.videos(platform);

-- 3. Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if replaying
DROP POLICY IF EXISTS "videos_anon_select" ON public.videos;
DROP POLICY IF EXISTS "videos_service_role_all" ON public.videos;

-- 4. Policies
-- Public/anon can only read verified videos
CREATE POLICY "videos_anon_select"
    ON public.videos
    FOR SELECT
    TO anon, authenticated
    USING (is_verified = true);

-- Service role has full management access
CREATE POLICY "videos_service_role_all"
    ON public.videos
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Role Grants & Privilege Revocation
-- Revoke all direct write privileges from client roles
REVOKE ALL ON TABLE public.videos FROM anon, authenticated;
GRANT SELECT ON TABLE public.videos TO anon, authenticated;

-- Grant all privileges to service_role
GRANT ALL ON TABLE public.videos TO service_role;

COMMIT;
