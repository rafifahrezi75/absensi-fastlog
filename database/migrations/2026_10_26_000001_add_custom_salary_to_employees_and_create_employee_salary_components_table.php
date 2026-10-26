<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (!Schema::hasColumn('employees', 'tipe_staf')) {
                $table->enum('tipe_staf', ['kantor', 'lapangan'])->default('kantor')->after('jabatan');
            }
            if (!Schema::hasColumn('employees', 'gaji_pokok_kustom')) {
                $table->decimal('gaji_pokok_kustom', 15, 2)->nullable()->after('salary_grade_id');
            }
        });

        if (!Schema::hasTable('employee_salary_components')) {
            Schema::create('employee_salary_components', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->foreignId('salary_component_id')->nullable()->constrained('salary_components')->nullOnDelete();
                $table->string('nama', 100)->nullable();
                $table->enum('tipe', ['tambahan', 'potongan']);
                $table->enum('metode', ['nominal', 'persen'])->default('nominal');
                $table->decimal('nilai', 15, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_salary_components');

        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'gaji_pokok_kustom')) {
                $table->dropColumn('gaji_pokok_kustom');
            }
            if (Schema::hasColumn('employees', 'tipe_staf')) {
                $table->dropColumn('tipe_staf');
            }
        });
    }
};
