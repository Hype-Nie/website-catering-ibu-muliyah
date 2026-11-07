<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('catatan_penolakan') && ! $this->has('reason')) {
            $this->merge(['reason' => $this->input('catatan_penolakan')]);
        }
    }

    public function rules(): array
    {
        $reasonField = $this->has('catatan_penolakan') ? 'catatan_penolakan' : 'reason';

        return [
            $reasonField => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Wajib memberikan alasan penolakan bukti pembayaran agar pelanggan dapat memperbaikinya.',
            'catatan_penolakan.required' => 'Wajib memberikan alasan penolakan bukti pembayaran agar pelanggan dapat memperbaikinya.',
            'reason.min' => 'Alasan penolakan minimal 5 karakter.',
            'catatan_penolakan.min' => 'Alasan penolakan minimal 5 karakter.',
        ];
    }
}
