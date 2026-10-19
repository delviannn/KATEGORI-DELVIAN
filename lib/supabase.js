import { createClient } from "@supabase/supabase-js";

// Client Supabase khusus server (Server Component, Server Action, Route Handler).
// Memakai SUPABASE_SECRET_KEY supaya bisa membaca data sesuai RLS.
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

