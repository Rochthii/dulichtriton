-- ==============================================================================
-- Migration: Expand video_discoveries for TikTok Scraper Engine
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-09
-- ==============================================================================

ALTER TABLE public.video_discoveries
  ADD COLUMN IF NOT EXISTS author_username VARCHAR(100),
  ADD COLUMN IF NOT EXISTS author_nickname VARCHAR(100),
  ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score NUMERIC(3,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS matched_pois JSONB DEFAULT '[]'::jsonb;

-- Index for hashtag & quality queries
CREATE INDEX IF NOT EXISTS video_discoveries_quality_idx ON public.video_discoveries (quality_score DESC);
CREATE INDEX IF NOT EXISTS video_discoveries_view_count_idx ON public.video_discoveries (view_count DESC);
