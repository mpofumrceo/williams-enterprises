import { createClient } from "@/src/lib/supabase/server";
import { getProfile } from "@/src/lib/auth/session";
import { canUsePOS } from "@/src/lib/permissions/roles";
import { redirect } from "next/navigation";
import PosClient from "./PosClient";
import type { PosSale, PosSaleItem, Service, Profile } from "@/src/types/database";

export default async function PosPage() {
  const profile = await getProfile();
  if (!profile || !canUsePOS(profile.role)) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const [{ data: sales }, { data: services }] = await Promise.all([
    supabase.from("pos_sales").select("*").order("sale_date", { ascending: false }).limit(50),
    supabase.from("services").select("id, name, pricing_info, short_description").eq("status", "published").order("sort_order"),
  ]);

  const saleIds = (sales ?? []).map((s) => s.id);
  const itemsBySale: Record<string, PosSaleItem[]> = {};
  if (saleIds.length) {
    const { data: items } = await supabase
      .from("pos_sale_items")
      .select("*")
      .in("sale_id", saleIds)
      .order("sort_order");
    for (const item of items ?? []) {
      if (!itemsBySale[item.sale_id]) itemsBySale[item.sale_id] = [];
      itemsBySale[item.sale_id].push(item as PosSaleItem);
    }
  }

  return (
    <PosClient
      sales={(sales as PosSale[]) ?? []}
      itemsBySale={itemsBySale}
      services={(services as Pick<Service, "id" | "name" | "pricing_info" | "short_description">[]) ?? []}
      cashier={profile as Profile}
    />
  );
}
