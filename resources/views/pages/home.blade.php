@extends('layouts.catering')
@section('title', 'Beranda')
@section('content')
<section class="hero container">
<div class="hero-copy">
<div class="origin">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
<circle cx="12" cy="10" r="2.5"/>
</svg> Dari dapur Menteng, Jakarta</div>
<h1>Ada nasi uduk.<br>Ada cerita<br>di meja makan.</h1>
<p>Gurih santannya, lengkap lauknya. Dari sarapan sendiri sampai hajatan keluarga, kami siapkan untuk momen Anda.</p>
<div class="hero-buttons">
<a href="/menu" class="button ">Pilih menu & pesan <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="m9 5 7 7-7 7"/>
</svg>
</a>
<a class="plain-link" href="#cara-pesan">Lihat cara pesan</a>
</div>
<div class="hero-note">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<circle cx="12" cy="12" r="9"/>
<path d="M12 7v5l3 2"/>
</svg> Dimasak di hari acara. Pesan minimal H-1.</div>
</div>
<figure class="hero-visual">
<img src="/images/hero.jpg" alt="Sajian nasi uduk dengan ayam goreng, telur, sambal, dan lalapan di atas daun pisang" fetchpriority="high">
<div class="food-tag">Resep rumahan.<br>Rasa yang dirindukan.<span>Sehangat makan di rumah</span>
</div>
<figcaption>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M20 3C7 1 1 10 6 17s17 2 14-14ZM5 20 16 9"/>
</svg> Nasi uduk & lauk pilihan</figcaption>
</figure>
</section>
<section class="service-strip container" aria-label="Informasi layanan">
<div>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M20 3C7 1 1 10 6 17s17 2 14-14ZM5 20 16 9"/>
</svg>
<span>
<b>Tiga cara menikmati</b>
<small>Porsi satuan, nasi box & prasmanan</small>
</span>
</div>
<div>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/>
<circle cx="6" cy="18" r="2"/>
<circle cx="18" cy="18" r="2"/>
</svg>
<span>
<b>Kami antar ke tempat Anda</b>
<small>Hingga 20 km dari Menteng, Jakarta</small>
</span>
</div>
<div>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M6 7h12l2 14H4L6 7Z"/>
<path d="M9 8V6a3 3 0 0 1 6 0v2"/>
</svg>
<span>
<b>Mau ambil sendiri? Bisa.</b>
<small>Pick-up di dapur, tanpa ongkir</small>
</span>
</div>
</section>
<section class="section container" id="pilihan-menu">
<div class="section-heading">
<div>
<h2>Untuk setiap meja,<br>ada pilihan sajiannya.</h2>
<p>Makan sendiri, rapat kantor, atau kumpul satu keluarga.</p>
</div>
<a class="plain-link" href="/menu">Jelajahi semua menu <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="m9 5 7 7-7 7"/>
</svg>
</a>
</div>
<div class="category-grid">
<a href="/menu?kategori=satuan" class="category-card" data-category="satuan">
<div class="category-image">
<img src="/images/satuan.jpg" alt="Ilustrasi sajian porsi satuan" loading="lazy">
<span>Mulai 1 porsi</span>
</div>
<div class="category-content">
<h3>Porsi satuan <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="m9 5 7 7-7 7"/>
</svg>
</h3>
<p>Teman sarapan dan makan siang, dengan lauk yang Anda suka.</p>
<div>Mulai <b>Rp18.000</b>
<small> / porsi</small>
</div>
</div>
</a>
<a href="/menu?kategori=box" class="category-card" data-category="box">
<div class="category-image">
<img src="/images/box.jpg" alt="Ilustrasi sajian nasi box" loading="lazy">
<span>Mulai 10 porsi</span>
</div>
<div class="category-content">
<h3>Nasi box <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="m9 5 7 7-7 7"/>
</svg>
</h3>
<p>Rapi dalam kotak. Praktis untuk rapat, pengajian, dan berbagi.</p>
<div>Mulai <b>Rp23.000</b>
<small> / porsi</small>
</div>
</div>
</a>
<a href="/menu?kategori=prasmanan" class="category-card" data-category="prasmanan">
<div class="category-image">
<img src="/images/prasmanan.jpg" alt="Ilustrasi sajian prasmanan" loading="lazy">
<span>Mulai 30 porsi</span>
</div>
<div class="category-content">
<h3>Prasmanan <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="m9 5 7 7-7 7"/>
</svg>
</h3>
<p>Hidangan lengkap untuk merayakan momen bersama.</p>
<div>Mulai <b>Rp40.000</b>
<small> / porsi</small>
</div>
</div>
</a>
</div>
<p class="photo-note">Foto merupakan ilustrasi penyajian. Komposisi mengikuti menu pilihan.</p>
</section>
<section class="how-section" id="cara-pesan">
<div class="container">
<div class="section-heading">
<h2>Anda rencanakan acaranya.<br>Kami siapkan hidangannya.</h2>
<p>Pesan dari rumah,<br>tenang sampai hari acara.</p>
</div>
<ol class="how-grid">
<li>
<span>1</span>
<h3>Pilih menu & porsi</h3>
<p>Cari lauk favorit, tentukan porsi, lalu masukkan ke keranjang.</p>
</li>
<li>
<span>2</span>
<h3>Tentukan jadwal</h3>
<p>Isi tanggal acara dan pilih diantar atau ambil di dapur.</p>
</li>
<li>
<span>3</span>
<h3>Selesaikan pembayaran</h3>
<p>Transfer melalui BCA atau Mandiri, lalu unggah buktinya.</p>
</li>
<li>
<span>4</span>
<h3>Tunggu hidangan Anda</h3>
<p>Pantau pesanan dari dapur hingga siap dinikmati.</p>
</li>
</ol>
</div>
</section>
<section class="section container delivery-section" id="pengiriman">
<div class="delivery-art">
<div class="delivery-circle">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
<circle cx="12" cy="10" r="2.5"/>
</svg>
<strong>Menteng</strong>
<span>Jakarta Pusat</span>
</div>
<span class="radius-label">Dari dapur, hingga 20 km</span>
<span class="map-place place-one">Gambir</span>
<span class="map-place place-two">Cikini</span>
<span class="map-place place-three">Tanah Abang</span>
</div>
<div>
<h2>Sampai di meja Anda,<br>sesuai waktunya.</h2>
<p>Pilih cara menerima hidangan yang paling nyaman. Semua disiapkan segar pada hari acara.</p>
<div class="delivery-option">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/>
<circle cx="6" cy="18" r="2"/>
<circle cx="18" cy="18" r="2"/>
</svg>
<div>
<h3>Diantar ke lokasi</h3>
<p>Dalam radius 20 km dari Dapur Menteng. Ongkir dihitung saat checkout.</p>
</div>
</div>
<div class="delivery-option">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="M6 7h12l2 14H4L6 7Z"/>
<path d="M9 8V6a3 3 0 0 1 6 0v2"/>
</svg>
<div>
<h3>Ambil langsung di dapur</h3>
<p>Datang sesuai tanggal dan jam pilihan Anda. Tanpa biaya pengiriman.</p>
</div>
</div>
</div>
</section>
<section class="container closing-cta">
<div>
<h2>Meja sudah siap.<br>Tinggal pilih hidangannya.</h2>
<p>Mulai dari seporsi, sampai untuk satu acara.</p>
</div>
<a href="/menu" class="button yellow">Lihat pilihan menu <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
<path d="m9 5 7 7-7 7"/>
</svg>
</a>
</section>

@endsection

