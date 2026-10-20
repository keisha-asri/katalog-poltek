import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServerClient() {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const secretKey = (process.env.SUPABASE_SECRET_KEY || "").trim();

  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable.");
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createClient = createServerClient;
export default createServerClient;

