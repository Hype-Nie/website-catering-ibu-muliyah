@extends('layouts.catering')
@section('title', 'Pembayaran')
@section('content')
<div class="container page-content">
    @include('partials.page-heading', ['heading' => 'Selesaikan pembayaran', 'description' => 'Transfer sesuai tagihan, lalu kirim bukti untuk diperiksa admin.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/pages/payment-upload.js') }}" defer></script>
<script src="{{ asset('js/pages/payment.js') }}" defer></script>
@endpush
