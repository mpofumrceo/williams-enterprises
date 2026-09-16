import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { pdf } from "@react-pdf/renderer";
import { QuotationPDF } from "@/src/lib/pdf/QuotationPDF";
import type { Quotation, QuotationItem } from "@/src/types/database";
import { getProfile } from "@/src/lib/auth/session";
import { hasPermission } from "@/src/lib/security/permissions";
import { isUuid } from "@/src/lib/security/validation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await getProfile();
  if (!profile || !hasPermission(profile, "finance")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  const supabase = await createClient();

  const { data: quote } = await supabase.from("quotations").select("*").eq("id", id).single();
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: items } = await supabase
    .from("quotation_items")
    .select("*")
    .eq("quotation_id", id)
    .order("sort_order");

  const buffer = await pdf(
    <QuotationPDF quote={quote as Quotation} items={(items ?? []) as QuotationItem[]} />
  ).toBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quotation-${quote.quote_number}.pdf"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
