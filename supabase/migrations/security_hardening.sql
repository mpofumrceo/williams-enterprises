-- Williams Enterprises — Security hardening
-- Safe to paste into the Supabase SQL Editor.
-- Does NOT drop CMS/content tables or existing rows.

-- ---------------------------------------------------------------------------
-- 1. Role model (additive — existing roles remain valid)
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'super_admin',
    'admin',
    'editor',
    'manager',
    'sales_manager',
    'staff',
    'user'
  ));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Lock the owner account as the platform super admin without renaming other admins
UPDATE public.profiles
SET role = 'super_admin', is_active = true
WHERE lower(email) = 'williamsenterprisess@gmail.com';

-- ---------------------------------------------------------------------------
-- 2. Helper functions (search_path pinned; no PUBLIC execute on admin helpers)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND (
        role = 'super_admin'
        OR lower(email) = 'williamsenterprisess@gmail.com'
      )
  );
$$;

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
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'manager', 'sales_manager', 'staff')
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
      AND is_active = true
      AND role IN ('super_admin', 'admin')
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
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_cms_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_content_editor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'manager', 'sales_manager', 'staff')
  );
$$;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_or_manager() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_cms_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_content_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_cms_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_content_editor() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role TEXT := 'user';
BEGIN
  IF lower(NEW.email) = 'williamsenterprisess@gmail.com' THEN
    assigned_role := 'super_admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    true
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(OLD.email) = 'williamsenterprisess@gmail.com' THEN
    NEW.role := 'super_admin';
    NEW.is_active := true;
    NEW.email := OLD.email;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Callers may update their own name/avatar, never their own role or email
  IF auth.uid() = OLD.id AND NOT public.is_super_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
    NEW.email := OLD.email;
  END IF;

  -- Non-super-admins cannot change anyone's role or active flag
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT public.is_super_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
    NEW.email := OLD.email;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_super_admin_trg ON public.profiles;
CREATE TRIGGER protect_super_admin_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

DROP TRIGGER IF EXISTS prevent_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_privilege_escalation_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_privilege_escalation();

-- ---------------------------------------------------------------------------
-- 3. Rate limiting + security events (distributed; works on serverless)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  rate_key TEXT PRIMARY KEY,
  hit_count INTEGER NOT NULL DEFAULT 1,
  window_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  email TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  success BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_created ON public.security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events (event_type, created_at DESC);

ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- No direct client access; only SECURITY DEFINER functions and super_admin reads
DROP POLICY IF EXISTS "Super admin read security events" ON public.security_events;
CREATE POLICY "Super admin read security events"
  ON public.security_events FOR SELECT
  USING (public.is_super_admin());

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.security_rate_limits%ROWTYPE;
BEGIN
  IF p_key IS NULL OR length(p_key) < 4 OR length(p_key) > 240 THEN
    RETURN FALSE;
  END IF;
  IF p_limit < 1 OR p_limit > 10000 OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.security_rate_limits (rate_key, hit_count, window_starts_at)
  VALUES (left(p_key, 240), 1, NOW())
  ON CONFLICT (rate_key) DO UPDATE
    SET hit_count = CASE
      WHEN public.security_rate_limits.window_starts_at < NOW() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE public.security_rate_limits.hit_count + 1
    END,
        window_starts_at = CASE
      WHEN public.security_rate_limits.window_starts_at < NOW() - make_interval(secs => p_window_seconds)
        THEN NOW()
      ELSE public.security_rate_limits.window_starts_at
    END
  RETURNING * INTO rec;

  RETURN rec.hit_count <= p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_security_event(
  p_event_type TEXT,
  p_email TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, email, ip_hash, user_agent, success, metadata)
  VALUES (
    left(coalesce(p_event_type, 'unknown'), 80),
    CASE WHEN p_email IS NULL THEN NULL ELSE lower(left(p_email, 254)) END,
    left(p_ip_hash, 128),
    left(p_user_agent, 300),
    p_success,
    p_metadata
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_security_event(TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_security_event(TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. Tighten profile RLS (no self-service role changes)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own name" ON public.profiles;

CREATE POLICY "Users update own name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admin update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- 5. Activity logs — staff insert/read; no public access
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Staff read activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Staff insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "CMS admin read activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Staff insert own activity logs" ON public.activity_logs;

CREATE POLICY "CMS admin read activity logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_cms_admin());

CREATE POLICY "Staff insert own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (public.is_staff() AND (user_id IS NULL OR user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 6. Contact / newsletter / reviews — public insert only, never public read
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can send message" ON public.contact_messages;
DROP POLICY IF EXISTS "Staff read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Staff update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "CMS admin read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "CMS admin update contact messages" ON public.contact_messages;

CREATE POLICY "Public insert contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(coalesce(full_name, '')) BETWEEN 2 AND 120
    AND char_length(coalesce(email, '')) BETWEEN 5 AND 254
    AND char_length(coalesce(message, '')) BETWEEN 10 AND 5000
  );

CREATE POLICY "CMS admin read contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_cms_admin());

CREATE POLICY "CMS admin update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Staff manage newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "CMS admin manage newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Public insert newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(coalesce(email, '')) BETWEEN 5 AND 254);

CREATE POLICY "CMS admin manage newsletter"
  ON public.newsletter_subscribers FOR ALL
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "Anyone can submit review" ON public.reviews;
DROP POLICY IF EXISTS "Public insert reviews" ON public.reviews;

CREATE POLICY "Public insert reviews"
  ON public.reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(coalesce(name, '')) BETWEEN 2 AND 120
    AND char_length(coalesce(review_text, '')) BETWEEN 10 AND 2000
    AND rating BETWEEN 1 AND 5
    AND status = 'pending'
  );

-- ---------------------------------------------------------------------------
-- 7. Sensitive / CMS tables — published read; staff/admin write with CHECK
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Staff manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "CMS admin manage site settings" ON public.site_settings;

CREATE POLICY "CMS admin manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "Public read media library" ON public.media_library;
DROP POLICY IF EXISTS "Staff manage media library" ON public.media_library;
DROP POLICY IF EXISTS "Staff read media library" ON public.media_library;
DROP POLICY IF EXISTS "Staff write media library" ON public.media_library;

CREATE POLICY "Staff read media library"
  ON public.media_library FOR SELECT
  USING (public.is_content_editor());

CREATE POLICY "Staff write media library"
  ON public.media_library FOR ALL
  USING (public.is_content_editor())
  WITH CHECK (public.is_content_editor());

DROP POLICY IF EXISTS "Staff manage theme" ON public.site_theme;
DROP POLICY IF EXISTS "CMS admin manage theme" ON public.site_theme;
CREATE POLICY "CMS admin manage theme"
  ON public.site_theme FOR ALL
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "Staff manage site branding" ON public.site_branding;
DROP POLICY IF EXISTS "CMS admin manage site branding" ON public.site_branding;
CREATE POLICY "CMS admin manage site branding"
  ON public.site_branding FOR ALL
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "Staff manage pages" ON public.site_pages;
DROP POLICY IF EXISTS "Editors manage pages" ON public.site_pages;
CREATE POLICY "Editors manage pages"
  ON public.site_pages FOR ALL
  USING (public.is_content_editor())
  WITH CHECK (public.is_content_editor());

DROP POLICY IF EXISTS "Staff manage sections" ON public.page_sections;
DROP POLICY IF EXISTS "Editors manage sections" ON public.page_sections;
CREATE POLICY "Editors manage sections"
  ON public.page_sections FOR ALL
  USING (public.is_content_editor())
  WITH CHECK (public.is_content_editor());

DROP POLICY IF EXISTS "Staff manage navigation" ON public.navigation_items;
DROP POLICY IF EXISTS "CMS admin manage navigation" ON public.navigation_items;
CREATE POLICY "CMS admin manage navigation"
  ON public.navigation_items FOR ALL
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

DROP POLICY IF EXISTS "Staff manage footer" ON public.footer_settings;
DROP POLICY IF EXISTS "CMS admin manage footer" ON public.footer_settings;
CREATE POLICY "CMS admin manage footer"
  ON public.footer_settings FOR ALL
  USING (public.is_cms_admin())
  WITH CHECK (public.is_cms_admin());

-- ---------------------------------------------------------------------------
-- 8. Storage: keep public media readable; private buckets staff-only
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Staff upload public media" ON storage.objects;
DROP POLICY IF EXISTS "Staff update public media" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete public media" ON storage.objects;
DROP POLICY IF EXISTS "Editors upload public media" ON storage.objects;
DROP POLICY IF EXISTS "Editors update public media" ON storage.objects;
DROP POLICY IF EXISTS "Editors delete public media" ON storage.objects;

CREATE POLICY "Editors upload public media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    public.is_content_editor()
    AND bucket_id IN (
      'founders', 'services', 'projects', 'gallery', 'news',
      'reviews', 'website-media', 'website'
    )
  );

CREATE POLICY "Editors update public media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    public.is_content_editor()
    AND bucket_id IN (
      'founders', 'services', 'projects', 'gallery', 'news',
      'reviews', 'website-media', 'website'
    )
  )
  WITH CHECK (
    public.is_content_editor()
    AND bucket_id IN (
      'founders', 'services', 'projects', 'gallery', 'news',
      'reviews', 'website-media', 'website'
    )
  );

CREATE POLICY "Editors delete public media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    public.is_content_editor()
    AND bucket_id IN (
      'founders', 'services', 'projects', 'gallery', 'news',
      'reviews', 'website-media', 'website'
    )
  );

DROP POLICY IF EXISTS "Staff read private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload private files" ON storage.objects;
DROP POLICY IF EXISTS "Staff manage private files" ON storage.objects;
DROP POLICY IF EXISTS "Finance read private files" ON storage.objects;
DROP POLICY IF EXISTS "Finance upload private files" ON storage.objects;
DROP POLICY IF EXISTS "Finance manage private files" ON storage.objects;

CREATE POLICY "Finance read private files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager()
    AND bucket_id IN ('employees', 'receipts', 'quotations')
  );

CREATE POLICY "Finance upload private files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_manager()
    AND bucket_id IN ('employees', 'receipts', 'quotations')
  );

CREATE POLICY "Finance manage private files"
  ON storage.objects FOR ALL TO authenticated
  USING (
    public.is_admin_or_manager()
    AND bucket_id IN ('employees', 'receipts', 'quotations')
  )
  WITH CHECK (
    public.is_admin_or_manager()
    AND bucket_id IN ('employees', 'receipts', 'quotations')
  );
