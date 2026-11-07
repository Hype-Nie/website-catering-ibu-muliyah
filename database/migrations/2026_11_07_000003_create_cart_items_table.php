<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_keranjang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_pengguna')->nullable()->constrained('pengguna')->onDelete('cascade');
            $table->string('id_sesi', 100)->nullable()->index();
            $table->foreignId('id_menu')->constrained('menu')->onDelete('cascade');
            $table->unsignedInteger('kuantitas')->default(1);
            $table->string('catatan', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_keranjang');
    }
};
