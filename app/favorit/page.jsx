import DaftarInteraksi from "@/components/DaftarInteraksi";
export const metadata = { title: "Favorit", robots: { index: false, follow: false } };
export default function HalamanFavorit() { return <DaftarInteraksi jenis="favorit" />; }
