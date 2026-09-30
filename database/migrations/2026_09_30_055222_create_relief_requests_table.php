<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relief_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('incident_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending'); // pending, approved, fulfilled, rejected
            $table->string('urgency')->default('medium'); // low, medium, high, critical
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relief_requests');
    }
};
