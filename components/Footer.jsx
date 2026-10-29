import Link from "next/link";
import { toko } from "@/lib/toko";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-garis bg-permukaan">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm text-teks-lembut sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-utama text-white font-extrabold text-xs">
              TD
            </span>
            <span className="font-extrabold text-base text-teks">
              {toko.nama}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-teks-lembut">
            {toko.tagline}
          </p>
          <div className="mt-1 flex flex-col gap-1 text-xs">
            <p>📍 {toko.alamat}</p>
            <p>🕒 {toko.jamBuka}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav aria-label="Tautan toko" className="flex gap-4 text-xs">
            <Link href="/tentang" className="hover:text-utama">Tentang</Link>
            <Link href="/kontak" className="hover:text-utama">Kontak</Link>
          </nav>
          <span className="text-xs text-teks-lembut">
            © {new Date().getFullYear()} {toko.nama}. Seluruh hak cipta dilindungi.
          </span>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-teks-lembut underline underline-offset-4 hover:text-utama transition-colors"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
