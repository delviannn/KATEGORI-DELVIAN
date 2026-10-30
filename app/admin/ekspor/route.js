import { NextResponse } from "next/server";
import { buatSupabaseSesi, buatSupabaseServer } from "@/lib/supabase";

function cell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await buatSupabaseSesi();
  const { data: { user } } = await session.auth.getUser();
  if (user?.app_metadata?.role !== "admin") return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const supabase = buatSupabaseServer();
  const columns = ["id", "nama", "harga", "kategori", "deskripsi", "foto_url", "stok", "aktif", "harga_coret", "urutan"];
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("produk").select(columns.join(",")).order("id").range(from, from + 999);
    if (error) return NextResponse.json({ error: "Ekspor produk gagal." }, { status: 503 });
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => cell(row[column])).join(","))].join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="produk-katalog.csv"', "Cache-Control": "private, no-store" } });
}
