import { buatSupabaseServer } from "@/lib/supabase";
import FormUlasan from "@/components/FormUlasan";

// US-38: tampilkan ulasan yang disetujui, rating rata-rata, dan form kirim ulasan.
export default async function UlasanProduk({ id }) {
  const supabase = buatSupabaseServer();
  const { data: ulasan } = await supabase
    .from("ulasan")
    .select("nama,rating,isi,created_at")
    .eq("produk_id", id)
    .eq("status", "disetujui")
    .order("created_at", { ascending: false })
    .limit(20);

  const jumlah = ulasan?.length || 0;
  const rata = jumlah
    ? (ulasan.reduce((total, item) => total + item.rating, 0) / jumlah).toFixed(1)
    : null;

  return (
    <div>
      <h2 className="text-xl font-bold">
        Ulasan pelanggan
        {rata && <span className="ml-2 text-sm font-semibold text-amber-600">★ {rata} ({jumlah})</span>}
      </h2>
      {ulasan?.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ulasan.map((item, index) => (
            <article key={`${item.created_at}-${index}`} className="rounded-xl border border-garis p-4">
              <p className="font-semibold">
                {item.nama} <span className="text-amber-600">{"★".repeat(item.rating)}</span>
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-teks-lembut">{item.isi}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-teks-lembut">Belum ada ulasan yang disetujui.</p>
      )}
      <h3 className="mt-6 font-bold">Tulis ulasan</h3>
      <FormUlasan produkId={id} />
    </div>
  );
}