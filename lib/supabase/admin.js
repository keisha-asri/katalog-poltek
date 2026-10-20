import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const cookieStore = await cookies();
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const publishableKey = (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

  if (!url || !publishableKey) {
    throw new Error("SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable.");
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Abaikan jika dipanggil dari konteks yang tidak mengizinkan modifikasi cookie
        }
      },
    },
  });
}

export const createAdminClient = createSessionClient;

export async function getUser() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

