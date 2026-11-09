<aside class="sidebar">
<p>Operasional dapur</p>
<nav aria-label="Navigasi admin">
@foreach(['dashboard'=>['/admin','Ringkasan'],'admin-menu'=>['/admin/menu','Menu & paket'],'admin-orders'=>['/admin/pesanan','Pesanan'],'customers'=>['/admin/pelanggan','Pelanggan'],'reports'=>['/admin/laporan','Laporan penjualan']] as $key => [$url, $label])
<a href="{{ $url }}" @if($page === $key) aria-current="page" @endif>@include('partials.icon', ['name' => ['dashboard'=>'grid','admin-menu'=>'leaf','admin-orders'=>'bag','customers'=>'users','reports'=>'chart'][$key]]) {{ $label }}</a>
@endforeach
</nav>
<div class="sidebar-note">
@include('partials.icon', ['name' => 'leaf'])
<b>Dapur Menteng</b><span>Selamat memasak,<br>selamat melayani.</span></div>
</aside>
