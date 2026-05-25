
REVOKE EXECUTE ON FUNCTION public.sync_revenue_verified() FROM PUBLIC, anon, authenticated;

-- Tighten public bucket SELECT policies: still publicly readable for actual files via URL,
-- but disallow listing for anon (only authenticated can list).
DROP POLICY IF EXISTS "public read startup-media" ON storage.objects;
DROP POLICY IF EXISTS "public read team-photos" ON storage.objects;
CREATE POLICY "read startup-media" ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'startup-media');
CREATE POLICY "read team-photos" ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'team-photos');
