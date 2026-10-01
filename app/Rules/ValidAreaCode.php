<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidAreaCode implements ValidationRule
{
    public function __construct(private readonly string $group)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $codes = config('geo-areas.'.$this->group, []);

        if (! in_array($value, $codes, true)) {
            $fail('The selected :attribute is invalid.');
        }
    }
}
