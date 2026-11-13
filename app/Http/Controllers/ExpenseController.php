<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesMonth;
use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    use ResolvesMonth;

    /**
     * Show the expenses for the selected month.
     */
    public function index(Request $request): Response
    {
        $month = $this->resolveMonth($request);
        $user = $request->user();

        $categoryId = $request->integer('category_id');

        $expenses = $user->expenses()
            ->with('category')
            ->whereBetween('spent_on', [
                $month->startOfMonth()->toDateString(),
                $month->endOfMonth()->toDateString(),
            ])
            ->when($categoryId > 0, fn ($query) => $query->where('category_id', $categoryId))
            ->orderByDesc('spent_on')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Expense $expense): array => [
                'id' => $expense->id,
                'category_id' => $expense->category_id,
                'category' => $expense->category->name ?? 'Uncategorized',
                'color' => $expense->category->color ?? '#94a3b8',
                'amount' => (float) $expense->amount,
                'spent_on' => $expense->spent_on->format('Y-m-d'),
                'description' => $expense->description,
            ]);

        return Inertia::render('expenses/index', [
            'month' => $month->format('Y-m'),
            'categoryId' => $categoryId > 0 ? $categoryId : null,
            'expenses' => $expenses,
            'categories' => $user->categories()->orderBy('name')->get(['id', 'name', 'color']),
            'total' => round((float) $expenses->sum('amount'), 2),
        ]);
    }

    /**
     * Store a newly created expense.
     */
    public function store(ExpenseRequest $request): RedirectResponse
    {
        $request->user()->expenses()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Expense added.')]);

        return back();
    }

    /**
     * Update the given expense.
     */
    public function update(ExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->ensureOwned($expense);

        $expense->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Expense updated.')]);

        return back();
    }

    /**
     * Remove the given expense.
     */
    public function destroy(Expense $expense): RedirectResponse
    {
        $this->ensureOwned($expense);

        $expense->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Expense deleted.')]);

        return back();
    }
}
