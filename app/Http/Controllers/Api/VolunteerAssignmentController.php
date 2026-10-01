<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Volunteer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VolunteerAssignmentController extends Controller
{
    private const STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

    private const WITH = ['volunteer.user', 'incident', 'assigner'];

    public function index(): JsonResponse
    {
        $assignments = Assignment::query()
            ->with(self::WITH)
            ->whereIn('volunteer_id', $this->ownVolunteerIds())
            ->latest()
            ->get();

        return $this->successResponse('Volunteer assignments retrieved successfully.', [
            'assignments' => $assignments,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', self::STATUSES)],
        ]);

        try {
            $assignment = Assignment::query()
                ->whereKey($id)
                ->whereIn('volunteer_id', $this->ownVolunteerIds())
                ->firstOrFail();
        } catch (ModelNotFoundException) {
            return $this->errorResponse('Assignment not found.', [], 404);
        }

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'accepted') {
            // Boolean literals (not PHP bools): the Postgres connection used
            // here rejects integer-bound booleans (SQLSTATE 42804), while
            // TRUE/FALSE literals work on both Postgres and SQLite.
            $data['accepted'] = DB::raw('TRUE');
        }

        $assignment->update($data);

        return $this->successResponse('Assignment status updated successfully.', [
            'assignment' => $assignment->fresh(self::WITH),
        ]);
    }

    private function ownVolunteerIds(): array
    {
        return Volunteer::query()->where('user_id', auth('api')->id())->pluck('id')->all();
    }
}
