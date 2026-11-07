<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pesanan')->unique()->constrained('pesanan')->onDelete('cascade');
            $table->string('nama_bank', 50);
            $table->string('nama_pemilik_rekening', 100);
            $table->decimal('nominal_transfer', 12, 2);
            $table->date('tanggal_transfer');
            $table->string('bukti_transfer', 255);
            $table->enum('status_verifikasi', [
                'Menunggu Verifikasi',
                'Lunas',
                'Ditolak',
            ])->default('Menunggu Verifikasi');
            $table->text('catatan_penolakan')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('pengguna')->onDelete('set null');
            $table->timestamp('diverifikasi_pada')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
