"use client";

import { useEffect, useState } from "react";

const FAVORITES = "katalog:favorit:v1";
const RECENT = "katalog:terakhir-dilihat:v1";
const COMPARE = "katalog:bandingkan:v1";

function readIds(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export default function InteraksiProduk({ produk }) {
  const [favorit, setFavorit] = useState(false);
  const [dibandingkan, setDibandingkan] = useState(false);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    const id = String(produk.id);
    setFavorit(readIds(FAVORITES).includes(id));
    setDibandingkan(readIds(COMPARE).includes(id));
    localStorage.setItem(RECENT, JSON.stringify([id, ...readIds(RECENT).filter((item) => item !== id)].slice(0, 12)));
  }, [produk.id]);

  function toggle(key, setValue, current, limit) {
    const id = String(produk.id);
    const ids = readIds(key);
    if (ids.includes(id)) {
      localStorage.setItem(key, JSON.stringify(ids.filter((item) => item !== id)));
      setValue(false);
      setPesan("Dihapus dari daftar.");
      return;
    }
    if (ids.length >= limit) {
      setPesan(`Maksimal ${limit} produk di daftar ini.`);
      return;
    }
    localStorage.setItem(key, JSON.stringify([...ids, id]));
    setValue(!current);
    setPesan("Tersimpan di browser ini.");
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: produk.nama, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setPesan("Link produk disalin.");
      }
    } catch {
      setPesan("Link tidak dapat dibagikan saat ini.");
    }
  }

  return <div className="flex flex-wrap gap-2">
    <button type="button" aria-pressed={favorit} onClick={() => toggle(FAVORITES, setFavorit, favorit, 100)} className="rounded-lg border border-garis px-3 py-2 text-sm">{favorit ? "♥ Favorit" : "♡ Simpan favorit"}</button>
    <button type="button" aria-pressed={dibandingkan} onClick={() => toggle(COMPARE, setDibandingkan, dibandingkan, 2)} className="rounded-lg border border-garis px-3 py-2 text-sm">{dibandingkan ? "✓ Dibandingkan" : "Bandingkan"}</button>
    <button type="button" onClick={share} className="rounded-lg border border-garis px-3 py-2 text-sm">Bagikan / salin link</button>
    <span className="sr-only" aria-live="polite">{pesan}</span>
  </div>;
}
