<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Assignment;
use Illuminate\Database\Eloquent\Collection;

class AssignmentService
{
    public function getAll(): Collection
    {
        return Assignment::query()->with(['volunteer.user', 'incident', 'assigner'])->latest()->get();
    }

    public function create(array $data): Assignment
    {
        $data['assigned_by'] = auth('api')->id();

        return Assignment::create($data)->load(['volunteer.user', 'incident', 'assigner']);
    }

    public function getById(int $id): Assignment
    {
        return Assignment::query()->with(['volunteer.user', 'incident', 'assigner'])->findOrFail($id);
    }

    public function update(int $id, array $data): Assignment
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->update($data);

        return $assignment->fresh(['volunteer.user', 'incident', 'assigner']);
    }

    public function delete(int $id): void
    {
        Assignment::findOrFail($id)->delete();
    }
}