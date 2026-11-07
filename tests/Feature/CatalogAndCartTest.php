<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CatalogAndCartTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    private Menu $menuSatuan;

    private Menu $menuBox;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::create([
            'nama_kategori' => 'Nasi Box',
            'slug' => 'box',
            'deskripsi' => 'Paket Nasi Box',
            'status_aktif' => true,
        ]);

        $this->menuSatuan = Menu::create([
            'id_kategori' => $this->category->id,
            'nama_menu' => 'Nasi Uduk Spesial',
            'slug' => 'nasi-uduk-spesial',
            'deskripsi' => 'Nasi uduk lezat',
            'harga' => 25000,
            'jenis_paket' => 'satuan',
            'minimal_pesanan' => 1,
            'foto_menu' => 'hero.jpg',
            'status_tersedia' => true,
        ]);

        $this->menuBox = Menu::create([
            'id_kategori' => $this->category->id,
            'nama_menu' => 'Nasi Box Acara',
            'slug' => 'nasi-box-acara',
            'deskripsi' => 'Nasi box untuk acara',
            'harga' => 35000,
            'jenis_paket' => 'box',
            'minimal_pesanan' => 10,
            'foto_menu' => 'box.jpg',
            'status_tersedia' => true,
        ]);
    }

    public function test_public_can_view_catalog_with_category_filter(): void
    {
        $response = $this->get('/menu?kategori=box');
        $response->assertStatus(200);
        $response->assertViewHas('menus');
        $response->assertViewHas('categories');
    }

    public function test_user_can_add_item_to_cart_respecting_min_order(): void
    {
        $user = User::create([
            'nama' => 'Tester Cart',
            'email' => 'cart@contoh.test',
            'nomor_telepon' => '081233221100',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $response = $this->actingAs($user)->post('/keranjang', [
            'menu_id' => $this->menuSatuan->id,
            'quantity' => 2,
            'notes' => 'Sambal banyakin',
        ]);

        $response->assertRedirect('/keranjang');
        $this->assertDatabaseHas('item_keranjang', [
            'id_pengguna' => $user->id,
            'id_menu' => $this->menuSatuan->id,
            'kuantitas' => 2,
            'catatan' => 'Sambal banyakin',
        ]);
    }

    public function test_adding_item_below_min_order_fails_validation(): void
    {
        $user = User::create([
            'nama' => 'Tester Cart 2',
            'email' => 'cart2@contoh.test',
            'nomor_telepon' => '081233221101',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        // menuBox minimal_pesanan is 10, attempt with 5
        $response = $this->actingAs($user)->post('/keranjang', [
            'menu_id' => $this->menuBox->id,
            'quantity' => 5,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseMissing('item_keranjang', [
            'id_pengguna' => $user->id,
            'id_menu' => $this->menuBox->id,
        ]);
    }

    public function test_user_can_update_cart_and_remove_item(): void
    {
        $user = User::create([
            'nama' => 'Tester Cart 3',
            'email' => 'cart3@contoh.test',
            'nomor_telepon' => '081233221102',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $item = CartItem::create([
            'id_pengguna' => $user->id,
            'id_menu' => $this->menuSatuan->id,
            'kuantitas' => 1,
            'catatan' => 'Tanpa timun',
        ]);

        // Update quantity
        $response = $this->actingAs($user)->put('/keranjang/'.$item->id, [
            'quantity' => 4,
            'notes' => 'Tambahkan kerupuk',
        ]);

        $response->assertRedirect('/keranjang');
        $this->assertDatabaseHas('item_keranjang', [
            'id' => $item->id,
            'kuantitas' => 4,
            'catatan' => 'Tambahkan kerupuk',
        ]);

        // Remove item
        $deleteResponse = $this->actingAs($user)->delete('/keranjang/'.$item->id);
        $deleteResponse->assertRedirect('/keranjang');
        $this->assertDatabaseMissing('item_keranjang', ['id' => $item->id]);
    }
}
