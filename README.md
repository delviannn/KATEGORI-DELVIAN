# Katalog UMKM + Order WhatsApp

Template workshop vibe coding Creative Hub App Talent (CHAT) 2026. Repo ini berisi tampilan aplikasi katalog UMKM; tugasmu merangkainya menjadi sistem utuh dengan bantuan AI: database, login admin, keamanan, dan pemesanan lewat WhatsApp.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fandixurniawan%2Fkatalog-umkm&project-name=katalog-umkm&repository-name=katalog-umkm)

## Langkah awal

1. **Salin repo ke akun GitHub-mu.** Klik tombol **Deploy with Vercel** di atas. Vercel akan membuat repo baru di akun GitHub-mu dan langsung men-deploy-nya. Setelah selesai, buka link Vercel-mu: katalog tampil dengan data contoh.
2. **Buat proyek Supabase.** Masuk ke [supabase.com](https://supabase.com) dengan akun GitHub, lalu buat proyek baru. Simpan password database di tempat aman.
3. **Siapkan database.** Migration berurutan ada di `supabase/migrations`. Pasang Supabase CLI, jalankan `supabase login`, `supabase link --project-ref <PROJECT_REF>`, lalu `supabase db push`. Jika memakai SQL Editor, jalankan file migration berdasarkan urutan timestamp. Migration memperbarui relasi kategori, ulasan, statistik, pengaturan toko, rate limit, dan policy Storage/RLS.
4. **Siapkan akun admin.** Buat akun di Supabase Auth dan matikan pendaftaran akun baru di **Authentication > Sign In / Providers**. Akses admin dibatasi dengan `app_metadata.role = "admin"`; gunakan SQL Editor untuk memberi role hanya kepada UUID admin yang benar:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where id = '<UUID_ADMIN_DARI_AUTH_USERS>';
   ```

   Keluar lalu login kembali agar token baru memuat role admin. Jangan memberi role ini lewat `user_metadata`.
5. **Isi environment variable di Vercel.** Buka proyekmu di Vercel > **Settings > Environment Variables**, lalu isi tiga variabel Supabase dari `.env.example` dan `SITE_URL` dengan domain produksi kanonis. Tambahkan `OPENAI_API_KEY` atau `GEMINI_API_KEY` untuk mengaktifkan generator deskripsi dan asisten tanya jawab. Setelah mengubah environment variable, lakukan **Redeploy**.
6. **Clone repo ke laptop.**

   ```bash
   git clone https://github.com/<akunmu>/<nama-repo>.git
   cd <nama-repo>
   npm install
   ```

7. **Buat file `.env.local`.** Salin `.env.example` menjadi `.env.local`, lalu isi dengan nilai yang sama seperti di Vercel.
8. **Jalankan di laptop.**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## Alur kerja

Kerjakan satu user story setiap kali, lalu simpan dan kirim perubahan:

```bash
git add .
git commit -m "US-01: katalog dari database"
git push
```

Setiap `git push`, Vercel otomatis men-deploy versi terbaru. Cek hasilnya di link Vercel-mu.

Urutan yang disarankan: US-01, US-02, US-03, US-04, US-05, US-06, lalu fitur bonus. Daftar lengkap ada di `docs/user-stories.md`.

## Isi repo

| File atau folder | Isi |
| --- | --- |
| `AGENTS.md` | Aturan untuk AI agent, dibaca sebelum setiap prompt |
| `DESIGN.md` | Panduan warna, huruf, dan komponen |
| `PROMPTS.md` | Jurnal prompt, wajib diisi |
| `docs/` | Problem statement, PRD, user story, rancangan teknis, skema database, checklist |
| `lib/toko.js` | Nama toko, nomor WhatsApp, alamat, jam buka |
| `app/` | Halaman aplikasi |
| `components/` | Komponen tampilan |

## Menyesuaikan dengan usahamu

- Identitas toko: ubah `lib/toko.js`.
- Warna: ubah bagian `@theme` di `app/globals.css` (lihat `DESIGN.md`).
- Produk: ubah langsung di Supabase > **Table Editor > produk**.

## Aturan penting

- Jangan menyimpan kunci atau password di kode, dan jangan push file `.env.local`.
- Jangan memberi awalan `NEXT_PUBLIC_` pada environment variable.
- Isi `PROMPTS.md` setiap menyelesaikan fitur.
- Setelah pembaruan aplikasi yang menambah kolom, fungsi, trigger, atau indeks, jalankan migration baru di Supabase sebelum memakai fitur terkait di production.

## Sebelum mengumpulkan

1. Jalankan semua poin di `docs/checklist-keamanan.md` dan `docs/checklist-pengujian.md` pada link Vercel.
2. Lengkapi bagian di bawah ini.
3. Push perubahan terakhir sebelum batas waktu.

## Tentang aplikasi ini

- **Nama usaha:** Toko Delviann
- **Pembuat:** Delvian (delviannn)
- **Link aplikasi:** https://katalog-delvian.vercel.app
- **Fitur bonus yang dikerjakan:** US-07 (List Produk), US-08 (Tambah Produk), US-09 (Ubah Produk), US-10 (Hapus Produk), US-11 (Filter & Pencarian), US-12 (Pilih Jumlah & Varian), US-13 (PWA), US-14 (Deskripsi AI)
