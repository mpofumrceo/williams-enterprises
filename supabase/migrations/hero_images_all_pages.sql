-- Persist local public/heroes images in Supabase.
-- Safe to run more than once.
-- Does not overwrite uploaded Supabase Storage photos.

INSERT INTO public.hero_backgrounds (page_key, background_type, background_url, overlay_color, overlay_opacity, is_active)
VALUES
  ('home', 'image', '/heroes/home.jpg', '#0A2540', 0.60, true),
  ('about', 'image', '/heroes/about.jpg', '#0A2540', 0.60, true),
  ('services', 'image', '/heroes/services.jpg', '#0A2540', 0.60, true),
  ('projects', 'image', '/heroes/projects.jpg', '#0A2540', 0.60, true),
  ('gallery', 'image', '/heroes/gallery.jpg', '#0A2540', 0.60, true),
  ('news', 'image', '/heroes/news.jpg', '#0A2540', 0.60, true),
  ('contact', 'image', '/heroes/contact.jpg', '#0A2540', 0.60, true),
  ('investors', 'image', '/heroes/investors.jpg', '#0A2540', 0.60, true)
ON CONFLICT (page_key) DO NOTHING;

UPDATE public.hero_backgrounds AS h
SET
  background_url = v.background_url,
  overlay_color = '#0A2540',
  overlay_opacity = 0.60,
  is_active = true,
  updated_at = NOW()
FROM (
  VALUES
    ('home', '/heroes/home.jpg'),
    ('about', '/heroes/about.jpg'),
    ('services', '/heroes/services.jpg'),
    ('projects', '/heroes/projects.jpg'),
    ('gallery', '/heroes/gallery.jpg'),
    ('news', '/heroes/news.jpg'),
    ('contact', '/heroes/contact.jpg'),
    ('investors', '/heroes/investors.jpg')
) AS v(page_key, background_url)
WHERE h.page_key = v.page_key
  AND (
    h.background_url IS NULL
    OR btrim(h.background_url) = ''
    OR h.background_url LIKE '%images.unsplash.com%'
  );
