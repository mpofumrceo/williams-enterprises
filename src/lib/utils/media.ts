/** Shared URL helpers — safe for server and client. */

export function isVideoUrl(url: string | null | undefined) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
}
