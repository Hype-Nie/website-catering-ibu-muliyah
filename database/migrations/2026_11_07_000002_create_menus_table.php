<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_kategori')->constrained('kategori')->onDelete('restrict');
            $table->string('nama_menu', 150);
            $table->string('slug', 150)->unique();
            $table->text('deskripsi');
            $table->decimal('harga', 12, 2);
            $table->enum('jenis_paket', ['satuan', 'box', 'prasmanan'])->default('satuan');
            $table->unsignedInteger('minimal_pesanan')->default(1);
            $table->string('foto_menu', 255)->default('satuan.jpg');
            $table->boolean('status_tersedia')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu');
    }
};
