import { createClient } from "@/src/lib/supabase/server";
import HeroesClient from "./HeroesClient";

export default async function HeroesPage() {
  const supabase = await createClient();
  const { data: heroes } = await supabase.from("hero_backgrounds").select("*").order("page_key");

  return <HeroesClient heroes={heroes ?? []} />;
}
