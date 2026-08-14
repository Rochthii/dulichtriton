-- Migration: Enrich places schema and align vector embedding to 768d (Gemini)
-- Date: 2026-08-14

-- 1. Rich columns for places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS detailed_story TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS travel_guide JSONB DEFAULT '{}'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS checkin_spots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS nearby_cafes_and_food JSONB DEFAULT '[]'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS google_maps_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS tags_info JSONB DEFAULT '{}'::jsonb;
ALTER TABLE places ADD COLUMN IF NOT EXISTS tiktok_videos JSONB DEFAULT '[]'::jsonb;

-- 2. Align vector embeddings to 768 dimensions (text-embedding-004 / gemini-embedding-001)
DROP INDEX IF EXISTS idx_places_embedding;
ALTER TABLE places ALTER COLUMN embedding TYPE vector(768);
CREATE INDEX IF NOT EXISTS idx_places_embedding ON places USING hnsw (embedding vector_cosine_ops);

-- 3. Update match_places RPC function
CREATE OR REPLACE FUNCTION public.match_places(
    query_embedding vector(768),
    match_threshold double precision DEFAULT 0.3,
    match_count integer DEFAULT 5
)
RETURNS TABLE(
    id text,
    slug text,
    name text,
    commune text,
    category text,
    rating numeric,
    image_url text,
    description text,
    golden_time_windows text[],
    similarity double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    places.id::text,
    places.slug::text,
    places.name::text,
    places.commune::text,
    places.category::text,
    places.rating,
    places.image_url::text,
    places.description::text,
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
