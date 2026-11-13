<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_get_the_default_categories(): void
    {
        $user = User::factory()->create();

        $this->assertSame(10, $user->categories()->count());
        $this->assertDatabaseHas('categories', [
            'user_id' => $user->id,
            'name' => 'Groceries',
        ]);
    }

    public function test_users_can_view_their_categories(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('categories/index')
                ->has('categories', 10)
            );
    }

    public function test_users_can_create_update_and_delete_a_category(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('categories.store'), [
                'name' => 'Pets',
                'color' => '#123abc',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('categories', [
            'user_id' => $user->id,
            'name' => 'Pets',
            'color' => '#123abc',
        ]);

        $category = $user->categories()->where('name', 'Pets')->firstOrFail();

        $this->actingAs($user)
            ->put(route('categories.update', $category), [
                'name' => 'Pet care',
                'color' => '#abcdef',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Pet care',
        ]);

        $this->actingAs($user)
            ->delete(route('categories.destroy', $category))
            ->assertRedirect();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_category_names_are_unique_per_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('categories.store'), [
                'name' => 'Groceries',
                'color' => '#123abc',
            ])
            ->assertSessionHasErrors('name');
    }

    public function test_users_cannot_delete_their_last_category(): void
    {
        $user = User::factory()->create();
        $user->categories()->where('name', '!=', 'Groceries')->delete();
        $category = $user->categories()->firstOrFail();

        $this->actingAs($user)
            ->delete(route('categories.destroy', $category))
            ->assertRedirect();

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_users_cannot_modify_another_users_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $category = $other->categories()->firstOrFail();

        $this->actingAs($user)
            ->put(route('categories.update', $category), [
                'name' => 'Changed',
                'color' => '#123abc',
            ])
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('categories.destroy', $category))
            ->assertForbidden();
    }
}
