# Dapur Menteng — arah frontend

Referensi: seluruh gambar di `ss wireframe` dan alur pada `rancangan.md`.

## Token
- Daun: `#244D3B`, identitas, tombol utama, navigasi.
- Daun muda: `#EAF0E8`, panel pendukung.
- Kunyit: `#E8BC55`, penanda informasi penting.
- Putih: `#FFFFFF`, permukaan utama.
- Beras: `#FAFAF6`, latar lembut.
- Tinta: `#243D31`, teks utama.

Tipografi: Fraunces dengan bobot medium untuk judul; Plus Jakarta Sans untuk teks dan kontrol. Fallback Georgia dan sistem sans-serif. Judul rata kiri, teks ringkas, angka harga menggunakan tabular numerals.

## Komposisi
Pilihan A mempertahankan hero dua kolom wireframe. Pilihan B memakai foto penuh dengan teks di atas gambar. A dipilih agar tulisan dan akses pesan tetap terbaca tanpa bergantung pada foto.

```text
Logo                  Navigasi          Keranjang / Masuk
Judul besar, CTA       Foto hidangan dengan sudut lengkung
                      Keterangan sajian
Informasi H-1         Delivery 20 km      Pick-up
Pilihan penyajian: foto, nama, harga, minimum porsi
Cara pesan: empat tahap yang benar-benar berurutan
Pengiriman / pengambilan            CTA katalog
Footer
```

## Tinjauan sebelum implementasi
Palet berangkat dari daun pisang dan nasi uduk Betawi, bukan aksen terracotta generik. Hindari label kapital, gradient, statistik klaim bisnis, bintang ulasan fiktif, serta kartu berbayang seragam. Daya tarik utama ada pada foto makanan dan judul yang besar. Sudut foto hero berbeda dari kontrol dan tabel; ruang kosong mengatur hierarki. Katalog mempertahankan kategori dan minimum porsi wireframe. Panel admin memakai identitas yang sama dengan judul sans-serif dan kepadatan informasi lebih tinggi.

## Batas implementasi
Frontend Blade, CSS, dan JavaScript tanpa ketergantungan runtime npm. Data interaksi demo disimpan di localStorage; autentikasi, rekening, verifikasi, dan transaksi bukan layanan produksi. Password tidak disimpan. Data demo dapat direset dari panel admin. Ekspor tabel menggunakan CSV dan cetak browser ke PDF.
