@extends('layouts.catering')
@section('title', 'Pesanan Anda')
@section('content')
<div class="container page-content">
    @include('partials.page-heading', ['heading' => 'Pesanan Anda', 'description' => 'Dari dapur hingga meja makan, pantau semuanya di sini.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/pages/history.js') }}" defer></script>
@endpush
