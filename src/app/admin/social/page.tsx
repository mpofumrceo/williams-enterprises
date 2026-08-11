import { createClient } from "@/src/lib/supabase/server";
import SocialClient from "./SocialClient";

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: links } = await supabase.from("social_links").select("*").order("sort_order");

  return <SocialClient links={links ?? []} />;
}
