<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $color
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, Expense> $expenses
 * @property-read Collection<int, Budget> $budgets
 */
#[Fillable(['name', 'color'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    /**
     * The categories every new account starts with.
     *
     * @var array<int, array{name: string, color: string}>
     */
    public const DEFAULTS = [
        ['name' => 'Housing', 'color' => '#6366f1'],
        ['name' => 'Groceries', 'color' => '#22c55e'],
        ['name' => 'Transport', 'color' => '#f59e0b'],
        ['name' => 'Dining', 'color' => '#ef4444'],
        ['name' => 'Utilities', 'color' => '#06b6d4'],
        ['name' => 'Health', 'color' => '#ec4899'],
        ['name' => 'Entertainment', 'color' => '#8b5cf6'],
        ['name' => 'Shopping', 'color' => '#f97316'],
        ['name' => 'Savings', 'color' => '#14b8a6'],
        ['name' => 'Other', 'color' => '#94a3b8'],
    ];

    /**
     * @return array<int, array{name: string, color: string}>
     */
    public static function defaults(): array
    {
        return self::DEFAULTS;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Expense, $this>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * @return HasMany<Budget, $this>
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
