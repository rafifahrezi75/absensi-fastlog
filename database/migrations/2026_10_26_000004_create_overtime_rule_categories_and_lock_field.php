<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('late_rule_categories') && !Schema::hasColumn('late_rule_categories', 'is_locked')) {
            Schema::table('late_rule_categories', function (Blueprint $table) {
                $table->boolean('is_locked')->default(false)->after('is_default');
            });

            DB::table('late_rule_categories')
                ->whereIn('kode', ['KANTOR', 'LAPANGAN'])
                ->update(['is_locked' => true]);
        }

        if (!Schema::hasTable('overtime_rule_categories')) {
            Schema::create('overtime_rule_categories', function (Blueprint $table) {
                $table->id();
                $table->string('kode', 50)->unique();
                $table->string('nama', 150);
                $table->text('deskripsi')->nullable();
                $table->json('departemen_list')->nullable();
                $table->json('jabatan_keywords')->nullable();
                $table->string('daily_start', 10)->default('17:00');
                $table->decimal('daily_rate', 12, 2)->default(50000);
                $table->string('weekend_start', 10)->default('13:00');
                $table->decimal('weekend_rate', 12, 2)->default(75000);
                $table->decimal('holiday_rate', 12, 2)->default(300000);
                $table->boolean('is_default')->default(false);
                $table->boolean('is_locked')->default(false);
                $table->timestamps();
            });

            DB::table('overtime_rule_categories')->insert([
                [
                    'kode' => 'KANTOR',
                    'nama' => 'Staf Kantor',
                    'deskripsi' => 'CS/Dokumen/Finance/Accounting/Procurement',
                    'departemen_list' => json_encode(['Finance & Accounting', 'IT & Tech', 'Marketing', 'HRD & GA']),
                    'jabatan_keywords' => json_encode(['CS', 'Dokumen', 'Finance', 'Accounting', 'Pricing', 'Procurement']),
                    'daily_start' => '17:00',
                    'daily_rate' => 50000,
                    'weekend_start' => '13:00',
                    'weekend_rate' => 75000,
                    'holiday_rate' => 300000,
                    'is_default' => true,
                    'is_locked' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'kode' => 'LAPANGAN',
                    'nama' => 'Staf Lapangan (Operasional)',
                    'deskripsi' => 'Petugas operasional lapangan dan ritase',
                    'departemen_list' => json_encode(['Operasional']),
                    'jabatan_keywords' => json_encode(['Operasional', 'Lapangan', 'Driver', 'Kurir', 'Gudang']),
                    'daily_start' => '16:31',
                    'daily_rate' => 50000,
                    'weekend_start' => '12:01',
                    'weekend_rate' => 75000,
                    'holiday_rate' => 300000,
                    'is_default' => false,
                    'is_locked' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('late_rule_categories') && Schema::hasColumn('late_rule_categories', 'is_locked')) {
            Schema::table('late_rule_categories', function (Blueprint $table) {
                $table->dropColumn('is_locked');
            });
        }

        Schema::dropIfExists('overtime_rule_categories');
    }
};
