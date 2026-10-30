import { buatSupabaseServer } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";

const pageSize = 1000;

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const fixed = ["", "/tentang", "/kontak"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: "weekly",
    priority: path ? 0.6 : 1,
  }));

  try {
    const supabase = buatSupabaseServer();
    const products = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("produk")
        .select("id, diperbarui_at, created_at")
        .eq("aktif", true)
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) break;
      for (const product of data || []) {
        products.push({
          url: new URL(`/produk/${product.id}`, siteUrl).toString(),
          lastModified: product.diperbarui_at || product.created_at,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      if (!data || data.length < pageSize) break;
    }
    const categories = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("kategori")
        .select("slug")
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) break;
      for (const category of data || []) {
        categories.push({
          url: new URL(`/kategori/${encodeURIComponent(category.slug)}`, siteUrl).toString(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
      if (!data || data.length < pageSize) break;
    }
    return [...fixed, ...categories, ...products];
  } catch {
    return fixed;
  }
}
