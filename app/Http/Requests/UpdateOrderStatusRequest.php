<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('status_pesanan') && ! $this->has('order_status')) {
            $this->merge(['order_status' => $this->input('status_pesanan')]);
        }
        if ($this->has('order_status') && ! $this->has('status_pesanan')) {
            $this->merge(['status_pesanan' => $this->input('order_status')]);
        }
    }

    public function rules(): array
    {
        $statusField = $this->has('status_pesanan') ? 'status_pesanan' : 'order_status';

        return [
            $statusField => ['required', 'integer', 'in:0,1,2,3,4'],
        ];
    }
}
