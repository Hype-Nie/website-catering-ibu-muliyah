<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('id_kategori') && ! $this->has('category_id')) {
            $this->merge(['category_id' => $this->input('id_kategori')]);
        }
        if ($this->has('nama_menu') && ! $this->has('name')) {
            $this->merge(['name' => $this->input('nama_menu')]);
        }
        if ($this->has('deskripsi') && ! $this->has('description')) {
            $this->merge(['description' => $this->input('deskripsi')]);
        }
        if ($this->has('harga') && ! $this->has('price')) {
            $this->merge(['price' => $this->input('harga')]);
        }
        if ($this->has('jenis_paket') && ! $this->has('package_type')) {
            $this->merge(['package_type' => $this->input('jenis_paket')]);
        }
        if ($this->has('minimal_pesanan') && ! $this->has('min_order')) {
            $this->merge(['min_order' => $this->input('minimal_pesanan')]);
        }
        if ($this->has('status_tersedia') && ! $this->has('is_available')) {
            $this->merge(['is_available' => $this->input('status_tersedia')]);
        }
    }

    public function rules(): array
    {
        $catField = $this->has('id_kategori') ? 'id_kategori' : 'category_id';
        $nameField = $this->has('nama_menu') ? 'nama_menu' : 'name';
        $descField = $this->has('deskripsi') ? 'deskripsi' : 'description';
        $priceField = $this->has('harga') ? 'harga' : 'price';
        $packageField = $this->has('jenis_paket') ? 'jenis_paket' : 'package_type';
        $minField = $this->has('minimal_pesanan') ? 'minimal_pesanan' : 'min_order';
        $availField = $this->has('status_tersedia') ? 'status_tersedia' : 'is_available';
        $rules = [
            $catField => ['required', 'exists:kategori,id'],
            $nameField => ['required', 'string', 'max:150'],
            $descField => ['required', 'string', 'max:1000'],
            $priceField => ['required', 'numeric', 'min:1000'],
            $packageField => ['required', 'in:satuan,box,prasmanan'],
            $minField => ['required', 'integer', 'min:1'],
            'foto_menu' => ['nullable'],
            'image' => ['nullable'],
            'preset_image' => ['nullable', 'string', 'max:100'],
            $availField => ['nullable', 'boolean'],
        ];

        if ($this->hasFile('foto_menu')) {
            $rules['foto_menu'] = ['file', 'mimes:jpeg,jpg,png,webp', 'max:2048'];
        }
        if ($this->hasFile('image')) {
            $rules['image'] = ['file', 'mimes:jpeg,jpg,png,webp', 'max:2048'];
        }

        return $rules;
    }
}
