<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Order;
use App\Services\OrderNumberService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderNumberServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_generates_first_order_number_of_day(): void
    {
        $service = new OrderNumberService;
        $orderNumber = $service->generate();

        $prefix = 'DM-'.Carbon::now('Asia/Jakarta')->format('ymd').'-';
        $this->assertEquals($prefix.'0001', $orderNumber);
    }

    public function test_it_increments_order_number_sequence(): void
    {
        $service = new OrderNumberService;

        $first = $service->generate();

        Order::create([
            'nomor_pesanan' => $first,
            'tanggal_pesanan' => now(),
            'tanggal_pengiriman' => Carbon::tomorrow()->toDateString(),
            'waktu_pengiriman' => '12:00',
            'jenis_pengiriman' => 'pickup',
            'nama_penerima' => 'Tester',
            'nomor_telepon_penerima' => '081234567890',
            'subtotal' => 50000,
            'biaya_pengiriman' => 0,
            'total_pembayaran' => 50000,
            'status_pembayaran' => Order::PAYMENT_PENDING,
            'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
        ]);

        $second = $service->generate();

        $prefix = 'DM-'.Carbon::now('Asia/Jakarta')->format('ymd').'-';
        $this->assertEquals($prefix.'0002', $second);
    }
}
