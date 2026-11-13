<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Show the user's expense categories.
     */
    public function index(Request $request): Response
    {
        $categories = $request->user()->categories()
            ->withCount('expenses')
            ->withSum('expenses', 'amount')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'expenses_count' => $category->expenses_count,
                'expenses_sum_amount' => round((float) ($category->expenses_sum_amount ?? 0), 2),
            ]);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(CategoryRequest $request): RedirectResponse
    {
        $request->user()->categories()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category added.')]);

        return back();
    }

    /**
     * Update the given category.
     */
    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $this->ensureOwned($category);

        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return back();
    }

    /**
     * Remove the given category.
     */
    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $this->ensureOwned($category);

        if ($request->user()->categories()->count() <= 1) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Keep at least one category.'),
            ]);

            return back();
        }

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return back();
    }
}
