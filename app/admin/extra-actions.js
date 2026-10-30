"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { buatSupabaseSesi, buatSupabaseServer } from "@/lib/supabase";

async function getAdminClient() {
  const client = await buatSupabaseSesi();
  const { data: { user } } = await client.auth.getUser();
  return user?.app_metadata?.role === "admin" ? { client, user } : null;
}

async function logAction(user, action, entity, id = null) {
  try {
    await buatSupabaseServer().from("log_admin").insert({ admin_id: user.id, aksi: action, entitas: entity, entitas_id: id === null ? null : String(id) });
  } catch { /* Audit logging must not reverse a successfully completed change. */ }
}

function slugKategori(nama) {
  const slug = nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kategori";
  return `${slug}-${createHash("md5").update(nama.toLowerCase()).digest("hex").slice(0, 8)}`;
}

export async function tambahKategori(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const nama = formData.get("nama")?.toString().trim() || "";
  if (!nama || nama.length > 60) return { error: "Nama kategori wajib diisi (maksimal 60 karakter)." };
  const { error } = await auth.client.from("kategori").insert({ nama, slug: slugKategori(nama) });
  if (error) return { error: error.code === "23505" ? "Kategori tersebut sudah ada." : "Kategori gagal disimpan." };
  await logAction(auth.user, "tambah_kategori", "kategori", nama);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  return { sukses: "Kategori berhasil ditambahkan." };
}

export async function ubahKategori(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const id = Number(formData.get("id"));
  const nama = formData.get("nama")?.toString().trim() || "";
  if (!Number.isSafeInteger(id) || id < 1 || !nama || nama.length > 60) return { error: "Data kategori tidak valid." };
  const { error } = await auth.client.rpc("admin_ubah_kategori", { category_id: id, new_name: nama });
  if (error) return { error: error.code === "23505" ? "Nama kategori sudah digunakan." : "Kategori gagal diubah. Pastikan migration fitur admin sudah diterapkan." };
  await logAction(auth.user, "ubah_kategori", "kategori", id);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return { sukses: "Kategori dan produk terkait berhasil diperbarui." };
}

export async function hapusKategori(idRaw) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const id = Number(idRaw);
  if (!Number.isSafeInteger(id) || id < 1) return { error: "ID kategori tidak valid." };
  const { error } = await auth.client.from("kategori").delete().eq("id", id);
  if (error) return { error: "Kategori masih dipakai produk atau gagal dihapus. Pindahkan produknya terlebih dahulu." };
  await logAction(auth.user, "hapus_kategori", "kategori", id);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  return { sukses: "Kategori berhasil dihapus." };
}

function urlAman(value) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null; }
  catch { return null; }
}

export async function simpanPengaturanToko(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const nama = formData.get("nama")?.toString().trim() || "";
  const tagline = formData.get("tagline")?.toString().trim() || "";
  const nomor = formData.get("nomor_whatsapp")?.toString().replace(/\D/g, "") || "";
  const alamat = formData.get("alamat")?.toString().trim() || "";
  const jam = formData.get("jam_buka")?.toString().trim() || "";
  const judul = formData.get("banner_judul")?.toString().trim() || "";
  const deskripsi = formData.get("banner_deskripsi")?.toString().trim() || "";
  const bannerFotoRaw = formData.get("banner_foto")?.toString().trim() || "";
  const tautanRaw = formData.get("promo_tautan")?.toString().trim() || "";
  const banner_foto = bannerFotoRaw ? urlAman(bannerFotoRaw) : null;
  const promo_tautan = tautanRaw ? urlAman(tautanRaw) : null;
  if (!nama || nama.length > 120 || !tagline || tagline.length > 300 || nomor.length < 10 || nomor.length > 15 || alamat.length > 300 || jam.length > 120) return { error: "Periksa identitas toko. Nama/tagline wajib diisi dan nomor WhatsApp harus 10–15 digit." };
  if (bannerFotoRaw && !banner_foto) return { error: "URL banner harus berupa HTTPS atau path lokal." };
  if (tautanRaw && !promo_tautan) return { error: "Tautan promo harus berupa HTTPS atau path lokal." };
  if (judul.length > 120 || deskripsi.length > 500) return { error: "Judul promo maksimal 120 karakter dan deskripsi maksimal 500 karakter." };
  const payload = {
    id: true, nama, tagline, nomor_whatsapp: nomor, alamat, jam_buka: jam,
    banner_judul: judul || null, banner_deskripsi: deskripsi || null,
    banner_foto, promo_tautan, promo_aktif: formData.get("promo_aktif") === "true",
    diperbarui_at: new Date().toISOString(),
  };
  const { error } = await auth.client.from("pengaturan_toko").upsert(payload, { onConflict: "id" });
  if (error) return { error: "Pengaturan gagal disimpan. Pastikan migration database terbaru sudah diterapkan." };
  await logAction(auth.user, "ubah_pengaturan_toko", "pengaturan_toko", true);
  revalidatePath("/");
  revalidatePath("/tentang");
  revalidatePath("/kontak");
  return { sukses: "Pengaturan toko berhasil disimpan." };
}

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === "") quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error("CSV memiliki tanda kutip yang tidak berpasangan.");
  row.push(field); if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export async function imporProdukCsv(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > 2 * 1024 * 1024) return { error: "Pilih file CSV maksimal 2 MB." };
  let rows;
  try { rows = parseCsv(new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer())); }
  catch { return { error: "CSV tidak valid atau bukan UTF-8." }; }
  if (rows.length < 2 || rows.length > 501) return { error: "CSV harus berisi header dan 1–500 produk." };
  const headers = rows[0].map((value) => value.trim().toLowerCase());
  const required = ["nama", "harga"];
  if (required.some((name) => !headers.includes(name)) || new Set(headers).size !== headers.length) return { error: "Header wajib: nama,harga. Kolom opsional: kategori,deskripsi,foto_url,stok,aktif,harga_coret." };
  const allowed = new Set(["id", "nama", "harga", "kategori", "deskripsi", "foto_url", "stok", "aktif", "harga_coret", "urutan"]);
  if (headers.some((name) => !allowed.has(name))) return { error: "CSV berisi kolom yang tidak didukung." };
  const products = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== headers.length) return { error: `Jumlah kolom tidak sesuai pada baris ${i + 1}.` };
    const row = Object.fromEntries(headers.map((header, index) => [header, rows[i][index]]));
    const hargaCoret = row.harga_coret?.trim();
    const harga = Number(row.harga);
    const stok = row.stok?.trim() ? Number(row.stok) : 0;
    const harga_coret = hargaCoret ? Number(hargaCoret) : null;
    const urutan = row.urutan?.trim() ? Number(row.urutan) : 0;
    const foto_url = urlAman(row.foto_url?.trim() || "") || "/produk/placeholder.svg";
    const nama = row.nama.trim();
    const statusRaw = row.aktif?.trim().toLowerCase();
    if (!nama || nama.length > 150 || !Number.isSafeInteger(harga) || harga < 0 || harga > 1000000000 || !Number.isSafeInteger(stok) || stok < 0 || stok > 1000000 || !Number.isSafeInteger(urutan) || urutan < 0 || urutan > 1000000 || (statusRaw && !["true", "false"].includes(statusRaw)) || (harga_coret !== null && (!Number.isSafeInteger(harga_coret) || harga_coret <= harga || harga_coret > 1000000000))) return { error: `Data produk tidak valid pada baris ${i + 1}.` };
    products.push({ nama, harga, stok, urutan, harga_coret, foto_url, kategori: row.kategori?.trim().slice(0, 60) || null, deskripsi: row.deskripsi?.trim().slice(0, 3000) || null, aktif: statusRaw !== "false", foto_lainnya: [], varian: [] });
  }
  const { error } = await auth.client.from("produk").insert(products);
  if (error) return { error: "Impor gagal. Pastikan migration database dan format kolom sesuai." };
  await logAction(auth.user, "impor_produk_csv", "produk", products.length);
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/sitemap.xml");
  return { sukses: `${products.length} produk berhasil diimpor.` };
}

export async function ubahUrutanProduk(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const id = Number(formData.get("id")); const urutan = Number(formData.get("urutan"));
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(urutan) || urutan < 0 || urutan > 1000000) return { error: "Urutan tidak valid." };
  const { error } = await auth.client.from("produk").update({ urutan }).eq("id", id);
  if (error) return { error: "Urutan gagal disimpan." };
  await logAction(auth.user, "atur_urutan_produk", "produk", id);
  revalidatePath("/"); revalidatePath("/admin");
  return { sukses: "Urutan diperbarui." };
}

export async function moderasiUlasan(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const id = Number(formData.get("id")); const status = formData.get("status")?.toString();
  if (!Number.isSafeInteger(id) || id < 1 || !["disetujui", "ditolak"].includes(status)) return { error: "Data moderasi tidak valid." };
  const { error } = await auth.client.from("ulasan").update({ status }).eq("id", id);
  if (error) return { error: "Status ulasan gagal diperbarui." };
  await logAction(auth.user, `moderasi_ulasan_${status}`, "ulasan", id);
  revalidatePath("/admin/ulasan"); revalidatePath("/produk");
  return { sukses: `Ulasan ${status}.` };
}

export async function buatAkunAdmin(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || password.length < 12 || password.length > 72) return { error: "Email tidak valid atau password kurang dari 12 karakter." };
  const service = buatSupabaseServer();
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return { error: error.code === "email_exists" ? "Email sudah terdaftar." : "Akun admin gagal dibuat." };
  const { error: roleError } = await service.auth.admin.updateUserById(data.user.id, { app_metadata: { role: "admin" } });
  if (roleError) {
    await service.auth.admin.deleteUser(data.user.id);
    return { error: "Role admin gagal diberikan. Akun baru dibatalkan." };
  }
  await logAction(auth.user, "buat_akun_admin", "auth_user", email);
  revalidatePath("/admin/akun");
  return { sukses: "Akun admin berhasil dibuat." };
}

export async function ubahStatusAkunAdmin(_prev, formData) {
  const auth = await getAdminClient();
  if (!auth) return { error: "Sesi admin tidak valid." };
  const id = formData.get("id")?.toString() || "";
  const aktif = formData.get("aktif") === "true";
  if (!/^[0-9a-f-]{36}$/i.test(id) || id === auth.user.id) return { error: "Akun sendiri tidak dapat diubah dari sini." };
  const service = buatSupabaseServer();
  if (!aktif) {
    const { data } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const admins = (data?.users || []).filter((user) => user.app_metadata?.role === "admin" && (!user.banned_until || new Date(user.banned_until) <= new Date()));
    if (admins.length <= 1) return { error: "Akun admin aktif terakhir tidak dapat dinonaktifkan." };
  }
  const { error } = await service.auth.admin.updateUserById(id, { ban_duration: aktif ? "none" : "876000h" });
  if (error) return { error: "Status akun gagal diperbarui." };
  await logAction(auth.user, aktif ? "aktifkan_akun_admin" : "nonaktifkan_akun_admin", "auth_user", id);
  revalidatePath("/admin/akun");
  return { sukses: aktif ? "Akun admin diaktifkan." : "Akun admin dinonaktifkan." };
}

