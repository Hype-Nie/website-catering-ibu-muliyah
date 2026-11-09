@extends('layouts.catering')
@section('title', 'Lacak pesanan')
@section('content')
<div class="container page-content">
    @include('partials.page-heading', ['heading' => 'Lacak status pesanan', 'description' => 'Pantau perkembangan hidangan Anda langsung dari dapur.'])
    <div data-page-content></div>
</div>
@endsection
@push('scripts')
<script src="{{ asset('js/pages/tracking.js') }}" defer></script>
@endpush
