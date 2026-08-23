<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReliefDistributionService;
use Illuminate\Http\Request;

class ReliefDistributionController extends Controller
{
    public function __construct(
        protected ReliefDistributionService $reliefDistributionService
    ) {}

    public function index()
    {
        return response()->json([
            'data' => $this->reliefDistributionService->getAll()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'relief_center_id' => 'required|exists:relief_centers,id',
            'relief_type' => 'required|string|max:100',
            'quantity' => 'required|integer|min:1',
            'distribution_date' => 'required|date',
            'description' => 'nullable|string',
            'recipient' => 'nullable|string|max:255',
'report_reference' => 'nullable|string|max:255',
'distributed_by' => 'nullable|integer',
'distributed_at' => 'nullable|date',
        ]);

        return response()->json([
            'data' => $this->reliefDistributionService->create($data)
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'data' => $this->reliefDistributionService->getById($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'relief_center_id' => 'sometimes|required|exists:relief_centers,id',
            'relief_type' => 'sometimes|required|string|max:100',
            'quantity' => 'sometimes|required|integer|min:1',
            'distribution_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'recipient' => 'nullable|string|max:255',
'report_reference' => 'nullable|string|max:255',
'distributed_by' => 'nullable|integer',
'distributed_at' => 'nullable|date',
        ]);

        return response()->json([
            'data' => $this->reliefDistributionService->update($id, $data)
        ]);
    }

    public function destroy($id)
    {
        $this->reliefDistributionService->delete($id);

        return response()->json([
            'message' => 'Relief distribution deleted successfully'
        ]);
    }
}