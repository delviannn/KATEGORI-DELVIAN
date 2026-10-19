import KartuProduk from "@/components/KartuProduk";
import FilterKatalog from "@/components/FilterKatalog";
import { toko } from "@/lib/toko";
import { buatSupabaseServer } from "@/lib/supabase";

// US-01 & US-11: katalog produk dengan pencarian dan filter kategori
export default async function HalamanKatalog({ searchParams }) {
  const { q, kategori } = (await searchParams) || {};
  const supabase = buatSupabaseServer();

  // Query produk dengan filter pencarian dan kategori
  let query = supabase
    .from("produk")
    .select("id, nama, harga, foto_url, kategori")
    .order("created_at", { ascending: false });

  if (q && q.trim()) {
    query = query.ilike("nama", `%${q.trim()}%`);
  }

  if (kategori && kategori.trim()) {
    query = query.eq("kategori", kategori.trim());
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
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>
          <span className="text-xs text-teks-lembut">
            Menampilkan {daftarProduk?.length || 0} produk
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
