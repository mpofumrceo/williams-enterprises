import { createClient } from "@/src/lib/supabase/server";
import ContactClient from "./ContactClient";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("contact_settings").select("*").limit(1).single();

  return <ContactClient settings={data} />;
}
