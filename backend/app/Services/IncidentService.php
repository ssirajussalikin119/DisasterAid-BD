<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Incident;

class IncidentService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Incident::query()->with('creator')->withCount('reports')->latest()->get();
    }

    public function create(array $data): Incident
    {
        $data['created_by'] = auth('api')->id();

        return Incident::create($data)->load('creator');
    }

    public function getById(int $id): Incident
    {
        return Incident::query()->with(['creator', 'reports'])->findOrFail($id);
    }

    public function update(int $id, array $data): Incident
    {
        $incident = Incident::findOrFail($id);
        $incident->update($data);

        return $incident->fresh(['creator'])->loadCount('reports');
    }

    public function delete(int $id): void
    {
        Incident::findOrFail($id)->delete();
    }
}