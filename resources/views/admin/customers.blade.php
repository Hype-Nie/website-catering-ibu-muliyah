@extends('layouts.catering')
@section('title', 'Pelanggan')
@section('content')
<div class="admin-content">
    @include('partials.page-heading', ['heading' => 'Pelanggan', 'description' => 'Kenali pelanggan dan lihat riwayat pesanannya.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/admin/customers.js') }}" defer></script>
@endpush
