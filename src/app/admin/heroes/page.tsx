import { createClient } from "@/src/lib/supabase/server";
import { ensureHeroPages } from "@/src/lib/actions/admin";
import HeroesClient from "./HeroesClient";

export default async function HeroesPage() {
  await ensureHeroPages();
  const supabase = await createClient();
  const { data: heroes } = await supabase.from("hero_backgrounds").select("*").order("page_key");

  return <HeroesClient heroes={heroes ?? []} />;
}
