<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Default Admin Dapur Menteng
        User::updateOrCreate(
            ['email' => 'admin@dapurmenteng.test'],
            [
                'nama' => 'Pengelola Dapur Menteng',
                'nomor_telepon' => '081200001111',
                'kata_sandi' => Hash::make('password123'),
                'peran' => 'admin',
                'alamat' => 'Jl. Menteng No. 10, Jakarta Pusat',
                'status_aktif' => true,
            ]
        );

        // Demo Customers
        $customers = [
            [
                'nama' => 'Siti Rahma',
                'email' => 'siti@contoh.test',
                'nomor_telepon' => '081234567890',
                'kata_sandi' => Hash::make('password123'),
                'peran' => 'customer',
                'alamat' => 'Jl. Cikini Raya No. 12, Menteng, Jakarta Pusat',
                'status_aktif' => true,
            ],
            [
                'nama' => 'Budi Santoso',
                'email' => 'budi@contoh.test',
                'nomor_telepon' => '081298765432',
                'kata_sandi' => Hash::make('password123'),
                'peran' => 'customer',
                'alamat' => 'Jl. Kebon Sirih No. 45, Jakarta Pusat',
                'status_aktif' => true,
            ],
            [
                'nama' => 'Dewi Lestari',
                'email' => 'dewi@contoh.test',
                'nomor_telepon' => '081355667788',
                'kata_sandi' => Hash::make('password123'),
                'peran' => 'customer',
                'alamat' => 'Jl. Salemba Raya No. 20, Jakarta Pusat',
                'status_aktif' => true,
            ],
        ];

        foreach ($customers as $c) {
            User::updateOrCreate(['email' => $c['email']], $c);
        }
    }
}
