<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_schedules', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal_mulai_berlaku')->unique();
            $table->string('normal_check_in', 10)->default('08:00');
            $table->string('normal_check_out', 10)->default('17:00');
            $table->integer('normal_tolerance')->default(0);
            $table->string('saturday_check_in', 10)->default('08:00');
            $table->string('saturday_check_out', 10)->default('12:00');
            $table->integer('saturday_tolerance')->default(0);
            $table->timestamps();
        });

        $existingSettings = DB::table('system_settings')->pluck('nilai', 'kunci')->all();

        DB::table('operational_schedules')->insert([
            'tanggal_mulai_berlaku' => '2020-01-01',
            'normal_check_in' => $existingSettings['normal_check_in'] ?? '08:00',
            'normal_check_out' => $existingSettings['normal_check_out'] ?? '17:00',
            'normal_tolerance' => (int)($existingSettings['normal_tolerance'] ?? 0),
            'saturday_check_in' => $existingSettings['saturday_check_in'] ?? '08:00',
            'saturday_check_out' => $existingSettings['saturday_check_out'] ?? '12:00',
            'saturday_tolerance' => (int)($existingSettings['saturday_tolerance'] ?? 0),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_schedules');
    }
};

