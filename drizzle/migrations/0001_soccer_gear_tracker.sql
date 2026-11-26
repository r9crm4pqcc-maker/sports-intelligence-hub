CREATE TABLE public.soccer_gear (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, name text NOT NULL, activation_date date NOT NULL, active boolean NOT NULL DEFAULT false);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soccer_gear TO authenticated;
GRANT ALL ON public.soccer_gear TO service_role;
ALTER TABLE public.soccer_gear ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own gear" ON public.soccer_gear FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);