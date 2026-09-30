<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminIncidentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class AdminIncidentController extends Controller
{
    public function __construct(private readonly AdminIncidentService $adminIncidentService)
    {
    }

    public function index(): JsonResponse
    {
        return $this->successResponse('Admin incidents retrieved successfully.', [
            'incidents' => $this->adminIncidentService->getAllIncidents(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $incident = $this->adminIncidentService->getIncidentDetails($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident details retrieved.', [
            'incident' => $incident,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:120'],
            'status' => ['sometimes', 'string', 'in:active,monitoring,resolved'],
            'severity' => ['sometimes', 'string', 'in:low,medium,high,critical'],
            'verified' => ['sometimes', 'boolean'],
        ]);

        $incident = $this->adminIncidentService->createIncident($validated, auth('api')->id());

        return $this->successResponse('Incident created successfully.', ['incident' => $incident], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:120'],
            'status' => ['required', 'string', 'in:active,monitoring,resolved'],
            'severity' => ['required', 'string', 'in:low,medium,high,critical'],
            'verified' => ['sometimes', 'boolean'],
        ]);

        try {
            $incident = $this->adminIncidentService->updateIncident($id, $validated);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident updated successfully.', ['incident' => $incident]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,monitoring,resolved'],
        ]);

        try {
            $incident = $this->adminIncidentService->updateStatus($id, $validated['status']);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident status updated.', ['incident' => $incident]);
    }

    public function close(int $id): JsonResponse
    {
        try {
            $incident = $this->adminIncidentService->closeIncident($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        }

        return $this->successResponse('Incident closed/resolved.', ['incident' => $incident]);
    }

    public function finalize(int $id): JsonResponse
    {
        try {
            DB::statement('CALL finalize_incident(?, ?)', [$id, auth('api')->id() ?? 0]);
            
            // Re-fetch the updated incident to return
            $incident = $this->adminIncidentService->getIncidentDetails($id);
            
            return $this->successResponse('Incident finalized successfully.', ['incident' => $incident]);
        } catch (QueryException $e) {
            $message = $e->getMessage();
            $cleanMessage = 'Could not finalize incident due to a database error.';
            
            if (str_contains($message, 'has uncompleted assignments')) {
                $cleanMessage = 'Cannot finalize: There are uncompleted assignments for this incident.';
            } elseif (str_contains($message, 'is already resolved')) {
                $cleanMessage = 'Cannot finalize: Incident is already resolved.';
            } elseif (str_contains($message, 'does not exist')) {
                $cleanMessage = 'Cannot finalize: Incident does not exist.';
            }

            return $this->errorResponse($cleanMessage, [], 422);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Incident not found.', [], 404);
        } catch (\Exception $e) {
            return $this->errorResponse('An error occurred during finalization.', [], 500);
        }
    }
}
