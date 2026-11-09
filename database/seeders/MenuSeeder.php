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
                'id_kategori' => $satuan->id,
                'nama_menu' => 'Nasi Uduk Semur Daging Betawi',
                'slug' => 'nasi-uduk-semur-daging-betawi',
                'deskripsi' => 'Nasi uduk gurih dengan semur daging sapi kuah pekat rempah Betawi, tahu semur, bihun goreng, sambal, dan emping renyah.',
                'harga' => 32000,
                'jenis_paket' => 'satuan',
                'minimal_pesanan' => 1,
                'foto_menu' => 'hero.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $satuan->id,
                'nama_menu' => 'Nasi Uduk Empal Serundeng',
                'slug' => 'nasi-uduk-empal-serundeng',
                'deskripsi' => 'Nasi uduk wangi daun pandan, empal daging sapi serundeng kelapa manis gurih, orek tempe, bihun, dan sambal terasi.',
                'harga' => 34000,
                'jenis_paket' => 'satuan',
                'minimal_pesanan' => 1,
                'foto_menu' => 'prasmanan.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $satuan->id,
                'nama_menu' => 'Nasi Uduk Sambal Goreng Ati',
                'slug' => 'nasi-uduk-sambal-goreng-ati',
                'deskripsi' => 'Nasi uduk pulen, sambal goreng ati ampela bumbu balado gurih, perkedel kentang lembut, bihun goreng, dan sambal kacang.',
                'harga' => 22000,
                'jenis_paket' => 'satuan',
                'minimal_pesanan' => 1,
                'foto_menu' => 'box.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $box->id,
                'nama_menu' => 'Nasi Box Berkah',
                'slug' => 'nasi-box-berkah',
                'deskripsi' => 'Kotak kemasan higienis: nasi uduk pulen, ayam goreng rempah, telur balado separuh, bihun, orek tempe, sambal, kerupuk, dan air mineral.',
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
                'deskripsi' => 'Kemasan premium sekat lima: nasi uduk pulen, ayam bakar madu, semur tahu kentang, telur balado, sambal goreng kentang ati, sambal, buah pisang, dan air mineral.',
                'harga' => 38000,
                'jenis_paket' => 'box',
                'minimal_pesanan' => 10,
                'foto_menu' => 'prasmanan.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $box->id,
                'nama_menu' => 'Nasi Box Rapat Kantor Empal',
                'slug' => 'nasi-box-rapat-kantor-empal',
                'deskripsi' => 'Box bento sekat eksklusif: nasi uduk pandan, empal daging serundeng, perkedel kentang, bihun goreng wortel, tempe orek basah, sambal, kerupuk udang, dan buah jeruk.',
                'harga' => 42000,
                'jenis_paket' => 'box',
                'minimal_pesanan' => 10,
                'foto_menu' => 'hero.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $box->id,
                'nama_menu' => 'Nasi Box Hemat Telur Balado',
                'slug' => 'nasi-box-hemat-telur-balado',
                'deskripsi' => 'Pilihan ekonomis untuk pengajian atau santunan: nasi uduk pulen, telur balado utuh, tempe orek renyah, bihun goreng, sambal, dan kerupuk.',
                'harga' => 24000,
                'jenis_paket' => 'box',
                'minimal_pesanan' => 10,
                'foto_menu' => 'box.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $box->id,
                'nama_menu' => 'Nasi Box Ayam Lengkuas Komplit',
                'slug' => 'nasi-box-ayam-lengkuas-komplit',
                'deskripsi' => 'Nasi box istimewa: ayam ungkep goreng bumbu lengkuas, tahu tempe bacem, bihun jagung manis, sambal terasi matang, kerupuk, dan air mineral.',
                'harga' => 35000,
                'jenis_paket' => 'box',
                'minimal_pesanan' => 10,
                'foto_menu' => 'satuan.jpg',
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
            [
                'id_kategori' => $prasmanan->id,
                'nama_menu' => 'Paket Prasmanan Syukuran Akbar',
                'slug' => 'paket-prasmanan-syukuran-akbar',
                'deskripsi' => 'Hidangan prasmanan istimewa: nasi uduk daun pandan & nasi putih pulen, semur daging Betawi empuk, ayam bakar madu, kakap fillet asam manis, capcay bakso, asinan Betawi, dan es buah segar.',
                'harga' => 65000,
                'jenis_paket' => 'prasmanan',
                'minimal_pesanan' => 30,
                'foto_menu' => 'prasmanan.jpg',
                'status_tersedia' => true,
            ],
            [
                'id_kategori' => $prasmanan->id,
                'nama_menu' => 'Paket Prasmanan Mini Arisan',
                'slug' => 'paket-prasmanan-mini-arisan',
                'deskripsi' => 'Konsep prasmanan praktis untuk arisan keluarga dan reuni kecil: nasi uduk gurih, ayam goreng kremes renyah, telur balado, perkedel kentang, tumis buncis jagung, sambal, dan kerupuk udang.',
                'harga' => 40000,
                'jenis_paket' => 'prasmanan',
                'minimal_pesanan' => 20,
                'foto_menu' => 'satuan.jpg',
                'status_tersedia' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(['slug' => $menu['slug']], $menu);
        }
    }
}
