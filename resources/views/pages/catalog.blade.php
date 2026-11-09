@extends('layouts.catering')
@section('title', 'Pilihan menu')
@section('content')
<div class="container page-content">
    @include('partials.page-heading', ['heading' => 'Mau makan apa hari ini?', 'description' => 'Pilih hidangan favorit. Kami siapkan dengan lauk yang lengkap.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/pages/catalog.js') }}" defer></script>
@endpush
