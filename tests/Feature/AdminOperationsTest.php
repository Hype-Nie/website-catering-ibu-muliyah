<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminOperationsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $customer;

    private Category $category;

    private Order $order;

    private Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::create([
            'nama' => 'Admin Dapur Menteng',
            'email' => 'admin@menteng.test',
            'nomor_telepon' => '081200000000',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'admin',
            'status_aktif' => true,
        ]);

        $this->customer = User::create([
            'nama' => 'Pelanggan Setia',
            'email' => 'setia@contoh.test',
            'nomor_telepon' => '081211112222',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $this->category = Category::create([
            'nama_kategori' => 'Porsi Satuan',
            'slug' => 'satuan',
            'deskripsi' => 'Porsi satuan',
            'status_aktif' => true,
        ]);

        $menu = Menu::create([
            'id_kategori' => $this->category->id,
            'nama_menu' => 'Nasi Uduk Ayam Goreng',
            'slug' => 'nasi-uduk-ayam-goreng',
            'deskripsi' => 'Ayam goreng nikmat',
            'harga' => 25000,
            'jenis_paket' => 'satuan',
            'minimal_pesanan' => 1,
            'foto_menu' => 'hero.jpg',
            'status_tersedia' => true,
        ]);

        $this->order = Order::create([
            'nomor_pesanan' => 'DM-261107-9999',
            'id_pengguna' => $this->customer->id,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::tomorrow()->toDateString(),
            'waktu_pengiriman' => '10:00',
            'jenis_pengiriman' => 'delivery',
            'nama_penerima' => 'Pelanggan Setia',
            'nomor_telepon_penerima' => '081211112222',
            'email_penerima' => 'setia@contoh.test',
            'alamat_pengiriman' => 'Jl. Cikini No. 5',
            'jarak_pengiriman_km' => 3.0,
            'subtotal' => 50000.0,
            'biaya_pengiriman' => 15000.0,
            'total_pembayaran' => 65000.0,
            'status_pembayaran' => Order::PAYMENT_VERIFYING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);

        OrderItem::create([
            'id_pesanan' => $this->order->id,
            'id_menu' => $menu->id,
            'nama_menu' => $menu->nama_menu,
            'harga' => 25000,
            'kuantitas' => 2,
            'subtotal' => 50000,
        ]);

        $this->payment = Payment::create([
            'id_pesanan' => $this->order->id,
            'nama_bank' => 'BCA',
            'nama_pemilik_rekening' => 'Pelanggan Setia',
            'nominal_transfer' => 65000.0,
            'tanggal_transfer' => Carbon::today()->toDateString(),
            'bukti_transfer' => 'bukti_transfer/contoh.jpg',
            'status_verifikasi' => Payment::STATUS_VERIFYING,
        ]);
    }

    public function test_admin_can_view_dashboard_metrics(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin');
        $response->assertStatus(200);
        $response->assertViewHas('totalRevenue');
        $response->assertViewHas('totalOrders');
        $response->assertViewHas('pendingVerifications');
    }

    public function test_admin_can_crud_menu(): void
    {
        // 1. Create Menu
        $file = UploadedFile::fake()->image('menu_baru.jpg');
        $storeResponse = $this->actingAs($this->admin)->post('/admin/menu', [
            'category_id' => $this->category->id,
            'name' => 'Nasi Uduk Rendang Daging',
            'description' => 'Nasi uduk dengan rendang empuk',
            'price' => 35000,
            'package_type' => 'satuan',
            'min_order' => 1,
            'image' => $file,
            'is_available' => true,
        ]);
        $storeResponse->assertRedirect(route('admin.menu.index'));
        $this->assertDatabaseHas('menu', ['nama_menu' => 'Nasi Uduk Rendang Daging']);

        $menu = Menu::where('nama_menu', 'Nasi Uduk Rendang Daging')->first();

        // 2. Toggle Availability
        $toggleResponse = $this->actingAs($this->admin)->patch('/admin/menu/'.$menu->id.'/toggle');
        $toggleResponse->assertRedirect(route('admin.menu.index'));
        $this->assertFalse($menu->fresh()->is_available);

        // 3. Update Menu
        $updateResponse = $this->actingAs($this->admin)->put('/admin/menu/'.$menu->id, [
            'category_id' => $this->category->id,
            'name' => 'Nasi Uduk Rendang Daging Super',
            'description' => 'Deskripsi baru',
            'price' => 38000,
            'package_type' => 'satuan',
            'min_order' => 1,
            'is_available' => true,
        ]);
        $updateResponse->assertRedirect(route('admin.menu.index'));
        $this->assertEquals('Nasi Uduk Rendang Daging Super', $menu->fresh()->nama_menu);

        // 4. Delete Menu
        $deleteResponse = $this->actingAs($this->admin)->delete('/admin/menu/'.$menu->id);
        $deleteResponse->assertRedirect(route('admin.menu.index'));
        $this->assertDatabaseMissing('menu', ['id' => $menu->id]);
    }

    public function test_admin_can_verify_payment(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/pesanan/'.$this->order->id.'/verify');
        $response->assertRedirect(route('admin.orders.index'));

        $this->order->refresh();
        $this->payment->refresh();

        $this->assertEquals(Order::PAYMENT_PAID, $this->order->status_pembayaran);
        $this->assertEquals(Order::STATUS_PROCESSING, $this->order->status_pesanan);
        $this->assertEquals(Payment::STATUS_PAID, $this->payment->status_verifikasi);
        $this->assertEquals($this->admin->id, $this->payment->diverifikasi_oleh);
        $this->assertNotNull($this->payment->diverifikasi_pada);
    }

    public function test_admin_can_reject_payment_with_reason(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/pesanan/'.$this->order->id.'/reject', [
            'reason' => 'Nominal pada struk tidak terbaca dan tanggal buram.',
        ]);
        $response->assertRedirect(route('admin.orders.index'));

        $this->order->refresh();
        $this->payment->refresh();

        $this->assertEquals(Order::PAYMENT_REJECTED, $this->order->status_pembayaran);
        $this->assertEquals(Order::STATUS_REJECTED, $this->order->status_pesanan);
        $this->assertEquals('Ditolak', $this->order->status_label);
        $this->assertEquals(Payment::STATUS_REJECTED, $this->payment->status_verifikasi);
        $this->assertEquals('Nominal pada struk tidak terbaca dan tanggal buram.', $this->payment->catatan_penolakan);
    }

    public function test_admin_can_update_order_lifecycle_status(): void
    {
        $this->order->update([
            'status_pembayaran' => Order::PAYMENT_PAID,
            'status_pesanan' => Order::STATUS_PROCESSING,
        ]);

        // Update to Shipped (2)
        $response1 = $this->actingAs($this->admin)->patch('/admin/pesanan/'.$this->order->id.'/status', [
            'order_status' => Order::STATUS_SHIPPED,
        ]);
        $response1->assertRedirect(route('admin.orders.index'));
        $this->assertEquals(Order::STATUS_SHIPPED, $this->order->fresh()->status_pesanan);

        // Update to Completed (3)
        $response2 = $this->actingAs($this->admin)->patch('/admin/pesanan/'.$this->order->id.'/status', [
            'order_status' => Order::STATUS_COMPLETED,
        ]);
        $response2->assertRedirect(route('admin.orders.index'));
        $this->assertEquals(Order::STATUS_COMPLETED, $this->order->fresh()->status_pesanan);
    }

    public function test_admin_can_view_customers_and_export_reports_csv(): void
    {
        // View Customers
        $customerResponse = $this->actingAs($this->admin)->get('/admin/pelanggan');
        $customerResponse->assertStatus(200);
        $customerResponse->assertViewHas('customers');

        // Export CSV Report
        $reportResponse = $this->actingAs($this->admin)->get('/admin/laporan/export-csv');
        $reportResponse->assertStatus(200);
        $this->assertStringContainsString('text/csv', (string) $reportResponse->headers->get('content-type'));
    }
}
