<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasLegacyColumns;

    public const LEGACY_MAP = [
        'name' => 'nama_kategori',
        'description' => 'deskripsi',
        'is_active' => 'status_aktif',
    ];

    protected $table = 'kategori';

    protected $fillable = [
        'nama_kategori', 'slug', 'deskripsi', 'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class, 'id_kategori');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status_aktif', true);
    }
}
