<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExpenseRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn ($query) => $query->where('user_id', $this->user()?->id),
                ),
            ],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'spent_on' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
