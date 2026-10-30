import { notFound } from "next/navigation";
import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { buatSupabaseServer } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const kategori = decodeURIComponent(slug).replaceAll("-", " ");
  return {
    title: `${kategori} | Katalog Delviann`,
    description: `Lihat pilihan produk kategori ${kategori} dari Toko Delviann.`,
    alternates: { canonical: new URL(`/kategori/${slug}`, getSiteUrl()).toString() },
    openGraph: { type: "website", title: `${kategori} | Katalog Delviann`, url: new URL(`/kategori/${slug}`, getSiteUrl()).toString() },
    twitter: { card: "summary", title: `${kategori} | Katalog Delviann` },
  };
}

export default async function HalamanKategori({ params, searchParams }) {
  const { slug } = await params;
  const queryParams = (await searchParams) || {};
  const halaman = Math.max(1, Math.min(10000, Number.parseInt(queryParams.halaman, 10) || 1));
  const ukuranHalaman = 12;
  const supabase = buatSupabaseServer();
  const { data: kategori, error } = await supabase.from("kategori").select("nama, slug").eq("slug", slug).maybeSingle();
  if (error || !kategori) notFound();
  const { data: produk, error: productError, count } = await supabase
    .from("produk")
    .select("id,nama,harga,foto_url,kategori,harga_coret,stok,aktif", { count: "exact" })
    .eq("kategori", kategori.nama)
    .eq("aktif", true)
    .order("urutan")
    .order("created_at", { ascending: false })
    .range((halaman - 1) * ukuranHalaman, halaman * ukuranHalaman - 1);

  return <section className="py-10">
    <a href="/" className="text-sm text-utama hover:underline">← Semua produk</a>
    <h1 className="mt-3 text-3xl font-extrabold">{kategori.nama}</h1>
    {productError ? <p className="mt-6 rounded-lg border border-garis p-4">Katalog kategori belum dapat dimuat.</p> : produk?.length ? <>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">{produk.map((item) => <KartuProduk key={item.id} produk={item} />)}</div>
      {count > ukuranHalaman && <nav aria-label="Navigasi halaman kategori" className="mt-8 flex items-center justify-center gap-4">
        {halaman > 1 ? <Link className="rounded-lg border border-garis px-4 py-2" href={`/kategori/${encodeURIComponent(slug)}?halaman=${halaman - 1}`}>Sebelumnya</Link> : <span />}
        <span className="text-sm text-teks-lembut">Halaman {halaman} dari {Math.ceil(count / ukuranHalaman)}</span>
        {halaman < Math.ceil(count / ukuranHalaman) ? <Link className="rounded-lg border border-garis px-4 py-2" href={`/kategori/${encodeURIComponent(slug)}?halaman=${halaman + 1}`}>Berikutnya</Link> : <span />}
      </nav>}
    </> : <p className="mt-6 text-teks-lembut">Belum ada produk di kategori ini.</p>}
  </section>;
}
