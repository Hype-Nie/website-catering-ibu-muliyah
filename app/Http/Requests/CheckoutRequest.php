<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Services\HaversineDistanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $minDate = Carbon::now('Asia/Jakarta')->addDay()->toDateString();

        return [
            'recipient_name' => ['required', 'string', 'max:100'],
            'recipient_phone' => ['required', 'string', 'max:20'],
            'recipient_email' => ['nullable', 'email', 'max:150'],
            'delivery_date' => ['required', 'date', 'after_or_equal:'.$minDate],
            'delivery_time' => ['required', 'date_format:H:i'],
            'delivery_type' => ['required', 'in:delivery,pickup'],
            'delivery_address' => ['required_if:delivery_type,delivery', 'nullable', 'string', 'max:500'],
            'delivery_latitude' => ['required_if:delivery_type,delivery', 'nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude' => ['required_if:delivery_type,delivery', 'nullable', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'delivery_date.after_or_equal' => 'Pemesanan catering mewajibkan penjadwalan minimal H-1 (mulai besok). Same-day pre-order tidak dapat diproses.',
            'delivery_time.date_format' => 'Format jam pengiriman harus berupa format JJ:MM (contoh: 11:30).',
            'delivery_address.required_if' => 'Alamat pengiriman wajib diisi untuk opsi Diantar ke Alamat.',
            'delivery_latitude.required_if' => 'Koordinat garis lintang (latitude) wajib disertakan untuk opsi Diantar ke Alamat.',
            'delivery_longitude.required_if' => 'Koordinat garis bujur (longitude) wajib disertakan untuk opsi Diantar ke Alamat.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $deliveryType = $this->input('delivery_type');

            if ($deliveryType === 'delivery') {
                $lat = $this->input('delivery_latitude');
                $lon = $this->input('delivery_longitude');

                if ($lat === null || $lon === null) {
                    $validator->errors()->add(
                        'delivery_address',
                        'Koordinat pengiriman wajib disertakan untuk opsi Diantar ke Alamat.'
                    );

                    return;
                }

                $haversine = app(HaversineDistanceService::class);
                $distance = $haversine->calculateDistance((float) $lat, (float) $lon);

                if ($distance > HaversineDistanceService::MAX_RADIUS_KM) {
                    $validator->errors()->add(
                        'delivery_type',
                        "Lokasi berada di luar radius pengiriman maksimal 20 km ({$distance} km). Silakan pilih opsi Ambil di Dapur (Pick-up)."
                    );
                }
            }
        });
    }
}
