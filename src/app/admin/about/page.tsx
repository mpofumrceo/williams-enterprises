import { createClient } from "@/src/lib/supabase/server";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("about_content").select("*").limit(1).single();

  return <AboutClient content={data} />;
}
