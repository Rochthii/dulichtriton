-- =============================================================================
-- DU LỊCH TRI TÔN — SEMANTIC VECTOR CHAT CACHE MIGRATION
-- Table & RPC function for sub-10ms AI response caching using pgvector
-- =============================================================================

-- Ensure pgvector extension is available
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create semantic_chat_cache table
CREATE TABLE IF NOT EXISTS public.semantic_chat_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    query_embedding vector(768) NOT NULL,
    answer_text TEXT NOT NULL,
    places_json JSONB DEFAULT '[]'::jsonb,
    videos_json JSONB DEFAULT '[]'::jsonb,
    hit_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_hit_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast IVFFlat / HNSW cosine distance vector search
CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding 
ON public.semantic_chat_cache 
USING ivfflat (query_embedding vector_cosine_ops) 
WITH (lists = 100);

-- 2. RPC Function for Cosine Similarity Cache Lookup
CREATE OR REPLACE FUNCTION match_semantic_cache(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.90
)
RETURNS TABLE (
    id UUID,
    query_text TEXT,
    answer_text TEXT,
    places_json JSONB,
    videos_json JSONB,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.query_text,
        s.answer_text,
        s.places_json,
        s.videos_json,
        (1 - (s.query_embedding <=> query_embedding)) AS similarity
    FROM public.semantic_chat_cache s
    WHERE (1 - (s.query_embedding <=> query_embedding)) >= match_threshold
    ORDER BY s.query_embedding <=> query_embedding ASC
    LIMIT 1;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.semantic_chat_cache TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_semantic_cache(vector(768), float) TO anon, authenticated, service_role;
