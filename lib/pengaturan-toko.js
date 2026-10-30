import "server-only";
import { cache } from "react";
import { buatSupabaseServer } from "@/lib/supabase";
import { toko as tokoDefault } from "@/lib/toko";

function safeUrl(value) {
  if (typeof value !== "string" || value.length > 500 || /[\\\u0000-\u001f]/.test(value)) return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.toString() : ""; }
  catch { return ""; }
}

export const ambilPengaturanToko = cache(async function ambilPengaturanToko() {
  try {
    const supabase = buatSupabaseServer();
    const { data } = await supabase.from("pengaturan_toko").select("*").eq("id", true).maybeSingle();
    if (!data) return { ...tokoDefault, promoAktif: false };
    return {
      nama: data.nama || tokoDefault.nama,
      tagline: data.tagline || tokoDefault.tagline,
      nomorWhatsApp: data.nomor_whatsapp?.replace(/\D/g, "") || tokoDefault.nomorWhatsApp,
      alamat: data.alamat || tokoDefault.alamat,
      jamBuka: data.jam_buka || tokoDefault.jamBuka,
      promoAktif: data.promo_aktif === true,
      bannerJudul: data.banner_judul || "",
      bannerDeskripsi: data.banner_deskripsi || "",
      bannerFoto: safeUrl(data.banner_foto),
      promoTautan: safeUrl(data.promo_tautan),
    };
  } catch {
    return { ...tokoDefault, promoAktif: false };
  }
});
