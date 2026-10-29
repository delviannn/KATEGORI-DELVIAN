import { NextResponse } from "next/server";
import { buatSupabaseServer } from "@/lib/supabase";
import { batasiPermintaan } from "@/lib/rate-limit";

export async function POST(request) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 415 });
  }
  if (!(await batasiPermintaan("whatsapp_click", 60, 3600))) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }
  try {
    if (Number(request.headers.get("content-length") || 0) > 1024) {
      return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413 });
    }
    const rawBody = await request.text();
    if (rawBody.length > 1024) return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413 });
    const body = JSON.parse(rawBody);
    const produkId = Number(body.produkId);
    const jumlah = Number(body.jumlah || 1);
    if (!Number.isSafeInteger(produkId) || produkId < 1 || !Number.isSafeInteger(jumlah) || jumlah < 1 || jumlah > 1000) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }
    const supabase = buatSupabaseServer();
    const { data: product, error: productError } = await supabase
      .from("produk").select("id").eq("id", produkId).eq("aktif", true).maybeSingle();
    if (productError || !product) return NextResponse.json({ error: "Produk tidak tersedia." }, { status: 404 });
    const { error } = await supabase.from("klik_whatsapp").insert({ produk_id: produkId, jumlah });
    if (error) return NextResponse.json({ error: "Pencatatan tidak tersedia." }, { status: 503 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses." }, { status: 400 });
  }
}
