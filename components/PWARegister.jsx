"use client";

import { useEffect, useState } from "react";

// US-13: Registrasi Service Worker & Tombol Install PWA
export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Daftarkan service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("PWA Service Worker registration failed:", err);
        });
    }

    // Tangani event install prompt PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBtn) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-garis bg-latar p-3 shadow-lg">
      <div className="flex flex-col text-xs">
        <span className="font-bold text-teks">Pasang Aplikasi</span>
        <span className="text-teks-lembut">Akses cepat dari layar utama</span>
      </div>
      <button
        type="button"
        onClick={handleInstallClick}
        className="rounded-xl bg-utama px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap transition-colors"
      >
        Install
      </button>
      <button
        type="button"
        onClick={() => setShowInstallBtn(false)}
        className="text-xs text-teks-lembut hover:text-teks p-1"
        aria-label="Tutup"
      >
        ✕
      </button>
    </div>
  );
}

