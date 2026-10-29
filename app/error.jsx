"use client";

export default function ErrorPage({ reset }) {
  return (
    <section role="alert" className="mx-auto max-w-xl py-20 text-center">
      <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-harga-latar text-2xl">!</span>
      <h1 className="mt-5 text-2xl font-extrabold text-teks">Halaman belum bisa ditampilkan</h1>
      <p className="mt-2 text-sm leading-6 text-teks-lembut">Terjadi kendala saat memuat halaman. Coba lagi sebentar lagi.</p>
      <button type="button" onClick={() => reset()} className="mt-6 min-h-11 rounded-xl bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap">Coba lagi</button>
    </section>
  );
}
