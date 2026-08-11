import { createClient } from "@/src/lib/supabase/server";
import FounderClient from "./FounderClient";

export default async function FounderPage() {
  const supabase = await createClient();
  const { data: founders } = await supabase.from("founders").select("*").order("sort_order");

  return <FounderClient founders={founders ?? []} />;
}
