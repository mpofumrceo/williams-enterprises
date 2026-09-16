const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;

export function sanitizeHref(value: string | null | undefined, fallback = "/"): string {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;
  if (DANGEROUS_PROTOCOLS.test(raw)) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw.slice(0, 500);
  if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw.slice(0, 2000);
  return fallback;
}

export function safeInternalPath(value: string | null | undefined, fallback = "/admin"): string {
  const raw = (value ?? "").trim();
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  if (raw.includes("://")) return fallback;
  if (!(raw === "/admin" || raw.startsWith("/admin/"))) return fallback;
  if (raw.includes("..")) return fallback;
  return raw.slice(0, 300);
}

export function isAllowedOrigin(origin: string | null, host: string | null) {
  if (!origin || !host) return false;
  try {
    const url = new URL(origin);
    return url.host === host;
  } catch {
    return false;
  }
}
