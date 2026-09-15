/** Local full-screen heroes served from /public/heroes. */
export const DEFAULT_HERO_IMAGES: Record<string, string> = {
  home: "/heroes/home.jpg",
  about: "/heroes/about.jpg",
  services: "/heroes/services.jpg",
  projects: "/heroes/projects.jpg",
  gallery: "/heroes/gallery.jpg",
  news: "/heroes/news.jpg",
  contact: "/heroes/contact.jpg",
  investors: "/heroes/investors.jpg",
};

function isLocalOrUploaded(url?: string | null) {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  return !url.includes("images.unsplash.com");
}

export function resolveHeroImage(
  pageKey?: string | null,
  backgroundUrl?: string | null
) {
  if (isLocalOrUploaded(backgroundUrl)) return backgroundUrl as string;
  return DEFAULT_HERO_IMAGES[pageKey ?? "home"] || DEFAULT_HERO_IMAGES.home;
}
