<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class CartController extends Controller
{
    private function getCartQuery()
    {
        if (Auth::check()) {
            return CartItem::where('id_pengguna', Auth::id());
        }

        $sessionId = session()->getId();

        return CartItem::where('id_sesi', $sessionId);
    }

    public function index(Request $request): View|JsonResponse
    {
        $cartItems = $this->getCartQuery()->with('menu.kategori')->get();
        $subtotal = $cartItems->sum(fn (CartItem $item) => $item->subtotal);

        if ($request->wantsJson()) {
            return response()->json([
                'items' => $cartItems,
                'subtotal' => $subtotal,
                'count' => $cartItems->sum('kuantitas'),
            ]);
        }

        return view('catering', [
            'page' => 'cart',
            'items' => $cartItems,
            'subtotal' => $subtotal,
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse|JsonResponse
    {
        $menuId = (int) ($request->input('id_menu') ?? $request->input('menu_id'));
        $quantity = (int) ($request->input('kuantitas') ?? $request->input('quantity'));
        $notes = $request->input('catatan') ?? $request->input('notes');

        $query = $this->getCartQuery()->where('id_menu', $menuId);
        if ($notes !== null) {
            $query->where('catatan', $notes);
        } else {
            $query->whereNull('catatan');
        }

        $existing = $query->first();

        if ($existing) {
            $existing->update([
                'kuantitas' => $existing->kuantitas + $quantity,
            ]);
        } else {
            CartItem::create([
                'id_pengguna' => Auth::id(),
                'id_sesi' => Auth::check() ? null : session()->getId(),
                'id_menu' => $menuId,
                'kuantitas' => $quantity,
                'catatan' => $notes,
            ]);
        }

        if (! Auth::check()) {
            session()->put('guest_cart_active', true);
            session()->save();
        }

        if ($request->wantsJson()) {
            $cartItems = $this->getCartQuery()->with('menu')->get();

            return response()->json([
                'message' => 'Menu berhasil ditambahkan ke keranjang.',
                'count' => (int) $cartItems->sum('kuantitas'),
                'items' => $cartItems,
            ], 201);
        }

        return redirect()->route('cart.index')->with('success', 'Menu berhasil ditambahkan ke keranjang.');
    }

    public function update(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $cartItem = $this->getCartQuery()->with('menu')->findOrFail($id);

        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1'],
            'kuantitas' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
            'catatan' => ['nullable', 'string', 'max:255'],
        ]);

        $newQty = (int) ($validated['kuantitas'] ?? $validated['quantity'] ?? $cartItem->kuantitas);
        $newNotes = $validated['catatan'] ?? $validated['notes'] ?? $cartItem->catatan;

        if ($newQty < $cartItem->menu->minimal_pesanan) {
            $qtyField = isset($validated['kuantitas']) ? 'kuantitas' : 'quantity';
            throw ValidationException::withMessages([
                $qtyField => "Pesanan untuk menu '{$cartItem->menu->nama_menu}' minimal berjumlah {$cartItem->menu->minimal_pesanan} porsi.",
            ]);
        }

        $cartItem->update([
            'kuantitas' => $newQty,
            'catatan' => $newNotes,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Keranjang diperbarui.', 'item' => $cartItem]);
        }

        return redirect()->route('cart.index')->with('success', 'Keranjang diperbarui.');
    }

    public function destroy(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $cartItem = $this->getCartQuery()->findOrFail($id);
        $cartItem->delete();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Menu dihapus dari keranjang.']);
        }

        return redirect()->route('cart.index')->with('success', 'Menu dihapus dari keranjang.');
    }
}
