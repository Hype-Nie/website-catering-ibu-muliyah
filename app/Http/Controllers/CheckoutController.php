<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\HaversineDistanceService;
use App\Services\OrderNumberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly HaversineDistanceService $haversineService,
        private readonly OrderNumberService $orderNumberService
    ) {}

    private function getCartItems()
    {
        $query = Auth::check()
            ? CartItem::where('id_pengguna', Auth::id())
            : CartItem::where('id_sesi', session()->getId());

        return $query->with('menu')->get();
    }

    public function index(Request $request): View|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect()->guest(route('login'))->with('error', 'Silakan masuk atau daftar terlebih dahulu untuk melanjutkan checkout.');
        }

        $cartItems = $this->getCartItems();
        if ($cartItems->isEmpty()) {
            return redirect()->route('catalog')->with('error', 'Keranjang belanja masih kosong. Silakan pilih menu terlebih dahulu.');
        }

        $subtotal = $cartItems->sum(fn ($item) => $item->subtotal);
        $defaultLocation = null;
        if (Auth::check()) {
            $user = Auth::user();
            /** @var Order|null $latestOrder */
            $latestOrder = Order::where('id_pengguna', $user->id)
                ->whereNotNull('latitude_pengiriman')
                ->whereNotNull('longitude_pengiriman')
                ->latest('id')
                ->first();

            if ($latestOrder) {
                $defaultLocation = [
                    'address' => $latestOrder->alamat_pengiriman,
                    'latitude' => (float) $latestOrder->latitude_pengiriman,
                    'longitude' => (float) $latestOrder->longitude_pengiriman,
                    'distance_km' => (float) $latestOrder->jarak_pengiriman_km,
                    'source' => 'latest_order',
                ];
            } elseif (! empty($user->alamat)) {
                $defaultLocation = [
                    'address' => $user->alamat,
                    'latitude' => null,
                    'longitude' => null,
                    'distance_km' => null,
                    'source' => 'profile_address',
                ];
            }
        }

        return view('pages.checkout', [
            'page' => 'checkout',
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'defaultLocation' => $defaultLocation,
            'kitchen' => [
                'name' => config('catering.kitchen.name', 'Dapur Pusat Menteng'),
                'address' => config('catering.kitchen.address', 'Jl. Menteng No. 10, Jakarta Pusat'),
                'latitude' => (float) config('catering.kitchen.latitude', HaversineDistanceService::KITCHEN_LAT),
                'longitude' => (float) config('catering.kitchen.longitude', HaversineDistanceService::KITCHEN_LON),
            ],
        ]);
    }

    public function process(CheckoutRequest $request): RedirectResponse|JsonResponse
    {
        if (! Auth::check()) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Silakan masuk atau daftar terlebih dahulu untuk melanjutkan checkout.'], 401);
            }

            return redirect()->guest(route('login'))->with('error', 'Silakan masuk atau daftar terlebih dahulu untuk melanjutkan checkout.');
        }

        $cartItems = $this->getCartItems();
        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'Keranjang belanja Anda masih kosong.',
            ]);
        }

        foreach ($cartItems as $item) {
            if (! $item->menu || ! $item->menu->status_tersedia) {
                $name = $item->menu?->nama_menu ?? 'Menu';
                throw ValidationException::withMessages([
                    'cart' => "Menu '{$name}' saat ini tidak tersedia. Silakan perbarui keranjang belanja Anda.",
                ]);
            }

            if (! $item->menu->checkMinOrder($item->kuantitas)) {
                throw ValidationException::withMessages([
                    'cart' => "Pesanan untuk menu '{$item->menu->nama_menu}' minimal berjumlah {$item->menu->minimal_pesanan} porsi.",
                ]);
            }
        }

        $deliveryType = $request->input('delivery_type');
        $lat = $request->input('delivery_latitude');
        $lon = $request->input('delivery_longitude');

        if ($deliveryType === 'delivery') {
            if ($lat === null || $lon === null) {
                throw ValidationException::withMessages([
                    'delivery_address' => 'Koordinat pengiriman wajib disertakan untuk opsi Diantar ke Alamat.',
                ]);
            }

            $distanceKm = $this->haversineService->calculateDistance((float) $lat, (float) $lon);
            $this->haversineService->validateRadius($distanceKm, 'delivery');
            $deliveryFee = $this->haversineService->calculateDeliveryFee($distanceKm, 'delivery');
        } else {
            $distanceKm = 0.0;
            $deliveryFee = 0.0;
        }

        $subtotal = (float) $cartItems->sum(fn ($item) => $item->subtotal);
        $totalAmount = $subtotal + $deliveryFee;

        $order = DB::transaction(function () use ($request, $cartItems, $subtotal, $deliveryFee, $totalAmount, $deliveryType, $distanceKm) {
            $orderNumber = $this->orderNumberService->generate();

            $order = Order::create([
                'nomor_pesanan' => $orderNumber,
                'id_pengguna' => Auth::id(),
                'tanggal_pesanan' => now(),
                'tanggal_pengiriman' => $request->input('delivery_date'),
                'waktu_pengiriman' => $request->input('delivery_time'),
                'jenis_pengiriman' => $deliveryType,
                'nama_penerima' => $request->input('recipient_name'),
                'nomor_telepon_penerima' => $request->input('recipient_phone'),
                'email_penerima' => $request->input('recipient_email') ?? Auth::user()?->email,
                'alamat_pengiriman' => $deliveryType === 'delivery' ? $request->input('delivery_address') : null,
                'latitude_pengiriman' => $request->input('delivery_latitude'),
                'longitude_pengiriman' => $request->input('delivery_longitude'),
                'jarak_pengiriman_km' => $distanceKm,
                'catatan' => $request->input('notes'),
                'subtotal' => $subtotal,
                'biaya_pengiriman' => $deliveryFee,
                'total_pembayaran' => $totalAmount,
                'status_pembayaran' => Order::PAYMENT_PENDING,
                'status_pesanan' => Order::STATUS_PENDING_PAYMENT,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'id_pesanan' => $order->id,
                    'id_menu' => $item->id_menu,
                    'nama_menu' => $item->menu->nama_menu,
                    'harga' => $item->menu->harga,
                    'kuantitas' => $item->kuantitas,
                    'subtotal' => $item->subtotal,
                    'catatan' => $item->catatan,
                ]);
            }

            CartItem::where('id_pengguna', Auth::id())->delete();
            CartItem::where('id_sesi', session()->getId())->delete();

            return $order;
        });
        if (Auth::check()) {
            $authUser = Auth::user();
            $updates = [];
            if (empty($authUser->nomor_telepon) && $request->filled('recipient_phone')) {
                $updates['nomor_telepon'] = (string) $request->input('recipient_phone');
            }
            if (empty($authUser->alamat) && $request->filled('delivery_address')) {
                $updates['alamat'] = (string) $request->input('delivery_address');
            }
            if (! empty($updates)) {
                $authUser->update($updates);
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'order' => $order,
                'redirect' => route('payment.show', ['id' => $order->nomor_pesanan]),
            ]);
        }

        return redirect()->route('payment.show', ['id' => $order->nomor_pesanan])
            ->with('success', 'Pesanan '.$order->nomor_pesanan.' berhasil dibuat. Silakan transfer dan unggah bukti pembayaran.');
    }
}
