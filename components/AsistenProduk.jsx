"use client";

import { useState } from "react";

export default function AsistenProduk({ produkId = null }) {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function ask(event) {
    event.preventDefault();
    if (pending || question.trim().length < 2) return;
    const asked = question.trim().slice(0, 500);
    setPending(true); setError(""); setQuestion("");
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: asked, history, productId }) });
      const result = await response.json();
      if (!response.ok) setError(result.error || "Asisten tidak dapat menjawab.");
      else setHistory((old) => [...old, { role: "user", content: asked }, { role: "assistant", content: result.answer }].slice(-8));
    } catch { setError("Asisten tidak dapat dijangkau. Coba lagi."); }
    finally { setPending(false); }
  }
  return <section className="mt-8 rounded-2xl border border-garis bg-permukaan p-4 sm:p-6"><h2 className="text-lg font-bold">Tanya asisten produk</h2><p className="mt-1 text-sm text-teks-lembut">Jawaban menggunakan informasi katalog. Pastikan harga dan stok saat memesan.</p>
    <div aria-live="polite" className="mt-4 grid gap-3">{history.map((item, index) => <p key={`${index}-${item.role}`} className={`max-w-2xl whitespace-pre-line rounded-xl p-3 text-sm ${item.role === "user" ? "ml-auto bg-utama text-white" : "bg-latar text-teks"}`}><strong>{item.role === "user" ? "Anda" : "Asisten"}: </strong>{item.content}</p>)}</div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={ask} className="mt-4 flex flex-col gap-2 sm:flex-row"><label htmlFor="pertanyaan-asisten" className="sr-only">Pertanyaan tentang produk</label><input id="pertanyaan-asisten" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} minLength={2} required placeholder="Contoh: Apa pilihan ukuran dan harganya?" className="min-w-0 flex-1 rounded-lg border border-garis bg-latar px-3 py-2" /><button disabled={pending} className="rounded-lg bg-utama px-4 py-2 font-semibold text-white disabled:opacity-60">{pending ? "Menjawab..." : "Tanya"}</button></form>
  </section>;
}
