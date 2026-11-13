<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $categories = $user->categories()->get()->keyBy('name');

        $expenses = [
            ['Housing', 950, 'Rent'],
            ['Groceries', 320, 'Weekly groceries'],
            ['Transport', 120, 'Fuel and fares'],
            ['Dining', 140, 'Eating out'],
            ['Utilities', 180, 'Electricity and water'],
            ['Entertainment', 75, 'Streaming and movies'],
            ['Shopping', 160, 'Clothes'],
        ];

        foreach (range(2, 0) as $monthsAgo) {
            $month = now()->subMonths($monthsAgo)->startOfMonth();

            $user->incomes()->create([
                'month' => $month->toDateString(),
                'source' => 'Salary',
                'amount' => 3200,
                'note' => 'Monthly wage',
            ]);

            foreach ($expenses as $index => [$name, $amount, $description]) {
                $user->expenses()->create([
                    'category_id' => $categories->get($name)?->id,
                    'amount' => $amount + ($monthsAgo * 10),
                    'spent_on' => $month->copy()->addDays(min($index * 3, 25))->toDateString(),
                    'description' => $description,
                ]);
            }
        }

        $budgets = [
            'Housing' => 1000,
            'Groceries' => 400,
            'Transport' => 150,
            'Dining' => 200,
            'Utilities' => 200,
            'Entertainment' => 100,
            'Shopping' => 150,
            'Savings' => 500,
        ];

        foreach ($budgets as $name => $amount) {
            $category = $categories->get($name);

            if ($category === null) {
                continue;
            }

            $user->budgets()->create([
                'category_id' => $category->id,
                'month' => now()->startOfMonth()->toDateString(),
                'amount' => $amount,
            ]);
        }
    }
}
