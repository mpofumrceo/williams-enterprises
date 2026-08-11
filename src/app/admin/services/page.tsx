import { createClient } from "@/src/lib/supabase/server";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ServicesClient services={services ?? []} />;
}
