BEGIN;

-- P02-022: Restrict custom knowledge-base policy to service_role and revoke anon write
-- Fix vulnerability where policy "Allow service role all on custom_knowledge_base" omitted "TO service_role",
-- making it apply to PUBLIC (all users) and allowing anonymous modification of knowledge entries.
-- Ensures only active entries (is_active = true) are readable by public/anon, and only service_role can mutate.

-- 1. Enable Row Level Security (RLS) on custom_knowledge_base
ALTER TABLE public.custom_knowledge_base ENABLE ROW LEVEL SECURITY;

-- 2. Drop the overly permissive policy that lacked TO service_role
DROP POLICY IF EXISTS "Allow service role all on custom_knowledge_base" ON public.custom_knowledge_base;
DROP POLICY IF EXISTS "Allow public read active knowledge" ON public.custom_knowledge_base;
DROP POLICY IF EXISTS "service_role_all_custom_knowledge_base" ON public.custom_knowledge_base;

-- 3. Create strictly scoped policy for public/anonymous read of ACTIVE knowledge only
CREATE POLICY "Allow public read active knowledge" ON public.custom_knowledge_base
  FOR SELECT
  TO anon, authenticated, service_role
  USING (is_active = true);

-- 4. Create strictly scoped policy for service_role administrative management
CREATE POLICY "service_role_all_custom_knowledge_base" ON public.custom_knowledge_base
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Revoke write privileges from anon on custom_knowledge_base
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.custom_knowledge_base FROM anon;

-- 6. Ensure SELECT privilege remains granted to anon
GRANT SELECT ON TABLE public.custom_knowledge_base TO anon;
GRANT ALL ON TABLE public.custom_knowledge_base TO service_role;

-- 7. Ensure public.knowledge_base (vector RAG articles) is also protected if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'knowledge_base') THEN
    ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read access to knowledge_base" ON public.knowledge_base;
    CREATE POLICY "Allow public read access to knowledge_base" ON public.knowledge_base
      FOR SELECT
      TO anon, authenticated, service_role
      USING (true);

    DROP POLICY IF EXISTS "service_role_all_knowledge_base" ON public.knowledge_base;
    CREATE POLICY "service_role_all_knowledge_base" ON public.knowledge_base
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.knowledge_base FROM anon;
    GRANT SELECT ON TABLE public.knowledge_base TO anon;
    GRANT ALL ON TABLE public.knowledge_base TO service_role;
  END IF;
END $$;

COMMIT;
