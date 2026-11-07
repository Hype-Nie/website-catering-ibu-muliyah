<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PaymentAndTrackingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->user = User::create([
            'nama' => 'Dewi Lestari',
            'email' => 'dewi@contoh.test',
            'nomor_telepon' => '081355667788',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $this->order = Order::create([
            'nomor_pesanan' => 'DM-261107-0001',
            'id_pengguna' => $this->user->id,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::tomorrow()->toDateString(),
            'waktu_pengiriman' => '10:00',
            'jenis_pengiriman' => 'delivery',
            'nama_penerima' => 'Dewi Lestari',
            'nomor_telepon_penerima' => '081355667788',
            'email_penerima' => 'dewi@contoh.test',
            'alamat_pengiriman' => 'Jl. Salemba No. 12',
            'jarak_pengiriman_km' => 5.0,
            'subtotal' => 50000.0,
            'biaya_pengiriman' => 15000.0,
            'total_pembayaran' => 65000.0,
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);
    }

    public function test_payment_upload_succeeds_with_valid_file_and_amount(): void
    {
        $file = UploadedFile::fake()->image('bukti_transfer.jpg', 600, 800)->size(1500); // 1.5 MB

        $response = $this->actingAs($this->user)->post('/pembayaran', [
            'order_id' => $this->order->id,
            'bank_name' => 'BCA',
            'account_holder' => 'Dewi Lestari',
            'transfer_amount' => 65000.0,
            'transfer_date' => Carbon::today()->toDateString(),
            'proof' => $file,
        ]);

        $response->assertRedirect(route('tracking.show', ['id' => $this->order->nomor_pesanan]));

        $this->order->refresh();
        $this->assertEquals(Order::PAYMENT_VERIFYING, $this->order->status_pembayaran);

        $payment = Payment::where('id_pesanan', $this->order->id)->first();
        $this->assertNotNull($payment);
        $this->assertEquals('BCA', $payment->nama_bank);
        $this->assertEquals(Payment::STATUS_VERIFYING, $payment->status_verifikasi);
        Storage::disk('public')->assertExists($payment->bukti_transfer);
    }

    public function test_payment_upload_fails_if_amount_does_not_match_order_total(): void
    {
        $file = UploadedFile::fake()->image('struk.jpg');

        $response = $this->actingAs($this->user)->post('/pembayaran', [
            'order_id' => $this->order->id,
            'bank_name' => 'BCA',
            'account_holder' => 'Dewi Lestari',
            'transfer_amount' => 50000.0, // Order total is 65000, mismatch!
            'transfer_date' => Carbon::today()->toDateString(),
            'proof' => $file,
        ]);

        $response->assertSessionHasErrors('transfer_amount');
        $this->assertDatabaseMissing('pembayaran', ['id_pesanan' => $this->order->id]);
    }

    public function test_payment_upload_fails_if_file_exceeds_2mb(): void
    {
        $file = UploadedFile::fake()->create('large_proof.pdf', 2500); // 2.5 MB > 2 MB

        $response = $this->actingAs($this->user)->post('/pembayaran', [
            'order_id' => $this->order->id,
            'bank_name' => 'Mandiri',
            'account_holder' => 'Dewi Lestari',
            'transfer_amount' => 65000.0,
            'transfer_date' => Carbon::today()->toDateString(),
            'proof' => $file,
        ]);

        $response->assertSessionHasErrors('proof');
    }

    public function test_customer_can_view_tracking_timeline(): void
    {
        $response = $this->actingAs($this->user)->get('/lacak-pesanan?id='.$this->order->nomor_pesanan);
        $response->assertStatus(200);
        $response->assertViewHas('order');
    }

    public function test_customer_can_view_order_history(): void
    {
        $response = $this->actingAs($this->user)->get('/pesanan');
        $response->assertStatus(200);
        $response->assertViewHas('orders');
    }
}
