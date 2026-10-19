import Link from "next/link";
import { notFound } from "next/navigation";
import PilihanPesanan from "@/components/PilihanPesanan";
import { buatSupabaseServer } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";

// US-02 & US-12: detail produk dengan pemilihan varian dan jumlah sebelum memesan
export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  const supabase = buatSupabaseServer();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .eq("id", id)
    .single();

  if (error || !produk) {
    notFound();
  }

  return (
    <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <img
        src={produk.foto_url || "/produk/placeholder.svg"}
        alt={produk.nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          ← Kembali ke katalog
        </Link>
        <div>
          <span className="rounded-md bg-permukaan px-2.5 py-1 text-xs font-semibold text-teks-lembut border border-garis">
            {produk.kategori || "Umum"}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-teks">
            {produk.nama}
          </h1>
        </div>
        <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
          {formatRupiah(produk.harga)}
        </p>
        <div className="max-w-prose leading-relaxed text-teks-lembut text-sm whitespace-pre-line">
          {produk.deskripsi || "Tidak ada deskripsi untuk produk ini."}
        </div>

        {/* US-12: Pilihan Varian dan Jumlah Pesanan */}
        <div className="border-t border-garis pt-4">
          <PilihanPesanan produk={produk} />
        </div>
      </div>
    </article>
  );
}
