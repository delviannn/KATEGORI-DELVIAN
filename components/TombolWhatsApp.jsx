import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

// US-03: tautan WhatsApp dengan pesan otomatis berisi nama dan harga produk.
export default function TombolWhatsApp({ produk }) {
  const pesan = `Halo, saya ingin memesan:\n\n*${produk.nama}*\nHarga: ${formatRupiah(produk.harga)}\n\nApakah tersedia?`;
  const url = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
