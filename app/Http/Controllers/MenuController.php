<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class MenuController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $categories = Category::active()->get();
        $selectedCategory = $request->query('kategori', 'satuan');

        $query = Menu::with('kategori')->available();

        if ($selectedCategory) {
            $query->byCategory((string) $selectedCategory);
        }

        if ($search = $request->query('q')) {
            $searchTerm = '%'.trim((string) $search).'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama_menu', 'LIKE', $searchTerm)
                    ->orWhere('deskripsi', 'LIKE', $searchTerm);
            });
        }

        $menus = $query->orderBy('harga')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'categories' => $categories,
                'menus' => $menus,
            ]);
        }

        return view('catering', [
            'page' => 'catalog',
            'categories' => $categories,
            'menus' => $menus,
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $menu = Menu::with('kategori')->findOrFail($id);

        return response()->json($menu);
    }
}
