const GENERIC = "Something went wrong. Please try again.";

const SAFE_PREFIXES = [
  "Unauthorized",
  "Access denied",
  "Invalid input",
  "Invalid credentials",
  "Too many requests",
  "This file type is not allowed",
  "Please ",
  "Missing ",
  "Name is required",
  "Service name is required",
];

export function publicErrorMessage(error: unknown, fallback = GENERIC) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (!message) return fallback;
  const lower = message.toLowerCase();
  if (
    lower.includes("password") ||
    lower.includes("token") ||
    lower.includes("service_role") ||
    lower.includes("api key") ||
    lower.includes("secret") ||
    lower.includes("stack") ||
    lower.includes("supabase") ||
    lower.includes("postgres") ||
    lower.includes("permission denied")
  ) {
    return fallback;
  }
  if (SAFE_PREFIXES.some((prefix) => message.startsWith(prefix))) return message;
  if (message.length <= 120 && !message.includes("\n")) return message;
  return fallback;
}

export function logServerError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : "unknown";
  console.error(`[${scope}]`, message.replace(/service_role|apikey|Bearer\s+\S+/gi, "[redacted]"));
}
