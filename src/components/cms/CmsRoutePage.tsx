import type { Metadata } from "next";
import { DynamicPage } from "@/src/components/cms/DynamicPage";
import type { CmsPageData } from "@/src/components/cms/page-data";
import {
  canPreviewWebsite,
  getInvestorOpportunities,
  getInvestorStatistics,
  getPageForRender,
  getPublishedPage,
  getSiteBranding,
  getSiteTheme,
} from "@/src/lib/data/cms";
import {
  getAboutContent,
  getApprovedReviews,
  getContactSettings,
  getFaqs,
  getFounders,
  getGalleryItems,
  getHeroBackground,
  getHomeShowcase,
  getNewsArticles,
  getProjects,
  getServices,
  getSocialLinks,
} from "@/src/lib/data/public";

async function loadPageData(slug: string): Promise<CmsPageData> {
  const [
    hero,
    services,
    projects,
    gallery,
    news,
    reviews,
    founders,
    about,
    contact,
    faqs,
    showcase,
    socialLinks,
    opportunities,
    investorStats,
  ] = await Promise.all([
    getHeroBackground(slug),
    getServices(),
    getProjects(),
    getGalleryItems(),
    getNewsArticles(),
    getApprovedReviews(6),
    getFounders(),
    getAboutContent(),
    getContactSettings(),
    getFaqs(),
    getHomeShowcase(),
    getSocialLinks(),
    getInvestorOpportunities(),
    getInvestorStatistics(),
  ]);

  return {
    hero,
    services,
    projects,
    gallery,
    news,
    reviews,
    founders,
    about,
    contact,
    faqs,
    showcase,
    socialLinks,
    opportunities,
    investorStats,
  };
}

export async function cmsPageMetadata(slug: string): Promise<Metadata> {
  const [page, branding] = await Promise.all([getPublishedPage(slug), getSiteBranding()]);
  const title = page?.seo_title || page?.title || branding.seo_title || "Williams Enterprises";
  const description = page?.seo_description || page?.description || branding.seo_description || undefined;
  const image = page?.og_image || branding.default_og_image || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export async function CmsRoutePage({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams?: Promise<{ preview?: string; type?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const preview = await canPreviewWebsite(params.preview);
  const [{ page, sections }, theme, data] = await Promise.all([
    getPageForRender(slug, preview),
    getSiteTheme(),
    loadPageData(slug),
  ]);

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-navy">Page unavailable</h1>
      </div>
    );
  }

  return (
    <DynamicPage
      page={page}
      sections={sections}
      data={data}
      globalStyle={theme.default_ui_style}
      enquiryType={params.type}
      preview={preview}
    />
  );
}

