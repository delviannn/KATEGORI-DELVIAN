"use client";

import { useState } from "react";

export default function GaleriProduk({ nama, foto }) {
  const images = Array.isArray(foto) ? [...new Set(foto.filter(Boolean))] : [foto].filter(Boolean);
  const [active, setActive] = useState(images[0] || "/produk/placeholder.svg");
  return <div>
    <img src={active} alt={nama} fetchPriority="high" decoding="async" className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover" />
    {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto" aria-label={`Galeri foto ${nama}`}>
      {images.map((image) => <button key={image} type="button" aria-label={`Lihat foto ${nama}`} aria-pressed={active === image} onClick={() => setActive(image)} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-garis focus-visible:ring-2 focus-visible:ring-utama"><img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /></button>)}
    </div>}
  </div>;
}
