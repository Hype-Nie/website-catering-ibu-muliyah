# Menjalankan frontend Dapur Menteng

Jalankan `php artisan serve`, lalu buka `http://127.0.0.1:8000`.
CSS, JavaScript, foto, dan font dilayani langsung dari `public`; pratinjau ini tidak memerlukan npm/Vite.

Untuk pratinjau tanpa database, gunakan `SESSION_DRIVER=file` dan `CACHE_STORE=file` di `.env`, lalu jalankan `php artisan config:clear`. Konfigurasi lokal workspace sudah disesuaikan karena PHP yang tersedia belum mengaktifkan driver PDO SQLite.

## Halaman

| URL | Halaman |
| --- | --- |
| `/` | Beranda, pilihan penyajian, cara pesan, pengiriman |
| `/menu` | Katalog, pencarian, filter kategori, dialog detail |
| `/keranjang` | Porsi, catatan, subtotal, hapus menu |
| `/checkout` | Penerima, H-1, jadwal, delivery / pick-up |
| `/pembayaran` | Rekening contoh, konfirmasi dan pratinjau bukti |
| `/pesanan` | Riwayat dan filter status |
| `/lacak-pesanan` | Timeline, rincian, cetak invoice |
| `/login`, `/register` | Form akun dan pratinjau pelanggan |
| `/admin` | Ringkasan dan grafik pesanan |
| `/admin/menu` | Tambah, edit, hapus, ketersediaan menu |
| `/admin/pesanan` | Filter, detail, verifikasi, penolakan, progres |
| `/admin/pelanggan` | Direktori dan riwayat belanja |
| `/admin/laporan` | Filter periode, metrik, CSV, cetak / PDF |

## Data demo

Interaksi menggunakan localStorage dengan awalan `menteng-`. Tidak ada transaksi bank, autentikasi server, pengiriman berkas ke server, atau pembaruan database. Password tidak disimpan atau diperiksa oleh server. Gunakan tombol **Coba sebagai pelanggan** di halaman masuk untuk menjelajahi riwayat contoh. Panel admin terbuka untuk pratinjau, bukan area admin produksi.

Checkout menegakkan minimum porsi, tanggal H-1, serta simulasi radius delivery 20 km. Tarif contoh Rp15.000 untuk 5 km pertama, kemudian Rp2.000/km. Pick-up gratis. Peta Leaflet dan geocoding aktual belum diintegrasikan. Rekening bank adalah data contoh; jangan transfer.

Bukti JPG/PNG/PDF maksimal 2 MB disimpan di browser untuk demonstrasi verifikasi. Reset data tersedia di bagian atas halaman admin. Data di browser berbeda tidak saling terhubung.

Laporan mengunduh CSV yang dapat dibuka di Excel. Tombol cetak menggunakan dialog browser, termasuk pilihan simpan PDF; belum menghasilkan `.xlsx` atau PDF dari server.

## Aset ilustrasi

Foto hanya untuk ilustrasi prototipe, bukan dokumentasi produk Dapur Menteng. Ganti dengan foto milik usaha sebelum publikasi komersial.

- `hero.jpg`: [Nasi Uduk Betawi Mpok Leha, GoFood](https://gofood.co.id/jakarta/restaurant/nasi-uduk-betawi-mpok-leha-kelapa-gading-f08cfef6-8bd8-4da0-aa31-8492abd5a716).
- `satuan.jpg`, `prasmanan.jpg`: [Resep Nasi Uduk, Yummy](https://www.yummy.co.id/resep/nasi-uduk-26).
- `box.jpg`: [Nasi uduk di Gading Serpong, Nibble](https://www.nibble.id/nasi-uduk-di-gading-serpong/).
- Fraunces dan Plus Jakarta Sans: Google Fonts, disimpan lokal dalam `public/fonts`.

`docs/frontend-design.md` mencatat token, pertimbangan desain, dan struktur yang dipilih.

## Validasi implementasi

- `php artisan test`: 2 pengujian bawaan Laravel lulus.
- `php artisan route:list --except-vendor`: 14 route frontend terdaftar.
- `php artisan view:cache`, `php -l routes/web.php`, dan `node --check public/js/catering.js`: lulus.
- Smoke test DOM terhadap respons HTTP aktual pada 14 halaman: render, kategori, dialog minimum porsi, penambahan keranjang, kuantitas/subtotal, radius di luar jangkauan, pick-up gratis, pembuatan pesanan, tambah menu admin, detail pesanan, pencarian kosong, dan riwayat pelanggan lulus.
- Pemeriksaan screenshot desktop/mobile belum dapat dilakukan: proses Chrome ditolak lingkungan dengan `spawn EPERM`. Smoke test DOM tidak menguji hasil layout atau rendering CSS.
