const siteUrl = process.env.SITE_URL || "https://katalog-delvian.vercel.app";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
