import Link from "next/link";
import { toko } from "@/lib/toko";
import ThemeToggle from "@/components/ThemeToggle";
import KeranjangBelanja from "@/components/KeranjangBelanja";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-garis bg-latar/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-utama text-white font-extrabold text-sm shadow-sm transition-transform duration-200 group-hover:scale-105">
            TD
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-teks transition-colors group-hover:text-utama">
              {toko.nama}
            </span>
            <span className="text-[10px] font-semibold text-teks-lembut -mt-1 hidden sm:inline">
              Katalog & Order WhatsApp
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav aria-label="Navigasi utama" className="hidden items-center gap-3 text-sm sm:flex">
            <Link href="/tentang" className="text-teks-lembut hover:text-utama">Tentang</Link>
            <Link href="/kontak" className="text-teks-lembut hover:text-utama">Kontak</Link>
          </nav>
          <ThemeToggle />
          <KeranjangBelanja />
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Siap Dipesan
          </span>
        </div>
      </div>
    </header>
  );
}
