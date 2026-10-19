import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatSupabaseServer } from "@/lib/supabase";

// US-07: daftar produk di halaman admin diambil langsung dari database Supabase
export default async function HalamanAdmin() {
  const supabase = buatSupabaseServer();

  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-teks">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Gagal memuat data produk dari database:</p>
          <p className="mt-1">{error.message}</p>
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk || []} />
      )}
    </div>
  );
}
