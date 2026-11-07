<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\PaymentProofRequest;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function show(Request $request): View|RedirectResponse
    {
        $identifier = $request->query('id');

        $order = null;
        if ($identifier) {
            $query = Order::with(['items', 'payment'])
                ->where('nomor_pesanan', (string) $identifier);

            if (Auth::check() && ! Auth::user()->isAdmin()) {
                $user = Auth::user();
                $query->where(function ($q) use ($user) {
                    $q->where('id_pengguna', $user->id)
                        ->orWhere('email_penerima', $user->email);
                });
            }

            $order = $query->first();
        }

        return view('catering', [
            'page' => 'payment',
            'order' => $order,
        ]);
    }

    public function upload(PaymentProofRequest $request): RedirectResponse|JsonResponse
    {
        $order = Order::findOrFail((int) ($request->input('id_pesanan') ?? $request->input('order_id')));

        if ($order->status_pembayaran === Order::PAYMENT_PAID) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Pesanan ini sudah lunas.'], 422);
            }

            return back()->with('error', 'Pesanan ini sudah lunas.');
        }

        if ($order->status_pesanan === Order::STATUS_CANCELLED) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Pesanan ini telah dibatalkan.'], 422);
            }

            return back()->with('error', 'Pesanan ini telah dibatalkan.');
        }

        $file = $request->file('bukti_transfer') ?? $request->file('proof');
        $filename = Str::random(40).'.'.$file->extension();
        $storedPath = $file->storeAs('bukti_transfer', $filename, 'public');

        $payment = Payment::updateOrCreate(
            ['id_pesanan' => $order->id],
            [
                'nama_bank' => $request->input('nama_bank') ?? $request->input('bank_name'),
                'nama_pemilik_rekening' => $request->input('nama_pemilik_rekening') ?? $request->input('account_holder'),
                'nominal_transfer' => $request->input('nominal_transfer') ?? $request->input('transfer_amount'),
                'tanggal_transfer' => $request->input('tanggal_transfer') ?? $request->input('transfer_date'),
                'bukti_transfer' => $storedPath,
                'status_verifikasi' => Payment::STATUS_VERIFYING,
                'catatan_penolakan' => null,
            ]
        );

        $order->update([
            'status_pembayaran' => Order::PAYMENT_VERIFYING,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Bukti pembayaran berhasil diunggah dan sedang diverifikasi oleh admin.',
                'payment' => $payment,
                'redirect' => route('tracking.show', ['id' => $order->nomor_pesanan]),
            ]);
        }

        return redirect()->route('tracking.show', ['id' => $order->nomor_pesanan])
            ->with('success', 'Bukti transfer berhasil dikirim. Admin akan segera memverifikasi pesanan Anda.');
    }
}
