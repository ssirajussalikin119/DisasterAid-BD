<?php

namespace App\Services;

use App\Models\ReliefDistribution;

class ReliefDistributionService
{
    public function getAll()
    {
        return ReliefDistribution::with('reliefCenter')->get();
    }

    public function getById($id)
    {
        return ReliefDistribution::with('reliefCenter')->findOrFail($id);
    }

    public function create(array $data)
    {
        return ReliefDistribution::create($data);
    }

    public function update($id, array $data)
    {
        $distribution = ReliefDistribution::findOrFail($id);
        $distribution->update($data);

        return $distribution;
    }

    public function delete($id)
    {
        $distribution = ReliefDistribution::findOrFail($id);
        $distribution->delete();

        return true;
    }
}