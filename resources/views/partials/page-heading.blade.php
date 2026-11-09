<div class="page-heading">
    <div>
        <a class="breadcrumb" href="{{ str_starts_with($page, 'admin') || in_array($page, ['dashboard', 'customers', 'reports']) ? '/admin' : '/' }}">Dapur Menteng</a>
        <h1>{{ $heading }}</h1>
        <p>{{ $description }}</p>
    </div>
</div>
