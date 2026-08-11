-- Williams Enterprises — FAQ table
-- Run in Supabase SQL Editor

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

CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(is_published, sort_order);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published faqs" ON public.faqs;
CREATE POLICY "Public read published faqs" ON public.faqs
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Staff manage faqs" ON public.faqs;
CREATE POLICY "Staff manage faqs" ON public.faqs
  FOR ALL USING (public.is_staff());

-- Seed existing site FAQs (skip if already present)
INSERT INTO public.faqs (question, answer, category, is_published, sort_order)
SELECT * FROM (VALUES
  (
    'Do you provide free quotations?',
    'Yes, we provide free consultations and project quotations.',
    'General',
    true,
    1
  ),
  (
    'Do you handle residential projects?',
    'Yes, we handle residential, commercial and industrial projects.',
    'Projects',
    true,
    2
  ),
  (
    'How long does a project take?',
    'Project duration depends on complexity and scope.',
    'Projects',
    true,
    3
  ),
  (
    'Do you supply materials?',
    'Yes, we can source and supply quality construction materials.',
    'Services',
    true,
    4
  )
) AS v(question, answer, category, is_published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);
