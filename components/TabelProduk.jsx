import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";

/**
 * @typedef {Object} Produk
 * @property {number|string} id
 * @property {string} nama
 * @property {number} harga
 * @property {string} [deskripsi]
 * @property {string} [foto_url]
 * @property {string} [kategori]
 * @property {number} [stok]
 * @property {string} [status]
 * @property {string} [created_at]
 */

/**
 * Komponen TabelProduk di halaman admin
 * @param {{ daftarProduk: Produk[] }} props
 */
export default function TabelProduk({ daftarProduk }) {
  if (!daftarProduk || daftarProduk.length === 0) {
    return (
      <div className="rounded-2xl border border-garis bg-latar p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-permukaan text-teks-lembut mb-3">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-teks">Belum ada produk</p>
        <p className="mt-1 text-sm text-teks-lembut">
          Tabel database masih kosong. Tambahkan produk pertamamu untuk mulai berjualan.
        </p>
        <div className="mt-4">
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-garis">
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="transition-colors hover:bg-permukaan/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={produk.foto_url || "/produk/placeholder.svg"}
                    alt=""
                    className="h-10 w-10 rounded-md border border-garis bg-permukaan object-cover"
                  />
                  <span className="font-semibold text-teks">{produk.nama}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori || "-"}</td>
              <td className="px-4 py-3 font-medium text-teks">{formatRupiah(produk.harga)}</td>
              <td className="px-4 py-3">
                <span className="font-medium text-teks">
                  {produk.stok !== undefined && produk.stok !== null ? `${produk.stok} pcs` : "Tersedia"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {produk.status || "Aktif"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {/* US-09 dan US-10 (bonus): ubah dan hapus produk */}
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <Tombol type="button" varian="bahaya">
                    Hapus
                  </Tombol>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
