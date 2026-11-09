@extends('layouts.catering')
@section('title', 'Checkout')
@section('content')
<div class="container page-content">
    @include('partials.page-heading', ['heading' => 'Sedikit lagi, siap dipesan.', 'description' => 'Lengkapi penerima, jadwal, dan cara menerima hidangan.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/pages/checkout-map.js') }}" defer></script>
<script src="{{ asset('js/pages/checkout.js') }}" defer></script>
@endpush
