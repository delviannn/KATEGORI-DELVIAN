"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

// US-12: Komponen pemilihan varian dan jumlah pesanan dengan integrasi WhatsApp
export default function PilihanPesanan({ produk }) {
  // Opsi varian disesuaikan dengan kategori atau opsi default yang fleksibel
  const varianOptions = ["Reguler / Standar", "Kemasan Besar", "Paket Hemat"];

  const [varianDipilih, setVarianDipilih] = useState(varianOptions[0]);
  const [jumlah, setJumlah] = useState(1);

  const stokMaksimal = produk.stok !== undefined && produk.stok !== null ? produk.stok : 50;

  const handleKurang = () => {
    if (jumlah > 1) {
      setJumlah((prev) => prev - 1);
    }
  };

  const handleTambah = () => {
    if (jumlah < stokMaksimal) {
      setJumlah((prev) => prev + 1);
    }
  };

  const totalHarga = produk.harga * jumlah;

  // Format pesan WhatsApp yang rapi dan memuat rincian pesanan
  const pesan = `Halo, saya ingin memesan:\n\n*${produk.nama}*\n- Varian: ${varianDipilih}\n- Jumlah: ${jumlah} item\n- Total Harga: ${formatRupiah(totalHarga)}\n\nApakah stok masih tersedia?`;
  const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Pilihan Varian */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-teks">
          Pilih Varian
        </label>
        <div className="flex flex-wrap gap-2">
          {varianOptions.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVarianDipilih(v)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                varianDipilih === v
                  ? "border-utama bg-utama/10 text-utama font-bold"
                  : "border-garis bg-latar text-teks hover:border-utama"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Pilihan Jumlah & Subtotal */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-teks">Jumlah</label>
          <span className="text-xs text-teks-lembut">
            Stok tersedia: {stokMaksimal}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={handleKurang}
              disabled={jumlah <= 1}
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks hover:bg-permukaan disabled:opacity-30 disabled:cursor-not-allowed rounded-l-lg transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center text-sm font-semibold text-teks">
              {jumlah}
            </span>
            <button
              type="button"
              onClick={handleTambah}
              disabled={jumlah >= stokMaksimal}
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks hover:bg-permukaan disabled:opacity-30 disabled:cursor-not-allowed rounded-r-lg transition-colors"
            >
              +
            </button>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-teks-lembut">Total Estimasi:</span>
            <span className="text-lg font-bold text-utama">
              {formatRupiah(totalHarga)}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol Pesan via WhatsApp */}
      <a
        href={urlWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-utama px-5 py-3.5 font-semibold text-white shadow-sm hover:bg-utama-gelap transition-colors sm:w-auto"
      >
        <svg
          className="h-5 w-5 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
        </svg>
        Pesan via WhatsApp
      </a>
    </div>
  );
}
