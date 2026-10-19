import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar transition-all duration-300 hover:-translate-y-1 hover:border-utama/40 hover:shadow-lg active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-permukaan">
        <img
          src={produk.foto_url || "/produk/placeholder.svg"}
          alt={produk.nama}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {produk.kategori && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-latar/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-teks-lembut shadow-xs border border-garis/60">
            {produk.kategori}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="font-semibold text-sm leading-snug text-teks transition-colors duration-200 group-hover:text-utama line-clamp-2">
          {produk.nama}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="rounded-md bg-harga-latar px-2.5 py-1 text-xs font-bold text-harga transition-transform duration-200 group-hover:scale-105">
            {formatRupiah(produk.harga)}
          </p>
          <span className="text-[11px] font-semibold text-utama opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden sm:inline">
            Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
