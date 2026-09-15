import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/src/lib/supabase/public";
import { resolveHeroImage } from "@/src/lib/content/hero-images";
import type {
  AboutContent,
  ContactSettings,
  Founder,
  GalleryItem,
  HeroBackground,
  NewsArticle,
  Project,
  Review,
  Service,
  SocialLink,
} from "@/src/types/database";

function getClient() {
  return createPublicClient();
}

function cachedPublic<Args extends unknown[], Result>(
  key: string,
  fn: (...args: Args) => Promise<Result>
) {
  return cache(
    unstable_cache(fn, [key], {
      revalidate: 60,
      tags: ["public"],
    })
  );
}

export const getContactSettings = cachedPublic(
  "contact-settings",
  async (): Promise<ContactSettings | null> => {
    const supabase = getClient();
    if (!supabase) return null;
    try {
      const { data } = await supabase.from("contact_settings").select("*").limit(1).single();
      return data as ContactSettings | null;
    } catch {
      return null;
    }
  }
);

export const getSocialLinks = cachedPublic(
  "social-links",
  async (): Promise<SocialLink[]> => {
    const supabase = getClient();
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
);

export const getServices = cachedPublic(
  "services",
  async (): Promise<Service[]> => {
    const supabase = getClient();
    if (!supabase) return [];
    try {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("status", "published")
        .order("sort_order");
      return (data as Service[]) ?? [];
    } catch {
      return [];
    }
  }
);

export const getProjects = cachedPublic(
  "projects",
  async (): Promise<Project[]> => {
    const supabase = getClient();
    if (!supabase) return [];
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("sort_order");
      return (data as Project[]) ?? [];
    } catch {
      return [];
    }
  }
);

export const getGalleryItems = cachedPublic(
  "gallery-items",
  async (limit?: number): Promise<GalleryItem[]> => {
    const supabase = getClient();
    if (!supabase) return [];
    try {
      let query = supabase
        .from("gallery_items")
        .select("*")
        .eq("status", "published")
        .order("sort_order");
      if (limit) query = query.limit(limit);
      const { data } = await query;
      return (data as GalleryItem[]) ?? [];
    } catch {
      return [];
    }
  }
);

export const getNewsArticles = cachedPublic(
  "news-articles",
  async (limit?: number): Promise<NewsArticle[]> => {
    const supabase = getClient();
    if (!supabase) return [];
    try {
      let query = supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data } = await query;
      return (data as NewsArticle[]) ?? [];
    } catch {
      return [];
    }
  }
);

export const getNewsBySlug = cachedPublic(
  "news-by-slug",
  async (slug: string): Promise<NewsArticle | null> => {
    const supabase = getClient();
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
);

export const getApprovedReviews = cachedPublic(
  "approved-reviews",
  async (limit: number = 6): Promise<Review[]> => {
    const supabase = getClient();
    if (!supabase) return [];
    try {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(typeof limit === "number" ? limit : 6);
      return (data as Review[]) ?? [];
    } catch {
      return [];
    }
  }
);

export const getFounders = cachedPublic(
  "founders",
  async (): Promise<Founder[]> => {
    const supabase = getClient();
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
);

export const getAboutContent = cachedPublic(
  "about-content",
  async (): Promise<AboutContent | null> => {
    const supabase = getClient();
    if (!supabase) return null;
    try {
      const { data } = await supabase.from("about_content").select("*").limit(1).single();
      return data as AboutContent | null;
    } catch {
      return null;
    }
  }
);

export const getHeroBackground = cachedPublic(
  "hero-background",
  async (pageKey: string): Promise<HeroBackground | null> => {
    const supabase = getClient();
    const fallback = (): HeroBackground => ({
      id: `fallback-${pageKey}`,
      page_key: pageKey,
      background_type: "image",
      background_url: resolveHeroImage(pageKey),
      mobile_background_url: null,
      overlay_color: "#0A2540",
      overlay_opacity: 0.6,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!supabase) return fallback();
    try {
      const { data } = await supabase
        .from("hero_backgrounds")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_active", true)
        .maybeSingle();

      const pageHero = data as HeroBackground | null;
      if (!pageHero) return fallback();

      return {
        ...pageHero,
        background_url: resolveHeroImage(pageKey, pageHero.background_url),
      };
    } catch {
      return fallback();
    }
  }
);

export const getSiteSetting = cachedPublic(
  "site-setting",
  async (key: string) => {
    const supabase = getClient();
    if (!supabase) return null;
    try {
      const { data } = await supabase.from("site_settings").select("value").eq("key", key).single();
      return data?.value ?? null;
    } catch {
      return null;
    }
  }
);

export const getFaqs = cachedPublic(
  "faqs",
  async () => {
    const supabase = getClient();
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
);

export const getHomeShowcase = cachedPublic(
  "home-showcase",
  async () => {
    const supabase = getClient();
    if (!supabase) return { settings: null, items: [] as import("@/src/types/database").HomeShowcaseItem[] };
    try {
      const [{ data: settings }, { data: items }] = await Promise.all([
        supabase.from("home_showcase_settings").select("*").limit(1).maybeSingle(),
        supabase
          .from("home_showcase_items")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")
          .limit(8),
      ]);
      return {
        settings: (settings as import("@/src/types/database").HomeShowcaseSettings) ?? null,
        items: (items as import("@/src/types/database").HomeShowcaseItem[]) ?? [],
      };
    } catch {
      return { settings: null, items: [] };
    }
  }
);
