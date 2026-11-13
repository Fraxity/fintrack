<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesMonth;
use App\Http\Requests\BudgetRequest;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    use ResolvesMonth;

    /**
     * Show the budgets for the selected month.
     */
    public function index(Request $request): Response
    {
        $month = $this->resolveMonth($request);
        $user = $request->user();

        $categories = $user->categories()->orderBy('name')->get();

        $budgets = $user->budgets()
            ->where('month', $month->startOfMonth()->toDateString())
            ->get()
            ->keyBy('category_id');

        $spent = $user->expenses()
            ->whereBetween('spent_on', [
                $month->startOfMonth()->toDateString(),
                $month->endOfMonth()->toDateString(),
            ])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $rows = $categories->map(function (Category $category) use ($budgets, $spent): array {
            $budget = $budgets->get($category->id);
            $amount = $budget ? (float) $budget->amount : null;
            $spentAmount = (float) ($spent[$category->id] ?? 0);

            return [
                'category_id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'budget_id' => $budget?->id,
                'budget' => $amount,
                'spent' => round($spentAmount, 2),
                'remaining' => $amount !== null ? round($amount - $spentAmount, 2) : null,
                'percentage' => $amount !== null && $amount > 0
                    ? (int) round(min(100, ($spentAmount / $amount) * 100))
                    : null,
                'over_budget' => $amount !== null && $spentAmount > $amount,
            ];
        });

        return Inertia::render('budgets/index', [
            'month' => $month->format('Y-m'),
            'rows' => $rows,
            'summary' => [
                'budgeted' => round((float) $budgets->sum('amount'), 2),
                'spent' => round((float) $spent->sum(), 2),
            ],
        ]);
    }

    /**
     * Create or update a budget for a category and month.
     */
    public function store(BudgetRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $request->user()->budgets()->updateOrCreate(
            [
                'category_id' => $data['category_id'],
                'month' => $data['month'].'-01',
            ],
            ['amount' => $data['amount']],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Budget saved.')]);

        return back();
    }

    /**
     * Update the given budget.
     */
    public function update(BudgetRequest $request, Budget $budget): RedirectResponse
    {
        $this->ensureOwned($budget);

        $data = $request->validated();

        $budget->update(['amount' => $data['amount']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Budget updated.')]);

        return back();
    }

    /**
     * Remove the given budget.
     */
    public function destroy(Budget $budget): RedirectResponse
    {
        $this->ensureOwned($budget);

        $budget->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Budget removed.')]);

        return back();
    }
}
