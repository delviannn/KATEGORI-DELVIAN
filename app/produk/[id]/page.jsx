import Link from "next/link";
import { notFound } from "next/navigation";
import PilihanPesanan from "@/components/PilihanPesanan";
import { buatSupabaseServer } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";
import { getSiteUrl } from "@/lib/site";
import GaleriProduk from "@/components/GaleriProduk";
import InteraksiProduk from "@/components/InteraksiProduk";
import FormUlasan from "@/components/FormUlasan";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";
import AsistenProduk from "@/components/AsistenProduk";
import { headers } from "next/headers";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = buatSupabaseServer();
  const { data } = await supabase.from("produk").select("nama, deskripsi, foto_url").eq("id", id).eq("aktif", true).maybeSingle();
  if (!data) return { title: "Produk tidak ditemukan" };
  return {
    title: data.nama,
    description: (data.deskripsi || `Lihat detail ${data.nama} di katalog Toko Delviann.`).slice(0, 160),
    alternates: { canonical: new URL(`/produk/${id}`, getSiteUrl()).toString() },
    openGraph: {
      type: "website",
      title: data.nama,
      description: (data.deskripsi || "Katalog Toko Delviann").slice(0, 160),
      url: new URL(`/produk/${id}`, getSiteUrl()).toString(),
      images: data.foto_url ? [data.foto_url] : [],
    },
    twitter: {
      card: data.foto_url ? "summary_large_image" : "summary",
      title: data.nama,
      description: (data.deskripsi || "Katalog Toko Delviann").slice(0, 160),
      ...(data.foto_url ? { images: [data.foto_url] } : {}),
    },
  };
}

// US-02 & US-12: detail produk dengan pemilihan varian dan jumlah sebelum memesan
export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  const supabase = buatSupabaseServer();
  const toko = await ambilPengaturanToko();
  const requestHeaders = await headers();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("id, nama, harga, harga_coret, stok, aktif, varian, deskripsi, foto_url, foto_lainnya, kategori")
    .eq("id", id)
    .eq("aktif", true)
    .single();

  if (error || !produk) {
    notFound();
  }

  return (
    <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <script type="application/ld+json" nonce={requestHeaders.get("x-nonce") || undefined}>{JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: produk.nama, description: produk.deskripsi || undefined, image: produk.foto_url ? [produk.foto_url, ...(produk.foto_lainnya || [])] : undefined, category: produk.kategori || undefined, offers: { "@type": "Offer", priceCurrency: "IDR", price: produk.harga, availability: produk.stok > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: new URL(`/produk/${id}`, getSiteUrl()).toString() } }).replaceAll("<", "\\u003c")}</script>
      <div className="flex flex-col gap-6">
        <GaleriProduk nama={produk.nama} foto={[produk.foto_url || "/produk/placeholder.svg", ...(produk.foto_lainnya || [])]} />
        <InteraksiProduk produk={produk} />
      </div>
      <div className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb">
        <Link
          href="/"
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          ← Kembali ke katalog
        </Link>
        <span aria-hidden="true" className="mx-2">/</span><span aria-current="page">{produk.nama}</span>
        </nav>
        <div>
          <span className="rounded-md bg-permukaan px-2.5 py-1 text-xs font-semibold text-teks-lembut border border-garis">
            {produk.kategori || "Umum"}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-teks">
            {produk.nama}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">{formatRupiah(produk.harga)}</p>
          {produk.harga_coret > produk.harga && <><span className="text-sm text-teks-lembut line-through">{formatRupiah(produk.harga_coret)}</span><span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-800">Promo</span></>}
        </div>
        <p className={`text-sm font-semibold ${produk.stok > 0 ? "text-utama" : "text-bahaya"}`}>
          {produk.stok > 0 ? `Stok tersedia: ${produk.stok}` : "Stok sedang habis"}
        </p>
        <div className="max-w-prose leading-relaxed text-teks-lembut text-sm whitespace-pre-line">
          {produk.deskripsi || "Tidak ada deskripsi untuk produk ini."}
        </div>

        {/* US-12: Pilihan Varian dan Jumlah Pesanan */}
        <div className="border-t border-garis pt-4">
          {produk.stok > 0 && <PilihanPesanan produk={produk} nomorWhatsApp={toko.nomorWhatsApp} />}
        </div>
      </div>
      <section className="md:col-span-2 border-t border-garis pt-6">
        <h2 className="text-xl font-bold">Produk lainnya</h2>
        <ProdukTerkait id={produk.id} kategori={produk.kategori} />
      </section>
      <section className="md:col-span-2 border-t border-garis pt-6">
        <UlasanProduk id={produk.id} />
      </section>
      <div className="md:col-span-2"><AsistenProduk produkId={produk.id} /></div>
    </article>
  );
}

async function UlasanProduk({ id }) {
  const supabase = buatSupabaseServer();
  const { data: ulasan } = await supabase.from("ulasan").select("nama,rating,isi,created_at").eq("produk_id", id).eq("status", "disetujui").order("created_at", { ascending: false }).limit(20);
  const jumlah = ulasan?.length || 0;
  const rata = jumlah ? (ulasan.reduce((sum, item) => sum + item.rating, 0) / jumlah).toFixed(1) : null;
  return <div><h2 className="text-xl font-bold">Ulasan pelanggan{rata && <span className="ml-2 text-sm font-semibold text-amber-600">★ {rata} ({jumlah})</span>}</h2>
    {ulasan?.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{ulasan.map((item, index) => <article key={`${item.created_at}-${index}`} className="rounded-xl border border-garis p-4"><p className="font-semibold">{item.nama} <span className="text-amber-600">{"★".repeat(item.rating)}</span></p><p className="mt-2 whitespace-pre-line text-sm text-teks-lembut">{item.isi}</p></article>)}</div> : <p className="mt-2 text-sm text-teks-lembut">Belum ada ulasan yang disetujui.</p>}
    <h3 className="mt-6 font-bold">Tulis ulasan</h3><FormUlasan produkId={id} />
  </div>;
}

async function ProdukTerkait({ id, kategori }) {
  const supabase = buatSupabaseServer();
  let query = supabase.from("produk").select("id,nama,harga,harga_coret,foto_url,kategori,stok").eq("aktif", true).neq("id", id).limit(3);
  if (kategori) query = query.eq("kategori", kategori);
  const { data } = await query.order("urutan").order("created_at", { ascending: false });
  return data?.length ? <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">{data.map((item) => <Link key={item.id} href={`/produk/${item.id}`} className="rounded-xl border border-garis p-3 hover:border-utama"><img src={item.foto_url || "/produk/placeholder.svg"} alt="" className="aspect-square w-full rounded-lg object-cover" /><p className="mt-2 font-semibold">{item.nama}</p><p className="text-sm text-teks-lembut">{formatRupiah(item.harga)}</p></Link>)}</div> : <p className="mt-3 text-sm text-teks-lembut">Belum ada produk terkait.</p>;
}
