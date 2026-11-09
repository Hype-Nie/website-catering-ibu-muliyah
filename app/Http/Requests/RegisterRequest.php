<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('password') && ! $this->has('password_confirmation')) {
            $this->merge(['password_confirmation' => $this->input('password')]);
        }
        if ($this->has('kata_sandi') && ! $this->has('kata_sandi_confirmation')) {
            $this->merge(['kata_sandi_confirmation' => $this->input('kata_sandi')]);
        }
    }

    public function rules(): array
    {
        $phoneField = $this->has('phone') ? 'phone' : ($this->has('phone_number') ? 'phone_number' : 'nomor_telepon');
        $nameField = $this->has('name') ? 'name' : 'nama';
        $passField = $this->has('password') ? 'password' : 'kata_sandi';
        $addressField = $this->has('address') ? 'address' : 'alamat';

        return [
            $nameField => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:150', 'unique:pengguna,email'],
            $phoneField => ['required', 'string', 'max:20', 'unique:pengguna,nomor_telepon'],
            $passField => ['required', 'string', 'min:8', 'confirmed'],
            $addressField => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.',
            'phone_number.unique' => 'Nomor WhatsApp / telepon ini sudah terdaftar.',
            'nomor_telepon.unique' => 'Nomor WhatsApp / telepon ini sudah terdaftar.',
            'phone.unique' => 'Nomor WhatsApp / telepon ini sudah terdaftar.',
            'password.min' => 'Password minimal berjumlah 8 karakter.',
            'kata_sandi.min' => 'Password minimal berjumlah 8 karakter.',
            'password.confirmed' => 'Konfirmasi password belum sama.',
            'kata_sandi.confirmed' => 'Konfirmasi password belum sama.',
        ];
    }
}
