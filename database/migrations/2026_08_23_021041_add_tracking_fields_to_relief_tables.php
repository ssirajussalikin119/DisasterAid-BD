<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        DB::statement('ALTER TABLE relief_centers ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION NULL');
        DB::statement('ALTER TABLE relief_centers ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION NULL');
        DB::statement('ALTER TABLE relief_centers ADD COLUMN IF NOT EXISTS available_resources TEXT NULL');

        DB::statement('ALTER TABLE relief_distributions ADD COLUMN IF NOT EXISTS recipient VARCHAR(255) NULL');
        DB::statement('ALTER TABLE relief_distributions ADD COLUMN IF NOT EXISTS report_reference VARCHAR(255) NULL');
        DB::statement('ALTER TABLE relief_distributions ADD COLUMN IF NOT EXISTS distributed_by BIGINT NULL');
        DB::statement('ALTER TABLE relief_distributions ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMP NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS distributed_at');
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS distributed_by');
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS report_reference');
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS recipient');
        DB::statement('ALTER TABLE relief_centers DROP COLUMN IF EXISTS available_resources');
        DB::statement('ALTER TABLE relief_centers DROP COLUMN IF EXISTS longitude');
        DB::statement('ALTER TABLE relief_centers DROP COLUMN IF EXISTS latitude');
    }
};
