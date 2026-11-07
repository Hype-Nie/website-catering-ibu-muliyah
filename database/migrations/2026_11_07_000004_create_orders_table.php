<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pesanan', 50)->unique();
            $table->foreignId('id_pengguna')->nullable()->constrained('pengguna')->onDelete('restrict');
            $table->dateTime('tanggal_pesanan');
            $table->date('tanggal_pengiriman');
            $table->time('waktu_pengiriman');
            $table->enum('jenis_pengiriman', ['delivery', 'pickup'])->default('delivery');
            $table->string('nama_penerima', 100);
            $table->string('nomor_telepon_penerima', 20);
            $table->string('email_penerima', 150)->nullable();
            $table->text('alamat_pengiriman')->nullable();
            $table->decimal('latitude_pengiriman', 10, 8)->nullable();
            $table->decimal('longitude_pengiriman', 11, 8)->nullable();
            $table->decimal('jarak_pengiriman_km', 5, 2)->nullable();
            $table->text('catatan')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('biaya_pengiriman', 12, 2)->default(0.00);
            $table->decimal('total_pembayaran', 12, 2);
            $table->enum('status_pembayaran', [
                'Menunggu Pembayaran',
                'Menunggu Verifikasi',
                'Lunas',
                'Ditolak',
            ])->default('Menunggu Pembayaran');
            $table->unsignedTinyInteger('status_pesanan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesanan');
    }
};
