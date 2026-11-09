<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_with_valid_data(): void
    {
        $response = $this->post('/register', [
            'name' => 'Ahmad Fauzi',
            'email' => 'ahmad@contoh.test',
            'phone_number' => '081234567899',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/menu');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('pengguna', [
            'email' => 'ahmad@contoh.test',
            'peran' => 'customer',
        ]);
    }

    public function test_registration_fails_on_duplicate_email_or_phone(): void
    {
        User::create([
            'nama' => 'Existing User',
            'email' => 'existing@contoh.test',
            'nomor_telepon' => '081122334455',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $response = $this->post('/register', [
            'name' => 'Duplicate User',
            'email' => 'existing@contoh.test',
            'phone_number' => '081122334455',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email', 'phone_number']);
        $this->assertGuest();
    }

    public function test_customer_login_redirects_to_catalog(): void
    {
        $user = User::create([
            'nama' => 'Pelanggan Nasi Uduk',
            'email' => 'pelanggan@contoh.test',
            'nomor_telepon' => '081999888777',
            'kata_sandi' => Hash::make('secret123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'pelanggan@contoh.test',
            'password' => 'secret123',
        ]);

        $response->assertRedirect('/menu');
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_invalid_credentials_and_retains_email(): void
    {
        User::create([
            'nama' => 'Pelanggan Tes',
            'email' => 'pelanggan@contoh.test',
            'nomor_telepon' => '081234567890',
            'kata_sandi' => Hash::make('secret123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => 'pelanggan@contoh.test',
            'password' => 'wrongpassword',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('email');
        $this->assertEquals('pelanggan@contoh.test', session()->getOldInput('email'));
        $this->assertGuest();

        $loginPage = $this->get('/login');
        $loginPage->assertSee('pelanggan@contoh.test');
        $loginPage->assertSee('Email atau kata sandi tidak sesuai.');
    }

    public function test_admin_login_redirects_to_admin_dashboard(): void
    {
        $admin = User::create([
            'nama' => 'Admin Dapur',
            'email' => 'admin@dapur.test',
            'nomor_telepon' => '081000111222',
            'kata_sandi' => Hash::make('admin12345'),
            'peran' => 'admin',
            'status_aktif' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'admin@dapur.test',
            'password' => 'admin12345',
        ]);

        $response->assertRedirect('/admin');
        $this->assertAuthenticatedAs($admin);
    }

    public function test_customer_cannot_access_admin_dashboard(): void
    {
        $customer = User::create([
            'nama' => 'Customer Biasa',
            'email' => 'cust@contoh.test',
            'nomor_telepon' => '081555444333',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $response = $this->actingAs($customer)->get('/admin');
        $response->assertStatus(403);
    }

    public function test_user_can_logout(): void
    {
        $user = User::create([
            'nama' => 'Logged User',
            'email' => 'logged@contoh.test',
            'nomor_telepon' => '081777888999',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        $response = $this->actingAs($user)->post('/logout');
        $response->assertRedirect('/');
        $this->assertGuest();
    }
}
