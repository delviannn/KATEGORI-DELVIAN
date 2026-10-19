"use server";

import { redirect } from "next/navigation";
import { buatSupabaseSesi } from "@/lib/supabase";

// US-04: login admin dengan email dan password.
export async function login(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatSupabaseSesi();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/admin");
}

// US-04: keluar (logout) admin.
export async function keluar() {
  const supabase = await buatSupabaseSesi();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

