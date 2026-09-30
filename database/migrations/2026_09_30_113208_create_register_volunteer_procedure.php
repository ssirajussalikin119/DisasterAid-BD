<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        $sql = File::get(database_path('sql/schema/create_register_volunteer_procedure.sql'));
        DB::unprepared($sql);
    }

    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS register_volunteer_proc;');
    }
};
