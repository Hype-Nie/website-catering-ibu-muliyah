<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasLegacyColumns;

    public const LEGACY_MAP = [
        'order_id' => 'id_pesanan',
        'menu_id' => 'id_menu',
        'menu_name' => 'nama_menu',
        'price' => 'harga',
        'quantity' => 'kuantitas',
        'notes' => 'catatan',
    ];

    protected $table = 'item_pesanan';

    protected $fillable = [
        'id_pesanan', 'id_menu', 'nama_menu', 'harga', 'kuantitas', 'subtotal', 'catatan',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'kuantitas' => 'integer',
        'subtotal' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'id_pesanan');
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'id_menu');
    }
}
