import type { MetadataRoute } from "next";
import { createClient } from "@/src/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createClient();

  const staticRoutes = ["", "/about", "/services", "/projects", "/gallery", "/news", "/investors", "/contact"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const { data: articles } = await supabase
    .from("news_articles")
    .select("slug, updated_at")
    .eq("status", "published");

  const newsRoutes = (articles ?? []).map((a) => ({
    url: `${base}/news/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...newsRoutes];
}
