-- Migration: Create Knowledge Base Table with pgvector HNSW Index and Retrieval RPC
-- Created At: 2026-08-11

-- Ensure extension pgvector is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop table if exists for clean migration re-runs
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    related_pois TEXT[] DEFAULT '{}',
    embedding VECTOR(768),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Vector Index for ultra-fast semantic similarity search (<5ms)
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_hnsw_idx 
ON public.knowledge_base 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Category and Topic indexes
CREATE INDEX IF NOT EXISTS idx_kb_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_topic ON public.knowledge_base(topic);

-- RPC Function for matching knowledge articles by cosine similarity
CREATE OR REPLACE FUNCTION match_kb(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.50,
    match_count INT DEFAULT 3
)
RETURNS TABLE (
    id TEXT,
    topic TEXT,
    title TEXT,
    category TEXT,
    content TEXT,
    summary TEXT,
    related_pois TEXT[],
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.topic,
        kb.title,
        kb.category,
        kb.content,
        kb.summary,
        kb.related_pois,
        1 - (kb.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_base kb
    WHERE kb.embedding IS NOT NULL
      AND (1 - (kb.embedding <=> query_embedding)) >= match_threshold
    ORDER BY kb.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
