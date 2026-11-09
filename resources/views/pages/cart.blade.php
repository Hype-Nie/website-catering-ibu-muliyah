@extends('layouts.catering')
@section('title', 'Keranjang')
@section('content')
<div class="container page-content">
    @include('partials.page-heading', ['heading' => 'Keranjang Anda', 'description' => 'Periksa porsi dan catatan sebelum kami siapkan hidangannya.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/pages/cart.js') }}" defer></script>
@endpush
