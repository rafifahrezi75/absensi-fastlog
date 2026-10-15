<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('employees') && !Schema::hasColumn('employees', 'salary_grade_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->foreignId('salary_grade_id')->nullable()->after('jabatan')->constrained('salary_grades')->nullOnDelete();
            });
        }

        if (!Schema::hasTable('payrolls')) {
            Schema::create('payrolls', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->string('periode', 7)->index();
                $table->decimal('gaji_pokok', 15, 2)->default(0);
                $table->decimal('tunjangan', 15, 2)->default(0);
                $table->decimal('lembur', 15, 2)->default(0);
                $table->decimal('bonus', 15, 2)->default(0);
                $table->decimal('potongan_terlambat', 15, 2)->default(0);
                $table->decimal('potongan_alpa', 15, 2)->default(0);
                $table->decimal('potongan_lainnya', 15, 2)->default(0);
                $table->decimal('total_potongan', 15, 2)->default(0);
                $table->decimal('thp', 15, 2)->default(0);
                $table->integer('hadir_hari')->default(0);
                $table->integer('terlambat_menit')->default(0);
                $table->integer('alpa_hari')->default(0);
                $table->integer('lembur_menit')->default(0);
                $table->string('status', 20)->default('draft');
                $table->dateTime('dibayar_pada')->nullable();
                $table->text('catatan')->nullable();
                $table->timestamps();

                $table->unique(['employee_id', 'periode']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');

        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'salary_grade_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropForeign(['salary_grade_id']);
                $table->dropColumn('salary_grade_id');
            });
        }
    }
};
