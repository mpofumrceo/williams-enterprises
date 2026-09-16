-- Point the public contact map at Bulawayo (replaces the old Harare seed coords).
-- Safe to paste into the Supabase SQL Editor.

UPDATE public.contact_settings
SET
  map_lat = -20.1561,
  map_lng = 28.5887,
  map_zoom = 12,
  map_marker_title = COALESCE(NULLIF(map_marker_title, ''), 'Williams Enterprises, Bulawayo'),
  updated_at = NOW()
WHERE map_lat IS NULL
   OR map_lng IS NULL
   OR (
     ABS(map_lat - -17.8252) < 0.05
     AND ABS(map_lng - 31.0335) < 0.05
   );

ALTER TABLE public.contact_settings
  ALTER COLUMN map_lat SET DEFAULT -20.1561,
  ALTER COLUMN map_lng SET DEFAULT 28.5887,
  ALTER COLUMN map_zoom SET DEFAULT 12;
