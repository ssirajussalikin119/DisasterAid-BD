<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Volunteer;
use Illuminate\Database\Eloquent\Collection;

class VolunteerService
{
    public function getAll(): Collection
    {
        return Volunteer::query()->with('user')->latest()->get();
    }

    public function create(array $data): Volunteer
    {
        $data['user_id'] = auth('api')->id();

        return Volunteer::updateOrCreate(['user_id' => $data['user_id']], $data)->load('user');
    }

    public function getById(int $id): Volunteer
    {
        return Volunteer::query()->with('user')->findOrFail($id);
    }

    public function update(int $id, array $data): Volunteer
    {
        $volunteer = Volunteer::findOrFail($id);
        $volunteer->update($data);

        return $volunteer->fresh('user');
    }

    public function delete(int $id): void
    {
        Volunteer::findOrFail($id)->delete();
    }
}