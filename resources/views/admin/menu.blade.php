@extends('layouts.catering')
@section('title', 'Menu & paket')
@section('content')
<div class="admin-content">
    @include('partials.page-heading', ['heading' => 'Menu & paket', 'description' => 'Kelola hidangan, harga, dan ketersediaan untuk pelanggan.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/admin/menu.js') }}" defer></script>
@endpush
