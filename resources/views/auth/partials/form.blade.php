@php($register = $page === 'register')
<div class="container auth-layout">
    <section class="auth-story">
        <img src="{{ asset('images/hero.jpg') }}" alt="Ilustrasi sepiring nasi uduk lengkap">
        <div>
            <h1>{!! $register ? 'Satu akun.<br>Banyak momen<br>makan bersama.' : 'Senang bertemu<br>Anda lagi.' !!}</h1>
            <p>Pesan hidangan favorit dan pantau persiapannya, dari dapur sampai meja makan.</p>
        </div>
    </section>
    <section class="auth-form">
        <a class="breadcrumb" href="/">Kembali ke beranda</a>
        <h2>{{ $register ? 'Buat akun Anda' : 'Masuk ke akun' }}</h2>
        <p>{{ $register ? 'Mulai rencanakan hidangan untuk momen Anda.' : 'Pesanan dan menu favorit Anda sudah menanti.' }}</p>
        @if($errors->any() || session('error'))
            <div class="notice error" role="alert" id="auth-error-banner">{{ session('error') ?? $errors->first() }}</div>
        @endif
        <form id="auth-form" method="POST" action="{{ $register ? route('register.store') : route('login.attempt') }}" data-register="{{ $register ? 'true' : 'false' }}">
            @csrf
            @if(request('return'))
                <input type="hidden" name="return" value="{{ request('return') }}">
            @endif
            @if($register)
                <label>Nama lengkap<input name="name" autocomplete="name" value="{{ old('name', old('nama')) }}" required></label>
            @endif
            <label>Email<input name="email" type="email" autocomplete="email" value="{{ old('email') }}" required></label>
            <label>Kata sandi<input name="password" type="password" autocomplete="{{ $register ? 'new-password' : 'current-password' }}" @if($errors->any()) aria-invalid="true" @endif required></label>
            @if($register)
                <label>Nomor WhatsApp<input name="phone" type="tel" autocomplete="tel" value="{{ old('phone', old('nomor_telepon')) }}" placeholder="08xxxxxxxxxx" required></label>
                <label>Alamat lengkap<textarea name="address" rows="2" placeholder="Alamat pengantaran">{{ old('address', old('alamat')) }}</textarea></label>
            @endif
            <button class="button full" type="submit">{{ $register ? 'Daftar sekarang' : 'Masuk ke akun' }}</button>
        </form>
        <p class="auth-switch">
            {{ $register ? 'Sudah punya akun?' : 'Belum punya akun?' }}
            <a href="{{ route($register ? 'login' : 'register', request()->only('return')) }}">{{ $register ? 'Masuk' : 'Daftar di sini' }}</a>
        </p>
    </section>
</div>
