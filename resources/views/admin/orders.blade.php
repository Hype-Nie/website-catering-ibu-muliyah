@extends('layouts.catering')
@section('title', 'Pesanan masuk')
@section('content')
<div class="admin-content">
    @include('partials.page-heading', ['heading' => 'Pesanan masuk', 'description' => 'Periksa pembayaran dan kelola persiapan setiap pesanan.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/admin/orders.js') }}" defer></script>
@endpush
