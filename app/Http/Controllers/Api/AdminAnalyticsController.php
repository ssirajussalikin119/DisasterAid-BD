<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;

class AdminAnalyticsController extends Controller
{
    public function __construct(private readonly AdminAnalyticsService $analyticsService)
    {
    }

    public function districtSummary(): JsonResponse
    {
        try {
            $districts = $this->analyticsService->getDistrictSummary();
        } catch (\Exception) {
            return $this->errorResponse('Failed to load district disaster summary.', [], 500);
        }

        return $this->successResponse('District disaster summary retrieved successfully.', [
            'districts' => $districts,
            'count' => count($districts),
        ]);
    }

    public function overview(): JsonResponse
    {
        try {
            $overview = $this->analyticsService->getOverview();
        } catch (\Exception) {
            return $this->errorResponse('Failed to load analytics overview.', [], 500);
        }

        return $this->successResponse('Analytics overview retrieved successfully.', $overview);
    }
}
