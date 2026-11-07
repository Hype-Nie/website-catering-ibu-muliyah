<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasLegacyColumns;

    public const LEGACY_MAP = [
        'category_id' => 'id_kategori',
        'name' => 'nama_menu',
        'description' => 'deskripsi',
        'price' => 'harga',
        'package_type' => 'jenis_paket',
        'min_order' => 'minimal_pesanan',
        'image_path' => 'foto_menu',
        'is_available' => 'status_tersedia',
    ];

    protected $table = 'menu';

    protected $fillable = [
        'id_kategori', 'nama_menu', 'slug', 'deskripsi', 'harga',
        'jenis_paket', 'minimal_pesanan', 'foto_menu', 'status_tersedia',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'minimal_pesanan' => 'integer',
        'status_tersedia' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'id_kategori');
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'id_kategori');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'id_menu');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'id_menu');
    }

    public function checkMinOrder(int $quantity): bool
    {
        return $quantity >= $this->minimal_pesanan;
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status_tersedia', true);
    }

    public function scopeByCategory(Builder $query, string $categorySlug): Builder
    {
        return $query->whereHas('category', fn (Builder $q) => $q->where('slug', $categorySlug));
    }
}
