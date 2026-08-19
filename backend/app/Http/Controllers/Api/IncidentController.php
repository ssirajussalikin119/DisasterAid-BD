<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IncidentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function __construct(private readonly IncidentService $incidentService)
    {
    }

    public function index(): JsonResponse
    {
        return $this->successResponse('Incidents retrieved successfully.', [
            'incidents' => $this->incidentService->getAll(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $incident = $this->incidentService->create($request->validate($this->rules()));

        return $this->successResponse('Incident created successfully.', ['incident' => $incident], 201);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $incident = $this->incidentService->getById($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident retrieved successfully.', ['incident' => $incident]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $incident = $this->incidentService->update($id, $request->validate($this->rules()));
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident updated successfully.', ['incident' => $incident]);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->incidentService->delete($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident deleted successfully.');
    }

    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:120'],
            'status' => ['sometimes', 'string', 'in:active,monitoring,resolved'],
            'severity' => ['sometimes', 'string', 'in:low,medium,high,critical'],
            'verified' => ['sometimes', 'boolean'],
        ];
    }
}