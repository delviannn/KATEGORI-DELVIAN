import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { buatSupabaseServer } from "@/lib/supabase";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const kategori = decodeURIComponent(slug).replaceAll("-", " ");
  return { title: `${kategori} | Katalog Delviann`, description: `Lihat pilihan produk kategori ${kategori} dari Toko Delviann.` };
}

export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const supabase = buatSupabaseServer();
  const { data: kategori, error } = await supabase.from("kategori").select("nama, slug").eq("slug", slug).maybeSingle();
  if (error || !kategori) notFound();
  const { data: produk, error: productError } = await supabase.from("produk").select("id,nama,harga,foto_url,kategori,harga_coret,stok,aktif").eq("kategori", kategori.nama).eq("aktif", true).order("urutan").order("created_at", { ascending: false });

  return <section className="py-10">
    <a href="/" className="text-sm text-utama hover:underline">← Semua produk</a>
    <h1 className="mt-3 text-3xl font-extrabold">{kategori.nama}</h1>
    {productError ? <p className="mt-6 rounded-lg border border-garis p-4">Katalog kategori belum dapat dimuat.</p> : produk?.length ? <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">{produk.map((item) => <KartuProduk key={item.id} produk={item} />)}</div> : <p className="mt-6 text-teks-lembut">Belum ada produk di kategori ini.</p>}
  </section>;
}
