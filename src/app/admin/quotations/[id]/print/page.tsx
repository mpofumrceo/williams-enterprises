import { notFound } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import PrintQuotationClient from "./PrintQuotationClient";
import { isUuid } from "@/src/lib/security/validation";

export default async function PrintQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();

  const { data: quotation } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!quotation) notFound();

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", id)
    .order("sort_order");

  return <PrintQuotationClient quotation={quotation} items={items ?? []} />;
}
