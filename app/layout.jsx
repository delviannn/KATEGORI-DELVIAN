import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import { getSiteUrl } from "@/lib/site";
import { headers } from "next/headers";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";

export async function generateMetadata() {
  const toko = await ambilPengaturanToko();
  return {
    metadataBase: getSiteUrl(),
    title: toko.nama,
    description: toko.tagline,
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "id_ID", siteName: toko.nama, title: toko.nama, description: toko.tagline, url: "/" },
    twitter: { card: "summary", title: toko.nama, description: toko.tagline },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "default", title: toko.nama },
    icons: { apple: "/icons/icon-192.png" },
  };
}

export const viewport = {
  themeColor: "#16a34a",
};

export default async function RootLayout({ children }) {
  // Reads the request so nonce-based CSP is applied to dynamically rendered scripts.
  const requestHeaders = await headers();
  const settings = await ambilPengaturanToko();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.nama,
    description: settings.tagline,
    url: getSiteUrl().toString(),
    telephone: settings.nomorWhatsApp,
    address: { "@type": "PostalAddress", streetAddress: settings.alamat },
  };
  return (
    <html lang="id">
      <head>
        <script type="application/ld+json" nonce={requestHeaders.get("x-nonce") || undefined}>{JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header toko={settings} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer toko={settings} />
        <PWARegister />
      </body>
    </html>
  );
}
