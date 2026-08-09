-- Ensure UNIQUE constraint on video_url and external_video_id for upsert compatibility
DELETE FROM public.video_discoveries a USING public.video_discoveries b
WHERE a.id < b.id AND (a.video_url = b.video_url OR a.external_video_id = b.external_video_id);

ALTER TABLE public.video_discoveries 
DROP CONSTRAINT IF EXISTS video_discoveries_video_url_key;

ALTER TABLE public.video_discoveries 
ADD CONSTRAINT video_discoveries_video_url_key UNIQUE (video_url);

ALTER TABLE public.video_discoveries 
DROP CONSTRAINT IF EXISTS video_discoveries_external_video_id_key;

ALTER TABLE public.video_discoveries 
ADD CONSTRAINT video_discoveries_external_video_id_key UNIQUE (external_video_id);
