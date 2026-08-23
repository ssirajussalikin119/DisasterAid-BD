<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReliefCenterService;
use Illuminate\Http\Request;

class ReliefCenterController extends Controller
{
    public function __construct(
        protected ReliefCenterService $reliefCenterService
    ) {}

    public function index()
    {
        return response()->json([
            'data' => $this->reliefCenterService->getAll()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:0',
            'contact_number' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
             'latitude' => 'nullable|numeric',
    'longitude' => 'nullable|numeric',
    'available_resources' => 'nullable|string',
        ]);

        return response()->json([
            'data' => $this->reliefCenterService->create($data)
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'data' => $this->reliefCenterService->getById($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'capacity' => 'nullable|integer|min:0',
            'contact_number' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
'longitude' => 'nullable|numeric',
'available_resources' => 'nullable|string',
        ]);

        return response()->json([
            'data' => $this->reliefCenterService->update($id, $data)
        ]);
    }

    public function destroy($id)
    {
        $this->reliefCenterService->delete($id);

        return response()->json([
            'message' => 'Relief center deleted successfully'
        ]);
    }
}