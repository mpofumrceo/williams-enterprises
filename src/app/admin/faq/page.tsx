import { createClient } from "@/src/lib/supabase/server";
import FaqClient from "./FaqClient";
import type { Faq } from "@/src/types/database";

export default async function FaqAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order");

  return <FaqClient faqs={(data as Faq[]) ?? []} />;
}
