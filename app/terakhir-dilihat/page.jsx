import DaftarInteraksi from "@/components/DaftarInteraksi";
export const metadata = { title: "Terakhir dilihat", robots: { index: false, follow: false } };
export default function HalamanTerakhirDilihat() { return <DaftarInteraksi jenis="terakhir" />; }
