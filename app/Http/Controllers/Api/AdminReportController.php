<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminReportController extends Controller
{
    public function __construct(
        private readonly AdminReportService $adminReportService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,verified,rejected,closed'],
            'severity' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'search' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $limit = (int) ($validated['limit'] ?? 20);
        $page = (int) ($validated['page'] ?? 1);
        $offset = ($page - 1) * $limit;

        $data = $this->adminReportService->reportList(
            $validated['status'] ?? null,
            $validated['severity'] ?? null,
            $validated['search'] ?? null,
            $limit,
            $offset,
        );

        $overview = $this->adminReportService->overviewStats();

        return $this->successResponse('Reports retrieved successfully.', [
            'reports' => $data,
            'overview' => $overview,
        ]);
    }

    public function detail(int $id): JsonResponse
    {
        $report = $this->adminReportService->reportDetail($id);

        if ($report === null) {
            return $this->errorResponse('Report not found.', [], 404);
        }

        return $this->successResponse('Report details retrieved.', [
            'report' => $report,
        ]);
    }

    public function innerJoin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,verified,rejected,closed'],
            'severity' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $data = $this->adminReportService->innerJoinReportReporter(
            $validated['status'] ?? null,
            $validated['severity'] ?? null,
            $validated['search'] ?? null,
        );

        return $this->successResponse('INNER JOIN: Report + Reporter retrieved.', [
            'mode' => 'inner_join',
            'operation' => 'INNER JOIN reports INNER JOIN users',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function leftJoin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,verified,rejected,closed'],
            'severity' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $data = $this->adminReportService->leftJoinReportIncident(
            $validated['status'] ?? null,
            $validated['severity'] ?? null,
            $validated['search'] ?? null,
        );

        return $this->successResponse('LEFT JOIN: Report + Incident retrieved.', [
            'mode' => 'left_join',
            'operation' => 'LEFT JOIN reports LEFT JOIN incidents',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function statistics(): JsonResponse
    {
        $data = $this->adminReportService->reportStatistics();
        $overview = $this->adminReportService->overviewStats();

        return $this->successResponse('Report statistics retrieved.', [
            'overview' => $overview,
            'grouped' => $data,
        ]);
    }

    public function recentFiltered(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,verified,rejected,closed'],
            'severity' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $limit = (int) ($validated['limit'] ?? 20);
        $page = (int) ($validated['page'] ?? 1);
        $offset = ($page - 1) * $limit;

        $data = $this->adminReportService->recentFilteredReports(
            $validated['status'] ?? null,
            $validated['severity'] ?? null,
            $limit,
            $offset,
        );

        return $this->successResponse('Recent/filtered reports retrieved.', [
            'mode' => 'filtered',
            'operation' => 'WHERE/ORDER BY filtered reports',
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function verify(int $id): JsonResponse
    {
        try {
            $report = $this->adminReportService->verifyReport($id);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        }

        return $this->successResponse('Report verified successfully.', [
            'report' => $report,
        ]);
    }

    public function reject(int $id): JsonResponse
    {
        try {
            $report = $this->adminReportService->rejectReport($id);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        }

        return $this->successResponse('Report rejected successfully.', [
            'report' => $report,
        ]);
    }

    public function close(int $id): JsonResponse
    {
        try {
            $report = $this->adminReportService->closeReport($id);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        }

        return $this->successResponse('Report closed successfully.', [
            'report' => $report,
        ]);
    }
}
