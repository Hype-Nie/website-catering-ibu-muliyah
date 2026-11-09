<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectPaymentRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $query = Order::with(['items', 'payment', 'user'])->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $term = '%'.trim((string) $search).'%';
            $query->where(function ($q) use ($term) {
                $q->where('nomor_pesanan', 'LIKE', $term)
                    ->orWhere('nama_penerima', 'LIKE', $term)
                    ->orWhere('nomor_telepon_penerima', 'LIKE', $term);
            });
        }

        if ($request->filled('status')) {
            $query->where('status_pesanan', (int) $request->query('status'));
        }

        if ($request->filled('payment')) {
            $query->where('status_pembayaran', (string) $request->query('payment'));
        }

        $orders = $query->get();

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        return view('admin.orders', [
            'page' => 'admin-orders',
            'orders' => $orders,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['items.menu', 'payment.verifier', 'user'])->findOrFail($id);

        return response()->json($order);
    }

    public function verifyPayment(Request $request, int $id): RedirectResponse|JsonResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $order = Order::with('payment')->lockForUpdate()->findOrFail($id);

            if ($order->status_pesanan === Order::STATUS_CANCELLED) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Pesanan yang telah dibatalkan tidak dapat diverifikasi.'], 422);
                }

                return back()->with('error', 'Pesanan yang telah dibatalkan tidak dapat diverifikasi.');
            }

            if (! $order->payment) {
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Pesanan ini belum memiliki catatan pembayaran.'], 422);
                }

                return back()->with('error', 'Pesanan ini belum memiliki catatan pembayaran.');
            }

            $order->payment->verify((int) Auth::id());

            if ($request->wantsJson()) {
                return response()->json(['message' => 'Pembayaran berhasil diverifikasi. Pesanan masuk antrean dapur.']);
            }

            return redirect()->route('admin.orders.index')->with('success', 'Pembayaran pesanan '.$order->nomor_pesanan.' diverifikasi.');
        });
    }

    public function rejectPayment(RejectPaymentRequest $request, int $id): RedirectResponse|JsonResponse
    {
        $order = Order::with('payment')->findOrFail($id);

        if (! $order->payment) {
            return back()->with('error', 'Pesanan ini belum memiliki catatan pembayaran.');
        }

        $reason = (string) ($request->input('catatan_penolakan') ?? $request->input('reason'));
        $order->payment->reject((int) Auth::id(), $reason);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Bukti pembayaran ditolak. Alasan tersimpan untuk pelanggan.']);
        }

        return redirect()->route('admin.orders.index')->with('success', 'Bukti pembayaran pesanan '.$order->nomor_pesanan.' ditolak.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int $id): RedirectResponse|JsonResponse
    {
        $order = Order::findOrFail($id);
        $newStatus = (int) ($request->input('status_pesanan') ?? $request->input('order_status'));

        if (! $order->canTransitionTo($newStatus)) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => "Transisi status dari '{$order->status_label}' tidak diizinkan.",
                ], 422);
            }

            return back()->with('error', "Transisi status dari '{$order->status_label}' tidak diizinkan.");
        }

        $order->update(['status_pesanan' => $newStatus]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Status pesanan berhasil diperbarui.', 'order' => $order]);
        }

        return redirect()->route('admin.orders.index')->with('success', 'Status pesanan '.$order->nomor_pesanan.' diperbarui.');
    }
}
