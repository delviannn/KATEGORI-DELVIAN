import { buatSupabaseServer } from "@/lib/supabase";

const siteUrl = process.env.SITE_URL || "https://katalog-delvian.vercel.app";

export default async function sitemap() {
  const fixed = ["", "/tentang", "/kontak"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path ? 0.6 : 1,
  }));

  try {
    const supabase = buatSupabaseServer();
    const { data } = await supabase.from("produk").select("id, diperbarui_at, created_at").eq("aktif", true);
    const products = (data || []).map((product) => ({
      url: `${siteUrl}/produk/${product.id}`,
      lastModified: product.diperbarui_at || product.created_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...fixed, ...products];
  } catch {
    return fixed;
  }
}
