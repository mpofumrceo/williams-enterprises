import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/src/lib/supabase/env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key."
    );
  }

  return createBrowserClient(env.url, env.anonKey);
}
