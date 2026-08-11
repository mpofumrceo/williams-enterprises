import { createClient } from "@/src/lib/supabase/server";
import NewsletterClient from "./NewsletterClient";

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  return <NewsletterClient subscribers={subscribers ?? []} />;
}
