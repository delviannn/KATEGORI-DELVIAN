import { ambilPengaturanToko } from "@/lib/pengaturan-toko";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata() {
  const toko = await ambilPengaturanToko();
  const url = new URL("/tentang", getSiteUrl()).toString();
  const title = `Tentang ${toko.nama}`;
  return {
    title,
    description: toko.tagline,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description: toko.tagline, url },
    twitter: { card: "summary", title, description: toko.tagline },
  };
}

export default async function HalamanTentang() {
  const toko = await ambilPengaturanToko();
  return <article className="max-w-prose py-12">
    <p className="text-sm font-semibold text-utama">Cerita kami</p>
    <h1 className="mt-2 text-3xl font-extrabold">Tentang {toko.nama}</h1>
    <p className="mt-4 leading-7 text-teks-lembut">{toko.tagline} Kami memilih produk dengan perhatian pada kualitas, dibuat oleh usaha dan perajin lokal.</p>
    <h2 className="mt-8 text-xl font-bold">Kunjungi toko</h2>
    <p className="mt-2 text-teks-lembut">{toko.alamat}<br />{toko.jamBuka}</p>
  </article>;
}
