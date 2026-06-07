
CREATE TABLE public.investor_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  startup_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (investor_id, startup_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_favorites TO authenticated;
GRANT ALL ON public.investor_favorites TO service_role;

ALTER TABLE public.investor_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investor manages own favorites"
  ON public.investor_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = investor_id)
  WITH CHECK (auth.uid() = investor_id);
