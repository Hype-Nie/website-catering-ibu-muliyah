<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasLegacyColumns, Notifiable;

    public const LEGACY_MAP = [
        'name' => 'nama', 'phone_number' => 'nomor_telepon', 'phone' => 'nomor_telepon',
        'password' => 'kata_sandi', 'role' => 'peran', 'address' => 'alamat',
        'is_active' => 'status_aktif',
    ];

    protected $table = 'pengguna';

    protected $fillable = [
        'nama', 'email', 'nomor_telepon', 'kata_sandi', 'peran',
        'alamat', 'status_aktif', 'email_verified_at',
    ];

    protected $attributes = ['peran' => 'customer', 'status_aktif' => true];

    protected $hidden = ['kata_sandi', 'remember_token'];

    protected function casts(): array
    {
        return [
            'status_aktif' => 'boolean',
            'kata_sandi' => 'hashed',
            'email_verified_at' => 'datetime',
        ];
    }

    public function getAuthPasswordName(): string
    {
        return 'kata_sandi';
    }

    public function getAuthPassword(): string
    {
        return (string) $this->kata_sandi;
    }

    public function isAdmin(): bool
    {
        return $this->peran === 'admin';
    }

    public function isCustomer(): bool
    {
        return $this->peran === 'customer';
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'id_pengguna');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class, 'id_pengguna');
    }
}
