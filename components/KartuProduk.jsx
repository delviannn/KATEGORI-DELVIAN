import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar transition-all duration-300 hover:-translate-y-1 hover:border-utama/40 hover:shadow-lg active:scale-[0.98]"
    >
      <div className="aspect-square w-full overflow-hidden bg-permukaan">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs font-medium text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug text-teks transition-colors duration-200 group-hover:text-utama">
          {produk.nama}
        </h3>
        <p className="mt-auto self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga transition-transform duration-200 group-hover:scale-105">
          {formatRupiah(produk.harga)}
        </p>
      </div>
    </Link>
  );
}
