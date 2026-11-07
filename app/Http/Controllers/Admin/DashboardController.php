<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $paidOrders = Order::where('status_pembayaran', Order::PAYMENT_PAID);
        $totalRevenue = (float) $paidOrders->sum('total_pembayaran');
        $totalOrders = Order::count();
        $pendingVerifications = Order::where('status_pembayaran', Order::PAYMENT_VERIFYING)->count();

        $recentOrders = Order::with(['items', 'payment'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $metrics = [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'pendingVerifications' => $pendingVerifications,
            'recentOrders' => $recentOrders,
        ];

        if ($request->wantsJson()) {
            return response()->json($metrics);
        }

        return view('catering', array_merge(['page' => 'dashboard'], $metrics));
    }
}
