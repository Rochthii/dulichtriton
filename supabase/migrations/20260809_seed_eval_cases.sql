-- Migration: 20260809_seed_eval_cases.sql
-- Description: Create evaluation tables for Golden Dataset and benchmark tracking

CREATE TABLE IF NOT EXISTS public.eval_cases (
    id VARCHAR(10) PRIMARY KEY,
    query TEXT NOT NULL,
    intent VARCHAR(50) NOT NULL,
    target_pois JSONB DEFAULT '[]'::jsonb,
    mandatory_facts JSONB DEFAULT '[]'::jsonb,
    forbidden_phrases JSONB DEFAULT '[]'::jsonb,
    difficulty VARCHAR(20) DEFAULT 'medium',
    test_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eval_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_timestamp TIMESTAMPTZ DEFAULT NOW(),
    total_cases INT NOT NULL,
    retrieval_mean NUMERIC(5,4),
    factuality_mean NUMERIC(5,4),
    forbidden_total INT DEFAULT 0,
    rejection_acc NUMERIC(5,4),
    edge_in_scope_acc NUMERIC(5,4),
    status VARCHAR(20) NOT NULL,
    report_json JSONB
);

-- Enable RLS & Policies
ALTER TABLE public.eval_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eval_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for eval_cases" ON public.eval_cases;
CREATE POLICY "Public read for eval_cases" ON public.eval_cases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for eval_runs" ON public.eval_runs;
CREATE POLICY "Public read for eval_runs" ON public.eval_runs FOR SELECT USING (true);

