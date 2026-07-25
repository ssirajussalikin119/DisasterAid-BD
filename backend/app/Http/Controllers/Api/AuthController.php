<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $this->authService->register($request->validated());

        return $this->successResponse('Registration successful.', [
            'user' => new AuthenticatedUserResource($payload['user']),
            'token_type' => $payload['token_type'],
            'expires_at' => $payload['expires_at'],
            'dashboard_route' => $payload['dashboard_route'],
        ], 201)->cookie($this->authService->cookie($payload['token']));
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $payload = $this->authService->login($request->validated());
        } catch (UnauthorizedHttpException) {
            return $this->errorResponse('Invalid email or password.', [], 401)->cookie($this->authService->forgetCookie());
        }

        return $this->successResponse('Login successful.', [
            'user' => new AuthenticatedUserResource($payload['user']),
            'token_type' => $payload['token_type'],
            'expires_at' => $payload['expires_at'],
            'dashboard_route' => $payload['dashboard_route'],
        ])->cookie($this->authService->cookie($payload['token']));
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->successResponse('Logout successful.')->cookie($this->authService->forgetCookie());
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
