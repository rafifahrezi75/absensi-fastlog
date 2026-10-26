<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('overtime_logs')) {
            Schema::table('overtime_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('overtime_logs', 'tipe_lembur')) {
                    $table->string('tipe_lembur', 50)->nullable()->after('durasi_menit');
                }
                if (!Schema::hasColumn('overtime_logs', 'kategori_staf')) {
                    $table->string('kategori_staf', 50)->nullable()->after('tipe_lembur');
                }
                if (!Schema::hasColumn('overtime_logs', 'nominal')) {
                    $table->decimal('nominal', 15, 2)->default(0)->after('kategori_staf');
                }
            });
        }

        $defaultSettings = [
            'overtime_kantor_daily_start' => '17:00',
            'overtime_kantor_daily_rate' => '50000',
            'overtime_kantor_weekend_start' => '13:00',
            'overtime_kantor_weekend_rate' => '75000',
            'overtime_kantor_holiday_rate' => '300000',
            'overtime_lapangan_daily_start' => '16:31',
            'overtime_lapangan_daily_rate' => '50000',
            'overtime_lapangan_weekend_start' => '12:01',
            'overtime_lapangan_weekend_rate' => '75000',
            'overtime_lapangan_holiday_rate' => '300000',
        ];

        foreach ($defaultSettings as $key => $val) {
            DB::table('system_settings')->updateOrInsert(
                ['kunci' => $key],
                ['nilai' => $val, 'tipe' => 'string', 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('overtime_logs')) {
            Schema::table('overtime_logs', function (Blueprint $table) {
                if (Schema::hasColumn('overtime_logs', 'nominal')) {
                    $table->dropColumn('nominal');
                }
                if (Schema::hasColumn('overtime_logs', 'kategori_staf')) {
                    $table->dropColumn('kategori_staf');
                }
                if (Schema::hasColumn('overtime_logs', 'tipe_lembur')) {
                    $table->dropColumn('tipe_lembur');
                }
            });
        }

        DB::table('system_settings')->whereIn('kunci', [
            'overtime_kantor_daily_start',
            'overtime_kantor_daily_rate',
            'overtime_kantor_weekend_start',
            'overtime_kantor_weekend_rate',
            'overtime_kantor_holiday_rate',
            'overtime_lapangan_daily_start',
            'overtime_lapangan_daily_rate',
            'overtime_lapangan_weekend_start',
            'overtime_lapangan_weekend_rate',
            'overtime_lapangan_holiday_rate',
        ])->delete();
    }
};
