import { getSiteUrl } from "@/lib/site";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString(),
  };
}
