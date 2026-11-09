<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class OrderTrackingController extends Controller
{
    public function history(Request $request): View|JsonResponse
    {
        $user = Auth::user();

        $query = Order::with(['items', 'payment'])->orderByDesc('created_at');

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('id_pengguna', $user->id)
                    ->orWhere('email_penerima', $user->email);
            });
        } else {
            $query->where('id_pengguna', -1);
        }

        $filter = $request->query('status');
        if ($filter === 'active') {
            $query->whereIn('status_pesanan', [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PROCESSING, Order::STATUS_SHIPPED]);
        } elseif ($filter === 'done') {
            $query->where('status_pesanan', Order::STATUS_COMPLETED);
        }

        $orders = $query->get();

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        return view('pages.history', [
            'page' => 'history',
            'orders' => $orders,
        ]);
    }

    public function tracking(Request $request): View|JsonResponse
    {
        $identifier = $request->query('id');

        $order = null;
        if ($identifier) {
            $query = Order::with(['items', 'payment'])
                ->where('nomor_pesanan', (string) $identifier);

            if (Auth::check()) {
                /** @var User $user */
                $user = Auth::user();
                if (! $user->isAdmin()) {
                    $query->where(function ($q) use ($user) {
                        $q->where('id_pengguna', $user->id)
                            ->orWhere('email_penerima', $user->email);
                    });
                }
            } else {
                $phone = $request->query('phone');
                if (! $phone) {
                    if ($request->wantsJson()) {
                        return response()->json(['message' => 'Verifikasi nomor telepon penerima diperlukan untuk melacak pesanan.'], 403);
                    }

                    return view('pages.tracking', [
                        'page' => 'tracking',
                        'order' => null,
                        'error' => 'Verifikasi nomor telepon penerima diperlukan untuk melacak pesanan.',
                    ]);
                }
                $query->where('nomor_telepon_penerima', trim((string) $phone));
            }

            $order = $query->first();
        }

        if ($request->wantsJson()) {
            if (! $order) {
                return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
            }

            return response()->json($order);
        }

        $orders = null;
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();
            $ordersQuery = Order::with(['items', 'payment'])
                ->orderByDesc('created_at');
            if (! $user->isAdmin()) {
                $ordersQuery->where(function ($q) use ($user) {
                    $q->where('id_pengguna', $user->id)
                        ->orWhere('email_penerima', $user->email);
                });
            }
            $orders = $ordersQuery->limit(10)->get();
        }

        return view('pages.tracking', [
            'page' => 'tracking',
            'order' => $order,
            'orders' => $orders,
        ]);
    }
}
