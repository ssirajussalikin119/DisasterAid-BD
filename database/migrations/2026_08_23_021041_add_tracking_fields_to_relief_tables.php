<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->addColumnsPortably();

            return;
        }

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
        if (DB::getDriverName() !== 'pgsql') {
            Schema::table('relief_distributions', function (Blueprint $table): void {
                $table->dropColumn(['distributed_at', 'distributed_by', 'report_reference', 'recipient']);
            });
            Schema::table('relief_centers', function (Blueprint $table): void {
                $table->dropColumn(['available_resources', 'longitude', 'latitude']);
            });

            return;
        }

        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS distributed_at');
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS distributed_by');
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS report_reference');
        DB::statement('ALTER TABLE relief_distributions DROP COLUMN IF EXISTS recipient');
        DB::statement('ALTER TABLE relief_centers DROP COLUMN IF EXISTS available_resources');
        DB::statement('ALTER TABLE relief_centers DROP COLUMN IF EXISTS longitude');
        DB::statement('ALTER TABLE relief_centers DROP COLUMN IF EXISTS latitude');
    }

    /**
     * Portable alternative to PostgreSQL-only "ALTER TABLE ... ADD COLUMN IF NOT EXISTS".
     */
    private function addColumnsPortably(): void
    {
        if (! Schema::hasColumn('relief_centers', 'latitude')) {
            Schema::table('relief_centers', function (Blueprint $table): void {
                $table->double('latitude')->nullable();
            });
        }
        if (! Schema::hasColumn('relief_centers', 'longitude')) {
            Schema::table('relief_centers', function (Blueprint $table): void {
                $table->double('longitude')->nullable();
            });
        }
        if (! Schema::hasColumn('relief_centers', 'available_resources')) {
            Schema::table('relief_centers', function (Blueprint $table): void {
                $table->text('available_resources')->nullable();
            });
        }

        if (! Schema::hasColumn('relief_distributions', 'recipient')) {
            Schema::table('relief_distributions', function (Blueprint $table): void {
                $table->string('recipient')->nullable();
            });
        }
        if (! Schema::hasColumn('relief_distributions', 'report_reference')) {
            Schema::table('relief_distributions', function (Blueprint $table): void {
                $table->string('report_reference')->nullable();
            });
        }
        if (! Schema::hasColumn('relief_distributions', 'distributed_by')) {
            Schema::table('relief_distributions', function (Blueprint $table): void {
                $table->unsignedBigInteger('distributed_by')->nullable();
            });
        }
        if (! Schema::hasColumn('relief_distributions', 'distributed_at')) {
            Schema::table('relief_distributions', function (Blueprint $table): void {
                $table->timestamp('distributed_at')->nullable();
            });
        }
    }
};
