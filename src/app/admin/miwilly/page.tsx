import { createClient } from "@/src/lib/supabase/server";
import MiwillyClient from "./MiwillyClient";

export default async function MiwillyPage() {
  const supabase = await createClient();
  const { data: knowledge } = await supabase
    .from("ai_knowledge")
    .select("*")
    .order("created_at", { ascending: false });

  return <MiwillyClient knowledge={knowledge ?? []} />;
}
