"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const enabled = localStorage.getItem("katalog:tema") === "gelap";
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
  }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("katalog:tema", next ? "gelap" : "terang");
    setDark(next);
  }
  return <button type="button" onClick={toggle} aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"} aria-pressed={dark} className="rounded-lg border border-garis px-3 py-2 text-sm">{dark ? "☀️" : "🌙"}</button>;
}
