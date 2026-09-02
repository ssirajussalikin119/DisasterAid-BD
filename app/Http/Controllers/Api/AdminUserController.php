<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminUserService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(private readonly AdminUserService $adminUserService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'in:citizen,volunteer,doctor,ngo,admin'],
            'status' => ['nullable', 'string', 'in:active,inactive,suspended'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return $this->successResponse('Users retrieved successfully.', [
            'users' => $this->adminUserService->list(
                $validated['search'] ?? null,
                $validated['role'] ?? null,
                $validated['status'] ?? null,
                (int) ($validated['page'] ?? 1),
                (int) ($validated['per_page'] ?? 20)
            ),
            'users_with_reports' => $this->adminUserService->usersWithReports(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse('User details retrieved successfully.', $this->adminUserService->details($id));
        } catch (ModelNotFoundException) {
            return $this->errorResponse('User not found.', [], 404);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email,'.$id],
            'phone' => ['required', 'string', 'max:20', 'regex:/^\+?[0-9]{10,15}$/', 'unique:users,phone,'.$id],
        ]);

        try {
            return $this->successResponse('User updated successfully.', ['user' => $this->adminUserService->update($id, $validated)]);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('User not found.', [], 404);
        }
    }

    public function activate(int $id): JsonResponse
    {
        try {
            return $this->successResponse('User activated successfully.', ['user' => $this->adminUserService->changeStatus($id, (int) auth('api')->id(), true)]);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('User not found or already active.', [], 404);
        }
    }

    public function suspend(int $id): JsonResponse
    {
        try {
            return $this->successResponse('User suspended successfully.', ['user' => $this->adminUserService->changeStatus($id, (int) auth('api')->id(), false)]);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('User not found or already inactive.', [], 404);
        } catch (\InvalidArgumentException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }
    }
}