<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
@switch($name)
    @case('grid')
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        @break
    @case('leaf')
        <path d="M20 3C7 1 1 10 6 17s17 2 14-14ZM5 20 16 9"/>
        @break
    @case('bag')
        <path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>
        @break
    @case('users')
        <circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/>
        @break
    @case('chart')
        <path d="M4 3v18h18M8 16v-4m5 4V7m5 9V4"/>
        @break
@endswitch
</svg>
