<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        $sql = File::get(database_path('sql/schema/create_active_assignments_view.sql'));
        DB::unprepared($sql);
    }

    public function down(): void
    {
        DB::unprepared('DROP VIEW IF EXISTS active_assignments_view;');
    }
};
