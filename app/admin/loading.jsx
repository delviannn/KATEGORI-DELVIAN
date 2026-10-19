import NavAdmin from "@/components/NavAdmin";

// Loading skeleton state untuk halaman admin saat data sedang diambil dari Supabase
export default function LoadingAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8 animate-pulse">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-8 w-32 rounded-lg bg-permukaan" />
        <div className="h-10 w-36 rounded-lg bg-permukaan" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
        <div className="h-11 bg-permukaan border-b border-garis" />
        <div className="divide-y divide-garis">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-permukaan" />
                <div className="h-4 w-40 rounded bg-permukaan" />
              </div>
              <div className="h-4 w-20 rounded bg-permukaan" />
              <div className="h-4 w-24 rounded bg-permukaan" />
              <div className="h-4 w-16 rounded bg-permukaan" />
              <div className="h-6 w-16 rounded-full bg-permukaan" />
              <div className="flex gap-2">
                <div className="h-8 w-16 rounded-lg bg-permukaan" />
                <div className="h-8 w-16 rounded-lg bg-permukaan" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

