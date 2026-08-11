import { tryCreateClient } from "@/src/lib/supabase/server";
import type { AboutContent, ContactSettings, Founder, GalleryItem, HeroBackground, NewsArticle, Project, Review, Service, SocialLink } from "@/src/types/database";

async function getClient() {
  return tryCreateClient();
}

export async function getContactSettings(): Promise<ContactSettings | null> {
  const supabase = await getClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("contact_settings").select("*").limit(1).single();
    return data as ContactSettings | null;
  } catch {
    return null;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order");
    return (data as SocialLink[]) ?? [];
  } catch {
    return [];
  }
}

export async function getServices(filters?: { featured?: boolean; trending?: boolean; mostRequested?: boolean }): Promise<Service[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    let query = supabase.from("services").select("*").eq("status", "published").order("sort_order");
    if (filters?.featured) query = query.eq("is_featured", true);
    if (filters?.trending) query = query.eq("is_trending", true);
    if (filters?.mostRequested) query = query.eq("is_most_requested", true);
    const { data } = await query;
    return (data as Service[]) ?? [];
  } catch {
    return [];
  }
}

export async function getProjects(filters?: { featured?: boolean; recent?: boolean; trending?: boolean }): Promise<Project[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    let query = supabase.from("projects").select("*").eq("status", "published").order("sort_order");
    if (filters?.featured) query = query.eq("is_featured", true);
    if (filters?.recent) query = query.eq("is_recent", true);
    if (filters?.trending) query = query.eq("is_trending", true);
    const { data } = await query;
    return (data as Project[]) ?? [];
  } catch {
    return [];
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("status", "published")
      .order("sort_order");
    return (data as GalleryItem[]) ?? [];
  } catch {
    return [];
  }
}

export async function getNewsArticles(filters?: { featured?: boolean; trending?: boolean; limit?: number }): Promise<NewsArticle[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("news_articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (filters?.featured) query = query.eq("is_featured", true);
    if (filters?.trending) query = query.eq("is_trending", true);
    if (filters?.limit) query = query.limit(filters.limit);
    const { data } = await query;
    return (data as NewsArticle[]) ?? [];
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = await getClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("news_articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    return data as NewsArticle | null;
  } catch {
    return null;
  }
}

export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

export async function getFounders(): Promise<Founder[]> {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("founders")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return (data as Founder[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAboutContent(): Promise<AboutContent | null> {
  const supabase = await getClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("about_content").select("*").limit(1).single();
    return data as AboutContent | null;
  } catch {
    return null;
  }
}

export async function getHeroBackground(pageKey: string): Promise<HeroBackground | null> {
  const supabase = await getClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("hero_backgrounds")
      .select("*")
      .eq("page_key", pageKey)
      .eq("is_active", true)
      .single();
    return data as HeroBackground | null;
  } catch {
    return null;
  }
}

export async function getSiteSetting(key: string) {
  const supabase = await getClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.from("site_settings").select("value").eq("key", key).single();
    return data?.value ?? null;
  } catch {
    return null;
  }
}

export async function getFaqs() {
  const supabase = await getClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return (data as import("@/src/types/database").Faq[]) ?? [];
  } catch {
    return [];
  }
}

export async function getHomeShowcase() {
  const supabase = await getClient();
  if (!supabase) return { settings: null, items: [] as import("@/src/types/database").HomeShowcaseItem[] };
  try {
    const [{ data: settings }, { data: items }] = await Promise.all([
      supabase.from("home_showcase_settings").select("*").limit(1).maybeSingle(),
      supabase
        .from("home_showcase_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);
    return {
      settings: (settings as import("@/src/types/database").HomeShowcaseSettings) ?? null,
      items: (items as import("@/src/types/database").HomeShowcaseItem[]) ?? [],
    };
  } catch {
    return { settings: null, items: [] };
  }
}
