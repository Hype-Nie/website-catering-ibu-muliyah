@extends('layouts.catering')
@section('title', 'Laporan penjualan')
@section('content')
<div class="admin-content">
    @include('partials.page-heading', ['heading' => 'Laporan penjualan', 'description' => 'Tinjau transaksi dan omzet sesuai periode yang Anda pilih.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/admin/reports.js') }}" defer></script>
@endpush
