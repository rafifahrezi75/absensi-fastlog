<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fingerspot_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('cloud_id', 50);
            $table->string('action', 50)->default('get_attlog');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('records_received')->default(0);
            $table->unsignedInteger('records_inserted')->default(0);
            $table->string('status', 20)->default('success');
            $table->text('response_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fingerspot_sync_logs');
    }
};
