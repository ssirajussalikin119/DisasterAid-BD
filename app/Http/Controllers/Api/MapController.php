<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MapController extends Controller
{
    public function __construct(private readonly MapService $mapService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'severity' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'status' => ['nullable', 'string', 'in:active,monitoring,resolved'],
        ]);

        $data = $this->mapService->getMapData(
            $validated['severity'] ?? null,
            $validated['status'] ?? null,
        );

        return $this->successResponse('Map data retrieved successfully.', $data);
    }
}
