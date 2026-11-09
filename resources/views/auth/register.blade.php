@extends('layouts.catering')
@section('title', 'Daftar akun')
@section('content')
@include('auth.partials.form')
@endsection
@push('scripts')
<script src="{{ asset('js/auth/form.js') }}" defer></script>
<script src="{{ asset('js/auth/register.js') }}" defer></script>
@endpush
