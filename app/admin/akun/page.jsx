import NavAdmin from "@/components/NavAdmin";
import FormDenganStatus from "@/components/FormDenganStatus";
import { buatSupabaseServer, buatSupabaseSesi } from "@/lib/supabase";
import { buatAkunAdmin, ubahStatusAkunAdmin } from "@/app/admin/extra-actions";

export default async function AdminAkun() {
  const session = await buatSupabaseSesi();
  const { data: { user } } = await session.auth.getUser();
  const service = buatSupabaseServer();
  const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const users = (data?.users || []).filter((item) => item.app_metadata?.role === "admin");
  return <section className="flex flex-col gap-6 py-8"><NavAdmin /><div><h1 className="text-2xl font-extrabold">Akun admin</h1><p className="mt-1 text-sm text-teks-lembut">Buat akun admin dan nonaktifkan akun lain yang tidak lagi digunakan.</p></div>
    <FormDenganStatus action={buatAkunAdmin} label="Buat akun admin" className="max-w-xl gap-4"><label className="grid gap-1 text-sm font-semibold">Email<input name="email" type="email" required maxLength={255} autoComplete="email" className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-semibold">Password awal (minimal 12 karakter)<input name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" className="rounded-lg border border-garis bg-latar px-3 py-2 font-normal" /></label></FormDenganStatus>
    {error ? <p role="alert">Daftar akun tidak dapat dimuat.</p> : <div className="grid gap-3">{users.map((item) => { const aktif = !item.banned_until || new Date(item.banned_until) <= new Date(); return <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-garis p-4"><div><p className="font-semibold">{item.email}</p><p className="text-xs text-teks-lembut">{item.id === user?.id ? "Akun saat ini" : aktif ? "Aktif" : "Nonaktif"}</p></div>{item.id !== user?.id && <FormDenganStatus action={ubahStatusAkunAdmin} label={aktif ? "Nonaktifkan" : "Aktifkan"} className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={item.id} /><input type="hidden" name="aktif" value={String(!aktif)} /></FormDenganStatus>}</article>; })}</div>}
  </section>;
}
