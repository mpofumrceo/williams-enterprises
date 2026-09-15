-- Williams Enterprises — Seed Data
-- Run AFTER schema.sql

-- Contact settings
INSERT INTO public.contact_settings (phone, email, address, business_hours, whatsapp, map_lat, map_lng, map_zoom, company_description)
VALUES (
  '+263 71 298 9340',
  'williamsenterprises@gmail.com',
  'Zimbabwe',
  'Monday - Friday: 8:00 AM - 5:00 PM | Saturday: 8:00 AM - 1:00 PM',
  'https://whatsapp.com/channel/0029VbC4yuN7oQhl0vCQaM1B',
  -17.8252,
  31.0335,
  13,
  'Williams Enterprises delivers reliable construction, engineering, renovations, roofing, paving, plumbing, electrical works, and infrastructure solutions with excellence and professionalism.'
) ON CONFLICT DO NOTHING;

-- Social links
INSERT INTO public.social_links (platform, url, is_visible, sort_order) VALUES
  ('facebook', 'https://www.facebook.com/share/1D4KqPv8Jg/', true, 1),
  ('instagram', 'https://www.instagram.com/williamsenterprisesoffixial?igsh=OWc0YzNmdTFhdnRt', true, 2),
  ('whatsapp', 'https://whatsapp.com/channel/0029VbC4yuN7oQhl0vCQaM1B', true, 3)
ON CONFLICT DO NOTHING;

-- Hero backgrounds
INSERT INTO public.hero_backgrounds (page_key, background_type, background_url, overlay_color, overlay_opacity, is_active) VALUES
  ('home', 'image', '/heroes/home.jpg', '#0A2540', 0.6, true),
  ('about', 'image', '/heroes/about.jpg', '#0A2540', 0.6, true),
  ('services', 'image', '/heroes/services.jpg', '#0A2540', 0.6, true),
  ('projects', 'image', '/heroes/projects.jpg', '#0A2540', 0.6, true),
  ('gallery', 'image', '/heroes/gallery.jpg', '#0A2540', 0.6, true),
  ('news', 'image', '/heroes/news.jpg', '#0A2540', 0.6, true),
  ('contact', 'image', '/heroes/contact.jpg', '#0A2540', 0.6, true),
  ('investors', 'image', '/heroes/investors.jpg', '#0A2540', 0.6, true)
ON CONFLICT (page_key) DO NOTHING;

-- About content
INSERT INTO public.about_content (title, main_description, company_story, mission, vision, values, stats, cta_title, cta_description, cta_button_text, cta_button_url)
VALUES (
  'About Williams Enterprises',
  'Building Today, Transforming Tomorrow through quality construction, innovation, and excellence.',
  'Williams Enterprises is a trusted construction company dedicated to delivering high-quality building solutions across residential, commercial, and industrial sectors. We combine skilled workmanship, premium materials, and modern construction techniques to ensure every project meets the highest standards. From planning and design to project completion, our team works closely with clients to turn ideas into reality.',
  'To deliver exceptional construction services that exceed client expectations while maintaining the highest standards of safety, quality, and professionalism.',
  'To be the leading construction company in Zimbabwe, recognized for innovation, reliability, and transformative building solutions.',
  '["Integrity & Transparency", "Safety First", "Customer Satisfaction", "Quality Workmanship", "Innovation", "Professional Excellence"]'::jsonb,
  '[{"label": "Projects Completed", "value": "[ADD STAT]"}, {"label": "Happy Clients", "value": "[ADD STAT]"}, {"label": "Years Experience", "value": "[ADD STAT]"}, {"label": "Services Offered", "value": "16+"}]'::jsonb,
  'Ready To Build With Us?',
  'Let our team help turn your vision into reality.',
  'Get A Free Quote',
  '/contact'
);

-- Founder placeholder
INSERT INTO public.founders (name, title, biography, image_url, sort_order, is_active)
VALUES (
  '[ADD FOUNDER NAME]',
  '[ADD FOUNDER TITLE]',
  '[ADD FOUNDER BIO]',
  NULL,
  0,
  true
);

-- Services (16 from existing site)
INSERT INTO public.services (name, slug, short_description, description, category, icon_name, is_featured, is_trending, is_most_requested, status, sort_order) VALUES
  ('Pre-Construction', 'pre-construction', 'Comprehensive project preparation, feasibility studies and budgeting.', 'Comprehensive project preparation, feasibility studies and budgeting.', 'Planning', 'Building2', false, false, false, 'published', 1),
  ('Planning & Designing', 'planning-designing', 'Architectural planning and modern building design solutions.', 'Architectural planning and modern building design solutions.', 'Planning', 'PencilRuler', true, true, true, 'published', 2),
  ('Quantity Surveying', 'quantity-surveying', 'Accurate cost estimation and project financial management.', 'Accurate cost estimation and project financial management.', 'Planning', 'Calculator', false, false, false, 'published', 3),
  ('Demolition & Clearing', 'demolition-clearing', 'Safe site demolition and land preparation services.', 'Safe site demolition and land preparation services.', 'Site Work', 'Hammer', false, false, false, 'published', 4),
  ('Substructure', 'substructure', 'Strong foundations and underground construction works.', 'Strong foundations and underground construction works.', 'Structure', 'Home', false, false, false, 'published', 5),
  ('Superstructure', 'superstructure', 'Complete building framework and structural construction.', 'Complete building framework and structural construction.', 'Structure', 'Warehouse', true, false, true, 'published', 6),
  ('Roofing', 'roofing', 'All roofing styles for residential and commercial buildings.', 'All roofing styles for residential and commercial buildings.', 'Finishing', 'House', true, true, true, 'published', 7),
  ('Plastering', 'plastering', 'Professional interior and exterior wall finishing.', 'Professional interior and exterior wall finishing.', 'Finishing', 'PaintBucket', false, false, false, 'published', 8),
  ('Tiling', 'tiling', 'Floor and wall tiling with premium craftsmanship.', 'Floor and wall tiling with premium craftsmanship.', 'Finishing', 'Grid3X3', false, false, false, 'published', 9),
  ('Plumbing', 'plumbing', 'Water systems installation and maintenance.', 'Water systems installation and maintenance.', 'MEP', 'Wrench', true, false, true, 'published', 10),
  ('Electrical Works', 'electrical-works', 'Residential and commercial electrical installations.', 'Residential and commercial electrical installations.', 'MEP', 'Zap', true, true, false, 'published', 11),
  ('Carpentry', 'carpentry', 'Custom woodwork and structural carpentry services.', 'Custom woodwork and structural carpentry services.', 'Finishing', 'Drill', false, false, false, 'published', 12),
  ('Welding', 'welding', 'Steel fabrication and welding solutions.', 'Steel fabrication and welding solutions.', 'Structure', 'Cog', false, false, false, 'published', 13),
  ('Painting', 'painting', 'Professional interior and exterior painting.', 'Professional interior and exterior painting.', 'Finishing', 'Brush', false, false, false, 'published', 14),
  ('Glass Work', 'glass-work', 'Modern glass installation and glazing services.', 'Modern glass installation and glazing services.', 'Finishing', 'GlassWater', false, false, false, 'published', 15),
  ('Paving', 'paving', 'Driveways, walkways and commercial paving solutions.', 'Driveways, walkways and commercial paving solutions.', 'Infrastructure', 'Map', true, false, true, 'published', 16);

-- Projects
INSERT INTO public.projects (title, slug, description, category, cover_image_url, is_featured, is_recent, is_trending, status, sort_order) VALUES
  ('Luxury Residential Home', 'luxury-residential-home', 'A premium residential construction project showcasing modern design and quality craftsmanship.', 'Residential', '/projects/project1.jpg', true, true, false, 'published', 1),
  ('Commercial Office Complex', 'commercial-office-complex', 'A commercial office development delivering functional and professional workspace solutions.', 'Commercial', '/projects/project2.jpg', true, false, true, 'published', 2),
  ('Industrial Warehouse', 'industrial-warehouse', 'Large-scale industrial warehouse construction with structural excellence.', 'Industrial', '/projects/project3.jpg', false, true, false, 'published', 3),
  ('Roofing Project', 'roofing-project', 'Professional roofing installation for residential property.', 'Roofing', '/projects/project4.jpg', true, false, true, 'published', 4),
  ('Paving Development', 'paving-development', 'Infrastructure paving development for commercial property.', 'Infrastructure', '/projects/project5.jpg', false, true, false, 'published', 5),
  ('Modern Villa', 'modern-villa', 'Contemporary villa construction with premium finishes.', 'Residential', '/projects/project6.jpg', true, true, true, 'published', 6);

-- Gallery
INSERT INTO public.gallery_items (title, image_url, category, status, sort_order) VALUES
  ('Project 1', '/gallery/project1.jpg', 'Construction', 'published', 1),
  ('Project 2', '/gallery/project2.jpg', 'Construction', 'published', 2),
  ('Project 3', '/gallery/project3.jpg', 'Construction', 'published', 3),
  ('Project 4', '/gallery/project4.jpg', 'Construction', 'published', 4),
  ('Project 5', '/gallery/project5.jpg', 'Construction', 'published', 5),
  ('Project 6', '/gallery/project6.jpg', 'Construction', 'published', 6),
  ('Project 7', '/gallery/project7.jpg', 'Construction', 'published', 7),
  ('Project 8', '/gallery/project8.jpg', 'Construction', 'published', 8);

-- Site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'Williams Enterprises'),
  ('tagline', 'Building Today, Transforming Tomorrow'),
  ('meta_description', 'Williams Enterprises delivers professional construction, renovation, infrastructure and engineering solutions in Zimbabwe.')
ON CONFLICT (key) DO NOTHING;

-- AI Knowledge base (from existing content)
INSERT INTO public.ai_knowledge (title, content, category, source, keywords, is_active) VALUES
  ('Company Overview', 'Williams Enterprises is a trusted construction company in Zimbabwe delivering professional construction, renovation, infrastructure and engineering solutions. Tagline: Building Today, Transforming Tomorrow.', 'company', 'website', '["company", "overview", "construction", "zimbabwe"]'::jsonb, true),
  ('Contact Information', 'Phone: +263 71 298 9340. Email: williamsenterprises@gmail.com. Location: Zimbabwe. Business hours: Monday-Friday 8AM-5PM, Saturday 8AM-1PM.', 'contact', 'website', '["contact", "phone", "email", "hours"]'::jsonb, true),
  ('Services Overview', 'Williams Enterprises offers 16 construction services including Pre-Construction, Planning & Designing, Quantity Surveying, Demolition, Substructure, Superstructure, Roofing, Plastering, Tiling, Plumbing, Electrical Works, Carpentry, Welding, Painting, Glass Work, and Paving.', 'services', 'website', '["services", "construction", "building"]'::jsonb, true);

-- FAQs (skip if migration already seeded)
INSERT INTO public.faqs (question, answer, category, is_published, sort_order)
SELECT * FROM (VALUES
  ('Do you provide free quotations?', 'Yes, we provide free consultations and project quotations.', 'General', true, 1),
  ('Do you handle residential projects?', 'Yes, we handle residential, commercial and industrial projects.', 'Projects', true, 2),
  ('How long does a project take?', 'Project duration depends on complexity and scope.', 'Projects', true, 3),
  ('Do you supply materials?', 'Yes, we can source and supply quality construction materials.', 'Services', true, 4)
) AS v(question, answer, category, is_published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);

-- ============================================
-- ADMIN ROLE ASSIGNMENT
-- Run AFTER creating Auth user with email: williamsenterprisess@gmail.com
-- ============================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'williamsenterprisess@gmail.com';
