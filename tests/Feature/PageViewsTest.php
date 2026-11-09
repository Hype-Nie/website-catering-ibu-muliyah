<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageViewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_routes_select_their_own_views_and_scripts(): void
    {
        foreach ([
            '/' => ['pages.home', null],
            '/menu' => ['pages.catalog', 'pages/catalog'],
            '/keranjang' => ['pages.cart', 'pages/cart'],
            '/pembayaran' => ['pages.payment', 'pages/payment'],
            '/pesanan' => ['pages.history', 'pages/history'],
            '/lacak-pesanan' => ['pages.tracking', 'pages/tracking'],
            '/login' => ['auth.login', 'auth/login'],
            '/register' => ['auth.register', 'auth/register'],
        ] as $url => [$view, $script]) {
            $response = $this->get($url)->assertOk()->assertViewIs($view);
            $response->assertDontSee('js/catering.js', false);
            $response->assertDontSee('js/admin/menu.js', false);
            $response->assertDontSee('js/admin/order-dialog.js', false);
            $response->assertDontSee('js/admin/order-table.js', false);
            $response->assertDontSee('vendor/leaflet/leaflet.js', false);
            if ($script) {
                $response->assertSee('js/'.$script.'.js', false);
            }
        }
    }

    public function test_admin_routes_select_their_own_views(): void
    {
        $user = User::create([
            'nama' => 'Admin', 'email' => 'admin@example.test',
            'nomor_telepon' => '081234000111', 'kata_sandi' => bcrypt('password123'),
            'peran' => 'admin', 'status_aktif' => true,
        ]);
        $this->actingAs($user);
        foreach (['/admin' => 'dashboard', '/admin/menu' => 'menu', '/admin/pesanan' => 'orders', '/admin/pelanggan' => 'customers', '/admin/laporan' => 'reports'] as $url => $view) {
            $this->get($url)->assertOk()->assertViewIs('admin.'.$view)
                ->assertSee('js/admin/'.$view.'.js', false)
                ->assertDontSee('js/pages/checkout.js', false);
        }
    }

    public function test_authentication_fields_and_home_are_present_without_javascript(): void
    {
        $this->get('/')->assertSee('Ada nasi uduk.');
        $this->get('/login')->assertSee('name="email"', false)->assertSee('name="password"', false);
        $this->get('/register')->assertSee('name="phone"', false)->assertSee('name="name"', false);
    }
}
