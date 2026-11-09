<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

// Public & Customer Routes
Route::view('/', 'catering', ['page' => 'home'])->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('catalog');
Route::get('/menu/{id}', [MenuController::class, 'show'])->name('menu.show');

Route::get('/keranjang', [CartController::class, 'index'])->name('cart.index');
Route::post('/keranjang', [CartController::class, 'store'])->name('cart.store');
Route::put('/keranjang/{id}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/keranjang/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::put('/cart/{id}', [CartController::class, 'update']);
Route::delete('/cart/{id}', [CartController::class, 'destroy']);

Route::middleware('auth')->group(function () {
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'process'])->name('checkout.process');
});

Route::get('/pembayaran', [PaymentController::class, 'show'])->name('payment.show');
Route::post('/pembayaran', [PaymentController::class, 'upload'])->name('payment.upload');

Route::get('/pesanan', [OrderTrackingController::class, 'history'])->name('orders.history');
Route::get('/lacak-pesanan', [OrderTrackingController::class, 'tracking'])->name('tracking.show');

// Authentication Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.store');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Admin Routes (Protected by auth and role:admin)
Route::prefix('admin')->middleware(['auth', 'role:admin'])->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('/menu', [AdminMenuController::class, 'index'])->name('menu.index');
    Route::post('/menu', [AdminMenuController::class, 'store'])->name('menu.store');
    Route::put('/menu/{id}', [AdminMenuController::class, 'update'])->name('menu.update');
    Route::patch('/menu/{id}/toggle', [AdminMenuController::class, 'toggleAvailability'])->name('menu.toggle');
    Route::delete('/menu/{id}', [AdminMenuController::class, 'destroy'])->name('menu.destroy');

    Route::get('/pesanan', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/pesanan/{id}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::post('/pesanan/{id}/verify', [AdminOrderController::class, 'verifyPayment'])->name('orders.verify');
    Route::post('/pesanan/{id}/reject', [AdminOrderController::class, 'rejectPayment'])->name('orders.reject');
    Route::patch('/pesanan/{id}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');

    Route::get('/pelanggan', [AdminCustomerController::class, 'index'])->name('customers.index');
    Route::get('/pelanggan/{id}', [AdminCustomerController::class, 'show'])->name('customers.show');

    Route::get('/laporan', [AdminReportController::class, 'index'])->name('reports.index');
    Route::get('/laporan/export-csv', [AdminReportController::class, 'exportCsv'])->name('reports.export_csv');
});
