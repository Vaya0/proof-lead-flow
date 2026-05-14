
-- Role enum
CREATE TYPE public.user_role AS ENUM ('founder', 'investor');
CREATE TYPE public.intro_status AS ENUM ('pending', 'accepted', 'declined');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role public.user_role NOT NULL,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Startup profiles
CREATE TABLE public.startup_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  startup_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  industry TEXT NOT NULL,
  business_model TEXT NOT NULL,
  stage TEXT NOT NULL,
  founded_year INT NOT NULL,
  hq_location TEXT NOT NULL,
  demo_url TEXT NOT NULL,
  mrr NUMERIC NOT NULL DEFAULT 0,
  growth_rate NUMERIC NOT NULL DEFAULT 0,
  total_users INT NOT NULL DEFAULT 0,
  traction_description TEXT NOT NULL,
  team_size INT NOT NULL DEFAULT 1,
  raise_amount NUMERIC NOT NULL DEFAULT 0,
  use_of_funds TEXT NOT NULL,
  founder_name TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.startup_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "startups readable by authenticated" ON public.startup_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "founder insert own startup" ON public.startup_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "founder update own startup" ON public.startup_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "founder delete own startup" ON public.startup_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Investor profiles
CREATE TABLE public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  thesis TEXT NOT NULL,
  preferred_industries TEXT[] NOT NULL DEFAULT '{}',
  target_stages TEXT[] NOT NULL DEFAULT '{}',
  min_ticket NUMERIC NOT NULL DEFAULT 0,
  max_ticket NUMERIC NOT NULL DEFAULT 0,
  linkedin_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investors readable by authenticated" ON public.investor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "investor insert own" ON public.investor_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investor update own" ON public.investor_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Intro requests
CREATE TABLE public.intro_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startup_profiles ON DELETE CASCADE,
  status public.intro_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (investor_id, startup_id)
);
ALTER TABLE public.intro_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investor reads own intros" ON public.intro_requests FOR SELECT TO authenticated
  USING (auth.uid() = investor_id OR EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));
CREATE POLICY "investor creates intro" ON public.intro_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "founder updates intro status" ON public.intro_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.startup_profiles s WHERE s.id = startup_id AND s.user_id = auth.uid()));

-- Auto-create profile on signup using metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'founder'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
