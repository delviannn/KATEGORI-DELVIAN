"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
export default function FormProduk({ action, produk = {}, labelTombol = "Simpan produk" }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input
        label="Nama produk"
        name="nama"
        defaultValue={produk.nama || ""}
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
        defaultValue={produk.kategori || ""}
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

      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={produk.deskripsi || ""}
        placeholder="Jelaskan keunggulan dan detail produk..."
      />

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
