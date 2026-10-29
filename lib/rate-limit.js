import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { buatSupabaseServer } from "@/lib/supabase";

export async function batasiPermintaan(kunciAksi, batas, detik) {
  const requestHeaders = await headers();
  const alamat = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = createHash("sha256").update(`${kunciAksi}:${alamat}`).digest("hex");
  try {
    const supabase = buatSupabaseServer();
    const { data, error } = await supabase.rpc("rate_limit_consume", {
      bucket_key: bucket,
      request_limit: batas,
      window_seconds: detik,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}
