# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
> Baca AGENTS.md dan docs/user-stories.md bagian US-01.
> Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.
> Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Membuat fungsi koneksi server `buatSupabaseServer()` di `lib/supabase.js` menggunakan `@supabase/supabase-js`.
- Mengubah `app/page.jsx` menjadi async Server Component yang membaca tabel `produk`.
- Menampilkan daftar produk menggunakan `KartuProduk`, pesan error bila gagal memuat, dan tulisan "Belum ada produk" saat data kosong.
- Menghapus komponen `CatatanBelumAktif`.

**Perbaikan:**
- Mengatasi warning deprecation `baseUrl` pada `jsconfig.json` dengan menambahkan `"ignoreDeprecations": "6.0"`.

## US-02 Detail produk

**Prompt:**
> Baca docs/user-stories.md bagian US-02.
> Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**
- Mengubah `app/produk/[id]/page.jsx` untuk mengambil satu produk dari tabel `produk` berdasarkan `id` di URL menggunakan `buatSupabaseServer()`.
- Memanggil `notFound()` jika data produk tidak ditemukan atau terjadi error.
- Mempertahankan tampilan dan susunan komponen detail produk.
- Menghapus komponen `CatatanBelumAktif`.

**Perbaikan:**
- Memastikan `params` di-await (`const { id } = await params`) sesuai standar Next.js 16.

## US-03 Pesan via WhatsApp

**Prompt:**
> Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".
> Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**
- Mengubah `components/TombolWhatsApp.jsx` dari button biasa menjadi tag `<a>` menuju `https://wa.me/<nomor>?text=<pesan>`.
- Nomor tujuan diambil dari `toko.nomorWhatsApp` di `lib/toko.js`.
- Pesan otomatis diformat dengan nama produk dan harga rupiah ter-encode `encodeURIComponent`.
- Tautan membuka di tab baru (`target="_blank"`, `rel="noopener noreferrer"`).

**Perbaikan:**
- Mempertahankan semua styling tombol Tailwind CSS agar tampilan antarmuka tidak berubah.

## US-04 Login admin

**Prompt:**
> Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.
> Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
- Menambahkan fungsi `buatSupabaseSesi()` di `lib/supabase.js` menggunakan `@supabase/ssr` dan cookie handling.
- Membuat file `app/admin/actions.js` berisi Server Action `login` dan `keluar`.
- Menyambungkan form di `app/admin/login/page.jsx` dengan `useActionState` untuk menampilkan pesan error saat login gagal dan redirect ke `/admin` saat berhasil.
- Menyambungkan tombol "Keluar" di `components/NavAdmin.jsx` ke action `keluar`.
- Menghapus `CatatanBelumAktif` dari halaman login.

**Perbaikan:**
- Menggunakan `cookies()` dari `next/headers` yang asynchronous pada Next.js 16.

## US-05 Ganti password

**Prompt:**
> Baca docs/user-stories.md bagian US-05.
> Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Menambahkan Server Action `gantiPassword` di `app/admin/actions.js`.
- Menambahkan validasi server: panjang password minimal 8 karakter, konfirmasi password wajib cocok, dan memvalidasi sesi aktif dengan `getUser()`.
- Menghubungkan form di `app/admin/password/page.jsx` dengan `useActionState` serta menampilkan notifikasi sukses/error.
- Menghapus `CatatanBelumAktif`.

**Perbaikan:**
- Memastikan sesi admin yang valid dicek sebelum mengeksekusi `updateUser()`.

## US-06 Proteksi halaman admin

**Prompt:**
> Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.
> Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
- Membuat file `proxy.js` di root proyek untuk memproteksi semua rute `/admin/:path*` menggunakan `@supabase/ssr`.
- Pengguna yang belum login dialihkan ke `/admin/login`.
- Pengguna yang sudah login yang mengakses `/admin/login` dialihkan ke `/admin`.
- Menghapus `CatatanBelumAktif` dari `app/admin/page.jsx`.

**Perbaikan:**
- Menambahkan matcher yang mencakup `/admin` dan `/admin/:path*` untuk proteksi menyeluruh.

## Debugging dan fitur bonus

**[SENDIRI] Penanganan Deprecation baseUrl di jsconfig.json**
- **Masalah:** TypeScript 7.0 deprecation warning pada konfigurasi `baseUrl`.
- **Solusi:** Menambahkan `"ignoreDeprecations": "6.0"` di `jsconfig.json`.

**[SENDIRI] Proteksi Navigasi Masuk Admin**
- **Masalah:** Halaman `/admin` sempat dapat diakses langsung sebelum proxy aktif.
- **Solusi:** Mengaktifkan `proxy.js` sesuai standar Next.js 16 sehingga seluruh rute `/admin` terproteksi otomatis.

## US-07 (Bonus) List Produk di Halaman Admin dari Database

**Prompt:**
> Bertindak sebagai Senior Full Stack Developer yang berpengalaman membangun aplikasi e-commerce menggunakan Next.js, Supabase, dan Vercel. Implementasikan fitur User Story US-07: List Produk di Halaman Admin dari Database. Sesuai halaman tadi buat agar serasi.

**Hasil:**
- Mengubah `app/admin/page.jsx` untuk mengambil seluruh daftar produk secara dinamis dari database Supabase melalui `buatSupabaseServer()`.
- Memperbarui `components/TabelProduk.jsx` untuk menampilkan kolom: Nama Produk (beserta thumbnail foto), Kategori, Harga (format rupiah), Stok, Status Produk (badge aktif), dan tombol Aksi.
- Menambahkan empty state yang informatif ketika belum ada produk di database.
- Menambahkan penanganan error Supabase secara jelas dan elegan di halaman admin.
- Membuat `app/admin/loading.jsx` untuk menampilkan skeleton loading state saat data produk sedang diambil.

**Perbaikan:**
- Menyediakan fallback nilai stok dan status tanpa mengubah integritas skema database existing di `docs/schema.sql`.

## US-08 Tambah Produk (Terkunci Login)

**Prompt:**
> Implementasikan fitur Admin Product Management: US-08: Tambah Produk (harus terkunci login).

**Hasil:**
- Membuat Server Action `tambahProduk` di `app/admin/actions.js` dengan validasi autentikasi admin (`getUser()`) dan validasi input data wajib (nama, harga positif).
- Memperbarui `components/FormProduk.jsx` dan `app/admin/produk/baru/page.jsx` untuk menyimpan data produk langsung ke Supabase, menampilkan notifikasi error/sukses, dan melakukan revalidasi cache.
- Menghapus komponen `CatatanBelumAktif`.

**Perbaikan:**
- Menyediakan default fallback untuk link foto dan memastikan alur redirect kembali ke `/admin` secara otomatis setelah simpan berhasil.

## US-09 Ubah Produk (Terkunci Login)

**Prompt:**
> Implementasikan fitur Admin Product Management: US-09: Ubah Produk (harus terkunci login).

**Hasil:**
- Membuat Server Action `ubahProduk` di `app/admin/actions.js` dengan proteksi login admin dan validasi data.
- Memperbarui `app/admin/produk/[id]/ubah/page.jsx` untuk mengambil data produk langsung dari Supabase berdasarkan id URL dan mengisinya ke `FormProduk`.
- Melakukan revalidasi cache halaman admin dan detail produk publik saat update berhasil.
- Menghapus komponen `CatatanBelumAktif`.

**Perbaikan:**
- Menghapus ketergantungan pada `cariProdukContoh` dan menggantikannya dengan query Supabase database langsung.

## US-10 Hapus Produk (Terkunci Login)

**Prompt:**
> Implementasikan fitur Admin Product Management: US-10: Hapus Produk (harus terkunci login).

**Hasil:**
- Membuat Server Action `hapusProduk` di `app/admin/actions.js` dengan proteksi autentikasi admin di server.
- Membuat komponen client `components/TombolHapusProduk.jsx` yang menampilkan dialog konfirmasi browser sebelum menghapus.
- Mengintegrasikan `TombolHapusProduk` ke dalam `components/TabelProduk.jsx`.
- Melakukan pembaruan daftar produk secara otomatis via `revalidatePath` dan `useTransition`.

**Perbaikan:**
- Menambahkan alert penanganan error jika penghapusan produk gagal dieksekusi.
