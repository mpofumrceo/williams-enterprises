import { createClient } from "@/src/lib/supabase/server";
import ContactClient from "./ContactClient";
import type { ContactMessage, SocialLink } from "@/src/types/database";

export default async function ContactPage() {
  const supabase = await createClient();
  const [{ data }, { data: messages }, { data: links }] = await Promise.all([
    supabase.from("contact_settings").select("*").limit(1).single(),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80),
    supabase.from("social_links").select("*").order("sort_order"),
  ]);

  return (
    <ContactClient
      settings={data}
      messages={(messages as ContactMessage[]) ?? []}
      socialLinks={(links as SocialLink[]) ?? []}
    />
  );
}
