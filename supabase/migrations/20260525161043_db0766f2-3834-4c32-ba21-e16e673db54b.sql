
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.media_kind AS ENUM ('image','pdf','video');
CREATE TYPE public.allocation_category AS ENUM ('Product Development','Hiring','Marketing','Operations','Other');

-- =========================
-- STARTUP PROFILE EXTENSIONS
-- =========================
ALTER TABLE public.startup_profiles
  ADD COLUMN intro_video_url text,
  ADD COLUMN monthly_burn numeric NOT NULL DEFAULT 0,
  ADD COLUMN runway_months integer NOT NULL DEFAULT 0,
  ADD COLUMN annual_revenue numeric NOT NULL DEFAULT 0,
  ADD COLUMN hq_region text,
  ADD COLUMN revenue_verified boolean NOT NULL DEFAULT false;

-- =========================
-- INVESTOR LISTS
-- =========================
CREATE TABLE public.investor_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor manages own lists" ON public.investor_lists FOR ALL TO authenticated
  USING (auth.uid() = investor_id) WITH CHECK (auth.uid() = investor_id);

CREATE TABLE public.investor_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.investor_lists(id) ON DELETE CASCADE,
  startup_id uuid NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, startup_id)
);
ALTER TABLE public.investor_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor manages own list items" ON public.investor_list_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.investor_lists l WHERE l.id = list_id AND l.investor_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.investor_lists l WHERE l.id = list_id AND l.investor_id = auth.uid()));

-- =========================
-- STARTUP LABELS (per investor)
-- =========================
CREATE TABLE public.startup_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  startup_id uuid NOT NULL,
  label text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor manages own labels" ON public.startup_labels FOR ALL TO authenticated
  USING (auth.uid() = investor_id) WITH CHECK (auth.uid() = investor_id);

-- =========================
-- TEAM MEMBERS
-- =========================
CREATE TABLE public.startup_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  photo_url text,
  linkedin_url text,
  bio text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team readable by authenticated" ON public.startup_team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "founder manages own team" ON public.startup_team_members FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- =========================
-- MEDIA (images / pdfs / video)
-- =========================
CREATE TABLE public.startup_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  kind public.media_kind NOT NULL,
  url text NOT NULL,
  title text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media readable by authenticated" ON public.startup_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "founder manages own media" ON public.startup_media FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- =========================
-- EXISTING INVESTORS
-- =========================
CREATE TABLE public.startup_existing_investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  round text,
  is_lead boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_existing_investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "existing investors readable by authenticated" ON public.startup_existing_investors FOR SELECT TO authenticated USING (true);
CREATE POLICY "founder manages own existing investors" ON public.startup_existing_investors FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- =========================
-- REVENUE PROOFS (private)
-- =========================
CREATE TABLE public.startup_revenue_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  file_url text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_revenue_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder manages own revenue proofs" ON public.startup_revenue_proofs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- Auto-flag revenue_verified when proofs exist
CREATE OR REPLACE FUNCTION public.sync_revenue_verified() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sid uuid;
BEGIN
  sid := COALESCE(NEW.startup_id, OLD.startup_id);
  UPDATE public.startup_profiles
    SET revenue_verified = EXISTS (SELECT 1 FROM public.startup_revenue_proofs WHERE startup_id = sid)
    WHERE id = sid;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_revenue_verified_ins
AFTER INSERT OR DELETE ON public.startup_revenue_proofs
FOR EACH ROW EXECUTE FUNCTION public.sync_revenue_verified();

-- =========================
-- FUND ALLOCATIONS
-- =========================
CREATE TABLE public.startup_fund_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  category public.allocation_category NOT NULL,
  percentage numeric NOT NULL DEFAULT 0,
  UNIQUE(startup_id, category)
);
ALTER TABLE public.startup_fund_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allocations readable by authenticated" ON public.startup_fund_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "founder manages own allocations" ON public.startup_fund_allocations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- =========================
-- PROFILE VIEWS (analytics)
-- =========================
CREATE TABLE public.startup_profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  investor_id uuid NOT NULL,
  session_key text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(startup_id, investor_id, session_key)
);
ALTER TABLE public.startup_profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor inserts own view" ON public.startup_profile_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "founder reads views of own startup" ON public.startup_profile_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- =========================
-- USER SETTINGS (themes)
-- =========================
CREATE TABLE public.user_settings (
  user_id uuid PRIMARY KEY,
  theme text NOT NULL DEFAULT 'midnight',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own settings" ON public.user_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- STORAGE BUCKETS
-- =========================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('startup-media','startup-media',true),
  ('team-photos','team-photos',true),
  ('revenue-proofs','revenue-proofs',false)
ON CONFLICT (id) DO NOTHING;

-- Public read for media + team
CREATE POLICY "public read startup-media" ON storage.objects FOR SELECT USING (bucket_id = 'startup-media');
CREATE POLICY "public read team-photos" ON storage.objects FOR SELECT USING (bucket_id = 'team-photos');

-- Authenticated upload/update/delete scoped by user folder
CREATE POLICY "auth upload startup-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'startup-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "auth update startup-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'startup-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "auth delete startup-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'startup-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "auth upload team-photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'team-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "auth update team-photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'team-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "auth delete team-photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'team-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Private bucket: owner-only
CREATE POLICY "owner read revenue-proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'revenue-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "owner upload revenue-proofs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'revenue-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "owner delete revenue-proofs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'revenue-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
