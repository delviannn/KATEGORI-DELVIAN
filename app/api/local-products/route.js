import { NextResponse } from "next/server";
import { buatSupabaseServer } from "@/lib/supabase";

export async function GET(request) {
  const raw = request.nextUrl.searchParams.get("ids") || "";
  const ids = [...new Set(raw.split(",").filter((id) => /^\d{1,15}$/.test(id)).map(Number))];
  if (!ids.length || ids.length > 100 || ids.some((id) => !Number.isSafeInteger(id) || id < 1)) return NextResponse.json({ products: [] });
  const supabase = buatSupabaseServer();
  const { data, error } = await supabase.from("produk").select("id,nama,harga,harga_coret,foto_url,kategori,stok,varian,deskripsi").eq("aktif", true).in("id", ids);
  if (error) return NextResponse.json({ error: "Produk tidak dapat dimuat." }, { status: 503 });
  return NextResponse.json({ products: data || [] }, { headers: { "Cache-Control": "private, no-store" } });
}
