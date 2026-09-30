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
    /**
     * Canonicalize accepted phone input to the E.164 Bangladesh format
     * (+8801XXXXXXXX). This is a superset of the previous rule: every input
     * that was accepted before is still accepted, unchanged inputs pass
     * through, and alternate formats map onto the same canonical identity
     * instead of being rejected.
     */
    public static function normalizePhone(string $phone): string
    {
        $compact = preg_replace('/[\\s\\-().]/', '', $phone) ?? $phone;

        if (preg_match('/^01[3-9]\\d{8}$/', $compact) === 1) {
            return '+880'.substr($compact, 1);
        }

        if (preg_match('/^(?:00)?8801[3-9]\\d{8}$/', $compact) === 1) {
            return '+'.ltrim($compact, '0');
        }

        return $compact;
    }

    public function generate(string $phone): void
    {
        $minuteKey = "otp:send:minute:{$phone}";
        $dailyKey = "otp:send:day:{$phone}";

        if (RateLimiter::tooManyAttempts($minuteKey, 1)) {
            throw ValidationException::withMessages([
                'phone' => ['Please wait 60 seconds before requesting another OTP.'],
            ]);
        }

        if (RateLimiter::tooManyAttempts($dailyKey, 10)) {
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

        if (app()->environment(['local', 'development']) || filter_var(env('OTP_LOG_ENABLED', false), FILTER_VALIDATE_BOOLEAN)) {
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
