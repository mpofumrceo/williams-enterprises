import { headers } from "next/headers";
import { createPublicClient } from "@/src/lib/supabase/public";
import { createAdminClient } from "@/src/lib/supabase/admin";

export type RateLimitBucket =
  | "login"
  | "contact"
  | "newsletter"
  | "review"
  | "upload"
  | "ai"
  | "search";

const LIMITS: Record<RateLimitBucket, { limit: number; windowSeconds: number }> = {
  login: { limit: 5, windowSeconds: 15 * 60 },
  contact: { limit: 5, windowSeconds: 15 * 60 },
  newsletter: { limit: 8, windowSeconds: 15 * 60 },
  review: { limit: 5, windowSeconds: 60 * 60 },
  upload: { limit: 30, windowSeconds: 15 * 60 },
  ai: { limit: 20, windowSeconds: 15 * 60 },
  search: { limit: 40, windowSeconds: 15 * 60 },
};

export async function clientFingerprint() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "local";
  const ip = forwarded.split(",")[0]?.trim() || "local";
  const ua = h.get("user-agent") ?? "unknown";
  const ipHash = await sha256(`we:${ip}`);
  return { ipHash, userAgent: ua.slice(0, 300) };
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function rpcClient() {
  const publicClient = createPublicClient();
  if (publicClient) return publicClient;
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export async function consumeRateLimit(bucket: RateLimitBucket, key: string) {
  const { limit, windowSeconds } = LIMITS[bucket];
  const client = rpcClient();
  if (!client) return { ok: true, limited: false };

  const { data, error } = await client.rpc("consume_rate_limit", {
    p_key: `${bucket}:${key}`.slice(0, 240),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("rate_limit_error");
    return { ok: true, limited: false };
  }

  const allowed = data === true;
  return { ok: allowed, limited: !allowed };
}

export async function recordSecurityEvent(input: {
  eventType: string;
  email?: string | null;
  success?: boolean;
  metadata?: Record<string, unknown>;
}) {
  const client = rpcClient();
  if (!client) return;
  const { ipHash, userAgent } = await clientFingerprint();
  const { error } = await client.rpc("record_security_event", {
    p_event_type: input.eventType,
    p_email: input.email ?? null,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
    p_success: input.success ?? null,
    p_metadata: input.metadata ?? null,
  });
  if (error) console.error("security_event_error");
}
