<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasLegacyColumns;

    public const LEGACY_MAP = [
        'user_id' => 'id_pengguna',
        'session_id' => 'id_sesi',
        'menu_id' => 'id_menu',
        'quantity' => 'kuantitas',
        'notes' => 'catatan',
    ];

    protected $table = 'item_keranjang';

    protected $fillable = [
        'id_pengguna', 'id_sesi', 'id_menu', 'kuantitas', 'catatan',
    ];

    protected $casts = [
        'kuantitas' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_pengguna');
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'id_menu');
    }

    public function getSubtotalAttribute(): float
    {
        return (float) ($this->kuantitas * ($this->menu?->harga ?? 0));
    }
}
