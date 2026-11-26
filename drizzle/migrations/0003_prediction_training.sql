CREATE TABLE public.prediction_training (user_id uuid NOT NULL, kind text NOT NULL, data jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,kind));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prediction_training TO authenticated;
GRANT ALL ON public.prediction_training TO service_role;
ALTER TABLE public.prediction_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own prediction training" ON public.prediction_training FOR ALL TO authenticated USING ((select auth.uid())=user_id) WITH CHECK ((select auth.uid())=user_id);