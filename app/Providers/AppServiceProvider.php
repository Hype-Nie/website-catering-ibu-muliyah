<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\CartItem;
use App\Services\HaversineDistanceService;
use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Auth::provider('eloquent', function ($app, array $config) {
            return new class($app['hash'], $config['model']) extends EloquentUserProvider
            {
                public function retrieveByCredentials(array $credentials)
                {
                    $credentials = array_filter(
                        $credentials,
                        fn ($key) => ! str_contains($key, 'password') && $key !== 'kata_sandi',
                        ARRAY_FILTER_USE_KEY
                    );

                    return parent::retrieveByCredentials($credentials);
                }

                public function validateCredentials(UserContract $user, array $credentials)
                {
                    $plain = $credentials['kata_sandi'] ?? $credentials['password'] ?? null;
                    if (is_null($plain) || is_null($hashed = $user->getAuthPassword())) {
                        return false;
                    }

                    return $this->hasher->check($plain, $hashed);
                }
            };
        });

        View::composer(['pages.home', 'pages.catalog', 'pages.cart', 'pages.checkout', 'pages.payment', 'pages.history', 'pages.tracking', 'auth.login', 'auth.register', 'admin.dashboard', 'admin.menu', 'admin.orders', 'admin.customers', 'admin.reports'], function ($view) {
            $data = $view->getData();
            if (! isset($data['kitchen'])) {
                $view->with('kitchen', [
                    'name' => 'Dapur Menteng',
                    'address' => 'Jl. Menteng No. 10, Jakarta Pusat',
                    'latitude' => HaversineDistanceService::KITCHEN_LAT,
                    'longitude' => HaversineDistanceService::KITCHEN_LON,
                ]);
            }
            if (Schema::hasTable('item_keranjang') && (! isset($data['items']) || ! isset($data['cartCount']))) {
                $sessionId = session()->getId();
                $query = Auth::check()
                    ? CartItem::where('id_pengguna', Auth::id())
                    : CartItem::where('id_sesi', $sessionId);
                $cartItems = $query->with('menu.kategori')->get();
                if (! isset($data['items'])) {
                    $view->with('items', $cartItems);
                }
                if (! isset($data['cartCount'])) {
                    $view->with('cartCount', (int) $cartItems->sum('kuantitas'));
                }
                if (! isset($data['subtotal'])) {
                    $view->with('subtotal', (float) $cartItems->sum(fn ($i) => $i->subtotal));
                }
            }
        });
    }
}
