<?php

namespace App\Services;

use App\Models\ReliefDistribution;
use Illuminate\Support\Facades\DB;

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

    public function getStatistics()
    {
        // 1. INNER JOIN: Show each relief distribution together with its relief center name.
        $distributionsWithCenter = DB::select("
            SELECT d.id, d.relief_type, d.quantity, d.distribution_date, c.name as center_name
            FROM relief_distributions d
            INNER JOIN relief_centers c ON d.relief_center_id = c.id
            ORDER BY d.distribution_date DESC
        ");

        // 2. LEFT JOIN + COUNT: Show every relief center and the number of distributions.
        // A relief center with zero distributions will also appear.
        $centerDistributionCounts = DB::select("
            SELECT c.name as center_name, COUNT(d.id) as total_distributions
            FROM relief_centers c
            LEFT JOIN relief_distributions d ON c.id = d.relief_center_id
            GROUP BY c.id, c.name
            ORDER BY total_distributions DESC
        ");

        // 3. AGGREGATE FUNCTIONS: Use SQL COUNT() and SUM().
        $totals = DB::select("
            SELECT COUNT(*) as total_distributions, COALESCE(SUM(quantity), 0) as total_quantity
            FROM relief_distributions
        ");
        $totals = $totals[0] ?? ['total_distributions' => 0, 'total_quantity' => 0];

        // 4. GROUP BY: Group distribution quantities by relief center.
        $quantityPerCenter = DB::select("
            SELECT c.name as center_name, COALESCE(SUM(d.quantity), 0) as total_quantity
            FROM relief_distributions d
            INNER JOIN relief_centers c ON d.relief_center_id = c.id
            GROUP BY c.id, c.name
            ORDER BY total_quantity DESC
        ");

        // 5. HAVING: Show only relief centers whose total distributed quantity > 100.
        $highVolumeCenters = DB::select("
            SELECT c.name as center_name, COALESCE(SUM(d.quantity), 0) as total_quantity
            FROM relief_distributions d
            INNER JOIN relief_centers c ON d.relief_center_id = c.id
            GROUP BY c.id, c.name
            HAVING SUM(d.quantity) > 100
            ORDER BY total_quantity DESC
        ");

        // Note on RIGHT JOIN:
        // A RIGHT JOIN (e.g. FROM relief_distributions RIGHT JOIN relief_centers) 
        // achieves the exact same result as the LEFT JOIN above by simply reversing 
        // the table order. It is omitted to avoid redundancy.

        return [
            'distributions_with_center' => $distributionsWithCenter,
            'center_distribution_counts' => $centerDistributionCounts,
            'totals' => $totals,
            'quantity_per_center' => $quantityPerCenter,
            'high_volume_centers' => $highVolumeCenters,
        ];
    }
}