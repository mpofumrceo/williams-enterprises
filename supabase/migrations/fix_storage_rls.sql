-- Fix storage uploads blocked by RLS (services, gallery, etc.)
-- Run in Supabase SQL Editor

-- Ensure helpers resolve tables correctly when called from storage policies
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'sales_manager', 'staff')
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND is_active = true
  );
$$;

-- Ensure public media buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES
  ('founders', 'founders', true),
  ('services', 'services', true),
  ('projects', 'projects', true),
  ('gallery', 'gallery', true),
  ('news', 'news', true),
  ('reviews', 'reviews', true),
  ('employees', 'employees', false),
  ('receipts', 'receipts', false),
  ('quotations', 'quotations', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Recreate storage policies cleanly
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload public media" ON storage.objects;
DROP POLICY IF EXISTS "Staff update public media" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete public media" ON storage.objects;
DROP POLICY IF EXISTS "Staff read private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff manage private files" ON storage.objects;

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews'));

CREATE POLICY "Staff upload public media" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews')
    AND public.is_staff()
  );

CREATE POLICY "Staff update public media" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews')
    AND public.is_staff()
  )
  WITH CHECK (
    bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews')
    AND public.is_staff()
  );

CREATE POLICY "Staff delete public media" ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews')
    AND public.is_staff()
  );

CREATE POLICY "Staff read private files" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff());

CREATE POLICY "Staff upload private files" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff());

CREATE POLICY "Staff manage private files" ON storage.objects
  FOR ALL
  USING (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff())
  WITH CHECK (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff());
