import NavAdmin from "@/components/NavAdmin";
import FormDenganStatus from "@/components/FormDenganStatus";
import { imporProdukCsv } from "@/app/admin/extra-actions";

export default function AdminImpor() {
  return <section className="flex flex-col gap-6 py-8"><NavAdmin /><div><h1 className="text-2xl font-extrabold">Impor produk CSV</h1><p className="mt-1 text-sm text-teks-lembut">Maksimal 500 produk dan 2 MB. Kolom wajib: nama,harga. Kolom opsional: kategori,deskripsi,foto_url,stok,aktif,harga_coret.</p></div>
    <a href="/admin/ekspor" className="self-start rounded-lg border border-garis px-4 py-2 text-sm font-semibold">Unduh CSV produk</a>
    <FormDenganStatus action={imporProdukCsv} label="Validasi dan impor" className="max-w-xl gap-4"><label className="grid gap-2 text-sm font-semibold">File CSV UTF-8<input type="file" name="file" accept=".csv,text/csv" required className="rounded-lg border border-garis p-3" /></label></FormDenganStatus>
  </section>;
}
