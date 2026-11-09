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

        if ($search = $request->query('q')) {
            $searchTerm = '%'.trim((string) $search).'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('nama_menu', 'LIKE', $searchTerm)
                    ->orWhere('deskripsi', 'LIKE', $searchTerm);
            });
        }

        if ($request->wantsJson()) {
            if ($selectedCategory) {
                $query->byCategory((string) $selectedCategory);
            }

            return response()->json([
                'categories' => $categories,
                'menus' => $query->orderBy('harga')->get(),
            ]);
        }

        return view('pages.catalog', [
            'page' => 'catalog',
            'categories' => $categories,
            'menus' => $query->orderBy('harga')->get(),
            'selectedCategory' => $selectedCategory,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $menu = Menu::with('kategori')->findOrFail($id);

        return response()->json($menu);
    }
}
