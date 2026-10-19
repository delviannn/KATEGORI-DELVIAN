import Tombol from "@/components/Tombol";

export default function TidakDitemukan() {
  return (
    <div className="flex flex-col items-start gap-4 py-16 max-w-md">
      <span className="rounded-xl bg-utama/10 px-3 py-1 text-xs font-bold text-utama">
        Error 404
      </span>
      <h1 className="text-3xl font-extrabold text-teks">Halaman tidak ditemukan</h1>
      <p className="text-sm text-teks-lembut leading-relaxed">
        Produk atau halaman yang Anda cari mungkin telah dipindahkan, habis, atau tidak tersedia. Silakan telusuri katalog utama kami.
      </p>
      <div className="pt-2">
        <Tombol href="/">Lihat semua produk</Tombol>
      </div>
    </div>
  );
}
