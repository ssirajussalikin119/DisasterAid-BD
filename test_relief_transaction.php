<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ReliefCenter;
use App\Models\ReliefDistribution;
use App\Services\ReliefDistributionService;

echo "--- RELIEF DISTRIBUTION TRANSACTION TEST ---\n\n";

try {
    // 1. Create a temporary Relief Center
    echo "1. Creating temporary Relief Center (Capacity: 100)...\n";
    $center = ReliefCenter::create([
        'name' => 'Test Transaction Center ' . time(),
        'address' => 'Dhaka, Bangladesh',
        'capacity' => 100,
        'contact_number' => '01711000000',
        'status' => 'active'
    ]);
    
    $service = new ReliefDistributionService();

    // 2. Test Successful Distribution
    echo "\n2. Testing Successful Distribution (Quantity: 30)...\n";
    $distribution1 = $service->create([
        'relief_center_id' => $center->id,
        'relief_type' => 'Rice',
        'quantity' => 30,
        'distribution_date' => now()->toDateString(),
        'description' => 'First distribution'
    ]);
    
    $center->refresh();
    echo "   Success! Distribution created. ID: {$distribution1->id}\n";
    echo "   Center capacity updated to: {$center->capacity} (Expected: 70)\n";

    // 3. Test Failure Case (Insufficient Capacity)
    echo "\n3. Testing Failure Case (Quantity: 100) on remaining capacity of 70...\n";
    try {
        $service->create([
            'relief_center_id' => $center->id,
            'relief_type' => 'Water',
            'quantity' => 100, // Exceeds 70
            'distribution_date' => now()->toDateString(),
            'description' => 'This should fail and rollback'
        ]);
    } catch (\InvalidArgumentException $e) {
        echo "   Exception caught successfully: " . $e->getMessage() . "\n";
    }

    // 4. Verify Rollback
    echo "\n4. Verifying Rollback Results...\n";
    $center->refresh();
    $distributionCount = ReliefDistribution::where('relief_center_id', $center->id)->count();
    
    echo "   Center capacity remains: {$center->capacity} (Expected: 70)\n";
    echo "   Total distributions for this center: {$distributionCount} (Expected: 1)\n";
    if ($center->capacity === 70 && $distributionCount === 1) {
        echo "   -> ROLLBACK SUCCESSFUL. No partial data was saved.\n";
    } else {
        echo "   -> ROLLBACK FAILED. Partial data exists!\n";
    }

    // 5. Cleanup
    echo "\n5. Cleaning up temporary test data...\n";
    $distribution1->delete();
    $center->delete();
    echo "   Cleanup completed.\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
