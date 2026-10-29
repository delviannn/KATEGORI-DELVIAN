export default function LoadingKatalog() {
  return (
    <section aria-label="Memuat katalog" aria-busy="true" className="py-10">
      <div className="h-64 animate-pulse rounded-[2rem] bg-permukaan sm:h-80" />
      <div className="mt-10 flex items-center justify-between">
        <div className="h-7 w-44 animate-pulse rounded bg-permukaan" />
        <p role="status" className="text-sm text-teks-lembut">Memuat katalog produk…</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-garis p-3">
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-permukaan sm:aspect-square" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-permukaan" />
          <div className="mt-3 h-6 w-1/2 animate-pulse rounded bg-permukaan" />
        </div>)}
      </div>
    </section>
  );
}
