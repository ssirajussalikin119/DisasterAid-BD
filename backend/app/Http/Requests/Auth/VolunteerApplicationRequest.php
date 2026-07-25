<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VolunteerApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'district' => ['required', 'string', 'max:120'],
            'skills' => ['required', 'array', 'min:1'],
            'skills.*' => ['string', 'max:80'],
            'motivation' => ['required', 'string', 'max:2000'],
            'availability' => ['required', 'string', 'max:255'],
        ];
    }
}
