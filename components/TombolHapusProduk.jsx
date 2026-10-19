"use client";

import { useTransition } from "react";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

// US-10: tombol hapus dengan konfirmasi dialog dan pembaruan otomatis
export default function TombolHapusProduk({ id, nama }) {
  const [isPending, startTransition] = useTransition();

  const handleHapus = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) {
      startTransition(async () => {
        const res = await hapusProduk(id);
        if (res?.error) {
          alert(`Gagal menghapus produk: ${res.error}`);
        }
      });
    }
  };

  return (
    <Tombol
      type="button"
      varian="bahaya"
      onClick={handleHapus}
      disabled={isPending}
    >
      {isPending ? "Menghapus…" : "Hapus"}
    </Tombol>
  );
}

