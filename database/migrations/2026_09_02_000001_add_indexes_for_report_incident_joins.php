<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        // Raw SQL for creating indexes on frequently joined and queried columns
        DB::statement('CREATE INDEX IF NOT EXISTS reports_user_id_idx ON reports (user_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS reports_incident_id_idx ON reports (incident_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status)');
        DB::statement('CREATE INDEX IF NOT EXISTS reports_severity_idx ON reports (severity)');

        DB::statement('CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents (status)');
        DB::statement('CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents (severity)');
        DB::statement('CREATE INDEX IF NOT EXISTS incidents_district_idx ON incidents (district)');
    }

    public function down(): void
    {
        // Raw SQL for dropping indexes
        DB::statement('DROP INDEX IF EXISTS reports_user_id_idx');
        DB::statement('DROP INDEX IF EXISTS reports_incident_id_idx');
        DB::statement('DROP INDEX IF EXISTS reports_status_idx');
        DB::statement('DROP INDEX IF EXISTS reports_severity_idx');

        DB::statement('DROP INDEX IF EXISTS incidents_status_idx');
        DB::statement('DROP INDEX IF EXISTS incidents_severity_idx');
        DB::statement('DROP INDEX IF EXISTS incidents_district_idx');
    }
};
