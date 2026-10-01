<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Volunteer;
use App\Models\Incident;
use App\Services\AssignmentService;

echo "--- DB CONCEPTS TEST SCRIPT ---\n\n";

try {
    // 1. Run Migrations programmatically
    echo "1. Running migrations...\n";
    \Illuminate\Support\Facades\Artisan::call('migrate');
    echo \Illuminate\Support\Facades\Artisan::output();
    
    // Create temporary test data without using Factories
    echo "\n-> Creating temporary test User and Incident...\n";
    $testTimestamp = time();
    $user = User::create([
        'name' => 'Test Volunteer ' . $testTimestamp,
        'email' => 'testvol' . $testTimestamp . '@example.com',
        'phone' => '017' . rand(10000000, 99999999),
        'password' => bcrypt('password'),
        'role' => 'volunteer',
        'role_status' => 'active'
    ]);

    $incident = Incident::create([
        'title' => 'Test Flood ' . $testTimestamp,
        'district' => 'Dhaka',
        'status' => 'active',
        'severity' => 'medium'
    ]);

    // Set authenticated user so auth('api')->id() works in AssignmentService
    auth('api')->setUser($user);

    // 2. Test Stored Procedure
    echo "\n2. Testing Stored Procedure (Register Volunteer)...\n";
    $skills = json_encode(['first aid', 'search & rescue']);
    DB::statement("CALL register_volunteer_proc(?, ?, ?, ?, ?, ?, ?)", [
        $user->id, $skills, 'available', 'Dhaka', 23.8103, 90.4125, 5.0
    ]);
    
    $volunteer = Volunteer::where('user_id', $user->id)->first();
    echo "   Volunteer created via procedure: ID {$volunteer->id}, Availability: {$volunteer->availability}\n";

    // 3. Test Transaction (Normal)
    echo "\n3. Testing Normal Transaction...\n";
    $assignmentService = new AssignmentService();
    
    $assignment = $assignmentService->create([
        'volunteer_id' => $volunteer->id,
        'incident_id' => $incident->id,
        'status' => 'pending'
    ]);
    $volunteer->refresh();
    echo "   Assignment created successfully! ID: {$assignment->id}\n";
    echo "   Volunteer availability updated to: {$volunteer->availability} (Should be busy)\n";

    // 4. Test View
    echo "\n4. Testing View (active_assignments_view)...\n";
    // First need to set status to in_progress to appear in view
    $assignment->update(['status' => 'in_progress']);
    
    $viewData = DB::select("SELECT * FROM active_assignments_view WHERE assignment_id = ?", [$assignment->id]);
    if (count($viewData) > 0) {
        echo "   View fetched data successfully! Volunteer Name: {$viewData[0]->volunteer_name}, Incident: {$viewData[0]->incident_title}\n";
    }

    // 5. Test Trigger
    echo "\n5. Testing Trigger...\n";
    $assignment->update(['status' => 'completed']);
    $volunteer->refresh();
    echo "   Assignment status set to 'completed'.\n";
    echo "   Volunteer availability auto-updated by Trigger to: {$volunteer->availability} (Should be available)\n";

    // 6. Test Rollback
    echo "\n6. Testing Rollback with Controlled Failure...\n";
    // We will pass an invalid incident_id to force an error during Assignment::create() inside the transaction
    try {
        $assignmentService->create([
            'volunteer_id' => $volunteer->id,
            'incident_id' => 9999999, // Invalid
            'status' => 'pending'
        ]);
    } catch (\Exception $e) {
        echo "   Exception caught as expected: " . $e->getMessage() . "\n";
    }
    // Check if volunteer status changed
    $volunteer->refresh();
    echo "   Volunteer availability after rollback: {$volunteer->availability} (Should STILL be available)\n";
    
    // 7. Cleanup
    echo "\n7. Cleaning up temporary test data...\n";
    $assignment->delete();
    $volunteer->delete();
    $incident->delete();
    $user->delete();
    echo "   Cleanup completed. No test data remains in the database.\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
