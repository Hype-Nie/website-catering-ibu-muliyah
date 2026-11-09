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

