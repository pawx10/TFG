<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartRequest extends FormRequest
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
                'quantity' => 'required|integer|min:1',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'quantity' => 'sometimes|integer|min:1',
            ];
        }

        return [];
    }
}
