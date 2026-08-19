<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function generate(string $phone): void
    {
        $minuteKey = "otp:send:minute:{$phone}";
        $dailyKey = "otp:send:day:{$phone}";

        if (RateLimiter::tooManyAttempts($minuteKey, 1)) {
            throw ValidationException::withMessages([
                'phone' => ['Please wait 60 seconds before requesting another OTP.'],
            ]);
        }

        if (RateLimiter::tooManyAttempts($dailyKey, 5)) {
            throw ValidationException::withMessages([
                'phone' => ['The daily OTP request limit has been reached.'],
            ]);
        }

        RateLimiter::hit($minuteKey, 60);
        RateLimiter::hit($dailyKey, 86400);

        Otp::query()->where('phone', $phone)->whereNull('consumed_at')->delete();

        $code = (string) random_int(100000, 999999);

        Otp::create([
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
        ]);

        if (app()->environment(['local', 'development'])) {
            Log::info('Development OTP generated.', [
                'phone' => $phone,
                'code' => $code,
            ]);
        }

        // TODO: integrate SMS gateway (e.g. BulkSMSBD/Alpha SMS) in production.
    }

    public function verify(string $phone, string $code): bool
    {
        $otp = Otp::query()->where('phone', $phone)->whereNull('consumed_at')->latest('id')->first();

        if (! $otp || $otp->expires_at->isPast() || $otp->attempts >= 5) {
            return false;
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');

            return false;
        }

        $otp->update(['consumed_at' => now()]);

        return true;
    }

    public function latestAttempts(string $phone): int
    {
        return (int) (Otp::query()
            ->where('phone', $phone)
            ->whereNull('consumed_at')
            ->latest('id')
            ->value('attempts') ?? 0);
    }
}
