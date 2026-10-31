import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

/**
 * Returns a stable Supabase client in the browser so components can safely
 * list it in hook dependency arrays. On the server (SSR of client components)
 * a fresh client is created per call so no state is shared between requests.
 */
export function createClient(): SupabaseClient {
  const create = () =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

  if (typeof window === "undefined") return create();

  browserClient ??= create();
  return browserClient;
}
