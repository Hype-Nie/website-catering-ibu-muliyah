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

