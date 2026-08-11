import { createClient } from "@/src/lib/supabase/server";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  return <GalleryClient items={items ?? []} />;
}
