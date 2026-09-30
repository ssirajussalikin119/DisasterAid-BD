<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relief_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('relief_request_id')->constrained()->cascadeOnDelete();
            $table->string('item_name');
            $table->integer('quantity');
            $table->string('status')->default('pending'); // pending, distributed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relief_items');
    }
};
