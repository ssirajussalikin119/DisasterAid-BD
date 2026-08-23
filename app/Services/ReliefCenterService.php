<?php

namespace App\Services;

use App\Models\ReliefCenter;

class ReliefCenterService
{
    public function getAll()
    {
        return ReliefCenter::all();
    }

    public function getById($id)
    {
        return ReliefCenter::findOrFail($id);
    }

    public function create(array $data)
    {
        return ReliefCenter::create($data);
    }

    public function update($id, array $data)
    {
        $reliefCenter = ReliefCenter::findOrFail($id);
        $reliefCenter->update($data);

        return $reliefCenter;
    }

    public function delete($id)
    {
        $reliefCenter = ReliefCenter::findOrFail($id);
        $reliefCenter->delete();

        return true;
    }
}