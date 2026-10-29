import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase khusus server (Server Component, Server Action, Route Handler).
// Memakai SUPABASE_SECRET_KEY supaya bisa membaca data melewati RLS.
// JANGAN impor file ini dari komponen "use client".
export function buatSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY wajib diisi di .env.local"
    );
  }

  return createClient(url, key);
}

// Client Supabase dengan cookie sesi admin (@supabase/ssr).
// Memakai SUPABASE_PUBLISHABLE_KEY agar RLS tetap berlaku.
// Dipakai untuk login, keluar, ganti password, dan aksi CRUD produk.
export async function buatSupabaseSesi() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY wajib diisi di .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
