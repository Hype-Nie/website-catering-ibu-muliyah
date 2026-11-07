<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Validation\ValidationException;

class HaversineDistanceService
{
    public const KITCHEN_LAT = -6.1944;

    public const KITCHEN_LON = 106.8372;

    public const MAX_RADIUS_KM = 20.0;

    public const EARTH_RADIUS_KM = 6371.0;

    public function calculateDistance(
        float $targetLat,
        float $targetLon,
        float $originLat = self::KITCHEN_LAT,
        float $originLon = self::KITCHEN_LON
    ): float {
        $latFrom = deg2rad($originLat);
        $lonFrom = deg2rad($originLon);
        $latTo = deg2rad($targetLat);
        $lonTo = deg2rad($targetLon);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return round($angle * self::EARTH_RADIUS_KM, 2);
    }

    public function calculateDeliveryFee(float $distanceKm, string $deliveryType = 'delivery'): float
    {
        if ($deliveryType === 'pickup') {
            return 0.0;
        }

        if ($distanceKm <= 5.0) {
            return 15000.0;
        }

        return 15000.0 + (ceil($distanceKm - 5.0) * 2000.0);
    }

    public function validateRadius(float $distanceKm, string $deliveryType = 'delivery'): void
    {
        if ($deliveryType === 'delivery' && $distanceKm > self::MAX_RADIUS_KM) {
            throw ValidationException::withMessages([
                'delivery_type' => 'Lokasi berada di luar radius pengiriman maksimal 20 km ('.$distanceKm.' km). Silakan pilih opsi Ambil di Dapur (Pick-up).',
            ]);
        }
    }
}
