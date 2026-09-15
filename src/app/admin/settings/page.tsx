import { createClient } from "@/src/lib/supabase/server";
import SettingsClient from "./SettingsClient";
import { BrandingEditor } from "./BrandingEditor";
import { getAdminBranding } from "@/src/lib/data/cms";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, branding] = await Promise.all([
    supabase.from("site_settings").select("*").order("key"),
    getAdminBranding(),
  ]);

  return (
    <div>
      <BrandingEditor branding={branding} />
      <SettingsClient settings={settings ?? []} />
    </div>
  );
}
