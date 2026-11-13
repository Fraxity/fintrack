<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExpenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('expenses.index'))->assertRedirect(route('login'));
    }

    public function test_users_only_see_their_own_expenses(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $otherExpense = Expense::factory()->for($other)->create();

        $this->actingAs($user)
            ->get(route('expenses.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('expenses/index')
                ->has('expenses', 0)
                ->where('month', now()->format('Y-m'))
            );

        $this->assertDatabaseHas('expenses', ['id' => $otherExpense->id]);
    }

    public function test_users_can_create_an_expense(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->firstOrFail();

        $this->actingAs($user)
            ->post(route('expenses.store'), [
                'category_id' => $category->id,
                'amount' => 42.5,
                'spent_on' => '2026-11-01',
                'description' => 'Lunch',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 42.5,
            'description' => 'Lunch',
        ]);
    }

    public function test_users_cannot_use_another_users_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $otherCategory = $other->categories()->firstOrFail();

        $this->actingAs($user)
            ->post(route('expenses.store'), [
                'category_id' => $otherCategory->id,
                'amount' => 10,
                'spent_on' => '2026-11-01',
            ])
            ->assertSessionHasErrors('category_id');

        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_users_can_update_their_expense(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->for($user)->create([
            'category_id' => $user->categories()->firstOrFail()->id,
        ]);

        $this->actingAs($user)
            ->put(route('expenses.update', $expense), [
                'category_id' => $expense->category_id,
                'amount' => 99.99,
                'spent_on' => '2026-11-05',
                'description' => 'Updated',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'amount' => 99.99,
            'description' => 'Updated',
        ]);
    }

    public function test_users_cannot_update_another_users_expense(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $expense = Expense::factory()->for($other)->create([
            'category_id' => $other->categories()->firstOrFail()->id,
        ]);

        $this->actingAs($user)
            ->put(route('expenses.update', $expense), [
                'category_id' => $user->categories()->firstOrFail()->id,
                'amount' => 1,
                'spent_on' => '2026-11-05',
            ])
            ->assertForbidden();
    }

    public function test_users_can_delete_their_expense(): void
    {
        $user = User::factory()->create();
        $expense = Expense::factory()->for($user)->create([
            'category_id' => $user->categories()->firstOrFail()->id,
        ]);

        $this->actingAs($user)
            ->delete(route('expenses.destroy', $expense))
            ->assertRedirect();

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }
}
