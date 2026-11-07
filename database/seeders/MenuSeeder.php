<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $satuan = Category::where('slug', 'satuan')->first();
        $box = Category::where('slug', 'box')->first();
        $prasmanan = Category::where('slug', 'prasmanan')->first();

        $menus = [
            [
                'id_kategori' => $satuan->id,
                'nama_menu' => 'Nasi Uduk Ayam Goreng',
                'slug' => 'nasi-uduk-ayam-goreng',
                'deskripsi' => 'Nasi uduk gurih santan Betawi, ayam goreng lengkuas, bihun goreng, tempe orek manis, sambal terasi, dan kerupuk.',
                'harga' => 25000,
                'jenis_paket' => 'satuan',
                'minimal_pesanan' => 1,
                'foto_menu' => 'hero.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $satuan->id,
                'nama_menu' => 'Nasi Uduk Telur Balado',
                'slug' => 'nasi-uduk-telur-balado',
                'deskripsi' => 'Nasi uduk harum, telur rebus bumbu balado pedas manis, bihun goreng gurih, tempe orek, dan kerupuk.',
                'harga' => 18000,
                'jenis_paket' => 'satuan',
                'minimal_pesanan' => 1,
                'foto_menu' => 'box.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $satuan->id,
                'nama_menu' => 'Nasi Uduk Ayam Bakar',
                'slug' => 'nasi-uduk-ayam-bakar',
                'deskripsi' => 'Nasi uduk hangat, ayam bakar bumbu kecap rempah, tahu goreng, lalapan segar ketimun kemangi, dan sambal terasi.',
                'harga' => 28000,
                'jenis_paket' => 'satuan',
                'minimal_pesanan' => 1,
                'foto_menu' => 'satuan.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $box->id,
                'nama_menu' => 'Nasi Box Berkah',
                'slug' => 'nasi-box-berkah',
                'deskripsi' => 'Kotak kemasan higienis: nasi uduk, ayam goreng rempah, telur balado separuh, bihun, orek tempe, sambal, kerupuk, dan air mineral.',
                'harga' => 32000,
                'jenis_paket' => 'box',
                'minimal_pesanan' => 10,
                'foto_menu' => 'box.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $box->id,
                'nama_menu' => 'Nasi Box Syukuran Spesial',
                'slug' => 'nasi-box-syukuran-spesial',
                'deskripsi' => 'Kemasan premium sekat lima: nasi uduk pulen, ayam bakar madu, semur tahu kentang, telur balado, sambal goreng kentang ati, sambal, dan buah pisang.',
                'harga' => 38000,
                'jenis_paket' => 'box',
                'minimal_pesanan' => 10,
                'foto_menu' => 'prasmanan.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $prasmanan->id,
                'nama_menu' => 'Paket Prasmanan Betawi Inti',
                'slug' => 'paket-prasmanan-betawi-inti',
                'deskripsi' => 'Penyajian prasmanan hangat: nasi uduk pandan, ayam goreng kalasan, bihun goreng bakso, tempe orek basah, telur dadar iris, sambal kacang Betawi, emping, dan acar.',
                'harga' => 45000,
                'jenis_paket' => 'prasmanan',
                'minimal_pesanan' => 20,
                'foto_menu' => 'prasmanan.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $prasmanan->id,
                'nama_menu' => 'Paket Prasmanan Hajatan Lengkap',
                'slug' => 'paket-prasmanan-hajatan-lengkap',
                'deskripsi' => 'Penyajian prasmanan mewah: nasi uduk & nasi putih, empal daging serundeng, ayam bakar bumbu rujak, sambal goreng ati ampla, bihun, telur balado, kerupuk udang, dan es cincau kelapa.',
                'harga' => 55000,
                'jenis_paket' => 'prasmanan',
                'minimal_pesanan' => 30,
                'foto_menu' => 'hero.jpg',
                'status_tersedia' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(['slug' => $menu['slug']], $menu);
        }
    }
}
