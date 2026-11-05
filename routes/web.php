<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'catering', ['page' => 'home']);

// Frontend previews; production authentication and persistence are separate.
foreach (['menu' => 'catalog', 'keranjang' => 'cart', 'checkout' => 'checkout',
    'pembayaran' => 'payment', 'pesanan' => 'history', 'lacak-pesanan' => 'tracking',
    'login' => 'login', 'register' => 'register', 'admin' => 'dashboard',
    'admin/menu' => 'admin-menu', 'admin/pesanan' => 'admin-orders',
    'admin/pelanggan' => 'customers', 'admin/laporan' => 'reports'] as $path => $page) {
    Route::view('/'.$path, 'catering', ['page' => $page]);
}
