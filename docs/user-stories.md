# User Story

Setiap user story diberi nomor. Pakai nomor ini di prompt ("kerjakan US-01") dan di pesan commit (`US-01: katalog dari database`).

## Wajib

### US-01 Katalog dari database

Sebagai pengunjung, saya ingin melihat semua produk toko dalam satu halaman, supaya saya tahu apa saja yang dijual.

Kriteria selesai:

- Halaman `/` menampilkan semua produk dari tabel `produk` di Supabase, bukan dari `lib/data-contoh.js`.
- Data diambil di sisi server.
- Setiap kartu menampilkan foto, kategori, nama, dan harga dalam format rupiah.
- Jika belum ada produk, halaman menampilkan pesan yang jelas.

### US-02 Detail produk

Sebagai pengunjung, saya ingin melihat detail satu produk, supaya saya yakin sebelum memesan.

Kriteria selesai:

- Halaman `/produk/[id]` menampilkan foto, kategori, nama, harga, dan deskripsi dari database.
- Produk yang tidak ada menampilkan halaman "tidak ditemukan".

### US-03 Pesan via WhatsApp

Sebagai pengunjung, saya ingin menekan satu tombol untuk memesan lewat WhatsApp, supaya saya tidak perlu mengetik ulang nama produk.

Kriteria selesai:

- Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor di `lib/toko.js`.
- Pesan sudah terisi otomatis dengan nama dan harga produk.
- Berfungsi di HP dan di laptop.

### US-04 Login admin

Sebagai admin, saya ingin masuk dengan email dan password, supaya hanya saya yang bisa mengelola toko.

Kriteria selesai:

- Login memakai Supabase Auth, diproses di server.
- Login berhasil mengarah ke `/admin`; login gagal menampilkan pesan yang jelas.
- Tombol "Keluar" mengakhiri sesi dan kembali ke halaman login.

### US-05 Ganti password

Sebagai admin, saya ingin mengganti password, supaya password bawaan tidak bisa dipakai orang lain.

Kriteria selesai:

- Form di `/admin/password` mengganti password admin yang sedang login.
- Password baru minimal 8 karakter dan harus sama dengan konfirmasinya.
- Menampilkan pesan berhasil atau pesan error yang jelas.

### US-06 Proteksi halaman admin

Sebagai admin, saya ingin halaman admin tertutup untuk orang lain, supaya data toko aman.

Kriteria selesai:

- Membuka halaman `/admin` mana pun tanpa login akan dialihkan ke `/admin/login`.
- Setiap aksi yang mengubah data memeriksa login di server.

## Bonus

### US-07 List Produk
Sebagai admin, saya ingin produk pada page `/admin` mengambil data dari database.

### US-08 Tambah produk

Sebagai admin, saya ingin menambah produk baru dari halaman admin. Kriteria: form di `/admin/produk/baru` menyimpan produk ke database, lalu kembali ke `/admin`.

### US-09 Ubah produk

Sebagai admin, saya ingin mengubah data produk. Kriteria: form di `/admin/produk/[id]/ubah` terisi data lama dan menyimpan perubahan ke database.

### US-10 Hapus produk

Sebagai admin, saya ingin menghapus produk. Kriteria: tombol "Hapus" meminta konfirmasi, lalu menghapus produk dari database.

### US-11 Filter kategori atau pencarian

Sebagai pengunjung, saya ingin menyaring produk berdasarkan kategori atau mencari nama produk.

### US-12 Pilih jumlah atau varian

Sebagai pengunjung, saya ingin memilih jumlah atau varian sebelum memesan, dan pilihan itu ikut tertulis di pesan WhatsApp.

### US-13 PWA

Sebagai pengunjung, saya ingin memasang katalog di layar HP seperti aplikasi. Ikon tersedia di `public/icons`.

### US-14 Deskripsi produk dibuat AI

Sebagai admin, saya ingin membuat deskripsi produk secara otomatis dengan AI (Gemini API) dari nama dan kategori produk.

Catatan: bonus US-08, US-09, dan US-10 hanya dihitung jika aksinya terlindungi login.

## User stories lanjutan

### US-15 Urutkan produk
Pengunjung dapat mengurutkan katalog berdasarkan terbaru, harga naik/turun, dan urutan pilihan toko.

### US-16 Paginasi
Katalog publik, halaman kategori, dan daftar admin memuat data dalam halaman terbatas.

### US-17 Produk terkait
Halaman detail menampilkan produk aktif dari kategori yang sama.

### US-18 Galeri beberapa foto produk
Admin dapat menyimpan foto tambahan dan pengunjung dapat memilihnya di galeri detail.

### US-19 Status stok
Stok tampil di kartu/detail dan produk habis tidak dapat dipesan.

### US-20 Harga promo
Harga coret hanya tampil jika lebih tinggi dari harga jual.

### US-21 Keranjang WhatsApp
Pengunjung mengumpulkan beberapa produk lalu mengirim satu ringkasan pesanan.

### US-22 Tentang dan kontak toko
Informasi toko dan kanal kontak tersedia untuk pengunjung.

### US-23 Bagikan produk
Pengunjung dapat membagikan atau menyalin URL produk.

### US-24 Favorit
Daftar favorit disimpan di browser dan dapat dibuka kembali.

### US-25 Mode gelap
Pengunjung dapat mengganti tema dan pilihan tersimpan di browser.

### US-26 Metadata SEO dan Open Graph
Halaman publik memiliki metadata, canonical, Open Graph, dan Twitter Card.

### US-27 sitemap.xml dan robots.txt
Peta situs memuat halaman publik aktif dan robots mengecualikan rute admin.

### US-28 404 dan loading
Halaman error 404 dan status loading memiliki tampilan khusus.

### US-29 Upload foto ke Supabase Storage
Foto produk diunggah dengan validasi format dan ukuran serta policy admin.

### US-30 Dashboard ringkasan admin
Dashboard merangkum total produk, status aktif, stok habis, dan popularitas.

### US-31 Kelola kategori
Admin dapat menambah, mengganti nama, dan menghapus kategori yang tidak dipakai produk.

### US-32 Status aktif produk
Admin dapat mengaktifkan atau menyembunyikan produk dari katalog.

### US-33 Cari dan paginasi admin
Daftar produk admin dapat dicari dan dinavigasi per halaman.

### US-34 Validasi server
Server memvalidasi seluruh data produk sebelum menyimpannya.

### US-35 Ekspor CSV
Admin dapat mengunduh daftar produk dalam CSV yang aman dibuka di spreadsheet.

### US-36 Terakhir dilihat
Produk yang pernah dibuka disimpan dan ditampilkan kembali di browser yang sama.

### US-37 Bandingkan produk
Pengunjung memilih hingga dua produk dan membandingkan harga, kategori, stok, dan deskripsi.

### US-38 Ulasan dan rating
Pengunjung mengirim rating dan ulasan yang menunggu persetujuan admin.

### US-39 Moderasi ulasan
Admin menyetujui atau menolak ulasan sebelum tampil untuk umum.

### US-40 Analitik klik WhatsApp
Klik pemesanan dicatat untuk produk aktif dan dapat dipakai dashboard admin.

### US-41 Produk terlaris
Dashboard menunjukkan nama produk dengan klik WhatsApp terbanyak.

### US-42 Banner promo
Admin mengelola banner promo dan memilih apakah banner tampil di beranda.

### US-43 Pengaturan toko
Admin memperbarui identitas, alamat, jam buka, nomor WhatsApp, dan informasi promo.

### US-44 Akun admin
Admin membuat akun admin dan menonaktifkan akun lain; akun saat ini dan admin aktif terakhir dilindungi.

### US-45 Log aktivitas admin
Aksi admin dicatat dan dapat ditelusuri di halaman log.

### US-46 Impor CSV
Admin mengimpor produk CSV setelah validasi semua baris dan batas file.

### US-47 Urutan tampil produk
Admin menetapkan urutan produk yang digunakan katalog dan dashboard.

### US-48 Varian harga
Admin mengatur harga per varian dan pilihan pelanggan ikut dalam pesanan.

### US-49 Halaman kategori
Setiap kategori memiliki halaman publik, metadata, dan paginasi.

### US-50 Asisten AI produk
Pengunjung menanyakan produk dan memperoleh jawaban yang dibatasi pada data katalog.
