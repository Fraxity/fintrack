<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_budgets_page_shows_spending_progress(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->firstOrFail();

        $budget = Budget::factory()->for($user)->create([
            'category_id' => $category->id,
            'month' => now()->startOfMonth()->toDateString(),
            'amount' => 500,
        ]);

        Expense::factory()->for($user)->create([
            'category_id' => $category->id,
            'amount' => 125,
            'spent_on' => now()->startOfMonth()->toDateString(),
        ]);

        $this->actingAs($user)
            ->get(route('budgets.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('budgets/index')
                ->where('summary.budgeted', 500)
                ->where('summary.spent', 125)
                ->has('rows', $user->categories()->count())
            );

        $this->assertDatabaseHas('budgets', ['id' => $budget->id]);
    }

    public function test_storing_a_budget_upserts_by_category_and_month(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->firstOrFail();

        $payload = [
            'category_id' => $category->id,
            'month' => '2026-11',
            'amount' => 300,
        ];

        $this->actingAs($user)
            ->post(route('budgets.store'), $payload)
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('budgets.store'), [...$payload, 'amount' => 450])
            ->assertRedirect();

        $this->assertDatabaseCount('budgets', 1);
        $this->assertDatabaseHas('budgets', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 450,
        ]);
    }

    public function test_users_can_update_and_delete_their_budget(): void
    {
        $user = User::factory()->create();
        $budget = Budget::factory()->for($user)->create([
            'category_id' => $user->categories()->firstOrFail()->id,
        ]);

        $this->actingAs($user)
            ->put(route('budgets.update', $budget), [
                'category_id' => $budget->category_id,
                'month' => $budget->month->format('Y-m'),
                'amount' => 700,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('budgets', ['id' => $budget->id, 'amount' => 700]);

        $this->actingAs($user)
            ->delete(route('budgets.destroy', $budget))
            ->assertRedirect();

        $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
    }
}
