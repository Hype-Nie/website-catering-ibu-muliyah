<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CustomerController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $customers = User::where('peran', 'customer')
            ->with(['orders.items', 'orders.payment'])
            ->orderBy('nama')
            ->get()
            ->map(function (User $user) {
                $orders = $user->orders;
                $totalSpend = $orders->where('status_pembayaran', Order::PAYMENT_PAID)->sum('total_pembayaran');

                return [
                    'id' => $user->id,
                    'name' => $user->nama,
                    'email' => $user->email,
                    'phone' => $user->nomor_telepon,
                    'address' => $user->alamat,
                    'order_count' => $orders->count(),
                    'total_spend' => (float) $totalSpend,
                    'orders' => $orders,
                ];
            });

        if ($request->wantsJson()) {
            return response()->json($customers);
        }

        return view('catering', [
            'page' => 'customers',
            'customers' => $customers,
            'orders' => Order::with(['items', 'payment'])->orderByDesc('created_at')->get(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $customer = User::where('peran', 'customer')
            ->with(['orders.items', 'orders.payment'])
            ->findOrFail($id);

        return response()->json($customer);
    }
}
