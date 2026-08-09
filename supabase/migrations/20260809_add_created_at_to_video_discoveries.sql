-- Add created_at column to video_discoveries for unified timestamp sorting
ALTER TABLE public.video_discoveries 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.video_discoveries 
SET created_at = discovered_at 
WHERE created_at IS NULL;
