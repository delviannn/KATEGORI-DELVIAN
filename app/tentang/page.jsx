import { toko } from "@/lib/toko";

export const metadata = { title: `Tentang ${toko.nama}`, description: toko.tagline };

export default function HalamanTentang() {
  return <article className="max-w-prose py-12">
    <p className="text-sm font-semibold text-utama">Cerita kami</p>
    <h1 className="mt-2 text-3xl font-extrabold">Tentang {toko.nama}</h1>
    <p className="mt-4 leading-7 text-teks-lembut">{toko.tagline} Kami memilih produk dengan perhatian pada kualitas, dibuat oleh usaha dan perajin lokal.</p>
    <h2 className="mt-8 text-xl font-bold">Kunjungi toko</h2>
    <p className="mt-2 text-teks-lembut">{toko.alamat}<br />{toko.jamBuka}</p>
  </article>;
}
