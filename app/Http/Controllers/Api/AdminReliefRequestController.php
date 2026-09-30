<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use App\Models\ReliefRequest;

class AdminReliefRequestController extends Controller
{
    public function innerJoin(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/inner_join.sql')))]);
    }
    public function leftJoin(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/left_join.sql')))]);
    }
    public function rightJoin(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/right_join.sql')))]);
    }
    public function fullOuterJoin(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/full_outer_join.sql')))]);
    }
    public function exceptQuery(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/except.sql')))]);
    }
    public function intersectQuery(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/intersect.sql')))]);
    }
    public function unionQuery(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/union.sql')))]);
    }
    public function aggregate(): JsonResponse {
        return response()->json(['data' => DB::select(File::get(base_path('database/sql/relief_management/aggregate.sql')))]);
    }

    public function index(): JsonResponse {
        $requests = ReliefRequest::with('user', 'incident', 'items')->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $requests]);
    }

    public function updateStatus(Request $request, $id): JsonResponse {
        $validated = $request->validate(['status' => 'required|in:pending,approved,fulfilled,rejected']);
        $req = ReliefRequest::findOrFail($id);
        $req->update($validated);
        return response()->json(['message' => 'Status updated.', 'data' => $req]);
    }
}
