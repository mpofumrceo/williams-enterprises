import { createClient } from "@/src/lib/supabase/server";
import ShowcaseClient from "./ShowcaseClient";
import type { HomeShowcaseItem, HomeShowcaseSettings } from "@/src/types/database";

export default async function ShowcaseAdminPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: items }] = await Promise.all([
    supabase.from("home_showcase_settings").select("*").limit(1).maybeSingle(),
    supabase.from("home_showcase_items").select("*").order("sort_order"),
  ]);

  return (
    <ShowcaseClient
      settings={(settings as HomeShowcaseSettings) ?? null}
      items={(items as HomeShowcaseItem[]) ?? []}
    />
  );
}
