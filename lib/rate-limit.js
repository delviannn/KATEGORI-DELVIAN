import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { buatSupabaseServer } from "@/lib/supabase";

export async function batasiPermintaan(kunciAksi, batas, detik, identitas = "") {
  const requestHeaders = await headers();
  const alamat = requestHeaders.get("x-real-ip")?.trim() ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const secret = process.env.SUPABASE_SECRET_KEY || "";
  const keys = [`${kunciAksi}:ip:${alamat}`];
  if (identitas) keys.push(`${kunciAksi}:identity:${identitas.trim().toLowerCase()}`);
  try {
    const supabase = buatSupabaseServer();
    for (const key of keys) {
      const bucket = createHash("sha256").update(`${secret}:${key}`).digest("hex");
      const { data, error } = await supabase.rpc("rate_limit_consume", {
        bucket_key: bucket,
        request_limit: batas,
        window_seconds: detik,
      });
      if (error || data !== true) return false;
    }
    return true;
  } catch {
    return false;
  }
}
