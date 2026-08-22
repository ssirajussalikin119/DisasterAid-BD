<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\NgoApplicationRequest;
use App\Http\Requests\Auth\ReviewRoleApplicationRequest;
use App\Http\Requests\Auth\VolunteerApplicationRequest;
use App\Http\Resources\Auth\RoleApplicationResource;
use App\Models\RoleApplication;
use App\Services\Auth\AuthService;
use App\Services\Auth\RoleApplicationService;
use Illuminate\Http\JsonResponse;

class RoleApplicationController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly RoleApplicationService $roleApplicationService,
    ) {
    }

    public function storeVolunteer(VolunteerApplicationRequest $request): JsonResponse
    {
        $application = $this->roleApplicationService->apply(
            $this->authService->currentUser(),
            Role::Volunteer,
            $this->roleApplicationService->payloadForVolunteer($request->validated())
        );

        return $this->successResponse('Volunteer application submitted.', [
            'application' => new RoleApplicationResource($application),
        ], 201);
    }

    public function storeNgo(NgoApplicationRequest $request): JsonResponse
    {
        $application = $this->roleApplicationService->apply(
            $this->authService->currentUser(),
            Role::NGO,
            $this->roleApplicationService->payloadForNgo($request->validated())
        );

        return $this->successResponse('NGO application submitted.', [
            'application' => new RoleApplicationResource($application),
        ], 201);
    }

    public function index(): JsonResponse
    {
        $applications = RoleApplication::query()
            ->latest()
            ->paginate(20);

        return $this->successResponse('Role applications retrieved.', [
            'applications' => RoleApplicationResource::collection($applications),
            'pagination' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function review(ReviewRoleApplicationRequest $request, RoleApplication $roleApplication): JsonResponse
    {
        $application = $this->roleApplicationService->review(
            $roleApplication,
            $request->validated()['decision'],
            $request->validated()['review_notes'] ?? null,
            $this->authService->currentUser()
        );

        return $this->successResponse('Application reviewed.', [
            'application' => new RoleApplicationResource($application),
        ]);
    }
}
