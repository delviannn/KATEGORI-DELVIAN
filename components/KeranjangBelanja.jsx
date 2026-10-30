"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

const CART_KEY = "katalog:keranjang:v1";

export function simpanKeKeranjang(item) {
  try {
    const old = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    const list = Array.isArray(old) ? old.filter((entry) => entry && Number.isSafeInteger(entry.id)) : [];
    const index = list.findIndex((entry) => entry.id === item.id && entry.varian === item.varian);
    if (index >= 0) list[index].jumlah = Math.min(1000, list[index].jumlah + item.jumlah);
    else if (list.length < 30) list.push(item);
    localStorage.setItem(CART_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("katalog:keranjang"));
    return true;
  } catch {
    return false;
  }
}

export default function KeranjangBelanja({ nomorWhatsApp }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const update = () => {
      try {
        const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        setItems(Array.isArray(value) ? value : []);
      } catch { setItems([]); }
    };
    update();
    window.addEventListener("katalog:keranjang", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("katalog:keranjang", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  if (!items.length) return null;
  const totalItems = items.reduce((total, item) => total + item.jumlah, 0);
  const text = ["Halo, saya ingin memesan produk berikut:", ...items.map((item) => `\n- ${item.nama}${item.varian ? ` (${item.varian})` : ""} × ${item.jumlah} = ${formatRupiah(item.harga * item.jumlah)}`)].join("");
  const href = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(text)}`;
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Pesan ${totalItems} barang di keranjang melalui WhatsApp`} className="rounded-lg bg-utama px-3 py-2 text-sm font-semibold text-white">Keranjang ({totalItems}) · Pesan</a>;
}
