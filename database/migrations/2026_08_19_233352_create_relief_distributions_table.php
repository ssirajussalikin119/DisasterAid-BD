<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public $withinTransaction = false;
    public function up(): void
    {
        Schema::create('relief_distributions', function (Blueprint $table) {
    $table->id();

    $table->foreignId('relief_center_id')
        ->constrained('relief_centers')
        ->cascadeOnDelete();

    $table->string('relief_type');
    $table->integer('quantity');
    $table->date('distribution_date');
    $table->text('description')->nullable();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relief_distributions');
    }
};
