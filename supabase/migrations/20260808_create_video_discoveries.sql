-- ==============================================================================
-- Migration: Create video_discoveries Table for Dynamic Video Discovery Engine
-- System: Du Lịch Tri Tôn AI System
-- Date: 2026-08-08
-- Specification: docs/dynamic_video_discovery_spec.md (v3.0)
-- ==============================================================================

-- 1. Create table video_discoveries
CREATE TABLE IF NOT EXISTS public.video_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(30) NOT NULL DEFAULT 'tiktok',
    external_video_id VARCHAR(100) NOT NULL,
    video_url TEXT NOT NULL,
    embed_url TEXT,
    thumbnail_url TEXT,
    title TEXT,
    author_name VARCHAR(100),
    
    -- Engagement Metrics (NULLable because OEmbed does not provide counts)
    view_count BIGINT NULL,
    like_count BIGINT NULL,
    comment_count BIGINT NULL,
    share_count BIGINT NULL,
    
    -- POI Match & Evidence Data
    matched_poi_id VARCHAR(50) REFERENCES public.places(id) ON DELETE SET NULL,
    matched_alias TEXT,
    matched_keywords TEXT[],
    matched_location TEXT,
    query_source TEXT,
    
    -- Detailed Score Breakdown (JSONB for Explainable AI)
    relevance_score NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Lifecycle Stage & Verification Status
    processing_stage VARCHAR(30) NOT NULL DEFAULT 'DISCOVERED',
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verification_reason TEXT,
    evidence_urls TEXT[],
    
    -- Timestamps
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Multi-platform Unique Constraint
    CONSTRAINT unq_platform_video UNIQUE(platform, external_video_id)
);

-- 2. Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_vid_disc_poi ON public.video_discoveries(matched_poi_id);
CREATE INDEX IF NOT EXISTS idx_vid_disc_status ON public.video_discoveries(verification_status);
CREATE INDEX IF NOT EXISTS idx_vid_disc_stage ON public.video_discoveries(processing_stage);
CREATE INDEX IF NOT EXISTS idx_vid_disc_score ON public.video_discoveries(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_vid_disc_platform ON public.video_discoveries(platform);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.video_discoveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Video Discoveries" ON public.video_discoveries;
DROP POLICY IF EXISTS "Service Role Full Access for Video Discoveries" ON public.video_discoveries;

-- Allow public read access to active verified/relevant videos
CREATE POLICY "Public Read Access for Video Discoveries" 
    ON public.video_discoveries 
    FOR SELECT 
    USING (verification_status IN ('VERIFIED', 'RELEVANT') AND expires_at > NOW());

-- Allow service role full access for discovery worker
CREATE POLICY "Service Role Full Access for Video Discoveries" 
    ON public.video_discoveries 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
