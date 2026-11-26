CREATE TABLE public.sports_research_cache (user_id uuid NOT NULL, research_key text NOT NULL, facts jsonb NOT NULL DEFAULT '[]'::jsonb, checked_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, research_key));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sports_research_cache TO authenticated;
GRANT ALL ON public.sports_research_cache TO service_role;
ALTER TABLE public.sports_research_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own research" ON public.sports_research_cache FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);