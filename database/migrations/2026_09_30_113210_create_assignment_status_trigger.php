<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        $sql = File::get(database_path('sql/schema/create_assignment_status_trigger.sql'));
        DB::unprepared($sql);
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trigger_assignment_status_update ON assignments;');
        DB::unprepared('DROP FUNCTION IF EXISTS trigger_update_volunteer_availability();');
    }
};
