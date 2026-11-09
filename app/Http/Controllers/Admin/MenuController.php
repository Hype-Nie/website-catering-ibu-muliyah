<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\MenuRequest;
use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class MenuController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $menus = Menu::with('kategori')->orderBy('id_kategori')->orderBy('harga')->get();
        $categories = Category::active()->get();

        if ($request->wantsJson()) {
            return response()->json(['menus' => $menus, 'categories' => $categories]);
        }

        return view('admin.menu', [
            'page' => 'admin-menu',
            'menus' => $menus,
            'categories' => $categories,
        ]);
    }

    public function store(MenuRequest $request): RedirectResponse|JsonResponse
    {
        $categorySlug = (string) ($request->input('jenis_paket') ?? $request->input('package_type') ?? 'satuan');
        $defaultImages = ['satuan' => 'satuan.jpg', 'box' => 'box.jpg', 'prasmanan' => 'prasmanan.jpg'];
        $preset = $request->input('preset_image') ?? $request->input('foto_menu') ?? $request->input('image');
        $imagePath = (is_string($preset) && ! empty($preset)) ? $preset : ($defaultImages[$categorySlug] ?? 'satuan.jpg');

        $file = $request->file('foto_menu') ?? $request->file('image');
        if ($file) {
            $filename = Str::random(40).'.'.$file->extension();
            $imagePath = $file->storeAs('menus', $filename, 'public');
        }

        $name = (string) ($request->input('nama_menu') ?? $request->input('name'));
        $slug = Str::slug($name);
        $counter = 1;
        while (Menu::where('slug', $slug)->exists()) {
            $slug = Str::slug($name).'-'.$counter++;
        }

        $menu = Menu::create([
            'id_kategori' => (int) ($request->input('id_kategori') ?? $request->input('category_id')),
            'nama_menu' => $name,
            'slug' => $slug,
            'deskripsi' => (string) ($request->input('deskripsi') ?? $request->input('description')),
            'harga' => (float) ($request->input('harga') ?? $request->input('price')),
            'jenis_paket' => (string) ($request->input('jenis_paket') ?? $request->input('package_type')),
            'minimal_pesanan' => (int) ($request->input('minimal_pesanan') ?? $request->input('min_order')),
            'foto_menu' => $imagePath,
            'status_tersedia' => $request->boolean('status_tersedia', $request->boolean('is_available', true)),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Menu berhasil ditambahkan.', 'menu' => $menu]);
        }

        return redirect()->route('admin.menu.index')->with('success', 'Menu berhasil ditambahkan.');
    }

    public function update(MenuRequest $request, int $id): RedirectResponse|JsonResponse
    {
        $menu = Menu::findOrFail($id);

        $data = [
            'id_kategori' => (int) ($request->input('id_kategori') ?? $request->input('category_id')),
            'nama_menu' => (string) ($request->input('nama_menu') ?? $request->input('name')),
            'deskripsi' => (string) ($request->input('deskripsi') ?? $request->input('description')),
            'harga' => (float) ($request->input('harga') ?? $request->input('price')),
            'jenis_paket' => (string) ($request->input('jenis_paket') ?? $request->input('package_type')),
            'minimal_pesanan' => (int) ($request->input('minimal_pesanan') ?? $request->input('min_order')),
            'status_tersedia' => $request->boolean('status_tersedia', $request->boolean('is_available', true)),
        ];

        $file = $request->file('foto_menu') ?? $request->file('image');
        if ($file) {
            $filename = Str::random(40).'.'.$file->extension();
            $data['foto_menu'] = $file->storeAs('menus', $filename, 'public');
        } elseif ($request->filled('preset_image')) {
            $data['foto_menu'] = (string) $request->input('preset_image');
        }
        $menu->update($data);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Menu berhasil diperbarui.', 'menu' => $menu]);
        }

        return redirect()->route('admin.menu.index')->with('success', 'Menu berhasil diperbarui.');
    }

    public function toggleAvailability(int $id): RedirectResponse|JsonResponse
    {
        $menu = Menu::findOrFail($id);
        $menu->update(['status_tersedia' => ! $menu->status_tersedia]);

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Ketersediaan menu diperbarui.', 'is_available' => $menu->status_tersedia]);
        }

        return redirect()->route('admin.menu.index')->with('success', 'Ketersediaan menu diperbarui.');
    }

    public function destroy(int $id): RedirectResponse|JsonResponse
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Menu berhasil dihapus.']);
        }

        return redirect()->route('admin.menu.index')->with('success', 'Menu berhasil dihapus.');
    }
}
