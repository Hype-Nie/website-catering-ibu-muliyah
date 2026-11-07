<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'nama_kategori' => 'Porsi Satuan',
                'slug' => 'satuan',
                'deskripsi' => 'Porsi satuan untuk makan sendiri atau santapan keluarga kecil.',
                'status_aktif' => true,
            ],
            [
                'nama_kategori' => 'Nasi Box',
                'slug' => 'box',
                'deskripsi' => 'Paket nasi box praktis untuk rapat, seminar, dan acara kantor.',
                'status_aktif' => true,
            ],
            [
                'nama_kategori' => 'Paket Prasmanan',
                'slug' => 'prasmanan',
                'deskripsi' => 'Prasmanan lengkap dengan lauk hangat untuk hajatan, reuni, dan syukuran.',
                'status_aktif' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
