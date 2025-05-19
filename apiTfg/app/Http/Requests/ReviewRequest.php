<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check(); // Solo usuarios autenticados
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'game_id' => 'required|exists:games,id',
                'content' => 'required|string',
                'rating' => 'required|integer|min:1|max:5',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'content' => 'sometimes|string',
                'rating' => 'sometimes|integer|min:1|max:5',
            ];
        }

        return [];
    }
}
