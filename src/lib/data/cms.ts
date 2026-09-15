import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/src/lib/supabase/public";
import { createClient } from "@/src/lib/supabase/server";
import { getProfile } from "@/src/lib/auth/session";
import { isStaffRole } from "@/src/lib/permissions/roles";
import { DEFAULT_NAV } from "@/src/lib/cms/constants";
import { FALLBACK_PAGES, fallbackPage, fallbackSections } from "@/src/lib/cms/defaults";
import { DEFAULT_THEME, isUiStyle } from "@/src/lib/cms/theme";
import type {
  FooterSettings,
  GalleryCategory,
  InvestorOpportunity,
  InvestorStatistic,
  MediaLibraryItem,
  NavigationItem,
  PageSection,
  SectionSettings,
  SiteBranding,
  SitePage,
  SiteTheme,
} from "@/src/lib/cms/types";

const DEFAULT_BRANDING: SiteBranding = {
  id: "fallback-branding",
  company_name: "Williams Enterprises",
  logo_url: "/logo.png",
  favicon_url: "/logo.png",
  tagline: "Building Today, Transforming Tomorrow",
  default_og_image: "/heroes/home.jpg",
  seo_title: "Williams Enterprises | Building Today, Transforming Tomorrow",
  seo_description:
    "Williams Enterprises delivers professional construction, renovation, infrastructure and engineering solutions in Zimbabwe.",
  seo_keywords: "construction, Zimbabwe, Bulawayo, infrastructure, engineering",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

const DEFAULT_FOOTER: FooterSettings = {
  id: "fallback-footer",
  logo_url: "/logo.png",
  description:
    "Williams Enterprises delivers reliable construction and engineering solutions with excellence.",
  copyright: "Williams Enterprises. All Rights Reserved.",
  cta_text: "Get a Quote",
  cta_url: "/contact",
  column_title: "Navigate",
  show_newsletter: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

function parseSettings(value: unknown): SectionSettings {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as SectionSettings;
  }
  return {};
}

function mapSection(row: Record<string, unknown>): PageSection {
  return {
    id: String(row.id),
    page_id: String(row.page_id),
    section_type: String(row.section_type),
    title: (row.title as string | null) ?? null,
    subtitle: (row.subtitle as string | null) ?? null,
    content: (row.content as string | null) ?? null,
    image: (row.image as string | null) ?? null,
    video_url: (row.video_url as string | null) ?? null,
    settings: parseSettings(row.settings),
    ui_style: isUiStyle(row.ui_style) ? row.ui_style : null,
    background_type: (row.background_type as PageSection["background_type"]) ?? "none",
    background_value: (row.background_value as string | null) ?? null,
    visible: Boolean(row.visible),
    status: row.status === "draft" ? "draft" : "published",
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function cachedPublic<Args extends unknown[], Result>(
  key: string,
  fn: (...args: Args) => Promise<Result>
) {
  return cache(
    unstable_cache(fn, [key], {
      revalidate: 60,
      tags: ["public", "cms"],
    })
  );
}

export const getSiteTheme = cachedPublic("cms-theme", async (): Promise<SiteTheme> => {
  const supabase = createPublicClient();
  if (!supabase) return DEFAULT_THEME;
  try {
    const { data, error } = await supabase.from("site_theme").select("*").eq("is_active", true).maybeSingle();
    if (error || !data) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...(data as SiteTheme) };
  } catch {
    return DEFAULT_THEME;
  }
});

export const getSiteBranding = cachedPublic("cms-branding", async (): Promise<SiteBranding> => {
  const supabase = createPublicClient();
  if (!supabase) return DEFAULT_BRANDING;
  try {
    const { data, error } = await supabase.from("site_branding").select("*").limit(1).maybeSingle();
    if (error || !data) return DEFAULT_BRANDING;
    return { ...DEFAULT_BRANDING, ...(data as SiteBranding) };
  } catch {
    return DEFAULT_BRANDING;
  }
});

export const getFooterSettings = cachedPublic("cms-footer", async (): Promise<FooterSettings> => {
  const supabase = createPublicClient();
  if (!supabase) return DEFAULT_FOOTER;
  try {
    const { data, error } = await supabase.from("footer_settings").select("*").limit(1).maybeSingle();
    if (error || !data) return DEFAULT_FOOTER;
    return { ...DEFAULT_FOOTER, ...(data as FooterSettings) };
  } catch {
    return DEFAULT_FOOTER;
  }
});

export const getNavigationItems = cachedPublic(
  "cms-navigation",
  async (location: "header" | "footer" | "both" = "header"): Promise<NavigationItem[]> => {
    const supabase = createPublicClient();
    if (!supabase) {
      return DEFAULT_NAV.map((item, index) => ({
        id: `fallback-nav-${index}`,
        label: item.label,
        url: item.url,
        location: "both",
        open_in_new_tab: false,
        is_enabled: true,
        sort_order: item.sort_order,
        created_at: "",
        updated_at: "",
      }));
    }
    try {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("is_enabled", true)
        .order("sort_order");
      if (error || !data?.length) {
        return DEFAULT_NAV.map((item, index) => ({
          id: `fallback-nav-${index}`,
          label: item.label,
          url: item.url,
          location: "both",
          open_in_new_tab: false,
          is_enabled: true,
          sort_order: item.sort_order,
          created_at: "",
          updated_at: "",
        }));
      }
      return (data as NavigationItem[]).filter(
        (item) => item.location === location || item.location === "both"
      );
    } catch {
      return DEFAULT_NAV.map((item, index) => ({
        id: `fallback-nav-${index}`,
        label: item.label,
        url: item.url,
        location: "both",
        open_in_new_tab: false,
        is_enabled: true,
        sort_order: item.sort_order,
        created_at: "",
        updated_at: "",
      }));
    }
  }
);

export const getPublishedPage = cachedPublic(
  "cms-page",
  async (slug: string): Promise<SitePage | null> => {
    const supabase = createPublicClient();
    if (!supabase) return fallbackPage(slug);
    try {
      const { data, error } = await supabase
        .from("site_pages")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error || !data) return fallbackPage(slug);
      return data as SitePage;
    } catch {
      return fallbackPage(slug);
    }
  }
);

export const getPublishedSections = cachedPublic(
  "cms-sections",
  async (pageId: string): Promise<PageSection[]> => {
    const fromFallback = FALLBACK_PAGES.find((p) => p.id === pageId);
    if (fromFallback) return fallbackSections(fromFallback.slug);
    const supabase = createPublicClient();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_id", pageId)
        .eq("visible", true)
        .eq("status", "published")
        .order("sort_order");
      if (error || !data?.length) {
        const page = FALLBACK_PAGES.find((p) => p.id === pageId);
        return page ? fallbackSections(page.slug) : [];
      }
      return (data as Record<string, unknown>[]).map(mapSection);
    } catch {
      return [];
    }
  }
);

export const getInvestorOpportunities = cachedPublic(
  "cms-investor-opportunities",
  async (): Promise<InvestorOpportunity[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("investor_opportunities")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error || !data) return [];
      return data as InvestorOpportunity[];
    } catch {
      return [];
    }
  }
);

export const getInvestorStatistics = cachedPublic(
  "cms-investor-statistics",
  async (): Promise<InvestorStatistic[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("investor_statistics")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error || !data) return [];
      return data as InvestorStatistic[];
    } catch {
      return [];
    }
  }
);

export const getGalleryCategories = cachedPublic(
  "cms-gallery-categories",
  async (): Promise<GalleryCategory[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error || !data) return [];
      return data as GalleryCategory[];
    } catch {
      return [];
    }
  }
);

export async function canPreviewWebsite(previewFlag?: string | string[]) {
  const flag = Array.isArray(previewFlag) ? previewFlag[0] : previewFlag;
  if (flag !== "1") return false;
  const profile = await getProfile();
  return Boolean(profile && isStaffRole(profile.role) && profile.is_active);
}

export async function getPageForRender(slug: string, preview: boolean) {
  if (preview) {
    const supabase = await createClient();
    const { data: page } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();
    if (page) {
      const { data: sections } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_id", page.id)
        .order("sort_order");
      return {
        page: page as SitePage,
        sections: ((sections ?? []) as Record<string, unknown>[]).map(mapSection),
      };
    }
  }

  const page = await getPublishedPage(slug);
  if (!page) {
    const fallback = fallbackPage(slug);
    return { page: fallback, sections: fallback ? fallbackSections(slug) : [] };
  }
  const sections = await getPublishedSections(page.id);
  if (!sections.length) {
    return { page, sections: fallbackSections(slug) };
  }
  return { page, sections };
}

export async function getAdminPages(): Promise<(SitePage & { section_count: number })[]> {
  try {
    const supabase = await createClient();
    const { data: pages, error } = await supabase.from("site_pages").select("*").order("sort_order");
    if (error) return [];
    const { data: sections } = await supabase.from("page_sections").select("id, page_id");
    const counts = new Map<string, number>();
    for (const section of sections ?? []) {
      const pageId = (section as { page_id: string }).page_id;
      counts.set(pageId, (counts.get(pageId) ?? 0) + 1);
    }
    return ((pages ?? []) as SitePage[]).map((page) => ({
      ...page,
      section_count: counts.get(page.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getAdminPage(slug: string) {
  try {
    const supabase = await createClient();
    const { data: page, error } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();
    if (error || !page) return null;
    const { data: sections } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order");
    return {
      page: page as SitePage,
      sections: ((sections ?? []) as Record<string, unknown>[]).map(mapSection),
    };
  } catch {
    return null;
  }
}

export async function getAdminTheme(): Promise<SiteTheme> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_theme").select("*").eq("is_active", true).maybeSingle();
    return data ? { ...DEFAULT_THEME, ...(data as SiteTheme) } : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export async function getAdminBranding(): Promise<SiteBranding> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_branding").select("*").limit(1).maybeSingle();
    return data ? { ...DEFAULT_BRANDING, ...(data as SiteBranding) } : DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}

export async function getAdminFooter(): Promise<FooterSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("footer_settings").select("*").limit(1).maybeSingle();
    return data ? { ...DEFAULT_FOOTER, ...(data as FooterSettings) } : DEFAULT_FOOTER;
  } catch {
    return DEFAULT_FOOTER;
  }
}

export async function getAdminNavigation(): Promise<NavigationItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("navigation_items").select("*").order("sort_order");
    return (data as NavigationItem[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminMedia(category?: string): Promise<MediaLibraryItem[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("media_library").select("*").order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    const { data } = await query;
    return (data as MediaLibraryItem[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminInvestorOpportunities(): Promise<InvestorOpportunity[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("investor_opportunities").select("*").order("sort_order");
    return (data as InvestorOpportunity[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminInvestorStatistics(): Promise<InvestorStatistic[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("investor_statistics").select("*").order("sort_order");
    return (data as InvestorStatistic[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminGalleryCategories(): Promise<GalleryCategory[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("gallery_categories").select("*").order("sort_order");
    return (data as GalleryCategory[]) ?? [];
  } catch {
    return [];
  }
}

export { DEFAULT_BRANDING, DEFAULT_FOOTER };
