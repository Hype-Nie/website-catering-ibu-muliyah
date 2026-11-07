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
    <link rel="stylesheet" href="{{ asset('css/catering.css') }}?v=2">
    <script>
        window.__SERVER_DATA__ = {
            csrfToken: "{{ csrf_token() }}",
            user: @json(auth()->user()),
            page: "{{ $page ?? 'home' }}",
            menus: @json($menus ?? null),
            categories: @json($categories ?? null),
            orders: @json($orders ?? null),
            order: @json($order ?? null),
            customers: @json($customers ?? null),
            totalRevenue: {{ isset($totalRevenue) ? (float) $totalRevenue : 0 }},
            totalOrders: {{ isset($totalOrders) ? (int) $totalOrders : 0 }},
            pendingVerifications: {{ isset($pendingVerifications) ? (int) $pendingVerifications : 0 }},
            flash: {
                success: @json(session('success')),
                error: @json(session('error') ?? $errors->first())
            }
        };
    </script>
    <script src="{{ asset('js/catering.js') }}?v=2" defer></script>
</head>
<body data-page="{{ $page }}">
    <a class="skip-link" href="#main">Lewati ke konten</a>
    <header id="site-header"></header>
    <div id="page-layout"><main id="main" tabindex="-1"></main></div>
    <footer id="site-footer"></footer>
    <dialog id="modal" aria-labelledby="modal-title"><button class="icon-button modal-close" aria-label="Tutup dialog" data-action="close">✕</button><div id="modal-content"></div></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <noscript><p class="notice">Aktifkan JavaScript untuk melihat katalog dan mencoba alur pemesanan.</p></noscript>
</body>
</html>
