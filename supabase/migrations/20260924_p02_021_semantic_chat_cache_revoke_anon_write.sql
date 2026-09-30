BEGIN;

-- P02-021: Revoke anonymous write permissions on public.semantic_chat_cache
-- Prevent unauthorized poisoning, tampering, or deletion of cached AI chatbot answers.
-- Enables Row Level Security (RLS) and preserves public read access and RPC execution (match_semantic_cache).

-- 1. Enable Row Level Security (RLS) on semantic_chat_cache
ALTER TABLE public.semantic_chat_cache ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy permissive policies if they exist
DROP POLICY IF EXISTS "semantic_chat_cache_anon_write" ON public.semantic_chat_cache;
DROP POLICY IF EXISTS "semantic_chat_cache_anon_all" ON public.semantic_chat_cache;
DROP POLICY IF EXISTS "Allow public read access to semantic_chat_cache" ON public.semantic_chat_cache;

-- 3. Policy for public/anonymous read-only access
CREATE POLICY "Allow public read access to semantic_chat_cache" ON public.semantic_chat_cache
  FOR SELECT USING (true);

-- 4. Revoke write privileges from anon
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.semantic_chat_cache FROM anon;

-- 5. Redefine match_semantic_cache with qualified argument to resolve ambiguous column error, and ensure SELECT & EXECUTE remain granted to anon
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
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        s.id,
        s.query_text,
        s.answer_text,
        s.places_json,
        s.videos_json,
        (1 - (s.query_embedding <=> match_semantic_cache.query_embedding)) AS similarity
    FROM public.semantic_chat_cache s
    WHERE (1 - (s.query_embedding <=> match_semantic_cache.query_embedding)) >= match_threshold
    ORDER BY s.query_embedding <=> match_semantic_cache.query_embedding ASC
    LIMIT 1;
$$;

GRANT SELECT ON TABLE public.semantic_chat_cache TO anon;
GRANT EXECUTE ON FUNCTION match_semantic_cache(vector(768), float) TO anon;

-- 6. Policy and grants for service_role to ensure full administrative access
DROP POLICY IF EXISTS "service_role_all_semantic_chat_cache" ON public.semantic_chat_cache;
CREATE POLICY "service_role_all_semantic_chat_cache" ON public.semantic_chat_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.semantic_chat_cache TO service_role;

COMMIT;
