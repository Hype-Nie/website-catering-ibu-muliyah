@extends('layouts.catering')
@section('title', 'Masuk')
@section('content')
@include('auth.partials.form')
@endsection
@push('scripts')
<script src="{{ asset('js/auth/form.js') }}" defer></script>
<script src="{{ asset('js/auth/login.js') }}" defer></script>
@endpush
