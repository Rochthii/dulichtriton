-- Migration: 20260810_backfill_slugs.sql
-- Description: Backfill slug column for all existing places records + trigger for future inserts
-- Rationale: 95 existing rows seeded from CSV have NULL slugs → all place detail pages return 404

-- 1. Add slug column if not exists (safety guard)
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create unique index on slug (allow NULL for now, enforce only when slug is set)
CREATE UNIQUE INDEX IF NOT EXISTS places_slug_unique_idx ON public.places (slug) WHERE slug IS NOT NULL;

-- 3. Helper function to transliterate Vietnamese → ASCII slug
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(input_text);
  -- Remove Vietnamese diacritics (basic transliteration)
  result := translate(result,
    'àáâãäåèéêëìíîïòóôõöùúûüýþÿñçðšžœæ',
    'aaaaaaeeeeiiiioooooouuuuytyncdszoa'
  );
  -- Vietnamese specific replacements
  result := regexp_replace(result, '[àáạảãăắặẳẵâấậẩẫ]', 'a', 'g');
  result := regexp_replace(result, '[èéẹẻẽêếệểễ]', 'e', 'g');
  result := regexp_replace(result, '[ìíịỉĩ]', 'i', 'g');
  result := regexp_replace(result, '[òóọỏõôốộổỗơớợởỡ]', 'o', 'g');
  result := regexp_replace(result, '[ùúụủũưứựửữ]', 'u', 'g');
  result := regexp_replace(result, '[ỳýỵỷỹ]', 'y', 'g');
  result := regexp_replace(result, '[đ]', 'd', 'g');
  -- Remove remaining non-ASCII
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  -- Replace whitespace and multiple hyphens with single hyphen
  result := regexp_replace(result, '[\s]+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(BOTH '-' FROM result);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Backfill slugs for all rows that have NULL slug using place id as suffix for uniqueness
UPDATE public.places
SET slug = generate_slug(name) || '-' || lower(id)
WHERE slug IS NULL OR slug = '';

-- 5. Create trigger function to auto-generate slug on INSERT if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name) || '-' || lower(COALESCE(NEW.id, extract(epoch from now())::text));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach trigger to places table
DROP TRIGGER IF EXISTS trg_auto_generate_slug ON public.places;
CREATE TRIGGER trg_auto_generate_slug
  BEFORE INSERT ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- Verify backfill result
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count FROM public.places WHERE slug IS NULL OR slug = '';
  IF null_count > 0 THEN
    RAISE WARNING '[20260810_backfill_slugs] % places still have NULL slug after backfill!', null_count;
  ELSE
    RAISE NOTICE '[20260810_backfill_slugs] ✅ All places now have slugs.';
  END IF;
END;
$$;
