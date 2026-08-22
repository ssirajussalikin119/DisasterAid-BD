<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function index(): JsonResponse
    {
        return $this->successResponse('Reports retrieved successfully.', [
            'reports' => $this->reportService->getAllReports(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $report = $this->reportService->createReport($request->validate($this->validationRules()));

        return $this->successResponse('Report created successfully.', [
            'report' => $report,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        try {
            $report = $this->reportService->getReportById($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Report not found.', [], 404);
        }

        return $this->successResponse('Report retrieved successfully.', [
            'report' => $report,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $report = $this->reportService->updateReport($id, $request->validate($this->validationRules()));
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Report not found.', [], 404);
        }

        return $this->successResponse('Report updated successfully.', [
            'report' => $report,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        try {
            $this->reportService->deleteReport($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Report not found.', [], 404);
        }

        return $this->successResponse('Report deleted successfully.');
    }

    private function validationRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'incident_id' => 'nullable|integer|exists:incidents,id',
            'status' => 'nullable|string|max:255',
            'severity' => 'nullable|string|max:255',
        ];
    }
}
