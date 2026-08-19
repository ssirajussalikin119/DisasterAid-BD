<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AssignmentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function __construct(private readonly AssignmentService $assignmentService)
    {
    }

    public function index(): JsonResponse
    {
        return $this->successResponse('Assignments retrieved successfully.', [
            'assignments' => $this->assignmentService->getAll(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $assignment = $this->assignmentService->create($request->validate($this->rules()));

        return $this->successResponse('Assignment created successfully.', ['assignment' => $assignment], 201);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->getById($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Assignment not found.', [], 404);
        }

        return $this->successResponse('Assignment retrieved successfully.', ['assignment' => $assignment]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->update($id, $request->validate($this->rules(true)));
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Assignment not found.', [], 404);
        }

        return $this->successResponse('Assignment updated successfully.', ['assignment' => $assignment]);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assignmentService->delete($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Assignment not found.', [], 404);
        }

        return $this->successResponse('Assignment deleted successfully.');
    }

    private function rules(bool $update = false): array
    {
        return [
            'volunteer_id' => [$update ? 'sometimes' : 'required', 'integer', 'exists:volunteers,id'],
            'incident_id' => [$update ? 'sometimes' : 'required', 'integer', 'exists:incidents,id'],
            'accepted' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'string', 'in:pending,accepted,in_progress,completed,cancelled'],
        ];
    }
}