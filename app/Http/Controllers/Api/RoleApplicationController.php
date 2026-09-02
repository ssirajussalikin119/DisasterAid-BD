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
use App\Services\AdminApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoleApplicationController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly RoleApplicationService $roleApplicationService,
        private readonly AdminApplicationService $adminApplicationService,
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

    public function adminApplications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'in:volunteer,ngo'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
        ]);

        return $this->successResponse('Applications retrieved successfully.', $this->adminApplicationService->queue(
            $validated['search'] ?? null,
            $validated['type'] ?? null,
            $validated['status'] ?? null,
        ));
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        return $this->adminReview($request, $id, 'approved');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        return $this->adminReview($request, $id, 'rejected');
    }

    public function innerJoin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'in:volunteer,ngo'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
        ]);

        $data = $this->adminApplicationService->innerJoinApplicationApplicant(
            $validated['search'] ?? null,
            $validated['type'] ?? null,
            $validated['status'] ?? null,
        );

        return $this->successResponse('INNER JOIN: Application + Applicant retrieved.', [
            'mode' => 'inner_join',
            'operation' => 'INNER JOIN role_applications INNER JOIN users',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function leftJoin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'in:volunteer,ngo'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
        ]);

        $data = $this->adminApplicationService->leftJoinApplicationReviewer(
            $validated['search'] ?? null,
            $validated['type'] ?? null,
            $validated['status'] ?? null,
        );

        return $this->successResponse('LEFT JOIN: Application + Reviewer retrieved.', [
            'mode' => 'left_join',
            'operation' => 'LEFT JOIN users (reviewer)',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function unionQueue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
        ]);

        $data = $this->adminApplicationService->unionApplicationQueue(
            $validated['search'] ?? null,
            null,
            $validated['status'] ?? null,
        );

        return $this->successResponse('UNION: Combined Volunteer + NGO queue retrieved.', [
            'mode' => 'union',
            'operation' => 'UNION (volunteer applications UNION ngo applications)',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function intersectApproved(): JsonResponse
    {
        $data = $this->adminApplicationService->intersectApprovedVolunteers();

        return $this->successResponse('INTERSECT: Approved volunteers with volunteer records.', [
            'mode' => 'intersect',
            'operation' => 'INTERSECT (approved volunteer applications INTERSECT volunteers)',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function statistics(): JsonResponse
    {
        $data = $this->adminApplicationService->applicationStatistics();
        $overview = $this->adminApplicationService->overviewStats();

        return $this->successResponse('Application statistics retrieved.', [
            'overview' => $overview,
            'grouped' => $data,
        ]);
    }

    public function recentFiltered(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
            'type' => ['nullable', 'string', 'in:volunteer,ngo'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $limit = (int) ($validated['limit'] ?? 20);
        $page = (int) ($validated['page'] ?? 1);
        $offset = ($page - 1) * $limit;

        $data = $this->adminApplicationService->recentFilteredApplications(
            $validated['status'] ?? null,
            $validated['type'] ?? null,
            $limit,
            $offset,
        );

        return $this->successResponse('Recent/filtered applications retrieved.', [
            'mode' => 'filtered',
            'operation' => 'WHERE/ORDER BY filtered applications',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function detail(int $id): JsonResponse
    {
        $application = $this->adminApplicationService->applicationDetail($id);

        if ($application === null) {
            return $this->errorResponse('Application not found.', [], 404);
        }

        return $this->successResponse('Application details retrieved.', [
            'application' => $application,
        ]);
    }

    private function adminReview(Request $request, int $id, string $decision): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $application = $this->adminApplicationService->review(
                $id,
                (int) $this->authService->currentUser()->id,
                $decision,
                $validated['review_notes'] ?? null,
            );
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Application not found.', [], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        }

        return $this->successResponse('Application '.$decision.' successfully.', [
            'application' => $application,
        ]);
    }
}
