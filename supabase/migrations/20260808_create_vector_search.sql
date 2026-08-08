-- Enable pgvector extension for Supabase PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to places table (768 dimensions for Gemini text-embedding-004 / standard vector model)
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create HNSW vector index for ultra-fast similarity search
CREATE INDEX IF NOT EXISTS places_embedding_hnsw_idx ON public.places USING hnsw (embedding vector_cosine_ops);

-- Create Stored Procedure RPC function for semantic RAG search
CREATE OR REPLACE FUNCTION match_places (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id text,
  slug text,
  name text,
  commune text,
  category text,
  rating numeric,
  image_url text,
  description text,
  golden_time_windows text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    places.id,
    places.slug,
    places.name,
    places.commune,
    places.category,
    places.rating,
    places.image_url,
    places.description,
    places.golden_time_windows,
    (1 - (places.embedding <=> query_embedding))::float AS similarity
  FROM places
  WHERE places.is_active = true
    AND places.embedding IS NOT NULL
    AND (1 - (places.embedding <=> query_embedding)) > match_threshold
  ORDER BY places.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
