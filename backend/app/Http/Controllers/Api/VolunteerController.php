<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VolunteerService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function __construct(private readonly VolunteerService $volunteerService)
    {
    }

    public function index(): JsonResponse
    {
        return $this->successResponse('Volunteers retrieved successfully.', [
            'volunteers' => $this->volunteerService->getAll(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $volunteer = $this->volunteerService->create($request->validate($this->rules()));

        return $this->successResponse('Volunteer profile saved successfully.', ['volunteer' => $volunteer], 201);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $volunteer = $this->volunteerService->getById($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Volunteer not found.', [], 404);
        }

        return $this->successResponse('Volunteer retrieved successfully.', ['volunteer' => $volunteer]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $volunteer = $this->volunteerService->update($id, $request->validate($this->rules()));
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Volunteer not found.', [], 404);
        }

        return $this->successResponse('Volunteer updated successfully.', ['volunteer' => $volunteer]);
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->volunteerService->delete($id);
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Volunteer not found.', [], 404);
        }

        return $this->successResponse('Volunteer deleted successfully.');
    }

    private function rules(): array
    {
        return [
            'skills' => ['required', 'array', 'min:1'],
            'skills.*' => ['string', 'max:80'],
            'availability' => ['required', 'string', 'in:available,busy,unavailable'],
            'current_location' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
        ];
    }
}