import { NextResponse } from "next/server";
import { buatSupabaseServer } from "@/lib/supabase";
import { batasiPermintaan } from "@/lib/rate-limit";

export async function POST(request) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 4096) return NextResponse.json({ error: "Ulasan terlalu besar." }, { status: 413 });
  if (!(await batasiPermintaan("review_submit", 5, 3600))) return NextResponse.json({ error: "Batas pengiriman ulasan tercapai. Coba lagi nanti." }, { status: 429 });
  try {
    const raw = await request.text();
    if (raw.length > 4096) return NextResponse.json({ error: "Ulasan terlalu besar." }, { status: 413 });
    const body = JSON.parse(raw);
    if (body.website) return new NextResponse(null, { status: 204 });
    const produkId = Number(body.produkId);
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    const isi = typeof body.isi === "string" ? body.isi.trim() : "";
    const rating = Number(body.rating);
    if (!Number.isSafeInteger(produkId) || produkId < 1 || nama.length < 2 || nama.length > 80 || isi.length < 5 || isi.length > 1200 || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Nama, rating, atau isi ulasan tidak valid." }, { status: 400 });
    const supabase = buatSupabaseServer();
    const { data: product } = await supabase.from("produk").select("id").eq("id", produkId).eq("aktif", true).maybeSingle();
    if (!product) return NextResponse.json({ error: "Produk tidak tersedia." }, { status: 404 });
    const { error } = await supabase.from("ulasan").insert({ produk_id: produkId, nama, rating, isi, status: "menunggu" });
    if (error) return NextResponse.json({ error: "Ulasan belum dapat dikirim." }, { status: 503 });
    return NextResponse.json({ sukses: "Terima kasih. Ulasan menunggu moderasi admin." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 });
  }
}
