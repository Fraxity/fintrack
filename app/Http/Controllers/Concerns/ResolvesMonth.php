<?php

namespace App\Http\Controllers\Concerns;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

trait ResolvesMonth
{
    /**
     * Resolve the requested month (YYYY-MM) into the first day of that month.
     */
    protected function resolveMonth(Request $request): CarbonImmutable
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $month = $validated['month'] ?? now()->format('Y-m');

        return CarbonImmutable::parse($month.'-01')->startOfMonth();
    }
}
