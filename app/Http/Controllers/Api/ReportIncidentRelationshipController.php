<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportIncidentRelationshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportIncidentRelationshipController extends Controller
{
    public function __construct(
        private readonly ReportIncidentRelationshipService $relationshipService
    ) {
    }

    /**
     * Unified query endpoint supporting ?mode=inner|left|right|full.
     */
    public function index(Request $request): JsonResponse
    {
        $mode = $request->query('mode', 'full');
        $filters = $request->only(['severity', 'status', 'district', 'search']);

        $data = match ($mode) {
            'inner', 'reports-with-reporters' => $this->relationshipService->getReportsWithReporters($filters),
            'left', 'reports-with-incidents' => $this->relationshipService->getReportsWithIncidents($filters),
            'right', 'incident-wise' => $this->relationshipService->getIncidentWiseReports($filters),
            default => $this->relationshipService->getCompleteRelationships($filters),
        };

        return $this->successResponse('Report-to-incident relationships retrieved successfully.', [
            'mode' => $mode,
            'summary' => $this->relationshipService->getSummaryMetrics(),
            'relationships' => $data,
        ]);
    }

    /**
     * Specific Endpoint 1: Reports + Reporter info using raw SQL INNER JOIN.
     */
    public function reportsWithReporters(Request $request): JsonResponse
    {
        $data = $this->relationshipService->getReportsWithReporters($request->all());

        return $this->successResponse('Reports with reporter information retrieved successfully (INNER JOIN).', [
            'mode' => 'inner_join',
            'count' => count($data),
            'reports' => $data,
        ]);
    }

    /**
     * Specific Endpoint 2: Reports with optional incident info using raw SQL LEFT JOIN.
     */
    public function reportsWithIncidents(Request $request): JsonResponse
    {
        $data = $this->relationshipService->getReportsWithIncidents($request->all());

        return $this->successResponse('Reports with incident information retrieved successfully (LEFT JOIN).', [
            'mode' => 'left_join',
            'count' => count($data),
            'reports' => $data,
        ]);
    }

    /**
     * Specific Endpoint 3: Incident-wise reports using raw SQL RIGHT JOIN.
     */
    public function incidentWiseReports(Request $request): JsonResponse
    {
        $data = $this->relationshipService->getIncidentWiseReports($request->all());

        return $this->successResponse('Incident-wise reports retrieved successfully (RIGHT JOIN).', [
            'mode' => 'right_join',
            'count' => count($data),
            'incidents' => $data,
        ]);
    }

    /**
     * Specific Endpoint 4: Complete incident/report relationship using raw SQL FULL OUTER JOIN.
     */
    public function complete(Request $request): JsonResponse
    {
        $data = $this->relationshipService->getCompleteRelationships($request->all());

        return $this->successResponse('Complete report-incident relationships retrieved successfully (FULL OUTER JOIN).', [
            'mode' => 'full_outer_join',
            'count' => count($data),
            'relationships' => $data,
        ]);
    }

    /**
     * Relationship summary KPI metrics.
     */
    public function summary(): JsonResponse
    {
        return $this->successResponse('Relationship summary metrics retrieved successfully.', [
            'summary' => $this->relationshipService->getSummaryMetrics(),
        ]);
    }
}
