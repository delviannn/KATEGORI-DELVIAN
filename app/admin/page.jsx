import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatSupabaseServer } from "@/lib/supabase";
import Link from "next/link";

// US-07: daftar produk di halaman admin diambil langsung dari database Supabase
export default async function HalamanAdmin({ searchParams }) {
  const params = (await searchParams) || {};
  const cari = String(params.cari || "").trim().slice(0, 100);
  const halaman = Math.max(1, Math.min(10000, Number.parseInt(params.halaman, 10) || 1));
  const ukuran = 20;
  const supabase = buatSupabaseServer();

  let query = supabase
    .from("produk")
    .select("*", { count: "exact" })
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  if (cari) query = query.ilike("nama", `%${cari.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`);
  const [
    { data: daftarProduk, error, count },
    { data: ringkasanRows, error: ringkasanError },
    { data: populerRows, error: populerError },
  ] = await Promise.all([
    query.range((halaman - 1) * ukuran, halaman * ukuran - 1),
    supabase.rpc("admin_ringkasan_produk"),
    supabase.rpc("admin_produk_populer"),
  ]);
  const ringkasan = ringkasanRows?.[0];
  const produkPalingDiminati = (populerRows || []).map(({ produk_id, jumlah_klik }) => [produk_id, jumlah_klik]);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-teks">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      <section aria-label="Ringkasan toko" className="grid gap-3 sm:grid-cols-3">
        {[
          ["Jumlah produk", ringkasan?.total || 0],
          ["Produk aktif", ringkasan?.aktif || 0],
          ["Stok habis", ringkasan?.stok_habis || 0],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-garis bg-latar p-4"><p className="text-sm text-teks-lembut">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p></div>)}
      </section>
      {(ringkasanError || populerError) && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">Statistik belum tersedia. Pastikan migration katalog terbaru sudah dijalankan di Supabase.</p>}
      <section className="rounded-xl border border-garis p-4">
        <h2 className="font-bold">Produk paling sering dipesan</h2>
        {produkPalingDiminati.length ? <ol className="mt-2 list-inside list-decimal text-sm text-teks-lembut">{produkPalingDiminati.map(([id, total]) => <li key={id}>Produk #{id} · {total} klik WhatsApp</li>)}</ol> : <p className="mt-2 text-sm text-teks-lembut">Belum ada klik pemesanan.</p>}
      </section>

      <form method="get" className="flex gap-2">
        <label className="sr-only" htmlFor="cari-admin">Cari produk</label>
        <input id="cari-admin" name="cari" defaultValue={cari} placeholder="Cari nama produk" className="min-w-0 flex-1 rounded-lg border border-garis bg-latar px-3 py-2" />
        <button className="rounded-lg bg-utama px-4 py-2 font-semibold text-white">Cari</button>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Gagal memuat data produk dari database:</p>
          <p className="mt-1">Silakan muat ulang halaman atau periksa koneksi database.</p>
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk || []} />
      )}
      {count > ukuran && <nav aria-label="Paginasi produk admin" className="flex justify-center gap-4 text-sm">
        {halaman > 1 && <Link href={`/admin?${new URLSearchParams({ ...(cari ? { cari } : {}), halaman: String(halaman - 1) })}`}>Sebelumnya</Link>}
        <span>Halaman {halaman} dari {Math.ceil(count / ukuran)}</span>
        {halaman < Math.ceil(count / ukuran) && <Link href={`/admin?${new URLSearchParams({ ...(cari ? { cari } : {}), halaman: String(halaman + 1) })}`}>Berikutnya</Link>}
      </nav>}
    </div>
  );
}
