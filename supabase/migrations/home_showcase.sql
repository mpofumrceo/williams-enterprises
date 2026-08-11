-- Homepage video showcase — controllable from admin
-- Run in Supabase SQL Editor

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

ALTER TABLE public.home_showcase_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_showcase_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read showcase settings" ON public.home_showcase_settings;
CREATE POLICY "Public read showcase settings" ON public.home_showcase_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage showcase settings" ON public.home_showcase_settings;
CREATE POLICY "Staff manage showcase settings" ON public.home_showcase_settings
  FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Public read active showcase items" ON public.home_showcase_items;
CREATE POLICY "Public read active showcase items" ON public.home_showcase_items
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff manage showcase items" ON public.home_showcase_items;
CREATE POLICY "Staff manage showcase items" ON public.home_showcase_items
  FOR ALL USING (public.is_staff());

-- Default settings row
INSERT INTO public.home_showcase_settings (eyebrow, heading, description, cta_label, cta_url, is_enabled)
SELECT
  'Williams Enterprises',
  'See what we build',
  'A curated look at the work, craft, and capabilities behind Williams Enterprises.',
  'Explore services',
  '/services',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.home_showcase_settings LIMIT 1);

-- Seed a few starter slides if empty
INSERT INTO public.home_showcase_items (title, caption, media_url, media_type, sort_order, is_active)
SELECT * FROM (VALUES
  (
    'Planning & Design',
    'From concept to build-ready plans.',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    'image',
    1,
    true
  ),
  (
    'Structural Builds',
    'Strong frameworks for lasting projects.',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
    'image',
    2,
    true
  ),
  (
    'Finishing Excellence',
    'Detail-focused craftsmanship on every site.',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80',
    'image',
    3,
    true
  ),
  (
    'Infrastructure',
    'Paving, roofing, and site works that last.',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80',
    'image',
    4,
    true
  )
) AS v(title, caption, media_url, media_type, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.home_showcase_items LIMIT 1);
