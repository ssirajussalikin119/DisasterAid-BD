<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->successResponse('Logout successful.')->cookie($this->authService->forgetCookie());
    }

    public function refresh(): JsonResponse
    {
        try {
            $payload = $this->authService->refreshToken();
        } catch (\Throwable) {
            return $this->errorResponse('Session expired. Please sign in again.', [], 401);
        }

        return $this->successResponse('Session refreshed.', [
            'user' => new AuthenticatedUserResource($payload['user']),
            'token' => $payload['token'],
            'token_type' => $payload['token_type'],
            'expires_at' => $payload['expires_at'],
            'dashboard_route' => $payload['dashboard_route'],
        ])->cookie($this->authService->cookie($payload['token']));
    }

    public function me(): JsonResponse
    {
        $user = $this->authService->currentUser();

        return $this->successResponse('Authenticated user.', [
            'user' => new AuthenticatedUserResource($user),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfile($this->authService->currentUser(), $request->validated());

        return $this->successResponse('Profile updated successfully.', [
            'user' => new AuthenticatedUserResource($user),
        ]);
    }

}
