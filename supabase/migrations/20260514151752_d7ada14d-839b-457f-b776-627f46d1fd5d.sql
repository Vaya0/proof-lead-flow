ALTER TABLE public.startup_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;

INSERT INTO storage.buckets (id, name, public) VALUES ('startup-logos', 'startup-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Logos publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'startup-logos');

CREATE POLICY "Founders upload own logo" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'startup-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Founders update own logo" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'startup-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Founders delete own logo" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'startup-logos' AND auth.uid()::text = (storage.foldername(name))[1]);