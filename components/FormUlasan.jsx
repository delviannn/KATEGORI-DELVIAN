"use client";

import { useState } from "react";

export default function FormUlasan({ produkId }) {
  const [pesan, setPesan] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setPending(true); setPesan("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produkId, nama: form.get("nama"), rating: form.get("rating"), isi: form.get("isi"), website: form.get("website") }) });
      const data = await response.json();
      setPesan(data.sukses || data.error || "Ulasan gagal dikirim.");
      if (response.ok) formElement.reset();
    } catch { setPesan("Ulasan gagal dikirim. Periksa koneksi lalu coba lagi."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="mt-4 grid max-w-xl gap-3">
    <label className="grid gap-1 text-sm font-semibold">Nama<input name="nama" required minLength={2} maxLength={80} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
    <label className="grid gap-1 text-sm font-semibold">Rating<select name="rating" defaultValue="5" className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal">{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} dari 5 bintang</option>)}</select></label>
    <label className="grid gap-1 text-sm font-semibold">Ulasan<textarea name="isi" required minLength={5} maxLength={1200} rows={4} className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label>
    <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button disabled={pending} className="min-h-10 justify-self-start rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Mengirim..." : "Kirim ulasan"}</button>
    <p role="status" aria-live="polite" className="text-sm">{pesan}</p>
  </form>;
}
