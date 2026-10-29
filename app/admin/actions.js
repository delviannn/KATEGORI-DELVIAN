"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatSupabaseSesi } from "@/lib/supabase";
import { batasiPermintaan } from "@/lib/rate-limit";
import { randomUUID } from "node:crypto";

async function unggahFoto(formData, supabase, fotoUrl) {
  const file = formData.get("foto_file");
  if (!(file instanceof File) || file.size === 0) return { foto_url: fotoUrl };
  const tipeDiizinkan = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!tipeDiizinkan.has(file.type) || file.size > 5 * 1024 * 1024) {
    return { error: "Foto harus berformat JPEG, PNG, atau WebP dengan ukuran maksimal 5 MB." };
  }
  const ekstensi = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  const path = `${randomUUID()}.${ekstensi}`;
  const { error } = await supabase.storage.from("product-images").upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) return { error: "Foto gagal diunggah. Periksa konfigurasi Supabase Storage." };
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { foto_url: data.publicUrl };
}

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

function bacaDataProduk(formData) {
  const nama = formData.get("nama")?.toString().trim() || "";
  const harga = Number(formData.get("harga"));
  const stok = Number(formData.get("stok"));
  const hargaCoretRaw = formData.get("harga_coret")?.toString().trim();
  const harga_coret = hargaCoretRaw ? Number(hargaCoretRaw) : null;
  const foto_url = sanitizeFotoUrl(formData.get("foto_url")?.toString());
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;
  const foto_lainnya = (formData.get("foto_lainnya")?.toString() || "")
    .split(/\r?\n/).map((url) => url.trim()).filter(Boolean).slice(0, 10)
    .map((url) => sanitizeFotoUrl(url)).filter((url) => url !== "/produk/placeholder.svg");
  let varian = [];
  try {
    varian = JSON.parse(formData.get("varian")?.toString() || "[]");
  } catch {
    return { error: "Format varian harus berupa JSON yang valid." };
  }
  if (!Array.isArray(varian) || varian.length > 20 || varian.some((item) =>
    !item || typeof item.nama !== "string" || item.nama.trim().length < 1 || item.nama.length > 80 ||
    (item.harga !== undefined && (!Number.isSafeInteger(item.harga) || item.harga < 0 || item.harga > 1000000000))
  )) return { error: "Varian harus berupa daftar nama dan harga yang valid (maksimal 20)." };
  if (!nama || nama.length > 150) return { error: "Nama produk wajib diisi dan maksimal 150 karakter." };
  if (!Number.isSafeInteger(harga) || harga < 0 || harga > 1000000000) return { error: "Harga produk tidak valid." };
  if (!Number.isSafeInteger(stok) || stok < 0 || stok > 1000000) return { error: "Stok harus berupa bilangan bulat dari 0 sampai 1.000.000." };
  if (harga_coret !== null && (!Number.isSafeInteger(harga_coret) || harga_coret <= harga || harga_coret > 1000000000)) return { error: "Harga sebelum promo harus lebih tinggi dari harga jual." };
  return { data: { nama, harga, stok, harga_coret, foto_url, foto_lainnya, kategori: kategori?.slice(0, 60) || null, deskripsi: deskripsi?.slice(0, 3000) || null, aktif: formData.get("aktif") === "true", varian } };
}

// US-04: login admin dengan email dan password.
export async function login(_prevState, formData) {
  if (!(await batasiPermintaan("login", 10, 900))) {
    return { error: "Terlalu banyak percobaan. Tunggu 15 menit sebelum mencoba lagi." };
  }
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
    return { error: "Gagal mengganti password. Pastikan password memenuhi ketentuan, lalu coba lagi." };
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

  const parsed = bacaDataProduk(formData);
  if (parsed.error) return { error: parsed.error };
  const foto = await unggahFoto(formData, supabase, parsed.data.foto_url);
  if (foto.error) return { error: foto.error };

  const { error } = await supabase.from("produk").insert({
    ...parsed.data,
    foto_url: foto.foto_url,
  });

  if (error) {
    return { error: "Gagal menyimpan produk. Periksa data dan coba lagi." };
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

  const parsed = bacaDataProduk(formData);
  if (parsed.error) return { error: parsed.error };
  const foto = await unggahFoto(formData, supabase, parsed.data.foto_url);
  if (foto.error) return { error: foto.error };

  const { error } = await supabase
    .from("produk")
    .update({
      ...parsed.data,
      foto_url: foto.foto_url,
      diperbarui_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui produk. Periksa data dan coba lagi." };
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
    return { error: "Gagal menghapus produk. Silakan coba lagi." };
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
    } catch {
      // Hindari mencatat detail permintaan dari provider pihak ketiga.
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
    } catch {
      // Hindari mencatat detail permintaan dari provider pihak ketiga.
    }
  }

  return { error: "Layanan AI belum tersedia. Atur OPENAI_API_KEY atau GEMINI_API_KEY di environment server." };
}
