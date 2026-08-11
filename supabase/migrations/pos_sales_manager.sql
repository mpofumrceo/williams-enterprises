-- Williams Enterprises — POS + Sales Manager Role Migration
-- Run this in Supabase SQL Editor AFTER using POS

-- 1) Add sales_manager to allowed roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'sales_manager', 'staff', 'user'));

-- 2) Update staff helper to include sales_manager
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'sales_manager', 'staff')
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_use_pos()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'sales_manager', 'staff')
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3) POS sales tables
CREATE TABLE IF NOT EXISTS public.pos_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed',
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_by_name TEXT,
  recorded_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER pos_sales_updated_at BEFORE UPDATE ON public.pos_sales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pos_sales_date ON public.pos_sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_pos_sales_recorded_by ON public.pos_sales(recorded_by);

CREATE TABLE IF NOT EXISTS public.pos_sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.pos_sales(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'service',
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'unit',
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_sale_items_sale ON public.pos_sale_items(sale_id);

-- 4) RLS
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "POS staff manage sales" ON public.pos_sales;
CREATE POLICY "POS staff manage sales" ON public.pos_sales
  FOR ALL USING (public.can_use_pos());

DROP POLICY IF EXISTS "POS staff manage sale items" ON public.pos_sale_items;
CREATE POLICY "POS staff manage sale items" ON public.pos_sale_items
  FOR ALL USING (public.can_use_pos());
