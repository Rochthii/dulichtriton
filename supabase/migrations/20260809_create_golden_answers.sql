-- Migration: 20260809_create_golden_answers.sql
-- Description: Create golden_answers table for Golden Cache & Dynamic Few-shot Behavior RAG Layer

-- Enable pgvector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create golden_answers table
CREATE TABLE IF NOT EXISTS public.golden_answers (
  id          TEXT PRIMARY KEY,                  -- Q001, Q002, ..., Q148
  intent      TEXT NOT NULL DEFAULT 'general',   -- place|food|itinerary|culture|logistics|compare|safety|reject
  question    TEXT NOT NULL,                     -- Original golden question
  answer_json JSONB NOT NULL,                    -- Standard answer JSON (format & content)
  format      TEXT NOT NULL DEFAULT 'json',      -- json|markdown|bullets|timeline|table|short|warning|...
  embedding   VECTOR(768),                       -- 768-dim vector from gemini-embedding-001
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HNSW Index for ultra-fast vector cosine similarity search (<5ms)
CREATE INDEX IF NOT EXISTS golden_answers_embedding_hnsw_idx 
ON public.golden_answers 
USING hnsw (embedding vector_cosine_ops);

-- 3. Stored Procedure RPC to query top-k similar golden questions
CREATE OR REPLACE FUNCTION match_golden(
  query_embedding VECTOR(768), 
  thresh FLOAT DEFAULT 0.85, 
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id TEXT, 
  intent TEXT, 
  question TEXT, 
  answer_json JSONB, 
  format TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT 
    id, 
    intent, 
    question, 
    answer_json, 
    format,
    (1 - (embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.golden_answers
  WHERE 1 - (embedding <=> query_embedding) >= thresh
  ORDER BY embedding <=> query_embedding ASC 
  LIMIT match_count;
$$;

-- 4. Enable Row Level Security (RLS) & Grant Access
ALTER TABLE public.golden_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to golden_answers" ON public.golden_answers;
CREATE POLICY "Allow public read access to golden_answers" 
ON public.golden_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert/update to golden_answers" ON public.golden_answers;
CREATE POLICY "Allow anon insert/update to golden_answers" 
ON public.golden_answers FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.golden_answers TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_golden TO anon, authenticated, service_role;
