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

class SecurityAndHardeningTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $user1;

    private User $user2;

    private Menu $menu;

    private Order $order1;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->admin = User::create([
            'nama' => 'Admin Test',
            'email' => 'admin.sec@test.local',
            'nomor_telepon' => '081299990001',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'admin',
            'status_aktif' => true,
        ]);

        $this->user1 = User::create([
            'nama' => 'Customer One',
            'email' => 'user1@test.local',
            'nomor_telepon' => '081299990002',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $this->user2 = User::create([
            'nama' => 'Customer Two',
            'email' => 'user2@test.local',
            'nomor_telepon' => '081299990003',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $category = Category::create([
            'nama_kategori' => 'Nasi Kotak',
            'slug' => 'nasi-kotak',
            'deskripsi' => 'Menu Kotak',
            'status_aktif' => true,
        ]);

        $this->menu = Menu::create([
            'id_kategori' => $category->id,
            'nama_menu' => 'Nasi Uduk Komplit',
            'slug' => 'nasi-uduk-komplit',
            'deskripsi' => 'Enak',
            'harga' => 30000,
            'jenis_paket' => 'satuan',
            'minimal_pesanan' => 1,
            'foto_menu' => 'hero.jpg',
            'status_tersedia' => true,
        ]);

        $this->order1 = Order::create([
            'nomor_pesanan' => 'DM-261107-1111',
            'id_pengguna' => $this->user1->id,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::tomorrow('Asia/Jakarta')->toDateString(),
            'waktu_pengiriman' => '12:00',
            'jenis_pengiriman' => 'delivery',
            'nama_penerima' => 'Customer One',
            'nomor_telepon_penerima' => '081299990002',
            'email_penerima' => 'user1@test.local',
            'alamat_pengiriman' => 'Jl. Menteng 1',
            'latitude_pengiriman' => -6.1944,
            'longitude_pengiriman' => 106.8372,
            'jarak_pengiriman_km' => 1.0,
            'subtotal' => 30000.0,
            'biaya_pengiriman' => 15000.0,
            'total_pembayaran' => 45000.0,
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);
    }

    public function test_guest_cannot_track_order_without_matching_phone(): void
    {
        $response = $this->getJson('/lacak-pesanan?id='.$this->order1->nomor_pesanan);
        $response->assertStatus(403);
    }

    public function test_guest_can_track_order_with_matching_phone(): void
    {
        $response = $this->getJson('/lacak-pesanan?id='.$this->order1->nomor_pesanan.'&phone=081299990002');
        $response->assertStatus(200)
            ->assertJsonPath('nomor_pesanan', $this->order1->nomor_pesanan);
    }

    public function test_customer_cannot_track_another_customer_order(): void
    {
        $response = $this->actingAs($this->user2)->getJson('/lacak-pesanan?id='.$this->order1->nomor_pesanan);
        $response->assertStatus(404);
    }

    public function test_sequential_numeric_id_tracking_is_blocked(): void
    {
        $response = $this->getJson('/lacak-pesanan?id='.$this->order1->id.'&phone=081299990002');
        $response->assertStatus(404);
    }

    public function test_customer_cannot_upload_payment_for_another_user_order(): void
    {
        $file = UploadedFile::fake()->image('slip.jpg');
        $response = $this->actingAs($this->user2)->post('/pembayaran', [
            'order_id' => $this->order1->id,
            'bank_name' => 'BCA',
            'account_holder' => 'Attacker',
            'transfer_amount' => 45000.0,
            'transfer_date' => Carbon::today('Asia/Jakarta')->toDateString(),
            'proof' => $file,
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_upload_payment_for_already_paid_or_cancelled_order(): void
    {
        $this->order1->update(['status_pembayaran' => Order::PAYMENT_PAID]);
        $file = UploadedFile::fake()->image('slip.jpg');

        $response = $this->actingAs($this->user1)->post('/pembayaran', [
            'order_id' => $this->order1->id,
            'bank_name' => 'BCA',
            'account_holder' => 'Customer One',
            'transfer_amount' => 45000.0,
            'transfer_date' => Carbon::today('Asia/Jakarta')->toDateString(),
            'proof' => $file,
        ]);
        $response->assertStatus(403);

        $this->order1->update([
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_CANCELLED,
        ]);

        $response2 = $this->actingAs($this->user1)->post('/pembayaran', [
            'order_id' => $this->order1->id,
            'bank_name' => 'BCA',
            'account_holder' => 'Customer One',
            'transfer_amount' => 45000.0,
            'transfer_date' => Carbon::today('Asia/Jakarta')->toDateString(),
            'proof' => $file,
        ]);
        $response2->assertStatus(403);
    }

    public function test_file_upload_uses_verified_extension(): void
    {
        $file = UploadedFile::fake()->image('exploit.php.jpg', 100, 100);

        $this->actingAs($this->user1)->post('/pembayaran', [
            'order_id' => $this->order1->id,
            'bank_name' => 'BCA',
            'account_holder' => 'Customer One',
            'transfer_amount' => 45000.0,
            'transfer_date' => Carbon::today('Asia/Jakarta')->toDateString(),
            'proof' => $file,
        ]);

        $payment = Payment::where('id_pesanan', $this->order1->id)->first();
        $this->assertNotNull($payment);
        $this->assertMatchesRegularExpression('/\.(jpg|jpeg)$/', $payment->bukti_transfer);
        $this->assertStringNotContainsString('.php', $payment->bukti_transfer);
    }

    public function test_sales_report_csv_sanitizes_formula_injection(): void
    {
        $this->order1->update([
            'nama_penerima' => '=1+1',
            'nomor_telepon_penerima' => '+6281234567',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/laporan/export-csv');
        $response->assertStatus(200);

        $content = $response->streamedContent();
        $this->assertStringContainsString("'=1+1", $content);
        $this->assertStringContainsString("'+6281234567", $content);
    }

    public function test_order_state_machine_prevents_invalid_status_transitions(): void
    {
        // Unpaid order cannot jump directly to Processing or Completed
        $response = $this->actingAs($this->admin)->patchJson('/admin/pesanan/'.$this->order1->id.'/status', [
            'order_status' => Order::STATUS_PROCESSING,
        ]);
        $response->assertStatus(422);

        $response2 = $this->actingAs($this->admin)->patchJson('/admin/pesanan/'.$this->order1->id.'/status', [
            'order_status' => Order::STATUS_COMPLETED,
        ]);
        $response2->assertStatus(422);
    }

    public function test_admin_cannot_verify_payment_on_cancelled_order(): void
    {
        Payment::create([
            'id_pesanan' => $this->order1->id,
            'nama_bank' => 'BCA',
            'nama_pemilik_rekening' => 'Cust',
            'nominal_transfer' => 45000.0,
            'tanggal_transfer' => now()->toDateString(),
            'bukti_transfer' => 'slip.jpg',
            'status_verifikasi' => Payment::STATUS_VERIFYING,
        ]);
        $this->order1->update(['status_pesanan' => Order::STATUS_CANCELLED]);

        $response = $this->actingAs($this->admin)->postJson('/admin/pesanan/'.$this->order1->id.'/verify');
        $response->assertStatus(422);
    }

    public function test_guest_cart_migrates_to_user_upon_login(): void
    {
        $guestSess = str_repeat('e', 40);
        $cookieName = config('session.cookie');

        CartItem::create([
            'id_sesi' => $guestSess,
            'id_menu' => $this->menu->id,
            'kuantitas' => 2,
        ]);

        $this->assertDatabaseHas('item_keranjang', [
            'id_pengguna' => null,
            'id_sesi' => $guestSess,
            'id_menu' => $this->menu->id,
            'kuantitas' => 2,
        ]);

        $response = $this->withCookie($cookieName, $guestSess)->post('/login', [
            'email' => $this->user1->email,
            'password' => 'password123',
        ]);
        $response->assertRedirect(route('catalog'));

        $this->assertDatabaseHas('item_keranjang', [
            'id_pengguna' => $this->user1->id,
            'id_sesi' => null,
            'id_menu' => $this->menu->id,
            'kuantitas' => 2,
        ]);
        $this->assertDatabaseMissing('item_keranjang', [
            'id_pengguna' => null,
        ]);
    }

    public function test_cannot_add_unavailable_menu_to_cart_and_checkout_validates(): void
    {
        $this->menu->update(['status_tersedia' => false]);

        $response = $this->actingAs($this->user1)->post('/keranjang', [
            'menu_id' => $this->menu->id,
            'quantity' => 1,
        ]);
        $response->assertSessionHasErrors('menu_id');
    }

    public function test_inactive_user_cannot_login_and_is_blocked_by_middleware(): void
    {
        $this->user1->update(['status_aktif' => false]);

        $response = $this->post('/login', [
            'email' => $this->user1->email,
            'password' => 'password123',
        ]);
        $response->assertSessionHasErrors('email');
        $this->assertFalse(auth()->check());

        // Middleware test
        $response2 = $this->actingAs($this->user1)->get('/admin');
        $response2->assertStatus(403);
    }
}
