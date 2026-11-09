<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private function getReportQuery(Request $request)
    {
        $now = Carbon::now('Asia/Jakarta');
        $startDate = $request->query('start_date', $now->copy()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', $now->toDateString());

        $query = Order::with('items')
            ->whereDate('tanggal_pesanan', '>=', $startDate)
            ->whereDate('tanggal_pesanan', '<=', $endDate)
            ->orderByDesc('tanggal_pesanan');

        if ($request->filled('status')) {
            $query->where('status_pesanan', (int) $request->query('status'));
        }

        return $query;
    }

    public function index(Request $request): View|JsonResponse
    {
        $now = Carbon::now('Asia/Jakarta');
        $startDate = $request->query('start_date', $now->copy()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', $now->toDateString());

        $orders = $this->getReportQuery($request)->get();

        $paidOrders = $orders->where('status_pembayaran', Order::PAYMENT_PAID);
        $totalRevenue = (float) $paidOrders->sum('total_pembayaran');
        $totalPortions = (int) $paidOrders->sum(fn ($o) => $o->items->sum('kuantitas'));

        $data = [
            'orders' => $orders,
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $orders->count(),
            'totalPortions' => $totalPortions,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return view('admin.reports', array_merge(['page' => 'reports'], $data));
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $orders = $this->getReportQuery($request)->get();
        $filename = 'Laporan-Penjualan-Dapur-Menteng-'.Carbon::now('Asia/Jakarta')->format('Ymd-His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $sanitize = function ($value): string {
            $str = (string) ($value ?? '');
            if ($str !== '' && in_array($str[0], ['=', '+', '-', '@', "\t", "\r", '%'], true)) {
                return "'".$str;
            }

            return $str;
        };

        $callback = function () use ($orders, $sanitize) {
            $output = fopen('php://output', 'w');
            fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($output, [
                'Nomor Invoice',
                'Tanggal Pesanan',
                'Nama Pelanggan',
                'WhatsApp',
                'Jadwal Kirim',
                'Total Porsi',
                'Subtotal (Rp)',
                'Ongkos Kirim (Rp)',
                'Total Tagihan (Rp)',
                'Status Pembayaran',
                'Status Pesanan',
            ]);

            foreach ($orders as $o) {
                fputcsv($output, [
                    $sanitize($o->nomor_pesanan),
                    $o->tanggal_pesanan?->format('Y-m-d H:i'),
                    $sanitize($o->nama_penerima),
                    $sanitize($o->nomor_telepon_penerima),
                    $sanitize($o->tanggal_pengiriman?->format('Y-m-d').' '.$o->waktu_pengiriman),
                    $o->items->sum('kuantitas'),
                    $o->subtotal,
                    $o->biaya_pengiriman,
                    $o->total_pembayaran,
                    $sanitize($o->status_pembayaran),
                    $sanitize($o->status_label),
                ]);
            }

            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }
}
