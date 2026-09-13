<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ResponseNetworkController extends Controller
{
    public function allMembers(): JsonResponse
    {
        try {
            $sql = File::get(base_path('database/sql/network/union_response_members.sql'));
            $results = DB::select($sql);
            return response()->json(['data' => $results]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load response network members.', 'message' => $e->getMessage()], 500);
        }
    }

    public function assignedVolunteers(): JsonResponse
    {
        try {
            $sql = File::get(base_path('database/sql/network/intersect_assigned_volunteers.sql'));
            $results = DB::select($sql);
            return response()->json(['data' => $results]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load assigned volunteers.', 'message' => $e->getMessage()], 500);
        }
    }

    public function availableVolunteers(): JsonResponse
    {
        try {
            $sql = File::get(base_path('database/sql/network/except_available_volunteers.sql'));
            $results = DB::select($sql);
            return response()->json(['data' => $results]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load available volunteers.', 'message' => $e->getMessage()], 500);
        }
    }
}
