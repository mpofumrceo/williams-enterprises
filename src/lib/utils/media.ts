/** Shared URL helpers — safe for server and client. */

export function isVideoUrl(url: string | null | undefined) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
}

export function isOptimizableImageUrl(url: string) {
  if (url.startsWith("/")) return true;
  try {
    const host = new URL(url).hostname;
    return host.endsWith("supabase.co") || host === "images.unsplash.com";
  } catch {
    return false;
  }
}
