<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesMonth;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesMonth;

    /**
     * Show the monthly spending overview.
     */
    public function index(Request $request): Response
    {
        $month = $this->resolveMonth($request);
        $user = $request->user();

        $start = $month->startOfMonth();
        $end = $month->endOfMonth();

        $incomes = $user->incomes()
            ->where('month', $start->toDateString())
            ->get();

        $expenses = $user->expenses()
            ->with('category')
            ->whereBetween('spent_on', [$start->toDateString(), $end->toDateString()])
            ->get();

        $totalIncome = (float) $incomes->sum('amount');
        $totalExpenses = (float) $expenses->sum('amount');

        $categoryBreakdown = $expenses
            ->groupBy(fn (Expense $expense) => $expense->category->name ?? 'Uncategorized')
            ->map(function (Collection $group, string $name): array {
                /** @var Expense $first */
                $first = $group->first();

                return [
                    'name' => $name,
                    'color' => $first->category->color ?? '#94a3b8',
                    'total' => round((float) $group->sum('amount'), 2),
                ];
            })
            ->sortByDesc('total')
            ->values();

        $budgets = $user->budgets()
            ->with('category')
            ->where('month', $start->toDateString())
            ->get()
            ->map(function (Budget $budget) use ($expenses): array {
                $amount = (float) $budget->amount;
                $spent = (float) $expenses
                    ->where('category_id', $budget->category_id)
                    ->sum('amount');

                return [
                    'id' => $budget->id,
                    'category' => $budget->category->name ?? 'Uncategorized',
                    'color' => $budget->category->color ?? '#94a3b8',
                    'budget' => round($amount, 2),
                    'spent' => round($spent, 2),
                    'remaining' => round($amount - $spent, 2),
                    'percentage' => $amount > 0 ? (int) round(min(100, ($spent / $amount) * 100)) : 0,
                    'over_budget' => $spent > $amount,
                ];
            })
            ->sortByDesc('percentage')
            ->values();

        $trendStart = $start->subMonths(5);

        $trendIncomes = $user->incomes()
            ->whereBetween('month', [$trendStart->toDateString(), $start->toDateString()])
            ->get();

        $trendExpenses = $user->expenses()
            ->whereBetween('spent_on', [$trendStart->toDateString(), $end->toDateString()])
            ->get();

        $trend = collect(range(0, 5))->map(function (int $offset) use ($trendStart, $trendIncomes, $trendExpenses): array {
            $current = $trendStart->addMonths($offset);
            $monthKey = $current->format('Y-m');

            $income = $trendIncomes->filter(
                fn (Income $entry) => $entry->month->format('Y-m') === $monthKey,
            )->sum('amount');

            $spent = $trendExpenses->filter(
                fn (Expense $entry) => $entry->spent_on->format('Y-m') === $monthKey,
            )->sum('amount');

            return [
                'month' => $monthKey,
                'label' => $current->format('M'),
                'income' => round((float) $income, 2),
                'expenses' => round((float) $spent, 2),
            ];
        });

        $recentExpenses = $user->expenses()
            ->with('category')
            ->orderByDesc('spent_on')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (Expense $expense): array => [
                'id' => $expense->id,
                'description' => $expense->description ?: ($expense->category->name ?? 'Expense'),
                'category' => $expense->category->name ?? 'Uncategorized',
                'color' => $expense->category->color ?? '#94a3b8',
                'amount' => (float) $expense->amount,
                'spent_on' => $expense->spent_on->format('Y-m-d'),
            ]);

        return Inertia::render('dashboard', [
            'month' => $month->format('Y-m'),
            'summary' => [
                'income' => round($totalIncome, 2),
                'expenses' => round($totalExpenses, 2),
                'remaining' => round($totalIncome - $totalExpenses, 2),
                'savings_rate' => $totalIncome > 0
                    ? (int) round((($totalIncome - $totalExpenses) / $totalIncome) * 100)
                    : 0,
            ],
            'categoryBreakdown' => $categoryBreakdown,
            'budgets' => $budgets,
            'trend' => $trend,
            'recentExpenses' => $recentExpenses,
        ]);
    }
}
