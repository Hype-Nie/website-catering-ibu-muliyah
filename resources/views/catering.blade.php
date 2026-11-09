<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#244d3b">
    <meta name="description" content="Nasi uduk dari Dapur Menteng, Jakarta. Pilih porsi satuan, nasi box, atau prasmanan untuk makan bersama. Pesan minimal H-1.">
    <title>Dapur Menteng — Nasi uduk untuk makan bersama</title>
    <link rel="icon" href="{{ asset('images/brand.svg') }}" type="image/svg+xml">
    <link rel="stylesheet" href="{{ asset('css/fonts.css') }}">
    <link rel="stylesheet" href="{{ asset('vendor/leaflet/leaflet.css') }}">
    <link rel="stylesheet" href="{{ asset('css/catering.css') }}?v=20">
    <script>
        window.__SERVER_DATA__ = {
            csrfToken: "{{ csrf_token() }}",
            user: @json(auth()->user()),
            page: "{{ $page ?? 'home' }}",
            menus: @json($menus ?? null),
            categories: @json($categories ?? null),
            items: @json($items ?? null),
            cartCount: {{ isset($cartCount) ? (int) $cartCount : 0 }},
            subtotal: {{ isset($subtotal) ? (float) $subtotal : 0 }},
            kitchen: @json($kitchen ?? null),
            defaultLocation: @json($defaultLocation ?? null),
            orders: @json($orders ?? $recentOrders ?? null),
            order: @json($order ?? null),
            customers: @json($customers ?? null),
            totalRevenue: {{ isset($totalRevenue) ? (float) $totalRevenue : 0 }},
            totalOrders: {{ isset($totalOrders) ? (int) $totalOrders : 0 }},
            pendingVerifications: {{ isset($pendingVerifications) ? (int) $pendingVerifications : 0 }},
            flash: {
                success: @json(session('success')),
                error: @json(session('error') ?? ($errors ?? null)?->first())
            },
            old: {
                email: @json(old('email')),
                name: @json(old('name') ?? old('nama')),
                phone: @json(old('phone') ?? old('phone_number') ?? old('nomor_telepon')),
                address: @json(old('address') ?? old('alamat'))
            },
        };
    </script>
    <script src="{{ asset('vendor/leaflet/leaflet.js') }}" defer></script>
    <script src="{{ asset('js/catering.js') }}?v=37" defer></script>
</head>
<body data-page="{{ $page }}">
    <a class="skip-link" href="#main">Lewati ke konten</a>
    <header id="site-header">
        <div class="header-inner">
            <a class="brand" href="/">
                <img src="{{ asset('images/brand.svg') }}" alt="" width="48" height="48">
                <span>Dapur Menteng<small>Catering Nasi Uduk</small></span>
            </a>
            <button class="icon-button mobile-toggle" data-action="nav" aria-label="Buka navigasi" aria-expanded="false">☰</button>
            <nav id="navigation" aria-label="Navigasi utama">
                @if(in_array($page ?? '', ['dashboard','admin-menu','admin-orders','customers','reports']))
                    <span class="admin-label">Panel administrasi</span>
                    <a href="/">Lihat website</a>
                @else
                    @if(auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->peran === 'admin'))
                        <a href="/admin">Panel admin</a>
                    @endif
                    <a href="/" @if(($page ?? '') === 'home') aria-current="page" @endif>Beranda</a>
                    <a href="/menu" @if(($page ?? '') === 'catalog') aria-current="page" @endif>Pilihan menu</a>
                    <a href="/pesanan" @if(($page ?? '') === 'history') aria-current="page" @endif>Pesanan saya</a>
                    <a href="/lacak-pesanan" @if(($page ?? '') === 'tracking') aria-current="page" @endif>Lacak pesanan</a>
                    <a href="/#cara-pesan">Cara pesan</a>
                    <a href="/#pengiriman">Pengiriman</a>
                @endif
            </nav>
            <div class="header-actions">
                @if(in_array($page ?? '', ['dashboard','admin-menu','admin-orders','customers','reports']))
                    <span class="avatar">A</span><span>Admin dapur</span><a class="logout-link" href="#" data-action="logout">Keluar</a>
                @else
                    <a class="cart-link" href="/keranjang" aria-label="Keranjang">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <span class="cart-count">{{ isset($cartCount) ? (int) $cartCount : 0 }}</span>
                    </a>
                    @if(auth()->check())
                        <span class="user-greeting">Halo, {{ auth()->user()->nama ?? auth()->user()->name }}</span>
                        <a class="logout-link" href="#" data-action="logout">Keluar</a>
                    @else
                        <a class="login-link" href="/login">Masuk</a>
                    @endif
                @endif
            </div>
        </div>
    </header>
    <div id="page-layout"><main id="main" tabindex="-1"></main></div>
    <footer id="site-footer">
        @if(!in_array($page ?? '', ['dashboard','admin-menu','admin-orders','customers','reports']))
            <div class="container footer-top">
                <div>
                    <a class="brand" href="/">
                        <img src="{{ asset('images/brand.svg') }}" alt="" width="48" height="48">
                        <span>Dapur Menteng<small>Catering Nasi Uduk</small></span>
                    </a>
                    <p>Masakan dari dapur kami,<br>untuk hangatnya kebersamaan Anda.</p>
                </div>
                <div>
                    <h3>Jelajahi & Layanan</h3>
                    <a href="/menu">Pilihan menu</a>
                    <a href="/pesanan">Pesanan saya</a>
                    <a href="/lacak-pesanan">Lacak pesanan</a>
                    <a href="/#cara-pesan">Cara pesan</a>
                    <a href="/#pengiriman">Area pengiriman</a>
                </div>
                <div>
                    <h3>Dapur kami</h3>
                    <p>Menteng, Jakarta Pusat<br>Delivery hingga radius 20 km<br>Pesan paling lambat H-1</p>
                </div>
            </div>
            <div class="container footer-bottom">
                <span>© {{ date('Y') }} Dapur Menteng</span>
                <span>Dimasak hari ini. Dinikmati bersama.</span>
                <a href="/admin">Panel admin</a>
            </div>
        @endif
    </footer>
    <dialog id="modal" aria-labelledby="modal-title"><button class="icon-button modal-close" aria-label="Tutup dialog" data-action="close">✕</button><div id="modal-content"></div></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <noscript><p class="notice">Aktifkan JavaScript untuk melihat katalog dan mencoba alur pemesanan.</p></noscript>
</body>
</html>
