import KartuProduk from "@/components/KartuProduk";
import FilterKatalog from "@/components/FilterKatalog";
import Link from "next/link";
import { toko } from "@/lib/toko";
import { buatSupabaseServer } from "@/lib/supabase";

// US-01 & US-11: katalog produk dengan pencarian dan filter kategori
export default async function HalamanKatalog({ searchParams }) {
  const resolvedParams = (await searchParams) || {};
  const q = (
    resolvedParams.q ||
    resolvedParams.cari ||
    resolvedParams.search ||
    ""
  ).toString().trim();

  const kategori = (
    resolvedParams.kategori ||
    resolvedParams.category ||
    ""
  ).toString().trim();
  const sort = ["baru", "harga-naik", "harga-turun", "unggulan"].includes(resolvedParams.urut)
    ? resolvedParams.urut
    : "baru";
  const halaman = Math.max(1, Math.min(10000, Number.parseInt(resolvedParams.halaman, 10) || 1));
  const ukuranHalaman = 12;

  const supabase = buatSupabaseServer();

  // Query produk dengan filter pencarian dan kategori
  let query = supabase
    .from("produk")
    .select("id, nama, harga, harga_coret, foto_url, foto_lainnya, kategori, stok, aktif, varian", { count: "exact" })
    .eq("aktif", true);

  if (sort === "harga-naik") query = query.order("harga", { ascending: true });
  else if (sort === "harga-turun") query = query.order("harga", { ascending: false });
  else if (sort === "unggulan") query = query.order("urutan", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("nama", `%${q}%`);
  }

  if (kategori && kategori !== "Semua") {
    query = query.eq("kategori", kategori);
  }

  const { data: daftarProduk, error, count } = await query.range((halaman - 1) * ukuranHalaman, halaman * ukuranHalaman - 1);

  // Ambil daftar seluruh kategori unik untuk chips filter
  const { data: semuaProduk } = await supabase
    .from("produk")
    .select("kategori")
    .eq("aktif", true);

  const daftarKategori = Array.from(
    new Set(semuaProduk?.map((p) => p.kategori).filter(Boolean))
  );

  return (
    <>
      <section className="py-10 sm:py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-utama/25 bg-utama/10 px-3.5 py-1 text-xs font-semibold text-utama mb-3">
          ✨ Langsung dari Dapur & Pengrajin Lokal
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl text-teks">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut leading-relaxed">
          {toko.tagline}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-teks-lembut">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-3 py-1.5 font-medium">
            🕒 {toko.jamBuka}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-3 py-1.5 font-medium">
            📍 {toko.alamat}
          </span>
        </div>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="judul-produk" className="text-xl font-bold text-teks">
              Produk Pilihan
            </h2>
            <p className="text-xs text-teks-lembut mt-0.5">
              Pilih produk dan tentukan varian untuk memesan lewat WhatsApp.
            </p>
          </div>
          <span className="text-xs font-semibold text-teks-lembut self-start sm:self-auto rounded-full bg-permukaan px-3 py-1 border border-garis">
            {daftarProduk?.length || 0} Produk Tersedia
          </span>
        </div>

        {/* US-11: Filter dan Pencarian */}
        <FilterKatalog daftarKategori={daftarKategori} />

        <form className="flex items-center gap-2 text-sm" method="get">
          {q && <input type="hidden" name="cari" value={q} />}
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
          <label htmlFor="urut" className="text-teks-lembut">Urutkan:</label>
          <select id="urut" name="urut" defaultValue={sort} className="rounded-lg border border-garis bg-latar px-3 py-2 text-teks">
            <option value="baru">Terbaru</option>
            <option value="harga-naik">Harga terendah</option>
            <option value="harga-turun">Harga tertinggi</option>
            <option value="unggulan">Pilihan toko</option>
          </select>
          <button className="rounded-lg border border-garis px-3 py-2 font-medium hover:bg-permukaan">Terapkan</button>
        </form>

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            Katalog sedang tidak dapat dimuat. Silakan coba lagi beberapa saat lagi.
          </p>
        ) : !daftarProduk || daftarProduk.length === 0 ? (
          <div className="rounded-2xl border border-garis bg-latar py-14 text-center">
            <p className="font-semibold text-teks">Tidak ada produk ditemukan</p>
            <p className="mt-1 text-sm text-teks-lembut">
              {q || kategori
                ? "Coba sesuaikan kata kunci pencarian atau ubah pilihan kategori."
                : "Belum ada produk yang terdaftar di katalog."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
        {count > ukuranHalaman && (
          <nav aria-label="Navigasi halaman katalog" className="flex items-center justify-center gap-4 py-4">
            {halaman > 1 ? <Link className="rounded-lg border border-garis px-4 py-2" href={`/?${new URLSearchParams({ ...(q ? { cari: q } : {}), ...(kategori ? { kategori } : {}), urut: sort, halaman: String(halaman - 1) })}`}>Sebelumnya</Link> : <span />}
            <span className="text-sm text-teks-lembut">Halaman {halaman} dari {Math.ceil(count / ukuranHalaman)}</span>
            {halaman < Math.ceil(count / ukuranHalaman) ? <Link className="rounded-lg border border-garis px-4 py-2" href={`/?${new URLSearchParams({ ...(q ? { cari: q } : {}), ...(kategori ? { kategori } : {}), urut: sort, halaman: String(halaman + 1) })}`}>Berikutnya</Link> : <span />}
          </nav>
        )}
      </section>
    </>
  );
}
