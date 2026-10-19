"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

// US-11: Filter kategori dan pencarian produk real-time dengan URL params
export default function FilterKatalog({ daftarKategori = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const qAwal =
    searchParams.get("cari") ||
    searchParams.get("q") ||
    searchParams.get("search") ||
    "";
  const kategoriAwal = searchParams.get("kategori") || "";

  const [search, setSearch] = useState(qAwal);

  const updateFilter = (newQ, newKategori) => {
    const params = new URLSearchParams();

    if (newQ && newQ.trim()) {
      params.set("cari", newQ.trim());
      params.set("q", newQ.trim());
    }

    if (newKategori && newKategori !== "Semua") {
      params.set("kategori", newKategori);
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : "/", { scroll: false });
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter(search, kategoriAwal);
  };

  const handleKategoriClick = (kat) => {
    updateFilter(search, kat === kategoriAwal ? "" : kat);
  };

  const handleReset = () => {
    setSearch("");
    startTransition(() => {
      router.push("/", { scroll: false });
    });
  };

  const adaFilterAktif = Boolean(qAwal || kategoriAwal);

  return (
    <div className="flex flex-col gap-4">
      {/* Form Pencarian */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            name="cari"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk berdasarkan nama..."
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pl-10 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-teks-lembut"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-utama px-4 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap transition-colors"
        >
          Cari
        </button>
        {adaFilterAktif && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks-lembut hover:text-bahaya transition-colors"
          >
            Reset
          </button>
        )}
      </form>

      {/* Filter Kategori Chips */}
      {daftarKategori.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-teks-lembut mr-1">Kategori:</span>
          <button
            type="button"
            onClick={() => handleKategoriClick("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !kategoriAwal
                ? "bg-utama text-white"
                : "border border-garis bg-permukaan text-teks hover:border-utama"
            }`}
          >
            Semua
          </button>
          {daftarKategori.map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => handleKategoriClick(kat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                kategoriAwal === kat
                  ? "bg-utama text-white"
                  : "border border-garis bg-permukaan text-teks hover:border-utama"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      )}

      {isPending && (
        <p className="text-xs text-teks-lembut animate-pulse">Memperbarui katalog…</p>
      )}
    </div>
  );
}
