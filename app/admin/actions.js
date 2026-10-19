"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

// US-05: ganti password admin yang sedang login.
export async function gantiPassword(_prevState, formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasi) {
    return { error: "Semua field wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
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

// US-08: tambah produk baru (terproteksi login)
export async function tambahProduk(_prevState, formData) {
  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga");
  const harga = hargaRaw ? parseInt(hargaRaw.toString(), 10) : 0;
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || "/produk/placeholder.svg";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka positif." };
  }

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (error) {
    return { error: "Gagal menyimpan produk: " + error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

// US-09: ubah produk yang ada (terproteksi login)
export async function ubahProduk(_prevState, formData) {
  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  const id = formData.get("id");
  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga");
  const harga = hargaRaw ? parseInt(hargaRaw.toString(), 10) : 0;
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || "/produk/placeholder.svg";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka positif." };
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
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

// US-10: hapus produk (terproteksi login)
export async function hapusProduk(id) {
  const supabase = await buatSupabaseSesi();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi habis, silakan login kembali." };
  }

  if (!id) {
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

  const prompt = `Buat deskripsi produk e-commerce dalam Bahasa Indonesia yang persuasif dengan panjang 120-200 kata berdasarkan data berikut:
Nama Produk: ${nama}
Kategori: ${kategori || "Umum"}
Fitur Utama: ${fitur || "Kualitas terjamin, bahan pilihan"}
Target Pengguna: ${target_user || "Semua kalangan"}

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
  const fallbackDeskripsi = `${nama} merupakan produk pilihan berkualitas unggul pada kategori ${
    kategori || "katalog kami"
  }. Dirancang khusus dengan standar mutu terbaik untuk memenuhi kebutuhan Anda.\n\n✨ Keunggulan Utama:\n- Dibuat dari bahan pilihan berkualitas tinggi ${
    fitur ? `(${fitur})` : "dan higienis"
  }.\n- Kemasan aman dan menjaga kesegaran serta mutu produk.\n\n🎯 Manfaat:\nSangat cocok untuk ${
    target_user || "konsumsi keluarga, kebutuhan harian, maupun hadiah istimewa"
  }.\n\nYuk pesan sekarang sebelum kehabisan stok!`;

  return { hasil: fallbackDeskripsi };
}
