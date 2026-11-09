<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#244d3b">
    <meta name="description" content="Nasi uduk dari Dapur Menteng, Jakarta. Pilih porsi satuan, nasi box, atau prasmanan untuk makan bersama. Pesan minimal H-1.">
    <title>@yield('title') — Dapur Menteng</title>
    <link rel="icon" href="{{ asset('images/brand.svg') }}" type="image/svg+xml">
    <link rel="stylesheet" href="{{ asset('css/fonts.css') }}">
    @if($page === 'checkout')
        <link rel="stylesheet" href="{{ asset('vendor/leaflet/leaflet.css') }}">
    @endif
    <link rel="stylesheet" href="{{ asset('css/catering.css') }}?v=20">
    @if(!in_array($page ?? '', ['dashboard','admin-menu','admin-orders','customers','reports']))
        <link rel="stylesheet" href="{{ asset('css/storefront.css') }}?v=1">
    @else
        <link rel="stylesheet" href="{{ asset('css/admin.css') }}?v=1">
    @endif
    @include('partials.server-data')
    @if($page === 'checkout')
        <script src="{{ asset('vendor/leaflet/leaflet.js') }}" defer></script>
    @endif

</head>
<body data-page="{{ $page }}" class="{{ in_array($page ?? '', ['dashboard','admin-menu','admin-orders','customers','reports']) ? 'admin' : 'storefront' }}">
    <a class="skip-link" href="#main">Lewati ke konten</a>
    @include('partials.header')
    <div id="page-layout">
        @if(in_array($page, ['dashboard','admin-menu','admin-orders','customers','reports']))
            @include('partials.sidebar')
        @endif
        <main id="main" tabindex="-1">@yield('content')</main>
    </div>
    @include('partials.footer')
    <dialog id="modal" aria-labelledby="modal-title"><button class="icon-button modal-close" aria-label="Tutup dialog" data-action="close">✕</button><div id="modal-content"></div></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <noscript><p class="notice">Aktifkan JavaScript untuk melihat katalog dan mencoba alur pemesanan.</p></noscript>
<script src="{{ asset('js/shared/state.js') }}" defer></script>
<script src="{{ asset('js/shared/ui.js') }}" defer></script>
@if(in_array($page, ['payment','history','tracking','dashboard','admin-orders','customers','reports']))
    <script src="{{ asset('js/shared/orders.js') }}" defer></script>
@endif
@if(in_array($page, ['tracking','dashboard','admin-orders','customers']))
    <script src="{{ asset('js/shared/receipt.js') }}" defer></script>
    @if($page !== 'tracking')
        <script src="{{ asset('js/admin/order-dialog.js') }}" defer></script>
    @endif
@endif
@if(in_array($page, ['dashboard','admin-orders','reports']))
    <script src="{{ asset('js/admin/order-table.js') }}" defer></script>
@endif
@if(in_array($page, ['dashboard','admin-menu','admin-orders','customers','reports']))
    <script src="{{ asset('js/admin/tables.js') }}" defer></script>
@endif
<script src="{{ asset('js/shared/events.js') }}" defer></script>
@stack('scripts')
<script src="{{ asset('js/app.js') }}" defer></script>
</body>
</html>
