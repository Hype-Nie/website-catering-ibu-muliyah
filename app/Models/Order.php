<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasLegacyColumns;

    public const STATUS_PENDING_PAYMENT = 0;

    public const STATUS_PROCESSING = 1;

    public const STATUS_SHIPPED = 2;

    public const STATUS_COMPLETED = 3;

    public const STATUS_CANCELLED = 4;

    public const PAYMENT_PENDING = 'Menunggu Pembayaran';

    public const PAYMENT_VERIFYING = 'Menunggu Verifikasi';

    public const PAYMENT_PAID = 'Lunas';

    public const PAYMENT_REJECTED = 'Ditolak';

    public const ALLOWED_TRANSITIONS = [
        0 => [1, 4], 1 => [2, 4], 2 => [3], 3 => [], 4 => [],
    ];

    public const LEGACY_MAP = [
        'order_number' => 'nomor_pesanan', 'user_id' => 'id_pengguna',
        'order_date' => 'tanggal_pesanan', 'delivery_date' => 'tanggal_pengiriman',
        'delivery_time' => 'waktu_pengiriman', 'delivery_type' => 'jenis_pengiriman',
        'recipient_name' => 'nama_penerima', 'recipient_phone' => 'nomor_telepon_penerima',
        'recipient_email' => 'email_penerima', 'delivery_address' => 'alamat_pengiriman',
        'delivery_latitude' => 'latitude_pengiriman', 'delivery_longitude' => 'longitude_pengiriman',
        'delivery_distance_km' => 'jarak_pengiriman_km', 'notes' => 'catatan',
        'subtotal_amount' => 'subtotal', 'delivery_fee' => 'biaya_pengiriman',
        'total_amount' => 'total_pembayaran', 'payment_status' => 'status_pembayaran',
        'order_status' => 'status_pesanan',
    ];

    protected $table = 'pesanan';

    protected $fillable = [
        'nomor_pesanan', 'id_pengguna', 'tanggal_pesanan', 'tanggal_pengiriman',
        'waktu_pengiriman', 'jenis_pengiriman', 'nama_penerima', 'nomor_telepon_penerima',
        'email_penerima', 'alamat_pengiriman', 'latitude_pengiriman', 'longitude_pengiriman',
        'jarak_pengiriman_km', 'catatan', 'subtotal', 'biaya_pengiriman',
        'total_pembayaran', 'status_pembayaran', 'status_pesanan',
    ];

    protected $casts = [
        'tanggal_pesanan' => 'datetime', 'tanggal_pengiriman' => 'date',
        'latitude_pengiriman' => 'float', 'longitude_pengiriman' => 'float',
        'jarak_pengiriman_km' => 'float', 'subtotal' => 'float',
        'biaya_pengiriman' => 'float', 'total_pembayaran' => 'float',
        'status_pesanan' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_pengguna');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'id_pesanan');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'id_pesanan');
    }

    public function canTransitionTo(int $newStatus): bool
    {
        return ($newStatus !== 1 || $this->status_pembayaran === self::PAYMENT_PAID)
            && in_array($newStatus, self::ALLOWED_TRANSITIONS[$this->status_pesanan] ?? [], true);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status_pesanan) {
            0 => 'Menunggu Pembayaran', 1 => 'Diproses Dapur',
            2 => 'Dikirim / Siap Diambil', 3 => 'Selesai', 4 => 'Dibatalkan',
            default => 'Status Tidak Diketahui',
        };
    }
}
