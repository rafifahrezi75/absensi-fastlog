<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_components', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('tipe', 20);
            $table->string('metode', 30);
            $table->decimal('nilai', 15, 2)->default(0);
            $table->string('basis', 50)->nullable();
            $table->decimal('batas_dasar', 15, 2)->nullable();
            $table->boolean('kena_pajak')->default(false);
            $table->string('status', 20)->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_components');
    }
};
