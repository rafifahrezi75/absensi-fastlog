<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_hr_actions', function (Blueprint $table) {
            $table->id();
            $table->string('finger');
            $table->string('nama')->nullable();
            $table->date('tanggal');
            $table->string('kategori');
            $table->string('tindakan');
            $table->string('status', 50)->default('Selesai');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->unique(['finger', 'tanggal', 'kategori'], 'emp_hr_action_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_hr_actions');
    }
};
