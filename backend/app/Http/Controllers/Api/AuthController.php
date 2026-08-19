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
