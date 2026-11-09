@extends('layouts.catering')
@section('title', 'Ringkasan admin')
@section('content')
<div class="admin-content">
    @include('partials.page-heading', ['heading' => 'Selamat datang di dapur.', 'description' => 'Berikut ringkasan pesanan dan aktivitas usaha Anda.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/admin/dashboard.js') }}" defer></script>
@endpush
