-- Protect williamsenterprisess@gmail.com as permanent super admin
-- Run in Supabase SQL Editor

-- Ensure account is admin + active if it exists
UPDATE public.profiles
SET role = 'admin', is_active = true
WHERE lower(email) = 'williamsenterprisess@gmail.com';

-- Auto-assign admin when this email signs up
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
