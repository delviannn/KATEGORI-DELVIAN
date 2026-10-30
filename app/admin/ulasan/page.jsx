import NavAdmin from "@/components/NavAdmin";
import FormDenganStatus from "@/components/FormDenganStatus";
import { buatSupabaseServer } from "@/lib/supabase";
import { moderasiUlasan } from "@/app/admin/extra-actions";

export default async function AdminUlasan() {
  const supabase = buatSupabaseServer();
  const { data: reviews, error } = await supabase.from("ulasan").select("id,produk_id,nama,rating,isi,status,created_at").order("created_at", { ascending: false }).limit(100);
  const ids = [...new Set((reviews || []).map((review) => review.produk_id))];
  const { data: products } = ids.length ? await supabase.from("produk").select("id,nama").in("id", ids) : { data: [] };
  const names = new Map((products || []).map((product) => [product.id, product.nama]));
  return <section className="flex flex-col gap-6 py-8"><NavAdmin /><div><h1 className="text-2xl font-extrabold">Moderasi ulasan</h1><p className="mt-1 text-sm text-teks-lembut">Ulasan publik baru perlu disetujui terlebih dahulu.</p></div>
    {error ? <p role="alert">Data ulasan belum tersedia. Jalankan migration database terbaru.</p> : !reviews?.length ? <p className="rounded-xl border border-garis p-5 text-sm">Belum ada ulasan.</p> : <div className="grid gap-4">{reviews.map((review) => <article key={review.id} className="rounded-xl border border-garis p-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{review.nama} · {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</h2><span className="text-sm">{review.status}</span></div><p className="mt-1 text-xs text-teks-lembut">Produk: {names.get(review.produk_id) || `#${review.produk_id}`}</p><p className="mt-3 whitespace-pre-line text-sm">{review.isi}</p>{review.status === "menunggu" && <div className="mt-4 flex gap-3"><FormDenganStatus action={moderasiUlasan} label="Setujui" className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={review.id} /><input type="hidden" name="status" value="disetujui" /></FormDenganStatus><FormDenganStatus action={moderasiUlasan} label="Tolak" className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={review.id} /><input type="hidden" name="status" value="ditolak" /></FormDenganStatus></div>}</article>)}</div>}
  </section>;
}
