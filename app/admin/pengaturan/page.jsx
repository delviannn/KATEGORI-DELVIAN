import NavAdmin from "@/components/NavAdmin";
import FormDenganStatus from "@/components/FormDenganStatus";
import { buatSupabaseServer } from "@/lib/supabase";
import { toko } from "@/lib/toko";
import { simpanPengaturanToko } from "@/app/admin/extra-actions";

export default async function AdminPengaturan() {
  const supabase = buatSupabaseServer();
  const { data } = await supabase.from("pengaturan_toko").select("*").eq("id", true).maybeSingle();
  const current = data || { nama: toko.nama, tagline: toko.tagline, nomor_whatsapp: toko.nomorWhatsApp, alamat: toko.alamat, jam_buka: toko.jamBuka };
  return <section className="flex flex-col gap-6 py-8"><NavAdmin /><div><h1 className="text-2xl font-extrabold">Pengaturan toko dan promo</h1><p className="mt-1 text-sm text-teks-lembut">Informasi ini tampil di katalog publik.</p></div>
    <FormDenganStatus action={simpanPengaturanToko} label="Simpan pengaturan" className="grid max-w-2xl gap-4">
      <label className="grid gap-1 text-sm font-semibold">Nama toko<input name="nama" defaultValue={current.nama} maxLength={120} required className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Tagline<textarea name="tagline" defaultValue={current.tagline} maxLength={300} required rows={2} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Nomor WhatsApp internasional<input name="nomor_whatsapp" defaultValue={current.nomor_whatsapp} inputMode="numeric" maxLength={15} required className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Alamat<input name="alamat" defaultValue={current.alamat} maxLength={300} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Jam buka<input name="jam_buka" defaultValue={current.jam_buka} maxLength={120} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <hr className="border-garis" /><label className="grid gap-1 text-sm font-semibold">Judul promo<input name="banner_judul" defaultValue={current.banner_judul || ""} maxLength={120} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Deskripsi promo<textarea name="banner_deskripsi" defaultValue={current.banner_deskripsi || ""} maxLength={500} rows={3} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Foto banner (HTTPS atau path lokal)<input name="banner_foto" defaultValue={current.banner_foto || ""} maxLength={500} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="grid gap-1 text-sm font-semibold">Tautan promo (opsional)<input name="promo_tautan" defaultValue={current.promo_tautan || ""} maxLength={500} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="promo_aktif" value="true" defaultChecked={current.promo_aktif} />Tampilkan banner promo</label>
    </FormDenganStatus>
  </section>;
}
