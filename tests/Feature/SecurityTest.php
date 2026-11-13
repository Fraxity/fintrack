<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('X-Permitted-Cross-Domain-Policies', 'none')
            ->assertHeader('Cross-Origin-Opener-Policy', 'same-origin')
            ->assertHeader(
                'Content-Security-Policy',
                "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
            );
    }

    public function test_guest_requests_are_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 60; $attempt++) {
            $this->get('/')->assertOk();
        }

        $this->get('/')->assertTooManyRequests();
    }

    public function test_registration_is_rate_limited(): void
    {
        for ($attempt = 1; $attempt <= 6; $attempt++) {
            $response = $this->post(route('register.store'), [
                'name' => "Spam {$attempt}",
                'email' => "spam{$attempt}@example.com",
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            if ($attempt < 6) {
                $response->assertRedirect();
            } else {
                $response->assertTooManyRequests();
            }
        }
    }

    public function test_sql_injection_payloads_are_rejected_by_month_validation(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('expenses.index'))
            ->get(route('expenses.index', ['month' => "2026-11' OR 1=1 --"]))
            ->assertRedirect(route('expenses.index'))
            ->assertSessionHasErrors('month');

        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_sql_injection_payloads_are_rejected_by_input_validation(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->firstOrFail();

        $this->actingAs($user)
            ->post(route('expenses.store'), [
                'category_id' => $category->id,
                'amount' => '10; DROP TABLE expenses; --',
                'spent_on' => "2026-11-01' OR '1'='1",
                'description' => "x'); DROP TABLE expenses; --",
            ])
            ->assertSessionHasErrors(['amount', 'spent_on']);

        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_sql_injection_payloads_in_the_category_filter_are_ignored(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Expense::factory()->for($other)->create([
            'category_id' => $other->categories()->firstOrFail()->id,
        ]);

        $this->actingAs($user)
            ->get(route('expenses.index', ['category_id' => '1 OR 1=1']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('expenses', 0)
                ->where('categoryId', 1)
            );
    }

    public function test_login_rejects_sql_injection_payloads(): void
    {
        User::factory()->create(['email' => 'victim@example.com']);

        $this->post(route('login.store'), [
            'email' => "' OR 1=1 --",
            'password' => 'anything',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_user_id_cannot_be_overridden_through_mass_assignment(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $category = $user->categories()->firstOrFail();

        $this->actingAs($user)
            ->post(route('expenses.store'), [
                'user_id' => $other->id,
                'category_id' => $category->id,
                'amount' => 10,
                'spent_on' => '2026-11-01',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('expenses', ['user_id' => $other->id]);
    }

    public function test_users_cannot_delete_another_users_financial_records(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $expense = Expense::factory()->for($other)->create([
            'category_id' => $other->categories()->firstOrFail()->id,
        ]);
        $income = Income::factory()->for($other)->create();
        $budget = Budget::factory()->for($other)->create([
            'category_id' => $other->categories()->firstOrFail()->id,
        ]);

        $this->actingAs($user)
            ->delete(route('expenses.destroy', $expense))
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('incomes.destroy', $income))
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('budgets.destroy', $budget))
            ->assertForbidden();

        $this->assertDatabaseHas('expenses', ['id' => $expense->id]);
        $this->assertDatabaseHas('incomes', ['id' => $income->id]);
        $this->assertDatabaseHas('budgets', ['id' => $budget->id]);
    }

    public function test_stored_html_is_escaped_in_the_page_response(): void
    {
        $user = User::factory()->create();
        $category = $user->categories()->firstOrFail();
        $payload = '<script>alert("xss")</script>';

        Expense::factory()->for($user)->create([
            'category_id' => $category->id,
            'description' => $payload,
        ]);

        $response = $this->actingAs($user)->get(route('expenses.index'));

        $response->assertOk();
        $this->assertStringNotContainsString($payload, $response->getContent());
    }
}
