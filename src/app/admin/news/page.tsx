import { createClient } from "@/src/lib/supabase/server";
import NewsClient from "./NewsClient";

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("news_articles")
    .select("*")
    .order("created_at", { ascending: false });

  return <NewsClient articles={articles ?? []} />;
}
