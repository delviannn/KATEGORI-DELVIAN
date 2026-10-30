"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/format";

const KEYS = { favorit: "katalog:favorit:v1", terakhir: "katalog:terakhir-dilihat:v1", bandingkan: "katalog:bandingkan:v1" };
const TITLES = { favorit: "Produk favorit", terakhir: "Terakhir dilihat", bandingkan: "Bandingkan produk" };

export default function DaftarInteraksi({ jenis }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    try {
      const value = JSON.parse(localStorage.getItem(KEYS[jenis]) || "[]");
      const ids = Array.isArray(value) ? value.map(String).filter((id) => /^\d{1,15}$/.test(id)).slice(0, jenis === "bandingkan" ? 2 : 100) : [];
      if (!ids.length) { setProducts([]); setLoading(false); return () => { active = false; }; }
      fetch(`/api/local-products?ids=${encodeURIComponent(ids.join(","))}`).then((res) => res.ok ? res.json() : { products: [] }).then(({ products: rows }) => {
        if (active) { const lookup = new Map((rows || []).map((row) => [String(row.id), row])); setProducts(ids.map((id) => lookup.get(id)).filter(Boolean)); }
      }).catch(() => { if (active) setProducts([]); }).finally(() => { if (active) setLoading(false); });
    } catch { setProducts([]); setLoading(false); }
    return () => { active = false; };
  }, [jenis]);

  return <section className="py-10"><h1 className="text-3xl font-extrabold">{TITLES[jenis]}</h1>{loading ? <p className="mt-5">Memuat produk…</p> : !products.length ? <p className="mt-5 text-teks-lembut">Belum ada produk di daftar ini.</p> : jenis === "bandingkan" ? <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[480px] border-collapse text-left text-sm"><thead><tr>{products.map((item) => <th key={item.id} className="border border-garis p-3"><Link href={`/produk/${item.id}`}>{item.nama}</Link></th>)}</tr></thead><tbody>{[["Harga", (item) => formatRupiah(item.harga)], ["Kategori", (item) => item.kategori || "—"], ["Stok", (item) => item.stok > 0 ? `${item.stok} tersedia` : "Habis"], ["Deskripsi", (item) => item.deskripsi || "—"]].map(([label, value]) => <tr key={label}><th className="border border-garis p-3">{label}</th>{products.map((item) => <td key={item.id} className="border border-garis p-3">{value(item)}</td>)}</tr>)}</tbody></table></div> : <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">{products.map((item) => <Link key={item.id} href={`/produk/${item.id}`} className="rounded-xl border border-garis p-3"><img src={item.foto_url || "/produk/placeholder.svg"} alt={item.nama} loading="lazy" className="aspect-square w-full rounded-lg object-cover"/><p className="mt-2 font-semibold">{item.nama}</p><p className="mt-1 text-sm text-teks-lembut">{formatRupiah(item.harga)}</p></Link>)}</div>}</section>;
}
