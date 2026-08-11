import { createClient } from "@/src/lib/supabase/server";
import QuotationsClient from "./QuotationsClient";

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: quotations } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .order("created_at", { ascending: false });

  return <QuotationsClient quotations={quotations ?? []} />;
}
