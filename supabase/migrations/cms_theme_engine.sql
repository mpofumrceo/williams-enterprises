-- Williams Enterprises — Website CMS + Theme Engine
-- Run this in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Controlled value helpers (TEXT + CHECK so existing rows stay compatible)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.ui_style AS ENUM (
    'minimalism',
    'neumorphism',
    'glassmorphism',
    'skeuomorphism',
    'claymorphism'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.animation_level AS ENUM ('none', 'subtle', 'medium', 'dynamic');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Extend existing content tables (do not drop existing data)
-- ---------------------------------------------------------------------------

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_value TEXT;

ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS map_marker_title TEXT;
ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS company_name TEXT;

DO $$ BEGIN
  ALTER TABLE public.gallery_items
    ADD CONSTRAINT gallery_items_media_type_check
    CHECK (media_type IN ('image', 'video'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Branding + SEO (single row)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL DEFAULT 'Williams Enterprises',
  logo_url TEXT,
  favicon_url TEXT,
  tagline TEXT DEFAULT 'Building Today, Transforming Tomorrow',
  default_og_image TEXT,
  seo_title TEXT DEFAULT 'Williams Enterprises | Building Today, Transforming Tomorrow',
  seo_description TEXT DEFAULT 'Williams Enterprises delivers professional construction, renovation, infrastructure and engineering solutions in Zimbabwe.',
  seo_keywords TEXT DEFAULT 'construction, Zimbabwe, Bulawayo, infrastructure, engineering',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS site_branding_updated_at ON public.site_branding;
CREATE TRIGGER site_branding_updated_at BEFORE UPDATE ON public.site_branding
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Theme (single active row; colors, typography, default UI style, animation)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_theme (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Williams Enterprises',
  is_active BOOLEAN NOT NULL DEFAULT true,
  primary_color TEXT NOT NULL DEFAULT '#0a2540',
  secondary_color TEXT NOT NULL DEFAULT '#071b2d',
  accent_color TEXT NOT NULL DEFAULT '#d97706',
  background_color TEXT NOT NULL DEFAULT '#f6f3ee',
  surface_color TEXT NOT NULL DEFAULT '#ffffff',
  text_color TEXT NOT NULL DEFAULT '#111827',
  muted_text_color TEXT NOT NULL DEFAULT '#64748b',
  border_color TEXT NOT NULL DEFAULT '#d7dee8',
  button_color TEXT NOT NULL DEFAULT '#d97706',
  button_text_color TEXT NOT NULL DEFAULT '#0a2540',
  success_color TEXT NOT NULL DEFAULT '#16a34a',
  warning_color TEXT NOT NULL DEFAULT '#d97706',
  error_color TEXT NOT NULL DEFAULT '#dc2626',
  heading_font TEXT NOT NULL DEFAULT 'Inter',
  body_font TEXT NOT NULL DEFAULT 'Inter',
  accent_font TEXT NOT NULL DEFAULT 'Inter',
  heading_weight INTEGER NOT NULL DEFAULT 700,
  body_weight INTEGER NOT NULL DEFAULT 400,
  base_font_size INTEGER NOT NULL DEFAULT 16,
  heading_scale NUMERIC(4,2) NOT NULL DEFAULT 1.25,
  line_height NUMERIC(4,2) NOT NULL DEFAULT 1.60,
  letter_spacing NUMERIC(4,2) NOT NULL DEFAULT 0,
  default_ui_style TEXT NOT NULL DEFAULT 'skeuomorphism'
    CHECK (default_ui_style IN ('minimalism', 'neumorphism', 'glassmorphism', 'skeuomorphism', 'claymorphism')),
  admin_ui_style TEXT NOT NULL DEFAULT 'claymorphism'
    CHECK (admin_ui_style IN ('minimalism', 'neumorphism', 'glassmorphism', 'skeuomorphism', 'claymorphism')),
  animation_level TEXT NOT NULL DEFAULT 'medium'
    CHECK (animation_level IN ('none', 'subtle', 'medium', 'dynamic')),
  enable_page_transitions BOOLEAN NOT NULL DEFAULT true,
  enable_scroll_reveals BOOLEAN NOT NULL DEFAULT true,
  enable_hover_effects BOOLEAN NOT NULL DEFAULT true,
  enable_parallax BOOLEAN NOT NULL DEFAULT false,
  enable_floating BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS site_theme_updated_at ON public.site_theme;
CREATE TRIGGER site_theme_updated_at BEFORE UPDATE ON public.site_theme
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS site_theme_one_active
  ON public.site_theme ((is_active))
  WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  ui_style TEXT
    CHECK (ui_style IS NULL OR ui_style IN ('minimalism', 'neumorphism', 'glassmorphism', 'skeuomorphism', 'claymorphism')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS site_pages_updated_at ON public.site_pages;
CREATE TRIGGER site_pages_updated_at BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_site_pages_published ON public.site_pages (published);

-- ---------------------------------------------------------------------------
-- Page sections
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.site_pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image TEXT,
  video_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  ui_style TEXT
    CHECK (ui_style IS NULL OR ui_style IN ('minimalism', 'neumorphism', 'glassmorphism', 'skeuomorphism', 'claymorphism')),
  background_type TEXT NOT NULL DEFAULT 'none'
    CHECK (background_type IN ('none', 'color', 'image', 'video', 'gradient')),
  background_value TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS page_sections_updated_at ON public.page_sections;
CREATE TRIGGER page_sections_updated_at BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_page_sections_page ON public.page_sections (page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_page_sections_visible ON public.page_sections (page_id, visible, status);

-- ---------------------------------------------------------------------------
-- Navigation
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'header'
    CHECK (location IN ('header', 'footer', 'both')),
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS navigation_items_updated_at ON public.navigation_items;
CREATE TRIGGER navigation_items_updated_at BEFORE UPDATE ON public.navigation_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_navigation_items_location ON public.navigation_items (location, sort_order);

-- ---------------------------------------------------------------------------
-- Footer
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.footer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url TEXT,
  description TEXT,
  copyright TEXT DEFAULT 'Williams Enterprises. All Rights Reserved.',
  cta_text TEXT DEFAULT 'Get a Quote',
  cta_url TEXT DEFAULT '/contact',
  column_title TEXT DEFAULT 'Navigate',
  show_newsletter BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS footer_settings_updated_at ON public.footer_settings;
CREATE TRIGGER footer_settings_updated_at BEFORE UPDATE ON public.footer_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  alt_text TEXT,
  url TEXT NOT NULL,
  storage_path TEXT,
  bucket TEXT NOT NULL DEFAULT 'website-media',
  folder TEXT,
  mime_type TEXT,
  media_kind TEXT NOT NULL DEFAULT 'image'
    CHECK (media_kind IN ('image', 'video', 'document')),
  category TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS media_library_updated_at ON public.media_library;
CREATE TRIGGER media_library_updated_at BEFORE UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_media_library_category ON public.media_library (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_kind ON public.media_library (media_kind);

-- ---------------------------------------------------------------------------
-- Gallery categories
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS gallery_categories_updated_at ON public.gallery_categories;
CREATE TRIGGER gallery_categories_updated_at BEFORE UPDATE ON public.gallery_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Investor CMS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.investor_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  location TEXT,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'open',
  timeline TEXT,
  image_url TEXT,
  investment_requirement TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS investor_opportunities_updated_at ON public.investor_opportunities;
CREATE TRIGGER investor_opportunities_updated_at BEFORE UPDATE ON public.investor_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.investor_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS investor_statistics_updated_at ON public.investor_statistics;
CREATE TRIGGER investor_statistics_updated_at BEFORE UPDATE ON public.investor_statistics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_statistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site branding" ON public.site_branding;
CREATE POLICY "Public read site branding" ON public.site_branding FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage site branding" ON public.site_branding;
CREATE POLICY "Staff manage site branding" ON public.site_branding FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read active theme" ON public.site_theme;
CREATE POLICY "Public read active theme" ON public.site_theme FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Staff manage theme" ON public.site_theme;
CREATE POLICY "Staff manage theme" ON public.site_theme FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read published pages" ON public.site_pages;
CREATE POLICY "Public read published pages" ON public.site_pages FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Staff manage pages" ON public.site_pages;
CREATE POLICY "Staff manage pages" ON public.site_pages FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read published sections" ON public.page_sections;
CREATE POLICY "Public read published sections" ON public.page_sections FOR SELECT USING (
  visible = true
  AND status = 'published'
  AND EXISTS (SELECT 1 FROM public.site_pages p WHERE p.id = page_id AND p.published = true)
);
DROP POLICY IF EXISTS "Staff manage sections" ON public.page_sections;
CREATE POLICY "Staff manage sections" ON public.page_sections FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read enabled navigation" ON public.navigation_items;
CREATE POLICY "Public read enabled navigation" ON public.navigation_items FOR SELECT USING (is_enabled = true);
DROP POLICY IF EXISTS "Staff manage navigation" ON public.navigation_items;
CREATE POLICY "Staff manage navigation" ON public.navigation_items FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read footer" ON public.footer_settings;
CREATE POLICY "Public read footer" ON public.footer_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage footer" ON public.footer_settings;
CREATE POLICY "Staff manage footer" ON public.footer_settings FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read media library" ON public.media_library;
CREATE POLICY "Public read media library" ON public.media_library FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage media library" ON public.media_library;
CREATE POLICY "Staff manage media library" ON public.media_library FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read gallery categories" ON public.gallery_categories;
CREATE POLICY "Public read gallery categories" ON public.gallery_categories FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Staff manage gallery categories" ON public.gallery_categories;
CREATE POLICY "Staff manage gallery categories" ON public.gallery_categories FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read investor opportunities" ON public.investor_opportunities;
CREATE POLICY "Public read investor opportunities" ON public.investor_opportunities FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Staff manage investor opportunities" ON public.investor_opportunities;
CREATE POLICY "Staff manage investor opportunities" ON public.investor_opportunities FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public read investor statistics" ON public.investor_statistics;
CREATE POLICY "Public read investor statistics" ON public.investor_statistics FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Staff manage investor statistics" ON public.investor_statistics;
CREATE POLICY "Staff manage investor statistics" ON public.investor_statistics FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage: website-media
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('website-media', 'website-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read website media" ON storage.objects;
CREATE POLICY "Public read website media" ON storage.objects FOR SELECT
  USING (bucket_id = 'website-media');

DROP POLICY IF EXISTS "Staff upload website media" ON storage.objects;
CREATE POLICY "Staff upload website media" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'website-media' AND public.is_staff());

DROP POLICY IF EXISTS "Staff update website media" ON storage.objects;
CREATE POLICY "Staff update website media" ON storage.objects FOR UPDATE
  USING (bucket_id = 'website-media' AND public.is_staff())
  WITH CHECK (bucket_id = 'website-media' AND public.is_staff());

DROP POLICY IF EXISTS "Staff delete website media" ON storage.objects;
CREATE POLICY "Staff delete website media" ON storage.objects FOR DELETE
  USING (bucket_id = 'website-media' AND public.is_staff());

-- ---------------------------------------------------------------------------
-- Seed: branding, theme, footer
-- ---------------------------------------------------------------------------

INSERT INTO public.site_branding (
  id, company_name, logo_url, favicon_url, tagline, default_og_image, seo_title, seo_description, seo_keywords
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Williams Enterprises',
  '/logo.png',
  '/logo.png',
  'Building Today, Transforming Tomorrow',
  '/heroes/home.jpg',
  'Williams Enterprises | Building Today, Transforming Tomorrow',
  'Williams Enterprises delivers professional construction, renovation, infrastructure and engineering solutions in Zimbabwe.',
  'construction, Zimbabwe, Bulawayo, infrastructure, engineering, Williams Enterprises'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_theme (
  id, name, is_active, default_ui_style, admin_ui_style, animation_level
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Construction Premium',
  true,
  'skeuomorphism',
  'claymorphism',
  'medium'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.footer_settings (
  id, logo_url, description, copyright, cta_text, cta_url, column_title, show_newsletter
) VALUES (
  '10000000-0000-0000-0000-000000000003',
  '/logo.png',
  'Williams Enterprises delivers reliable construction and engineering solutions with excellence.',
  'Williams Enterprises. All Rights Reserved.',
  'Get a Quote',
  '/contact',
  'Navigate',
  true
) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: eight public pages
-- ---------------------------------------------------------------------------

INSERT INTO public.site_pages (id, slug, title, description, published, seo_title, seo_description, ui_style, sort_order)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'home', 'Home', 'Williams Enterprises homepage', true,
    'Williams Enterprises | Building Today, Transforming Tomorrow',
    'Construction, infrastructure and engineering in Zimbabwe — delivered with the discipline of a builder and the outlook of a long-term partner.',
    'glassmorphism', 1),
  ('20000000-0000-0000-0000-000000000002', 'about', 'About', 'Company story, mission and leadership', true,
    'About Us', 'Learn about Williams Enterprises — our story, mission, vision, and the team building Zimbabwe''s future.',
    'skeuomorphism', 2),
  ('20000000-0000-0000-0000-000000000003', 'services', 'Services', 'Construction and engineering services', true,
    'Services', 'Explore Williams Enterprises construction services — from pre-construction planning to roofing, plumbing, electrical, and more.',
    'neumorphism', 3),
  ('20000000-0000-0000-0000-000000000004', 'projects', 'Projects', 'Completed and ongoing construction projects', true,
    'Projects', 'Explore Williams Enterprises completed and ongoing construction projects across residential, commercial, and industrial sectors.',
    'skeuomorphism', 4),
  ('20000000-0000-0000-0000-000000000005', 'gallery', 'Gallery', 'Construction portfolio gallery', true,
    'Gallery', 'Browse the Williams Enterprises construction portfolio — completed projects, milestones, and quality workmanship.',
    'minimalism', 5),
  ('20000000-0000-0000-0000-000000000006', 'news', 'News', 'Company news and insights', true,
    'News', 'Stay updated with the latest news, insights, and announcements from Williams Enterprises.',
    'minimalism', 6),
  ('20000000-0000-0000-0000-000000000007', 'investors', 'Investors', 'Investment opportunities and partnerships', true,
    'Investors', 'Invest in Williams Enterprises — construction, development and partnership opportunities in Zimbabwe.',
    'glassmorphism', 7),
  ('20000000-0000-0000-0000-000000000008', 'contact', 'Contact', 'Contact Williams Enterprises', true,
    'Contact', 'Contact Williams Enterprises in Bulawayo for construction quotes, partnerships and investment enquiries.',
    'neumorphism', 8)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  seo_title = COALESCE(public.site_pages.seo_title, EXCLUDED.seo_title),
  seo_description = COALESCE(public.site_pages.seo_description, EXCLUDED.seo_description);

-- ---------------------------------------------------------------------------
-- Seed: navigation
-- ---------------------------------------------------------------------------

INSERT INTO public.navigation_items (id, label, url, location, is_enabled, sort_order)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'Home', '/', 'both', true, 1),
  ('30000000-0000-0000-0000-000000000002', 'About', '/about', 'both', true, 2),
  ('30000000-0000-0000-0000-000000000003', 'Services', '/services', 'both', true, 3),
  ('30000000-0000-0000-0000-000000000004', 'Projects', '/projects', 'both', true, 4),
  ('30000000-0000-0000-0000-000000000005', 'Gallery', '/gallery', 'both', true, 5),
  ('30000000-0000-0000-0000-000000000006', 'News', '/news', 'both', true, 6),
  ('30000000-0000-0000-0000-000000000007', 'Investors', '/investors', 'both', true, 7),
  ('30000000-0000-0000-0000-000000000008', 'Contact', '/contact', 'both', true, 8)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: investor opportunities (copy from current Investors page)
-- ---------------------------------------------------------------------------

INSERT INTO public.investor_opportunities (id, title, location, description, category, status, featured, published, sort_order)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Joint ventures', 'Zimbabwe',
    'Co-develop residential, commercial and infrastructure projects with shared local delivery.',
    'Partnership', 'open', true, true, 1),
  ('40000000-0000-0000-0000-000000000002', 'Project capital', 'Zimbabwe',
    'Fund specific builds from groundbreaking through handover, with clear scope and reporting.',
    'Capital', 'open', true, true, 2),
  ('40000000-0000-0000-0000-000000000003', 'Strategic partnerships', 'Zimbabwe',
    'Long-term alliances across construction, renovation and engineering services.',
    'Partnership', 'open', true, true, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.gallery_categories (id, name, slug, sort_order, published)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'Projects', 'projects', 1, true),
  ('50000000-0000-0000-0000-000000000002', 'Sites', 'sites', 2, true),
  ('50000000-0000-0000-0000-000000000003', 'Team', 'team', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: page sections (only insert if the page currently has none)
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  home_id UUID := '20000000-0000-0000-0000-000000000001';
  about_id UUID := '20000000-0000-0000-0000-000000000002';
  services_id UUID := '20000000-0000-0000-0000-000000000003';
  projects_id UUID := '20000000-0000-0000-0000-000000000004';
  gallery_id UUID := '20000000-0000-0000-0000-000000000005';
  news_id UUID := '20000000-0000-0000-0000-000000000006';
  investors_id UUID := '20000000-0000-0000-0000-000000000007';
  contact_id UUID := '20000000-0000-0000-0000-000000000008';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = home_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (home_id, 'hero', 'Building Today.', 'Investing in Tomorrow.',
        'Construction, infrastructure and engineering in Zimbabwe — delivered with the discipline of a builder and the outlook of a long-term partner.',
        'glassmorphism', true, 'published', 1,
        jsonb_build_object(
          'eyebrow', 'Williams Enterprises',
          'heading_line_2', 'Investing in Tomorrow.',
          'button_text', 'Request a Quote',
          'button_url', '/contact',
          'button2_text', 'Explore Investment',
          'button2_url', '/investors',
          'show_stats', true,
          'show_phone', true
        )),
      (home_id, 'showcase', 'Home Showcase', NULL, NULL, NULL, true, 'published', 2, '{}'::jsonb),
      (home_id, 'intro', 'About Williams Enterprises', NULL, NULL, 'skeuomorphism', true, 'published', 3,
        jsonb_build_object('eyebrow', 'Company', 'button_text', 'Learn more', 'button_url', '/about', 'show_founder', true)),
      (home_id, 'stats', 'Williams Enterprises at a glance', NULL, NULL, 'neumorphism', true, 'published', 4,
        jsonb_build_object('eyebrow', 'By the numbers', 'dark', true)),
      (home_id, 'services', 'Featured services', 'Signature capabilities from planning through finishing.', NULL, 'skeuomorphism', true, 'published', 5,
        jsonb_build_object('eyebrow', 'Services', 'featured_only', true, 'limit', 4, 'button_text', 'View all services →', 'button_url', '/services')),
      (home_id, 'projects', 'Recent projects', 'Latest construction work from our sites.', NULL, 'glassmorphism', true, 'published', 6,
        jsonb_build_object('eyebrow', 'Portfolio', 'recent_only', true, 'limit', 4, 'dark', true, 'button_text', 'View all projects', 'button_url', '/projects')),
      (home_id, 'features', 'Built for trust on site', 'The qualities clients and partners should expect from a construction operator.', NULL, 'skeuomorphism', true, 'published', 7,
        jsonb_build_object(
          'eyebrow', 'Why Williams Enterprises',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Experience', 'text', 'Skilled teams delivering residential, commercial and infrastructure work.'),
            jsonb_build_object('title', 'Quality', 'text', 'Materials, methods and supervision that stand up on site.'),
            jsonb_build_object('title', 'Delivery', 'text', 'Clear programmes and accountable handover.'),
            jsonb_build_object('title', 'Partnership', 'text', 'Clients and investors who want a reliable local operator.')
          )
        )),
      (home_id, 'investment', 'A local builder with a long horizon',
        'Joint ventures, project capital and partnerships for people who want to back real construction in Zimbabwe.',
        NULL, 'glassmorphism', true, 'published', 8,
        jsonb_build_object('eyebrow', 'Investment', 'dark', true, 'button_text', 'Explore Investment Opportunities', 'button_url', '/investors')),
      (home_id, 'gallery', 'From the gallery', 'A snapshot of quality on site.', NULL, 'minimalism', true, 'published', 9,
        jsonb_build_object('eyebrow', 'Gallery', 'limit', 4, 'button_text', 'View full gallery →', 'button_url', '/gallery')),
      (home_id, 'news', 'Latest news', NULL, NULL, 'minimalism', true, 'published', 10,
        jsonb_build_object('eyebrow', 'News', 'featured_only', true, 'limit', 3)),
      (home_id, 'reviews', 'Reviews', NULL, NULL, NULL, true, 'published', 11, '{}'::jsonb),
      (home_id, 'faq', 'FAQ', NULL, NULL, NULL, true, 'published', 12, '{}'::jsonb),
      (home_id, 'cta', 'Let''s build something that matters.',
        'Talk to Williams Enterprises about construction, development or partnership.',
        NULL, 'claymorphism', true, 'published', 13,
        jsonb_build_object(
          'button_text', 'Contact Us',
          'button_url', '/contact',
          'button2_text', 'Request a Quote',
          'button2_url', '/contact?type=quote',
          'show_contact', true
        ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = about_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (about_id, 'hero', 'About Williams Enterprises',
        'Building Today, Transforming Tomorrow through quality construction, innovation, and excellence.',
        NULL, 'skeuomorphism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'ABOUT US')),
      (about_id, 'intro', 'Building Strong Structures That Last Generations', NULL, NULL, 'skeuomorphism', true, 'published', 2,
        jsonb_build_object('eyebrow', 'WHO WE ARE', 'show_values', true)),
      (about_id, 'leadership', 'Meet Our Founders', NULL, NULL, 'skeuomorphism', true, 'published', 3,
        jsonb_build_object('eyebrow', 'LEADERSHIP')),
      (about_id, 'stats', 'Our Impact', NULL, NULL, 'glassmorphism', true, 'published', 4,
        jsonb_build_object('eyebrow', 'BY THE NUMBERS', 'dark', true)),
      (about_id, 'services', 'Our Services', NULL, NULL, 'skeuomorphism', true, 'published', 5,
        jsonb_build_object('eyebrow', 'WHAT WE DO', 'featured_only', true, 'limit', 4, 'button_text', 'View all →', 'button_url', '/services')),
      (about_id, 'projects', 'Recent Projects', NULL, NULL, 'skeuomorphism', true, 'published', 6,
        jsonb_build_object('eyebrow', 'OUR WORK', 'recent_only', true, 'limit', 4, 'button_text', 'View all →', 'button_url', '/projects')),
      (about_id, 'mission_vision', 'Mission & Vision', NULL, NULL, 'skeuomorphism', true, 'published', 7, '{}'::jsonb),
      (about_id, 'features', 'Our Competitive Advantage', NULL, NULL, 'neumorphism', true, 'published', 8,
        jsonb_build_object(
          'eyebrow', 'WHY CHOOSE US',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Experienced Team', 'text', 'Skilled professionals committed to delivering exceptional construction results.'),
            jsonb_build_object('title', 'Guaranteed Quality', 'text', 'We use premium materials and proven construction methods for long-lasting structures.'),
            jsonb_build_object('title', 'Trusted Reputation', 'text', 'We prioritize client satisfaction and timely project delivery.')
          )
        )),
      (about_id, 'cta', 'Ready To Work With Us?',
        'Let''s discuss your next construction project and bring your vision to life.',
        NULL, 'claymorphism', true, 'published', 9,
        jsonb_build_object('button_text', 'Get In Touch', 'button_url', '/contact'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = services_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (services_id, 'hero', 'Construction Services',
        'From pre-construction planning to finishing — residential, commercial and infrastructure delivery.',
        NULL, 'neumorphism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'SERVICES')),
      (services_id, 'services', 'Our services', 'Browse the full catalogue of published Williams Enterprises services.', NULL, 'skeuomorphism', true, 'published', 2,
        jsonb_build_object('eyebrow', 'Catalogue', 'limit', 48, 'show_filters', true)),
      (services_id, 'cta', 'Need a construction partner?',
        'Tell us about the build and we will respond with a practical next step.',
        NULL, 'claymorphism', true, 'published', 3,
        jsonb_build_object('button_text', 'Request a Quote', 'button_url', '/contact?type=quote'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = projects_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (projects_id, 'hero', 'Construction Projects',
        'Explore our completed and ongoing projects demonstrating our commitment to quality and excellence.',
        NULL, 'skeuomorphism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'OUR PROJECTS')),
      (projects_id, 'projects', 'Featured projects', 'Signature builds that show the standard of Williams Enterprises workmanship.', NULL, 'skeuomorphism', true, 'published', 2,
        jsonb_build_object('eyebrow', 'Featured', 'featured_only', true, 'limit', 4)),
      (projects_id, 'projects', 'All projects', NULL, NULL, 'minimalism', true, 'published', 3,
        jsonb_build_object('eyebrow', 'Portfolio', 'limit', 48, 'show_filters', true)),
      (projects_id, 'cta', 'Have a project in mind?',
        'Talk to the Williams Enterprises team about construction, development or partnership.',
        NULL, 'claymorphism', true, 'published', 4,
        jsonb_build_object('button_text', 'Start a conversation', 'button_url', '/contact'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = gallery_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (gallery_id, 'hero', 'Our Construction Portfolio',
        'A showcase of our completed projects, construction milestones, and quality workmanship.',
        NULL, 'minimalism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'PROJECT GALLERY')),
      (gallery_id, 'gallery', 'Gallery', NULL, NULL, 'minimalism', true, 'published', 2,
        jsonb_build_object('show_categories', true, 'limit', 60)),
      (gallery_id, 'cta', 'See the work on site',
        'Contact Williams Enterprises to discuss your next build.',
        NULL, 'claymorphism', true, 'published', 3,
        jsonb_build_object('button_text', 'Contact Us', 'button_url', '/contact'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = news_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (news_id, 'hero', 'Latest from Williams Enterprises',
        'Industry updates, project highlights, and company news from our team.',
        NULL, 'minimalism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'NEWS & INSIGHTS')),
      (news_id, 'news', 'Featured stories', 'Top stories and announcements from Williams Enterprises.', NULL, 'skeuomorphism', true, 'published', 2,
        jsonb_build_object('eyebrow', 'Featured', 'featured_only', true, 'limit', 4)),
      (news_id, 'news', 'All news', NULL, NULL, 'minimalism', true, 'published', 3,
        jsonb_build_object('eyebrow', 'Updates', 'limit', 24)),
      (news_id, 'cta', 'Want to work with us?',
        'Get in touch about construction, investment or partnership.',
        NULL, 'claymorphism', true, 'published', 4,
        jsonb_build_object('button_text', 'Contact Us', 'button_url', '/contact'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = investors_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (investors_id, 'hero', 'Invest in real construction',
        'Joint ventures, project capital and long-term partnerships with a Zimbabwe operator that builds.',
        NULL, 'glassmorphism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'Investors', 'button_text', 'Talk to us', 'button_url', '/contact?type=investment')),
      (investors_id, 'intro', 'A local builder with institutional discipline',
        'Williams Enterprises presents construction, development and partnership opportunities grounded in published work — not invented returns.',
        NULL, 'skeuomorphism', true, 'published', 2,
        jsonb_build_object('eyebrow', 'Overview')),
      (investors_id, 'stats', 'By the numbers', NULL, NULL, 'neumorphism', true, 'published', 3,
        jsonb_build_object('eyebrow', 'Portfolio', 'dark', true, 'source', 'investor')),
      (investors_id, 'opportunities', 'How partners work with us', NULL, NULL, 'glassmorphism', true, 'published', 4,
        jsonb_build_object('eyebrow', 'Opportunities')),
      (investors_id, 'pipeline', 'Development pipeline', NULL, NULL, 'skeuomorphism', true, 'published', 5,
        jsonb_build_object('eyebrow', 'Projects')),
      (investors_id, 'strategy', 'Investment strategy',
        'We look for partners who want to back actual construction in Zimbabwe — residential, commercial and infrastructure — with clear scope, accountable delivery and local execution.',
        NULL, 'minimalism', true, 'published', 6,
        jsonb_build_object('eyebrow', 'Approach')),
      (investors_id, 'cta', 'Start a confidential conversation',
        'Share your interest and the Williams Enterprises team will respond.',
        NULL, 'claymorphism', true, 'published', 7,
        jsonb_build_object('button_text', 'Contact investors desk', 'button_url', '/contact?type=investment'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = contact_id) THEN
    INSERT INTO public.page_sections (page_id, section_type, title, subtitle, content, ui_style, visible, status, sort_order, settings)
    VALUES
      (contact_id, 'hero', 'Let''s build together',
        'Quotes, site visits, partnerships and investment enquiries — one team in Bulawayo.',
        NULL, 'neumorphism', true, 'published', 1,
        jsonb_build_object('eyebrow', 'CONTACT')),
      (contact_id, 'contact_info', 'Contact information', NULL, NULL, 'skeuomorphism', true, 'published', 2,
        jsonb_build_object('eyebrow', 'Reach us')),
      (contact_id, 'contact_form', 'Send an enquiry', 'Tell us what you need and we will route it to the right person.', NULL, 'neumorphism', true, 'published', 3,
        jsonb_build_object('eyebrow', 'Enquiry')),
      (contact_id, 'map', 'Find us', NULL, NULL, 'minimalism', true, 'published', 4,
        jsonb_build_object('eyebrow', 'Location')),
      (contact_id, 'cta', 'Prefer to talk first?',
        'Call or message Williams Enterprises using the numbers in Website Settings.',
        NULL, 'claymorphism', true, 'published', 5,
        jsonb_build_object('show_contact', true));
  END IF;
END $$;
