"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatSupabaseSesi } from "@/lib/supabase";

// Helper validasi link gambar aman (mencegah javascript: atau protocol injection)
function sanitizeFotoUrl(url) {
  if (!url || typeof url !== "string") return "/produk/placeholder.svg";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed.slice(0, 500);
  }
  return "/produk/placeholder.svg";
}

// US-04: login admin dengan email dan password.
export async function login(_prevState, formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // Validasi format email dasar
  if (!email.includes("@") || email.length > 255) {
    return { error: "Format email tidak valid." };
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

// US-05: ganti password admin yang sedang login.
export async function gantiPassword(_prevState, formData) {
  const passwordBaru = formData.get("password_baru")?.toString();
  const konfirmasi = formData.get("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasi) {
    return { error: "Semua field wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru.length > 72) {
    return { error: "Password terlalu panjang (maksimal 72 karakter)." };
  }

  if (passwordBaru !== konfirmasi) {
    return { error: "Password baru dan konfirmasi tidak sama." };
  }

  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: "Gagal mengganti password: " + error.message };
  }

  return { sukses: "Password berhasil diganti." };
}

// US-08: tambah produk baru (terproteksi login & validasi input ketat)
export async function tambahProduk(_prevState, formData) {
  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga");
  const harga = hargaRaw ? parseInt(hargaRaw.toString(), 10) : NaN;
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = sanitizeFotoUrl(formData.get("foto_url")?.toString());
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (nama.length > 150) {
    return { error: "Nama produk maksimal 150 karakter." };
  }

  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka positif." };
  }
  if (harga > 1000000000) {
    return { error: "Harga produk melebihi batas wajar." };
  }

  const { error } = await supabase.from("produk").insert({
    nama: nama.slice(0, 150),
    harga: Math.floor(harga),
    kategori: kategori ? kategori.slice(0, 60) : null,
    foto_url,
    deskripsi: deskripsi ? deskripsi.slice(0, 3000) : null,
  });

  if (error) {
    return { error: "Gagal menyimpan produk: " + error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

// US-09: ubah produk yang ada (terproteksi login & validasi input ketat)
export async function ubahProduk(_prevState, formData) {
  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  const idRaw = formData.get("id");
  const id = idRaw ? parseInt(idRaw.toString(), 10) : NaN;
  if (isNaN(id)) {
    return { error: "ID produk tidak valid." };
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga");
  const harga = hargaRaw ? parseInt(hargaRaw.toString(), 10) : NaN;
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = sanitizeFotoUrl(formData.get("foto_url")?.toString());
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (nama.length > 150) {
    return { error: "Nama produk maksimal 150 karakter." };
  }

  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka positif." };
  }
  if (harga > 1000000000) {
    return { error: "Harga produk melebihi batas wajar." };
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama: nama.slice(0, 150),
      harga: Math.floor(harga),
      kategori: kategori ? kategori.slice(0, 60) : null,
      foto_url,
      deskripsi: deskripsi ? deskripsi.slice(0, 3000) : null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui produk: " + error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

// US-10: hapus produk (terproteksi login & type validation)
export async function hapusProduk(idRaw) {
  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  const id = parseInt(idRaw?.toString() || "", 10);
  if (isNaN(id)) {
    return { error: "ID produk tidak valid." };
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    return { error: "Gagal menghapus produk: " + error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { sukses: true };
}

// US-14: AI Generated Product Description (OpenAI / Gemini / Smart Fallback)
export async function buatDeskripsiAI({ nama, kategori, fitur, target_user }) {
  const supabase = await buatSupabaseSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk wajib diisi sebelum membuat deskripsi dengan AI." };
  }

  const cleanNama = nama.trim().slice(0, 120);
  const cleanKategori = (kategori || "").trim().slice(0, 60);
  const cleanFitur = (fitur || "").trim().slice(0, 200);
  const cleanTarget = (target_user || "").trim().slice(0, 200);

  const prompt = `Buat deskripsi produk e-commerce dalam Bahasa Indonesia yang persuasif dengan panjang 120-200 kata berdasarkan data berikut:
Nama Produk: ${cleanNama}
Kategori: ${cleanKategori || "Umum"}
Fitur Utama: ${cleanFitur || "Kualitas terjamin, bahan pilihan"}
Target Pengguna: ${cleanTarget || "Semua kalangan"}

Tulis dengan format:
- Ringkasan produk
- Keunggulan utama
- Manfaat bagi pengguna
- Call to action`;

  // 1. Integrasi OpenAI API jika OPENAI_API_KEY tersedia
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Kamu adalah copywriter profesional e-commerce UMKM Indonesia.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return { hasil: data.choices[0].message.content.trim() };
      }
    } catch (e) {
      console.error("OpenAI API fetch error:", e);
    }
  }

  // 2. Integrasi Gemini API jika GEMINI_API_KEY tersedia
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { hasil: text.trim() };
      }
    } catch (e) {
      console.error("Gemini API fetch error:", e);
    }
  }

  // 3. Fallback cerdas jika API Key belum dipasang di environment
  const fallbackDeskripsi = `${cleanNama} merupakan produk pilihan berkualitas unggul pada kategori ${
    cleanKategori || "katalog kami"
  }. Dirancang khusus dengan standar mutu terbaik untuk memenuhi kebutuhan Anda.\n\n✨ Keunggulan Utama:\n- Dibuat dari bahan pilihan berkualitas tinggi ${
    cleanFitur ? `(${cleanFitur})` : "dan higienis"
  }.\n- Kemasan aman dan menjaga kesegaran serta mutu produk.\n\n🎯 Manfaat:\nSangat cocok untuk ${
    cleanTarget || "konsumsi keluarga, kebutuhan harian, maupun hadiah istimewa"
  }.\n\nYuk pesan sekarang sebelum kehabisan stok!`;

  return { hasil: fallbackDeskripsi };
}
