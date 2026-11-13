<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Model;

abstract class Controller
{
    /**
     * Ensure the authenticated user owns the given model.
     */
    protected function ensureOwned(Model $model): void
    {
        abort_unless(
            (int) $model->getAttribute('user_id') === (int) auth()->id(),
            403,
        );
    }
}
