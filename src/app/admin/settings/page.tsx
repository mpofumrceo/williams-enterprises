import { createClient } from "@/src/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");

  return <SettingsClient settings={settings ?? []} />;
}
