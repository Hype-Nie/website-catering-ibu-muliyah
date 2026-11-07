<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('login')->with('error', 'Silakan masuk terlebih dahulu.');
        }
        if (! $user->status_aktif) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Akun dinonaktifkan.'], 403);
            }

            abort(403, 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
        }

        if (! in_array($user->peran, $roles, true)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized role access.'], 403);
            }

            abort(403, 'Akses ditolak: Anda tidak memiliki hak akses administrator.');
        }

        return $next($request);
    }
}
