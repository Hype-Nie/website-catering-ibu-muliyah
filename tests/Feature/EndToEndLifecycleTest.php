<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EndToEndLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Category $category;

    private Menu $satuanMenu;

    private Menu $boxMenu;

    private string $cookieName;

    private string $guestSess;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->withCredentials();
        $this->cookieName = (string) config('session.cookie');
        $this->guestSess = str_repeat('b', 40);
        $this->withCookie($this->cookieName, $this->guestSess);
        $this->admin = User::create([
            'nama' => 'Admin Dapur Menteng',
            'email' => 'admin@dapurmenteng.test',
            'nomor_telepon' => '081200001111',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'admin',
            'alamat' => 'Jl. Menteng No. 10, Jakarta Pusat',
            'status_aktif' => true,
        ]);

        $this->category = Category::create([
            'nama_kategori' => 'Nasi Box & Satuan',
            'slug' => 'box-satuan',
            'deskripsi' => 'Kategori katering',
            'status_aktif' => true,
        ]);

        $this->satuanMenu = Menu::create([
            'id_kategori' => $this->category->id,
            'nama_menu' => 'Nasi Uduk Betawi Satuan',
            'slug' => 'nasi-uduk-betawi-satuan',
            'deskripsi' => 'Porsi satuan nasi uduk lengkap',
            'harga' => 25000,
            'jenis_paket' => 'satuan',
            'minimal_pesanan' => 1,
            'foto_menu' => 'satuan.jpg',
            'status_tersedia' => true,
        ]);

        $this->boxMenu = Menu::create([
            'id_kategori' => $this->category->id,
            'nama_menu' => 'Nasi Box Komplet Menteng',
            'slug' => 'nasi-box-komplet-menteng',
            'deskripsi' => 'Nasi box acara kantor',
            'harga' => 35000,
            'jenis_paket' => 'box',
            'minimal_pesanan' => 10,
            'foto_menu' => 'box.jpg',
            'status_tersedia' => true,
        ]);
    }

    public function test_full_happy_path_from_catalog_to_cart_checkout_payment_tracking_and_admin_verification(): void
    {

        $guestSessionData = ['id' => 'guest-fixed-session-id-12345678901234567890'];

        // 1. Guest visits catalog
        $catalogResponse = $this->withSession($guestSessionData)->get('/menu');
        $catalogResponse->assertOk();
        $catalogResponse->assertViewHas('menus');

        // 2. Guest adds items to cart via POST /keranjang
        $addResponse = $this->withSession($guestSessionData)->postJson('/keranjang', [
            'id_menu' => $this->satuanMenu->id,
            'kuantitas' => 5,
            'catatan' => 'Sambal dipisah',
        ]);
        $addResponse->assertCreated();
        $addResponse->assertJsonFragment(['count' => 5]);

        $this->assertDatabaseHas('item_keranjang', [
            'id_menu' => $this->satuanMenu->id,
            'kuantitas' => 5,
            'catatan' => 'Sambal dipisah',
        ]);

        // 3. Guest visits /keranjang, sees items and subtotal
        $cartPageResponse = $this->withSession($guestSessionData)->get('/keranjang');
        $cartPageResponse->assertOk();
        $cartPageResponse->assertViewHas('items');
        $this->assertCount(1, $cartPageResponse->viewData('items'));
        $this->assertEquals(125000, $cartPageResponse->viewData('subtotal'));

        // 4. Guest navigates to /checkout -> redirected to login because auth is required for checkout
        $checkoutRedirectResponse = $this->withSession($guestSessionData)->get('/checkout');
        $checkoutRedirectResponse->assertRedirect(route('login'));

        // 4b. Guest creates account (registers) to proceed with checkout
        $customer = User::create([
            'nama' => 'Fajar Pratama',
            'email' => 'fajar@contoh.test',
            'nomor_telepon' => '081234567890',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'alamat' => 'Jl. Cikini Raya No. 20, Menteng, Jakarta Pusat',
            'status_aktif' => true,
        ]);

        // When logging in, guest cart items migrate to authenticated customer
        $loginResponse = $this->withSession($guestSessionData)->post('/login', [
            'email' => 'fajar@contoh.test',
            'password' => 'password123',
            'return' => route('checkout.index'),
        ]);
        $loginResponse->assertRedirect(route('checkout.index'));
        $this->assertAuthenticatedAs($customer);

        // Cart items must now belong to customer id
        $this->assertDatabaseHas('item_keranjang', [
            'id_pengguna' => $customer->id,
            'id_menu' => $this->satuanMenu->id,
            'kuantitas' => 5,
        ]);

        // 4c. Authenticated customer visits /checkout, items are present!
        $checkoutPageResponse = $this->actingAs($customer)->get('/checkout');
        $checkoutPageResponse->assertOk();
        $checkoutPageResponse->assertViewHas('items');
        $this->assertCount(1, $checkoutPageResponse->viewData('items'));

        // 5. Customer submits checkout for delivery tomorrow at 3 km distance
        $tomorrow = Carbon::now('Asia/Jakarta')->addDay()->toDateString();
        $checkoutResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar Pratama',
            'phone' => '081234567890',
            'email' => 'fajar@contoh.test',
            'deliveryDate' => $tomorrow,
            'time' => '11:30',
            'method' => 'delivery',
            'address' => 'Jl. Cikini Raya No. 20, Menteng, Jakarta Pusat',
            'distance' => '3',
            'notes' => 'Tolong telepon saat sampai di gerbang',
        ]);

        // 6. Assert order created and redirected to payment
        $order = Order::where('email_penerima', 'fajar@contoh.test')->first();
        $this->assertNotNull($order);
        $this->assertMatchesRegularExpression('/^DM-\d{6}-\d{4}$/', $order->nomor_pesanan);
        $this->assertEquals(125000, (float) $order->subtotal);
        $this->assertEquals(11000, (float) $order->biaya_pengiriman); // 3.004km: 5000 + ceil(2.004)*2000
        $this->assertEquals(136000, (float) $order->total_pembayaran);
        $this->assertEquals(Order::PAYMENT_PENDING, $order->status_pembayaran);
        $this->assertDatabaseCount('item_pesanan', 1);
        $this->assertDatabaseCount('item_keranjang', 0); // Cart emptied!

        $checkoutResponse->assertRedirect(route('payment.show', ['id' => $order->nomor_pesanan]));

        // 7. Payment page displays order details
        $paymentPageResponse = $this->get('/pembayaran?id='.$order->nomor_pesanan);
        $paymentPageResponse->assertOk();
        $paymentPageResponse->assertViewHas('order');

        // 8. Customer uploads payment proof
        $file = UploadedFile::fake()->image('bukti_transfer.jpg', 600, 800)->size(500);
        $paymentResponse = $this->post('/pembayaran', [
            'id_pesanan' => $order->id,
            'nama_bank' => 'BCA',
            'nama_pemilik_rekening' => 'Fajar Pratama',
            'nominal_transfer' => 136000,
            'tanggal_transfer' => Carbon::today()->toDateString(),
            'bukti_transfer' => $file,
        ]);

        $order->refresh();
        $this->assertEquals(Order::PAYMENT_VERIFYING, $order->status_pembayaran);
        $this->assertDatabaseHas('pembayaran', [
            'id_pesanan' => $order->id,
            'nama_bank' => 'BCA',
            'nominal_transfer' => 136000,
            'status_verifikasi' => Payment::STATUS_VERIFYING,
        ]);

        $paymentResponse->assertRedirect(route('tracking.show', [
            'id' => $order->nomor_pesanan,
        ]));

        // 9. Customer views tracking
        $trackingResponse = $this->get('/lacak-pesanan?id='.$order->nomor_pesanan.'&phone=081234567890');
        $trackingResponse->assertOk();
        $trackingResponse->assertViewHas('order');

        // 10. Admin logs in
        $loginResponse = $this->post('/login', [
            'email' => 'admin@dapurmenteng.test',
            'password' => 'password123',
        ]);
        $loginResponse->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($this->admin);

        // 11. Admin verifies payment
        $verifyResponse = $this->actingAs($this->admin)
            ->post("/admin/pesanan/{$order->id}/verify");
        $verifyResponse->assertRedirect();

        $order->refresh();
        $this->assertEquals(Order::PAYMENT_PAID, $order->status_pembayaran);
        $this->assertEquals(Order::STATUS_PROCESSING, $order->status_pesanan);

        // 12. Admin transitions order: processing -> shipped -> completed
        $this->actingAs($this->admin)
            ->patch("/admin/pesanan/{$order->id}/status", ['status' => Order::STATUS_SHIPPED])
            ->assertRedirect();
        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPED, $order->status_pesanan);

        $this->actingAs($this->admin)
            ->patch("/admin/pesanan/{$order->id}/status", ['status' => Order::STATUS_COMPLETED])
            ->assertRedirect();
        $order->refresh();
        $this->assertEquals(Order::STATUS_COMPLETED, $order->status_pesanan);

        // 13. Customer sees final completed status
        $finalTracking = $this->get('/lacak-pesanan?id='.$order->nomor_pesanan.'&phone=081234567890');
        $finalTracking->assertOk();
        $this->assertEquals(Order::STATUS_COMPLETED, $finalTracking->viewData('order')->status_pesanan);
    }

    public function test_extreme_boundary_empty_cart_checkout_prevented(): void
    {
        // Visiting /checkout as unauthenticated guest redirects to login
        $guestResponse = $this->get('/checkout');
        $guestResponse->assertRedirect(route('login'));

        $customer = User::create([
            'nama' => 'Empty Cart Cust',
            'email' => 'empty_cart@contoh.test',
            'nomor_telepon' => '081299998888',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        // Visiting /checkout with empty cart as logged in user redirects to catalog
        $response = $this->actingAs($customer)->get('/checkout');
        $response->assertRedirect(route('catalog'));
        $response->assertSessionHas('error');

        // Posting /checkout with empty cart fails validation
        $postResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar',
            'phone' => '081234567890',
            'deliveryDate' => Carbon::now('Asia/Jakarta')->addDay()->toDateString(),
            'time' => '10:00',
            'method' => 'pickup',
        ]);
        $postResponse->assertSessionHasErrors('cart');
    }

    public function test_extreme_boundary_minimum_portion_enforced(): void
    {
        // Box menu requires min 10 portions; submitting 9 must fail
        $response = $this->postJson('/keranjang', [
            'id_menu' => $this->boxMenu->id,
            'kuantitas' => 9,
        ]);
        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('kuantitas');

        // Submitting min 10 portions must succeed
        $validResponse = $this->postJson('/keranjang', [
            'id_menu' => $this->boxMenu->id,
            'kuantitas' => 10,
        ]);
        $validResponse->assertCreated();
    }

    public function test_extreme_boundary_preorder_h_minus_1_rejected_for_today_and_past(): void
    {
        $customer = User::create([
            'nama' => 'Fajar Customer',
            'email' => 'fajar_preorder@contoh.test',
            'nomor_telepon' => '081299991111',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        CartItem::create([
            'id_pengguna' => $customer->id,
            'id_menu' => $this->satuanMenu->id,
            'kuantitas' => 2,
        ]);

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        $yesterday = Carbon::now('Asia/Jakarta')->subDay()->toDateString();
        $tomorrow = Carbon::now('Asia/Jakarta')->addDay()->toDateString();

        // Same-day order rejected
        $todayResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar',
            'phone' => '081234567890',
            'deliveryDate' => $today,
            'time' => '10:00',
            'method' => 'pickup',
        ]);
        $todayResponse->assertSessionHasErrors('delivery_date');

        // Past-date order rejected
        $pastResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar',
            'phone' => '081234567890',
            'deliveryDate' => $yesterday,
            'time' => '10:00',
            'method' => 'pickup',
        ]);
        $pastResponse->assertSessionHasErrors('delivery_date');

        // H-1 (tomorrow) accepted
        $tomorrowResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar',
            'phone' => '081234567890',
            'deliveryDate' => $tomorrow,
            'time' => '10:00',
            'method' => 'pickup',
        ]);
        $tomorrowResponse->assertRedirect();
        $this->assertDatabaseHas('pesanan', ['nama_penerima' => 'Fajar']);
    }

    public function test_extreme_boundary_haversine_distance_strictly_enforced_at_20km(): void
    {
        $customer = User::create([
            'nama' => 'Distance Cust',
            'email' => 'dist_cust@contoh.test',
            'nomor_telepon' => '081299992222',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        CartItem::create([
            'id_pengguna' => $customer->id,
            'id_menu' => $this->satuanMenu->id,
            'kuantitas' => 2,
        ]);

        $tomorrow = Carbon::now('Asia/Jakarta')->addDay()->toDateString();

        // Radius outside 20 km (e.g. 25 km option)
        $outsideResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar',
            'phone' => '081234567890',
            'deliveryDate' => $tomorrow,
            'time' => '10:00',
            'method' => 'delivery',
            'address' => 'Depok, Jawa Barat',
            'distance' => '25',
        ]);
        $outsideResponse->assertSessionHasErrors('delivery_type');

        // Radius within 20 km (e.g. 15 km option) succeeds
        $insideResponse = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Fajar',
            'phone' => '081234567890',
            'deliveryDate' => $tomorrow,
            'time' => '10:00',
            'method' => 'delivery',
            'address' => 'Kelapa Gading, Jakarta Utara',
            'distance' => '15',
        ]);
        $insideResponse->assertRedirect();
        $this->assertDatabaseHas('pesanan', ['nama_penerima' => 'Fajar']);
    }

    public function test_extreme_boundary_payment_amount_mismatch_prevented(): void
    {
        $order = Order::create([
            'nomor_pesanan' => 'DM-261108-9999',
            'id_pengguna' => null,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::now()->addDay()->toDateString(),
            'waktu_pengiriman' => '10:00',
            'jenis_pengiriman' => 'pickup',
            'nama_penerima' => 'Dewi',
            'nomor_telepon_penerima' => '081233334444',
            'subtotal' => 100000,
            'biaya_pengiriman' => 0,
            'total_pembayaran' => 100000,
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $file = UploadedFile::fake()->image('bukti.jpg', 600, 800)->size(500);

        // Underpayment of Rp1,000 rejected
        $underResponse = $this->post('/pembayaran', [
            'id_pesanan' => $order->id,
            'nama_bank' => 'BCA',
            'nama_pemilik_rekening' => 'Dewi',
            'nominal_transfer' => 99000,
            'tanggal_transfer' => Carbon::today()->toDateString(),
            'bukti_transfer' => $file,
        ]);
        $underResponse->assertSessionHasErrors();

        // Exact amount accepted
        $exactResponse = $this->post('/pembayaran', [
            'id_pesanan' => $order->id,
            'nama_bank' => 'BCA',
            'nama_pemilik_rekening' => 'Dewi',
            'nominal_transfer' => 100000,
            'tanggal_transfer' => Carbon::today()->toDateString(),
            'bukti_transfer' => $file,
        ]);
        $exactResponse->assertRedirect();
        $order->refresh();
        $this->assertEquals(Order::PAYMENT_VERIFYING, $order->status_pembayaran);
    }

    public function test_extreme_boundary_order_status_state_machine_transitions(): void
    {
        $order = Order::create([
            'nomor_pesanan' => 'DM-261108-8888',
            'id_pengguna' => null,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::now()->addDay()->toDateString(),
            'waktu_pengiriman' => '10:00',
            'jenis_pengiriman' => 'pickup',
            'nama_penerima' => 'Toni',
            'nomor_telepon_penerima' => '081255556666',
            'subtotal' => 50000,
            'biaya_pengiriman' => 0,
            'total_pembayaran' => 50000,
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);

        // Attempting to jump directly from 0 (Pending) to 3 (Completed) must be rejected
        $jumpResponse = $this->actingAs($this->admin)
            ->patch("/admin/pesanan/{$order->id}/status", ['status' => Order::STATUS_COMPLETED]);
        $jumpResponse->assertSessionHas('error');
        $order->refresh();
        $this->assertEquals(Order::STATUS_PENDING_PAYMENT, $order->status_pesanan);

        // Cancelled order cannot be verified
        $order->update(['status_pesanan' => Order::STATUS_CANCELLED]);
        $verifyResponse = $this->actingAs($this->admin)
            ->post("/admin/pesanan/{$order->id}/verify");
        $verifyResponse->assertSessionHas('error');
    }

    public function test_extreme_boundary_guest_cart_migrates_to_user_upon_login_and_checkout_succeeds(): void
    {
        $customer = User::create([
            'nama' => 'Maya Indah',
            'email' => 'maya@contoh.test',
            'nomor_telepon' => '081277778888',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'alamat' => 'Menteng',
            'status_aktif' => true,
        ]);

        auth()->logout();
        $migSess = str_repeat('f', 40);
        // Guest adds item
        $this->withCookie($this->cookieName, $migSess)->postJson('/keranjang', [
            'id_menu' => $this->satuanMenu->id,
            'kuantitas' => 3,
        ])->assertCreated();

        $this->assertDatabaseHas('item_keranjang', [
            'id_pengguna' => null,
            'id_sesi' => $migSess,
            'kuantitas' => 3,
        ]);

        // Guest logs in
        $login = $this->withCookie($this->cookieName, $migSess)->post('/login', [
            'email' => 'maya@contoh.test',
            'password' => 'password123',
        ]);
        $login->assertRedirect(route('catalog'));
        // Cart items must now belong to customer id
        $this->assertDatabaseHas('item_keranjang', [
            'id_pengguna' => $customer->id,
            'kuantitas' => 3,
        ]);

        // Logged in customer can checkout
        $checkout = $this->actingAs($customer)->post('/checkout', [
            'name' => 'Maya Indah',
            'phone' => '081277778888',
            'deliveryDate' => Carbon::now('Asia/Jakarta')->addDay()->toDateString(),
            'time' => '12:00',
            'method' => 'pickup',
        ]);
        $checkout->assertRedirect();
        $this->assertDatabaseHas('pesanan', [
            'id_pengguna' => $customer->id,
            'subtotal' => 75000,
        ]);
    }

    public function test_extreme_boundary_guest_tracking_requires_matching_phone(): void
    {
        auth()->logout();
        $order = Order::create([
            'nomor_pesanan' => 'DM-261108-7777',
            'id_pengguna' => null,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::now()->addDay()->toDateString(),
            'waktu_pengiriman' => '10:00',
            'jenis_pengiriman' => 'pickup',
            'nama_penerima' => 'Bambang',
            'nomor_telepon_penerima' => '081299998888',
            'subtotal' => 50000,
            'biaya_pengiriman' => 0,
            'total_pembayaran' => 50000,
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);

        // Guest tracking with wrong phone returns error
        $wrongPhoneResponse = $this->get('/lacak-pesanan?id=DM-261108-7777&phone=081100000000');
        $this->assertNull($wrongPhoneResponse->viewData('order'));

        // Guest tracking without phone returns prompt
        $noPhoneResponse = $this->get('/lacak-pesanan?id=DM-261108-7777');
        $this->assertNull($noPhoneResponse->viewData('order'));

        // Guest tracking with correct phone returns order
        $correctResponse = $this->get('/lacak-pesanan?id=DM-261108-7777&phone=081299998888');
        $this->assertNotNull($correctResponse->viewData('order'));
        $this->assertEquals('DM-261108-7777', $correctResponse->viewData('order')->nomor_pesanan);
    }
}
