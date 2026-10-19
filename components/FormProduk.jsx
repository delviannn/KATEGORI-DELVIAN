"use client";

import { useActionState, useState, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09), dilengkapi AI generator (US-14)
export default function FormProduk({ action, produk = {}, labelTombol = "Simpan produk" }) {
  const [state, formAction, pending] = useActionState(action, null);

  // State untuk form fields yang terhubung dengan AI generator
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");

  // State untuk panel AI generator
  const [bukaAI, setBukaAI] = useState(false);
  const [fiturAI, setFiturAI] = useState("");
  const [targetUserAI, setTargetUserAI] = useState("");
  const [pesanAI, setPesanAI] = useState(null);
  const [sedangGenerateAI, startGenerateAI] = useTransition();

  const handleGenerateAI = () => {
    if (!nama.trim()) {
      setPesanAI({ error: "Isi nama produk terlebih dahulu." });
      return;
    }

    setPesanAI(null);
    startGenerateAI(async () => {
      const res = await buatDeskripsiAI({
        nama,
        kategori,
        fitur: fiturAI,
        target_user: targetUserAI,
      });

      if (res?.error) {
        setPesanAI({ error: res.error });
      } else if (res?.hasil) {
        setDeskripsi(res.hasil);
        setPesanAI({ sukses: "Deskripsi berhasil dibuat dengan AI!" });
      }
    });
  };

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Contoh: Kopi Bubuk Robusta 250 g"
        required
      />

      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga || ""}
        placeholder="Contoh: 45000"
        required
      />

      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        placeholder="Contoh: Minuman, Camilan, Bumbu"
      />

      <Input
        label="Link foto (URL atau path)"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url || ""}
      />

      <Input
        label="Stok"
        name="stok"
        type="number"
        min="0"
        defaultValue={produk.stok ?? 10}
        placeholder="Contoh: 10"
      />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Status Produk
        <select
          name="status"
          defaultValue={produk.status || "Aktif"}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
        >
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </label>

      {/* US-14: Panel Pembuatan Deskripsi Produk dengan AI */}
      <div className="rounded-xl border border-garis bg-permukaan/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="text-sm font-bold text-teks">
              Bantuan AI Copywriting
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBukaAI(!bukaAI)}
            className="text-xs font-semibold text-utama hover:underline"
          >
            {bukaAI ? "Sembunyikan" : "Buka Generator"}
          </button>
        </div>

        {bukaAI && (
          <div className="mt-3 flex flex-col gap-3 pt-3 border-t border-garis">
            <p className="text-xs text-teks-lembut">
              AI akan membuat deskripsi pemasaran persuasif berdasarkan nama dan informasi tambahan:
            </p>
            <input
              type="text"
              value={fiturAI}
              onChange={(e) => setFiturAI(e.target.value)}
              placeholder="Fitur utama (contoh: 100% biji kopi murni sangrai sedang)"
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <input
              type="text"
              value={targetUserAI}
              onChange={(e) => setTargetUserAI(e.target.value)}
              placeholder="Target pengguna (contoh: pecinta kopi tubruk dan kopi susu)"
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />

            {pesanAI?.error && (
              <p className="text-xs text-red-600 font-medium">{pesanAI.error}</p>
            )}
            {pesanAI?.sukses && (
              <p className="text-xs text-green-600 font-medium">{pesanAI.sukses}</p>
            )}

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={sedangGenerateAI}
              className="self-start rounded-lg bg-utama px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap disabled:opacity-50 transition-colors"
            >
              {sedangGenerateAI ? "Sedang Menulis Deskripsi..." : "Generate Deskripsi"}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-teks">
          Deskripsi Produk
        </label>
        <textarea
          name="deskripsi"
          rows={6}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Tulis atau generate deskripsi produk di sini..."
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      {state?.error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state?.sukses && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.sukses}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Tombol type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
