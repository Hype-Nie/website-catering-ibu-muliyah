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
