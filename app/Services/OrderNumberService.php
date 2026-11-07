<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderNumberService
{
    public function generate(): string
    {
        $prefix = 'DM-'.Carbon::now('Asia/Jakarta')->format('ymd').'-';

        $generator = function () use ($prefix): string {
            $latestOrder = Order::lockForUpdate()
                ->where('order_number', 'LIKE', $prefix.'%')
                ->orderByDesc('id')
                ->first();

            $nextSequence = 1;
            if ($latestOrder) {
                $lastSequence = (int) substr($latestOrder->order_number, strlen($prefix));
                $nextSequence = $lastSequence + 1;
            }

            return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
        };

        return DB::transactionLevel() > 0 ? $generator() : DB::transaction($generator);
    }
}
