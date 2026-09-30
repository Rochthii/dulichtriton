BEGIN;

-- P02-019: Revoke anonymous write permissions on public.golden_answers
-- Prevent anonymous attackers from tampering with, creating, or deleting golden RAG answers.
-- Preserves anonymous SELECT and RPC execution (match_golden) for public AI chatbot queries.

-- 1. Drop the permissive ALL policy that granted anonymous write access
DROP POLICY IF EXISTS "Allow anon insert/update to golden_answers" ON public.golden_answers;

-- 2. Revoke write privileges from anon on golden_answers
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.golden_answers FROM anon;

-- 3. Ensure SELECT privilege and execute rights remain explicitly granted to anon
GRANT SELECT ON TABLE public.golden_answers TO anon;
GRANT EXECUTE ON FUNCTION match_golden TO anon;

-- 4. Explicit policy for service_role to ensure write access regardless of BYPASSRLS state
DROP POLICY IF EXISTS "service_role_all_golden_answers" ON public.golden_answers;
CREATE POLICY "service_role_all_golden_answers" ON public.golden_answers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
