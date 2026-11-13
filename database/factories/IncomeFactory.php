<?php

namespace Database\Factories;

use App\Models\Income;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Income>
 */
class IncomeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'month' => now()->startOfMonth()->toDateString(),
            'source' => fake()->randomElement(['Salary', 'Freelance', 'Bonus', 'Side gig']),
            'amount' => fake()->randomFloat(2, 500, 5000),
            'note' => null,
        ];
    }
}
