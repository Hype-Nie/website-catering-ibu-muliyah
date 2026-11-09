<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CheckoutAndSchedulingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Menu $menu;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'nama' => 'Budi Checkout',
            'email' => 'budi.checkout@contoh.test',
            'nomor_telepon' => '081299990000',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'alamat' => 'Jl. Menteng No. 5',
            'status_aktif' => true,
        ]);

        $category = Category::create([
            'nama_kategori' => 'Porsi Satuan',
            'slug' => 'satuan',
            'deskripsi' => 'Porsi satuan',
            'status_aktif' => true,
        ]);

        $this->menu = Menu::create([
            'id_kategori' => $category->id,
            'nama_menu' => 'Nasi Uduk Komplet',
            'slug' => 'nasi-uduk-komplet',
            'deskripsi' => 'Nasi uduk lezat',
            'harga' => 25000,
            'jenis_paket' => 'satuan',
            'minimal_pesanan' => 1,
            'foto_menu' => 'hero.jpg',
            'status_tersedia' => true,
        ]);

        CartItem::create([
            'id_pengguna' => $this->user->id,
            'id_menu' => $this->menu->id,
            'kuantitas' => 2,
            'catatan' => 'Tanpa cabai rawit',
        ]);
    }

    public function test_checkout_fails_if_scheduled_for_today(): void
    {
        $today = Carbon::today()->toDateString();

        $response = $this->actingAs($this->user)->post('/checkout', [
            'recipient_name' => 'Budi',
            'recipient_phone' => '081299990000',
            'delivery_date' => $today, // Today violates H-1
            'delivery_time' => '11:00',
            'delivery_type' => 'delivery',
            'delivery_address' => 'Jl. Cikini Raya No. 10',
            'delivery_distance_km' => 3.5,
        ]);

        $response->assertSessionHasErrors('delivery_date');
        $this->assertDatabaseCount('pesanan', 0);
    }

    public function test_checkout_fails_if_distance_exceeds_20_km(): void
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $response = $this->actingAs($this->user)->post('/checkout', [
            'recipient_name' => 'Budi',
            'recipient_phone' => '081299990000',
            'delivery_date' => $tomorrow,
            'delivery_time' => '11:00',
            'delivery_type' => 'delivery',
            'delivery_address' => 'Bekasi Timur',
            'delivery_latitude' => -6.2500,
            'delivery_longitude' => 107.0300,
            'delivery_distance_km' => 1.0, // Tampered distance should be ignored!
        ]);

        $response->assertSessionHasErrors('delivery_type');
        $this->assertDatabaseCount('pesanan', 0);
    }

    public function test_checkout_succeeds_for_delivery_within_20_km(): void
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $response = $this->actingAs($this->user)->post('/checkout', [
            'recipient_name' => 'Budi Penerima',
            'recipient_phone' => '081299990000',
            'delivery_date' => $tomorrow,
            'delivery_time' => '12:00',
            'delivery_type' => 'delivery',
            'delivery_address' => 'Jl. Kebon Sirih No. 12, Menteng',
            'delivery_latitude' => -6.1241,
            'delivery_longitude' => 106.8372,
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals(50000.0, (float) $order->subtotal_amount); // 2 * 25000
        $this->assertEquals(19000.0, (float) $order->delivery_fee);
        $this->assertEquals(69000.0, (float) $order->total_amount);
        $this->assertEquals('Menunggu Pembayaran', $order->payment_status);
        $this->assertStringStartsWith('DM-', $order->order_number);

        // Cart should be empty after checkout
        $this->assertDatabaseCount('item_keranjang', 0);

        $response->assertRedirect(route('payment.show', ['id' => $order->order_number]));
    }

    public function test_checkout_succeeds_for_pickup_with_zero_fee(): void
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $response = $this->actingAs($this->user)->post('/checkout', [
            'recipient_name' => 'Budi Ambil Sendiri',
            'recipient_phone' => '081299990000',
            'delivery_date' => $tomorrow,
            'delivery_time' => '14:00',
            'delivery_type' => 'pickup',
            'delivery_distance_km' => 0,
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals('pickup', $order->delivery_type);
        $this->assertEquals(0.0, (float) $order->delivery_fee);
        $this->assertEquals(50000.0, (float) $order->total_amount);
    }

    public function test_checkout_view_injects_default_location_from_user_latest_order(): void
    {
        Order::create([
            'nomor_pesanan' => 'DM-PREV-001',
            'id_pengguna' => $this->user->id,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::tomorrow()->toDateString(),
            'waktu_pengiriman' => '11:00',
            'jenis_pengiriman' => 'delivery',
            'nama_penerima' => 'Budi Prior',
            'nomor_telepon_penerima' => '081299990000',
            'alamat_pengiriman' => 'Jl. Teuku Umar No. 10',
            'latitude_pengiriman' => -6.1950,
            'longitude_pengiriman' => 106.8320,
            'jarak_pengiriman_km' => 1.2,
            'subtotal' => 50000,
            'biaya_pengiriman' => 7000,
            'total_pembayaran' => 57000,
            'status_pembayaran' => Order::PAYMENT_PAID,
            'status_pesanan' => Order::STATUS_COMPLETED,
        ]);

        $response = $this->actingAs($this->user)->get('/checkout');
        $response->assertOk();
        $response->assertViewHas('defaultLocation', [
            'address' => 'Jl. Teuku Umar No. 10',
            'latitude' => -6.1950,
            'longitude' => 106.8320,
            'distance_km' => 1.2,
            'source' => 'latest_order',
        ]);
    }

    public function test_checkout_view_injects_default_location_from_profile_address_when_no_prior_orders(): void
    {
        $response = $this->actingAs($this->user)->get('/checkout');
        $response->assertOk();
        $response->assertViewHas('defaultLocation', [
            'address' => 'Jl. Menteng No. 5',
            'latitude' => null,
            'longitude' => null,
            'distance_km' => null,
            'source' => 'profile_address',
        ]);
    }

    public function test_guest_cannot_access_checkout_and_is_redirected_to_login(): void
    {
        $response = $this->get('/checkout');
        $response->assertRedirect(route('login'));

        $postResponse = $this->post('/checkout', [
            'recipient_name' => 'Guest',
        ]);
        $postResponse->assertRedirect(route('login'));
    }
}
