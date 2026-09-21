<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('device_id')->nullable()->constrained('devices')->nullOnDelete();
            $table->string('cloud_id', 50);
            $table->string('pin', 50);
            $table->dateTime('scan_at');
            $table->string('verify_method', 20)->nullable();
            $table->string('status_scan', 20)->nullable();
            $table->json('raw_data')->nullable();
            $table->timestamps();

            $table->unique(['cloud_id', 'pin', 'scan_at'], 'unique_scan');
            $table->index(['pin', 'scan_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
