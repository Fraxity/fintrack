<?php

namespace Tests\Feature;

use App\Models\Income;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class IncomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_view_their_income(): void
    {
        $user = User::factory()->create();
        Income::factory()->for($user)->create(['amount' => 2500]);

        $this->actingAs($user)
            ->get(route('incomes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('incomes/index')
                ->has('incomes', 1)
                ->where('total', 2500)
            );
    }

    public function test_users_can_add_income_for_a_month(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('incomes.store'), [
                'month' => '2026-11',
                'source' => 'Salary',
                'amount' => 3200,
                'note' => 'Monthly wage',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('incomes', [
            'user_id' => $user->id,
            'month' => '2026-11-01',
            'source' => 'Salary',
            'amount' => 3200,
        ]);
    }

    public function test_users_can_update_and_delete_their_income(): void
    {
        $user = User::factory()->create();
        $income = Income::factory()->for($user)->create();

        $this->actingAs($user)
            ->put(route('incomes.update', $income), [
                'month' => '2026-11',
                'source' => 'Freelance',
                'amount' => 800,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('incomes', [
            'id' => $income->id,
            'source' => 'Freelance',
            'amount' => 800,
        ]);

        $this->actingAs($user)
            ->delete(route('incomes.destroy', $income))
            ->assertRedirect();

        $this->assertDatabaseMissing('incomes', ['id' => $income->id]);
    }

    public function test_users_cannot_update_another_users_income(): void
    {
        $user = User::factory()->create();
        $income = Income::factory()->create();

        $this->actingAs($user)
            ->put(route('incomes.update', $income), [
                'month' => '2026-11',
                'source' => 'Hacked',
                'amount' => 1,
            ])
            ->assertForbidden();
    }
}
