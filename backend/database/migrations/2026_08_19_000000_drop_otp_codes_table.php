<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::dropIfExists('otp_codes');
    }

    public function down(): void
    {
        // The abandoned table is intentionally not recreated.
    }
};