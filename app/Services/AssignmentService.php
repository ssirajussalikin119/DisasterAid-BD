<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Assignment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    public function getAll(): Collection
    {
        return Assignment::query()->with(['volunteer.user', 'incident', 'assigner'])->latest()->get();
    }

    public function create(array $data): Assignment
    {
        $data['assigned_by'] = auth('api')->id();

        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $assignment = Assignment::create($data);
            
            // Update volunteer status to 'busy' within the same transaction
            $volunteer = \App\Models\Volunteer::findOrFail($data['volunteer_id']);
            $volunteer->update(['availability' => 'busy']);

            return $assignment->load(['volunteer.user', 'incident', 'assigner']);
        });
    }

    public function getById(int $id): Assignment
    {
        return Assignment::query()->with(['volunteer.user', 'incident', 'assigner'])->findOrFail($id);
    }

    public function update(int $id, array $data): Assignment
    {
        // Boolean literals (not PHP bools): the Postgres connection used
        // here rejects integer-bound booleans (SQLSTATE 42804), while
        // TRUE/FALSE literals work on both Postgres and SQLite.
        if (array_key_exists('accepted', $data) && ! $data['accepted'] instanceof \Illuminate\Database\Query\Expression) {
            $data['accepted'] = DB::raw(filter_var($data['accepted'], FILTER_VALIDATE_BOOLEAN) ? 'TRUE' : 'FALSE');
        }

        $assignment = Assignment::findOrFail($id);
        $assignment->update($data);

        return $assignment->fresh(['volunteer.user', 'incident', 'assigner']);
    }

    public function delete(int $id): void
    {
        Assignment::findOrFail($id)->delete();
    }
}