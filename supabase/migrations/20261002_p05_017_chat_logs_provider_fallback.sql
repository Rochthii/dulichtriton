-- P05-017: persist whether a provider-backed response used a fallback route.
-- NULL means the request was not eligible for classification (guards, out of scope,
-- older rows, or otherwise unclassified); false means primary provider succeeded.
ALTER TABLE public.chat_logs
  ADD COLUMN IF NOT EXISTS provider_fallback BOOLEAN;
