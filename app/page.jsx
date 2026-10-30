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

  let { data: daftarProduk, error, count } = await query.range((halaman - 1) * ukuranHalaman, halaman * ukuranHalaman - 1);

  // Older Supabase schemas may not have the optional catalog columns yet.
  // Retry with the original core fields so a partial migration cannot blank the storefront.
  let schemaFallback = false;
  if (error) {
    let fallbackQuery = supabase
      .from("produk")
      .select("id, nama, harga, foto_url", { count: "exact" })
      .eq("aktif", true)
      .order("created_at", { ascending: false });
    if (q) fallbackQuery = fallbackQuery.ilike("nama", `%${q}%`);
    ({ data: daftarProduk, error, count } = await fallbackQuery.range((halaman - 1) * ukuranHalaman, halaman * ukuranHalaman - 1));
    schemaFallback = !error;
  }

  // Ambil daftar seluruh kategori unik untuk chips filter
  const { data: kategoriRows } = await supabase.rpc("kategori_produk_aktif");
  const daftarKategori = (kategoriRows || []).map((row) => row.kategori);

  return (
    <>
      <section className="hero-katalog relative isolate mt-6 overflow-hidden rounded-[2rem] border border-garis px-6 py-10 shadow-sm sm:mt-9 sm:px-10 sm:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full bg-utama/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 h-64 w-64 rounded-full bg-harga-latar/70 blur-3xl" />
        <span className="inline-flex items-center gap-2 rounded-full border border-utama/20 bg-latar/80 px-3.5 py-1.5 text-xs font-bold text-utama shadow-sm">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-utama" />Produk pilihan usaha lokal
        </span>
        <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-teks sm:text-6xl">
          Temukan yang <span className="text-utama">istimewa</span> di {toko.nama}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-teks-lembut sm:text-lg">{toko.tagline}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#produk" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-utama px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-utama-gelap">Jelajahi katalog <span aria-hidden="true" className="ml-2">↓</span></a>
          <Link href="/kontak" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-garis bg-latar/80 px-5 py-3 text-sm font-bold text-teks transition hover:border-utama hover:text-utama">Hubungi toko</Link>
        </div>
        <div className="mt-9 flex flex-wrap gap-2 text-xs text-teks-lembut">
          <span className="rounded-lg border border-garis bg-latar/75 px-3 py-2 font-medium">Jam buka · {toko.jamBuka}</span>
          <span className="rounded-lg border border-garis bg-latar/75 px-3 py-2 font-medium">Lokasi · {toko.alamat}</span>
        </div>
      </section>

      <section id="produk" aria-labelledby="judul-produk" className="flex scroll-mt-24 flex-col gap-6 py-10 sm:py-14">
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
            {count || 0} Produk Tersedia
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

        {schemaFallback && !error && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
            Katalog dimuat dengan data dasar. Beberapa filter dan informasi tambahan belum tersedia.
          </p>
        )}
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
