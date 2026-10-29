import { toko } from "@/lib/toko";

export const metadata = { title: `Kontak | ${toko.nama}`, description: `Hubungi ${toko.nama} melalui WhatsApp atau kunjungi toko kami.` };

export default function HalamanKontak() {
  const wa = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(`Halo ${toko.nama}, saya ingin bertanya tentang produk.`)}`;
  return <section className="max-w-prose py-12">
    <p className="text-sm font-semibold text-utama">Kami siap membantu</p>
    <h1 className="mt-2 text-3xl font-extrabold">Kontak toko</h1>
    <p className="mt-4 text-teks-lembut">Untuk pertanyaan produk dan pemesanan, hubungi kami melalui WhatsApp.</p>
    <a className="mt-6 inline-flex rounded-xl bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap" href={wa} target="_blank" rel="noopener noreferrer">Chat WhatsApp</a>
    <address className="mt-8 not-italic leading-7 text-teks-lembut">{toko.nama}<br />{toko.alamat}<br />{toko.jamBuka}</address>
  </section>;
}
