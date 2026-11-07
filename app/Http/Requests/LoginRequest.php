<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $passField = $this->has('kata_sandi') ? 'kata_sandi' : 'password';

        return [
            'email' => ['required', 'string', 'email'],
            $passField => ['required', 'string'],
        ];
    }
}
