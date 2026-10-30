import { toko } from "@/lib/toko";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";

// US-13: Web App Manifest untuk PWA
export default async function manifest() {
  const settings = await ambilPengaturanToko();
  return {
    name: settings.nama || toko.nama,
    short_name: settings.nama || toko.nama,
    description: settings.tagline || toko.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

