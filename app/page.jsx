import KartuProduk from "@/components/KartuProduk";
import FilterKatalog from "@/components/FilterKatalog";
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

  const supabase = buatSupabaseServer();

  // Query produk dengan filter pencarian dan kategori
  let query = supabase
    .from("produk")
    .select("id, nama, harga, foto_url, kategori")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("nama", `%${q}%`);
  }

  if (kategori && kategori !== "Semua") {
    query = query.eq("kategori", kategori);
  }

  const { data: daftarProduk, error } = await query;

  // Ambil daftar seluruh kategori unik untuk chips filter
  const { data: semuaProduk } = await supabase
    .from("produk")
    .select("kategori");

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

        {error ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            Gagal memuat produk: {error.message}
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
      </section>
    </>
  );
}
