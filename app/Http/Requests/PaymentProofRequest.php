<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PaymentProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        $orderId = (int) ($this->input('id_pesanan') ?? $this->input('order_id'));
        $order = Order::find($orderId);
        if (! $order) {
            return false;
        }

        if ($order->status_pembayaran === Order::PAYMENT_PAID || $order->status_pesanan === Order::STATUS_CANCELLED) {
            return false;
        }

        if (auth()->check()) {
            /** @var User $user */
            $user = auth()->user();

            return $user->isAdmin() || $order->id_pengguna === $user->id || $order->email_penerima === $user->email;
        }

        return $order->id_pengguna === null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('id_pesanan') && ! $this->has('order_id')) {
            $this->merge(['order_id' => $this->input('id_pesanan')]);
        }
        if ($this->has('order_id') && ! $this->has('id_pesanan')) {
            $this->merge(['id_pesanan' => $this->input('order_id')]);
        }
    }

    public function rules(): array
    {
        $orderField = $this->has('id_pesanan') ? 'id_pesanan' : 'order_id';
        $bankField = $this->has('nama_bank') ? 'nama_bank' : 'bank_name';
        $holderField = $this->has('nama_pemilik_rekening') ? 'nama_pemilik_rekening' : 'account_holder';
        $amountField = $this->has('nominal_transfer') ? 'nominal_transfer' : 'transfer_amount';
        $dateField = $this->has('tanggal_transfer') ? 'tanggal_transfer' : 'transfer_date';
        $proofField = $this->hasFile('bukti_transfer') ? 'bukti_transfer' : 'proof';

        return [
            $orderField => ['required', 'exists:pesanan,id'],
            $bankField => ['required', 'string', 'max:50'],
            $holderField => ['required', 'string', 'max:100'],
            $amountField => ['required', 'numeric', 'min:1'],
            $dateField => ['required', 'date', 'before_or_equal:today'],
            $proofField => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'proof.required' => 'Wajib melampirkan berkas bukti transfer.',
            'bukti_transfer.required' => 'Wajib melampirkan berkas bukti transfer.',
            'proof.mimes' => 'Format berkas bukti transfer harus berupa JPG, PNG, atau PDF.',
            'bukti_transfer.mimes' => 'Format berkas bukti transfer harus berupa JPG, PNG, atau PDF.',
            'proof.max' => 'Ukuran berkas maksimal adalah 2 MB (2048 KB).',
            'bukti_transfer.max' => 'Ukuran berkas maksimal adalah 2 MB (2048 KB).',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $orderId = (int) ($this->input('id_pesanan') ?? $this->input('order_id'));
            $amount = (float) ($this->input('nominal_transfer') ?? $this->input('transfer_amount'));

            $order = Order::find($orderId);
            if ($order && abs((float) $order->total_pembayaran - $amount) > 0.01) {
                $errField = $this->has('nominal_transfer') ? 'nominal_transfer' : 'transfer_amount';
                $validator->errors()->add(
                    $errField,
                    'Nominal transfer (Rp'.number_format($amount, 0, ',', '.').') harus sesuai dengan total tagihan pesanan (Rp'.number_format((float) $order->total_pembayaran, 0, ',', '.').').'
                );
            }
        });
    }
}
