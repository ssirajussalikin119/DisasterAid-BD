<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Services\Auth\AuthService;
use App\Services\Auth\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtpAuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly OtpService $otpService,
    ) {
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\\+8801[3-9]\\d{8}$/'],
        ]);

        $this->otpService->generate($validated['phone']);

        return $this->successResponse('OTP sent.', [
            'expires_in' => 300,
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\\+8801[3-9]\\d{8}$/'],
            'code' => ['required', 'string', 'digits:6'],
        ]);

        if (! $this->otpService->verify($validated['phone'], $validated['code'])) {
            return response()->json([
                'message' => 'Invalid, expired, or exhausted OTP.',
                'attempts' => $this->otpService->latestAttempts($validated['phone']),
            ], 422);
        }

        $payload = $this->authService->loginOrRegister($validated['phone']);

        return $this->successResponse('Authentication successful.', [
            'user' => new AuthenticatedUserResource($payload['user']),
            'token_type' => $payload['token_type'],
            'expires_at' => $payload['expires_at'],
            'dashboard_route' => $payload['dashboard_route'],
        ])->cookie($this->authService->cookie($payload['token']));
    }
}
