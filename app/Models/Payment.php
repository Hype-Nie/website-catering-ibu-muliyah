<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasLegacyColumns;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasLegacyColumns;

    public const STATUS_VERIFYING = 'Menunggu Verifikasi';

    public const STATUS_PAID = 'Lunas';

    public const STATUS_REJECTED = 'Ditolak';

    public const LEGACY_MAP = [
        'order_id' => 'id_pesanan', 'bank_name' => 'nama_bank',
        'account_holder' => 'nama_pemilik_rekening', 'transfer_amount' => 'nominal_transfer',
        'transfer_date' => 'tanggal_transfer', 'proof_image' => 'bukti_transfer',
        'status' => 'status_verifikasi', 'rejection_note' => 'catatan_penolakan',
        'verified_by' => 'diverifikasi_oleh', 'verified_at' => 'diverifikasi_pada',
    ];

    protected $table = 'pembayaran';

    protected $fillable = [
        'id_pesanan', 'nama_bank', 'nama_pemilik_rekening', 'nominal_transfer', 'tanggal_transfer',
        'bukti_transfer', 'status_verifikasi', 'catatan_penolakan', 'diverifikasi_oleh', 'diverifikasi_pada',
    ];

    protected $casts = [
        'nominal_transfer' => 'decimal:2',
        'tanggal_transfer' => 'date',
        'diverifikasi_pada' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'id_pesanan');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }

    public function verify(int $adminId): void
    {
        $this->update([
            'status_verifikasi' => self::STATUS_PAID,
            'diverifikasi_oleh' => $adminId,
            'diverifikasi_pada' => now(),
            'catatan_penolakan' => null,
        ]);

        $this->order->update([
            'status_pembayaran' => Order::PAYMENT_PAID,
            'status_pesanan' => Order::STATUS_PROCESSING,
        ]);
    }

    public function reject(int $adminId, string $note): void
    {
        $this->update([
            'status_verifikasi' => self::STATUS_REJECTED,
            'diverifikasi_oleh' => $adminId,
            'diverifikasi_pada' => now(),
            'catatan_penolakan' => $note,
        ]);

        $this->order->update(['status_pembayaran' => Order::PAYMENT_REJECTED]);
    }
}
