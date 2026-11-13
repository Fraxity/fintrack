<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesMonth;
use App\Http\Requests\IncomeRequest;
use App\Models\Income;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    use ResolvesMonth;

    /**
     * Show the income entries for the selected month.
     */
    public function index(Request $request): Response
    {
        $month = $this->resolveMonth($request);

        $incomes = $request->user()->incomes()
            ->where('month', $month->startOfMonth()->toDateString())
            ->orderByDesc('amount')
            ->get()
            ->map(fn (Income $income): array => [
                'id' => $income->id,
                'source' => $income->source,
                'amount' => (float) $income->amount,
                'note' => $income->note,
                'month' => $income->month->format('Y-m'),
            ]);

        return Inertia::render('incomes/index', [
            'month' => $month->format('Y-m'),
            'incomes' => $incomes,
            'total' => round((float) $incomes->sum('amount'), 2),
        ]);
    }

    /**
     * Store a newly created income entry.
     */
    public function store(IncomeRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['month'] = $data['month'].'-01';

        $request->user()->incomes()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Income added.')]);

        return back();
    }

    /**
     * Update the given income entry.
     */
    public function update(IncomeRequest $request, Income $income): RedirectResponse
    {
        $this->ensureOwned($income);

        $data = $request->validated();
        $data['month'] = $data['month'].'-01';

        $income->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Income updated.')]);

        return back();
    }

    /**
     * Remove the given income entry.
     */
    public function destroy(Income $income): RedirectResponse
    {
        $this->ensureOwned($income);

        $income->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Income deleted.')]);

        return back();
    }
}
