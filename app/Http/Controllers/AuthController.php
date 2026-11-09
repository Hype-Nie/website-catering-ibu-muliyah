<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\CartItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(Request $request): View|RedirectResponse
    {
        if (Auth::check()) {
            return Auth::user()->isAdmin()
                ? redirect()->route('admin.dashboard')
                : redirect()->route('catalog');
        }

        if ($request->has('return')) {
            session()->put('url.intended', $request->input('return'));
        }

        return view('auth.login', ['page' => 'login']);
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $user = User::where('email', strtolower(trim($request->input('email'))))->first();
        if ($user && ! $user->status_aktif) {
            return back()->withInput($request->only('email'))->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
            ]);
        }
        $guestSessionId = $request->session()->getId();

        $password = $request->input('kata_sandi') ?? $request->input('password');

        $credentials = [
            'email' => strtolower(trim($request->input('email'))),
            'kata_sandi' => $password,
            'status_aktif' => true,
        ];

        if (! Auth::attempt($credentials, true)) {
            return back()->withInput($request->only('email'))->withErrors([
                'email' => 'Email atau kata sandi tidak sesuai.',
            ]);
        }

        if ($request->filled('return')) {
            session()->put('url.intended', $request->input('return'));
        }

        $request->session()->regenerate();
        /** @var User $user */
        $user = Auth::user();
        $this->migrateCart($guestSessionId, $user->id);

        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return redirect()->intended(route('catalog'));
    }

    public function showRegister(Request $request): View|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('catalog');
        }

        if ($request->has('return')) {
            session()->put('url.intended', $request->input('return'));
        }

        return view('auth.register', ['page' => 'register']);
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        $guestSessionId = $request->session()->getId();

        $user = User::create([
            'nama' => $request->input('nama') ?? $request->input('name'),
            'email' => strtolower(trim((string) $request->input('email'))),
            'nomor_telepon' => trim((string) ($request->input('nomor_telepon') ?? $request->input('phone_number') ?? $request->input('phone') ?? '')),
            'kata_sandi' => Hash::make((string) ($request->input('kata_sandi') ?? $request->input('password'))),
            'alamat' => $request->input('alamat') ?? $request->input('address'),
            'peran' => 'customer',
            'status_aktif' => true,
        ]);

        Auth::login($user);
        if ($request->filled('return')) {
            session()->put('url.intended', $request->input('return'));
        }
        $request->session()->regenerate();
        $this->migrateCart($guestSessionId, $user->id);

        return redirect()->intended(route('catalog'))->with('success', 'Akun berhasil dibuat. Selamat datang di Dapur Menteng!');
    }

    private function migrateCart(string $guestSessionId, int $userId): void
    {
        $guestItems = CartItem::where('id_sesi', $guestSessionId)->get();

        foreach ($guestItems as $guestItem) {
            $query = CartItem::where('id_pengguna', $userId)
                ->where('id_menu', $guestItem->id_menu);

            if ($guestItem->catatan !== null) {
                $query->where('catatan', $guestItem->catatan);
            } else {
                $query->whereNull('catatan');
            }

            $existing = $query->first();

            if ($existing) {
                $existing->update(['kuantitas' => $existing->kuantitas + $guestItem->kuantitas]);
                $guestItem->delete();
            } else {
                $guestItem->update([
                    'id_pengguna' => $userId,
                    'id_sesi' => null,
                ]);
            }
        }
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Anda telah berhasil keluar.');
    }
}
