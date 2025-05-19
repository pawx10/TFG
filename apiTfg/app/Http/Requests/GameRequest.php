<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check(); // Asegúrate de que el usuario esté autenticado
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image_url' => 'nullable|url',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return [
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|numeric|min:0',
                'image_url' => 'nullable|url',
            ];
        }

        return [];
    }
}
