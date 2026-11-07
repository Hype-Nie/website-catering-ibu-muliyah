<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('id_menu') && ! $this->has('menu_id')) {
            $this->merge(['menu_id' => $this->input('id_menu')]);
        }
        if ($this->has('kuantitas') && ! $this->has('quantity')) {
            $this->merge(['quantity' => $this->input('kuantitas')]);
        }
        if ($this->has('catatan') && ! $this->has('notes')) {
            $this->merge(['notes' => $this->input('catatan')]);
        }
    }

    public function rules(): array
    {
        return [
            'menu_id' => ['required', Rule::exists('menu', 'id')->where(fn ($query) => $query->where('status_tersedia', true))],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'menu_id.exists' => 'Menu yang dipilih sedang tidak tersedia atau tidak ditemukan.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $menuId = (int) $this->input('menu_id');
            $quantity = (int) $this->input('quantity');

            $menu = Menu::find($menuId);
            if ($menu && ! $menu->status_tersedia) {
                $validator->errors()->add('menu_id', 'Menu ini sedang tidak tersedia.');

                return;
            }

            if ($menu && ! $menu->checkMinOrder($quantity)) {
                $msg = "Pesanan untuk menu '{$menu->nama_menu}' minimal berjumlah {$menu->minimal_pesanan} porsi.";
                $validator->errors()->add('quantity', $msg);
                $validator->errors()->add('kuantitas', $msg);
            }
        });
    }
}
