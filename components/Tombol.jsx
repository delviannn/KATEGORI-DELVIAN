import Link from "next/link";

const gaya = {
  utama: "bg-utama text-white hover:bg-utama-gelap shadow-sm hover:shadow",
  garis: "border border-garis bg-latar text-teks hover:border-utama hover:text-utama hover:bg-permukaan/50",
  bahaya: "border border-garis bg-latar text-bahaya hover:border-bahaya hover:bg-red-50/50",
};

export default function Tombol({ href, varian = "utama", className = "", children, ...props }) {
  const kelas = `inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utama focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${gaya[varian]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={kelas}>
        {children}
      </Link>
    );
  }

  return (
    <button className={kelas} {...props}>
      {children}
    </button>
  );
}
