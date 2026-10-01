<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL-only object: skip on other drivers (e.g. sqlite in tests).
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        $sql = File::get(database_path('sql/schema/create_assignment_status_trigger.sql'));
        DB::unprepared($sql);
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trigger_assignment_status_update ON assignments;');
        DB::unprepared('DROP FUNCTION IF EXISTS trigger_update_volunteer_availability();');
    }
};
