
-- Drop email column from profiles (it's redundant with auth.users.email)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update the new user trigger to no longer write email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'founder'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$function$;

-- Explicit owner-only SELECT policy on startup_revenue_proofs
-- (the existing FOR ALL policy already covers this, but make it explicit for clarity)
DROP POLICY IF EXISTS "founder reads own revenue proofs" ON public.startup_revenue_proofs;
CREATE POLICY "founder reads own revenue proofs"
ON public.startup_revenue_proofs
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.startup_profiles s
  WHERE s.id = startup_revenue_proofs.startup_id
    AND s.user_id = auth.uid()
));
