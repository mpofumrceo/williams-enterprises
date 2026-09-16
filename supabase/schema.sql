-- Williams Enterprises — Complete Database Schema
-- Run this in Supabase SQL Editor BEFORE seed.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Updated_at trigger (no table dependencies)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'sales_manager', 'staff', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup (super admin email is always admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'user';
BEGIN
  IF lower(NEW.email) = 'williamsenterprisess@gmail.com' THEN
    assigned_role := 'admin';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Block demotion / deactivation / email change for super admin
CREATE OR REPLACE FUNCTION public.protect_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF lower(OLD.email) = 'williamsenterprisess@gmail.com' THEN
    IF NEW.role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Super admin role cannot be changed';
    END IF;
    IF NEW.is_active IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'Super admin cannot be deactivated';
    END IF;
    IF lower(NEW.email) IS DISTINCT FROM 'williamsenterprisess@gmail.com' THEN
      RAISE EXCEPTION 'Super admin email cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_super_admin_trg ON public.profiles;
CREATE TRIGGER protect_super_admin_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

-- Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Contact settings
CREATE TABLE IF NOT EXISTS public.contact_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT,
  email TEXT,
  address TEXT,
  business_hours TEXT,
  whatsapp TEXT,
  map_lat DOUBLE PRECISION DEFAULT -20.1561,
  map_lng DOUBLE PRECISION DEFAULT 28.5887,
  map_zoom INTEGER DEFAULT 12,
  company_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER contact_settings_updated_at BEFORE UPDATE ON public.contact_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Social links
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER social_links_updated_at BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Hero backgrounds
CREATE TABLE IF NOT EXISTS public.hero_backgrounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL,
  background_type TEXT NOT NULL DEFAULT 'image' CHECK (background_type IN ('image', 'video', 'youtube', 'instagram', 'url')),
  background_url TEXT,
  mobile_background_url TEXT,
  overlay_color TEXT DEFAULT '#0A2540',
  overlay_opacity NUMERIC(3,2) DEFAULT 0.60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER hero_backgrounds_updated_at BEFORE UPDATE ON public.hero_backgrounds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Homepage showcase (admin-controlled reel)
CREATE TABLE IF NOT EXISTS public.home_showcase_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  eyebrow TEXT DEFAULT 'Williams Enterprises',
  heading TEXT DEFAULT 'See what we build',
  description TEXT DEFAULT 'A curated look at the work, craft, and capabilities behind Williams Enterprises.',
  cta_label TEXT DEFAULT 'Explore services',
  cta_url TEXT DEFAULT '/services',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER home_showcase_settings_updated_at BEFORE UPDATE ON public.home_showcase_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.home_showcase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_showcase_items_active
  ON public.home_showcase_items(is_active, sort_order);

CREATE TRIGGER home_showcase_items_updated_at BEFORE UPDATE ON public.home_showcase_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- About content
CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  main_description TEXT,
  company_story TEXT,
  mission TEXT,
  vision TEXT,
  values JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  cta_title TEXT,
  cta_description TEXT,
  cta_button_text TEXT,
  cta_button_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER about_content_updated_at BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Founders
CREATE TABLE IF NOT EXISTS public.founders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  biography TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER founders_updated_at BEFORE UPDATE ON public.founders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  category TEXT,
  pricing_info TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  icon_name TEXT,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_most_requested BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_services_slug ON public.services(slug);

CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  details TEXT,
  category TEXT,
  client TEXT,
  location TEXT,
  completion_date DATE,
  project_status TEXT,
  cover_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_recent BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_slug ON public.projects(slug);

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Project images
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_images_project ON public.project_images(project_id);

-- Gallery
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_status ON public.gallery_items(status);

CREATE TRIGGER gallery_items_updated_at BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- News
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  featured_image_url TEXT,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_status ON public.news_articles(status);
CREATE INDEX idx_news_slug ON public.news_articles(slug);

CREATE TRIGGER news_articles_updated_at BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_status ON public.reviews(status);

CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(is_published, sort_order);

CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employees (private)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT,
  full_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  employment_date DATE,
  salary NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'active',
  profile_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Payroll (private)
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payroll_employee ON public.payroll_records(employee_id);

CREATE TRIGGER payroll_records_updated_at BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Expenses (private)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  expense_date DATE NOT NULL,
  vendor TEXT,
  description TEXT,
  receipt_url TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'recorded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_email TEXT,
  client_phone TEXT,
  project_name TEXT,
  project_location TEXT,
  description TEXT,
  labour_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  materials_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  equipment_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  terms_and_conditions TEXT,
  payment_terms TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quotations_updated_at BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quotation items
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  item_type TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quote ON public.quotation_items(quotation_id);

-- AI Knowledge
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  source TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_knowledge_active ON public.ai_knowledge(is_active);

CREATE TRIGGER ai_knowledge_updated_at BEFORE UPDATE ON public.ai_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);

-- ============================================
-- ROLE HELPER FUNCTIONS (after profiles table exists)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_showcase_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_showcase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Staff can read all profiles" ON public.profiles FOR SELECT USING (public.is_staff());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

-- Public read policies
CREATE POLICY "Public read published services" ON public.services FOR SELECT USING (status = 'published');
CREATE POLICY "Staff manage services" ON public.services FOR ALL USING (public.is_staff());

CREATE POLICY "Public read published projects" ON public.projects FOR SELECT USING (status = 'published');
CREATE POLICY "Staff manage projects" ON public.projects FOR ALL USING (public.is_staff());

CREATE POLICY "Public read project images" ON public.project_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.status = 'published')
);
CREATE POLICY "Staff manage project images" ON public.project_images FOR ALL USING (public.is_staff());

CREATE POLICY "Public read published gallery" ON public.gallery_items FOR SELECT USING (status = 'published');
CREATE POLICY "Staff manage gallery" ON public.gallery_items FOR ALL USING (public.is_staff());

CREATE POLICY "Public read published news" ON public.news_articles FOR SELECT USING (status = 'published');
CREATE POLICY "Staff manage news" ON public.news_articles FOR ALL USING (public.is_staff());

CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit review" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff manage reviews" ON public.reviews FOR ALL USING (public.is_staff());

CREATE POLICY "Public read published faqs" ON public.faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Staff manage faqs" ON public.faqs FOR ALL USING (public.is_staff());

CREATE POLICY "Public read active founders" ON public.founders FOR SELECT USING (is_active = true);
CREATE POLICY "Staff manage founders" ON public.founders FOR ALL USING (public.is_staff());

CREATE POLICY "Public read active heroes" ON public.hero_backgrounds FOR SELECT USING (is_active = true);
CREATE POLICY "Staff manage heroes" ON public.hero_backgrounds FOR ALL USING (public.is_staff());

CREATE POLICY "Public read showcase settings" ON public.home_showcase_settings FOR SELECT USING (true);
CREATE POLICY "Staff manage showcase settings" ON public.home_showcase_settings FOR ALL USING (public.is_staff());
CREATE POLICY "Public read active showcase items" ON public.home_showcase_items FOR SELECT USING (is_active = true);
CREATE POLICY "Staff manage showcase items" ON public.home_showcase_items FOR ALL USING (public.is_staff());

CREATE POLICY "Public read contact settings" ON public.contact_settings FOR SELECT USING (true);
CREATE POLICY "Staff manage contact" ON public.contact_settings FOR ALL USING (public.is_staff());

CREATE POLICY "Public read visible social" ON public.social_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Staff manage social" ON public.social_links FOR ALL USING (public.is_staff());

CREATE POLICY "Public read about" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Staff manage about" ON public.about_content FOR ALL USING (public.is_staff());

CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Staff manage site settings" ON public.site_settings FOR ALL USING (public.is_staff());

CREATE POLICY "Public read active ai knowledge" ON public.ai_knowledge FOR SELECT USING (is_active = true);
CREATE POLICY "Staff manage ai knowledge" ON public.ai_knowledge FOR ALL USING (public.is_staff());

-- Newsletter
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff manage newsletter" ON public.newsletter_subscribers FOR ALL USING (public.is_staff());

-- Contact messages
CREATE POLICY "Anyone can send message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read messages" ON public.contact_messages FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff update messages" ON public.contact_messages FOR UPDATE USING (public.is_staff());

-- Private HR/Finance — admin/manager only
CREATE POLICY "Admin manager read employees" ON public.employees FOR SELECT USING (public.is_admin_or_manager());
CREATE POLICY "Admin manager manage employees" ON public.employees FOR ALL USING (public.is_admin_or_manager());

CREATE POLICY "Admin manager read payroll" ON public.payroll_records FOR SELECT USING (public.is_admin_or_manager());
CREATE POLICY "Admin manager manage payroll" ON public.payroll_records FOR ALL USING (public.is_admin_or_manager());

CREATE POLICY "Admin manager read expenses" ON public.expenses FOR SELECT USING (public.is_admin_or_manager());
CREATE POLICY "Admin manager manage expenses" ON public.expenses FOR ALL USING (public.is_admin_or_manager());

CREATE POLICY "Staff manage quotations" ON public.quotations FOR ALL USING (public.is_staff());
CREATE POLICY "Staff manage quotation items" ON public.quotation_items FOR ALL USING (public.is_staff());

CREATE POLICY "Staff read activity logs" ON public.activity_logs FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (public.is_staff());

-- ============================================
-- STORAGE BUCKETS
-- ============================================

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
ON CONFLICT (id) DO NOTHING;

-- Public bucket read
CREATE POLICY "Public read media" ON storage.objects FOR SELECT
  USING (bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews'));

CREATE POLICY "Staff upload public media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews') AND public.is_staff());

CREATE POLICY "Staff update public media" ON storage.objects FOR UPDATE
  USING (bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews') AND public.is_staff())
  WITH CHECK (bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews') AND public.is_staff());

CREATE POLICY "Staff delete public media" ON storage.objects FOR DELETE
  USING (bucket_id IN ('founders', 'services', 'projects', 'gallery', 'news', 'reviews') AND public.is_staff());

-- Private buckets
CREATE POLICY "Staff read private files" ON storage.objects FOR SELECT
  USING (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff());

CREATE POLICY "Staff upload private files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff());

CREATE POLICY "Staff manage private files" ON storage.objects FOR ALL
  USING (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff())
  WITH CHECK (bucket_id IN ('employees', 'receipts', 'quotations') AND public.is_staff());
