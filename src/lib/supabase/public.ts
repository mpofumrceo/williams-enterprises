import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/src/lib/supabase/env";

let cached: SupabaseClient | null | undefined;

/** Cookie-free anon client so public pages can be cached. */
export function createPublicClient() {
  if (cached !== undefined) return cached;

  const env = getSupabaseEnv();
  if (!env) {
    cached = null;
    return null;
  }

  cached = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cached;
}
