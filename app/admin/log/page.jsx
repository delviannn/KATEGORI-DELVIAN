import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import { buatSupabaseServer } from "@/lib/supabase";

const pageSize = 50;

export default async function HalamanLogAdmin({ searchParams }) {
  const params = (await searchParams) || {};
  const halaman = Math.max(1, Math.min(10000, Number.parseInt(params.halaman, 10) || 1));
  const supabase = buatSupabaseServer();
  const { data: aktivitas, error, count } = await supabase
    .from("log_admin")
    .select("admin_id, aksi, entitas, entitas_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((halaman - 1) * pageSize, halaman * pageSize - 1);

  return <div className="flex flex-col gap-6 py-8">
    <NavAdmin />
    <div>
      <h1 className="text-2xl font-extrabold">Aktivitas admin</h1>
      <p className="mt-1 text-sm text-teks-lembut">Riwayat perubahan akun dan produk.</p>
    </div>
    {error ? <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">Riwayat aktivitas belum dapat dimuat. Pastikan migration katalog terbaru sudah dijalankan.</p> : !aktivitas?.length ? <p className="rounded-xl border border-garis p-6 text-sm text-teks-lembut">Belum ada aktivitas tercatat.</p> : <div className="overflow-x-auto rounded-xl border border-garis">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut"><tr><th className="px-4 py-3">Waktu</th><th className="px-4 py-3">Aksi</th><th className="px-4 py-3">Entitas</th><th className="px-4 py-3">Admin</th></tr></thead>
        <tbody className="divide-y divide-garis">{aktivitas.map((item, index) => <tr key={`${item.created_at}-${item.aksi}-${index}`}>
          <td className="whitespace-nowrap px-4 py-3">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.created_at))}</td>
          <td className="px-4 py-3">{item.aksi}</td>
          <td className="px-4 py-3">{item.entitas}{item.entitas_id ? ` #${item.entitas_id}` : ""}</td>
          <td className="px-4 py-3 font-mono text-xs">{item.admin_id}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    {!error && count > pageSize && <nav aria-label="Navigasi riwayat aktivitas" className="flex items-center justify-center gap-4">
      {halaman > 1 ? <Link className="rounded-lg border border-garis px-4 py-2" href={`/admin/log?halaman=${halaman - 1}`}>Lebih baru</Link> : <span />}
      <span className="text-sm text-teks-lembut">Halaman {halaman} dari {Math.ceil(count / pageSize)}</span>
      {halaman < Math.ceil(count / pageSize) ? <Link className="rounded-lg border border-garis px-4 py-2" href={`/admin/log?halaman=${halaman + 1}`}>Lebih lama</Link> : <span />}
    </nav>}
  </div>;
}
