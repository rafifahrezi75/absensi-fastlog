<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('attendance_anomalies');
    }

    public function down(): void
    {
        Schema::create('attendance_anomalies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('attendance_id')->nullable()->constrained('attendances')->nullOnDelete();
            $table->dateTime('waktu_tap');
            $table->string('alasan')->nullable();
            $table->string('status')->default('MENUNGGU');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();
        });
    }
};

