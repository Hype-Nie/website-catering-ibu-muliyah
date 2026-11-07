<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pesanan')->constrained('pesanan')->onDelete('cascade');
            $table->foreignId('id_menu')->constrained('menu')->onDelete('restrict');
            $table->string('nama_menu', 150);
            $table->decimal('harga', 12, 2);
            $table->unsignedInteger('kuantitas');
            $table->decimal('subtotal', 12, 2);
            $table->string('catatan', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_pesanan');
    }
};
