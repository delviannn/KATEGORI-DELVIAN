import NavAdmin from "@/components/NavAdmin";
import FormDenganStatus from "@/components/FormDenganStatus";
import { buatSupabaseServer } from "@/lib/supabase";
import { tambahKategori, ubahKategori, hapusKategori } from "@/app/admin/extra-actions";

export default async function AdminKategori() {
  const supabase = buatSupabaseServer();
  const { data: kategori, error } = await supabase.from("kategori").select("id,nama,slug").order("nama");
  return <section className="flex flex-col gap-6 py-8">
    <NavAdmin /><div><h1 className="text-2xl font-extrabold">Kelola kategori</h1><p className="mt-1 text-sm text-teks-lembut">Kategori produk dipakai di katalog dan halaman kategori.</p></div>
    <FormDenganStatus action={tambahKategori} label="Tambah kategori">
      <label className="flex flex-col gap-1 text-sm font-semibold">Nama kategori<input name="nama" maxLength={60} required className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
    </FormDenganStatus>
    {error ? <p role="alert">Daftar kategori tidak dapat dimuat. Jalankan migration terbaru.</p> : <div className="grid gap-3">{(kategori || []).map((item) => <article key={item.id} className="rounded-xl border border-garis p-4"><p className="mb-3 text-xs text-teks-lembut">/{item.slug}</p><div className="flex flex-wrap items-end gap-4"><FormDenganStatus action={ubahKategori} label="Ubah nama" className="flex flex-1 flex-wrap items-end gap-2"><input type="hidden" name="id" value={item.id} /><label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold">Nama<input name="nama" defaultValue={item.nama} maxLength={60} required className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal" /></label></FormDenganStatus><form action={hapusKategori.bind(null, item.id)}><button className="min-h-10 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700">Hapus</button></form></div></article>)}</div>}
  </section>;
}
