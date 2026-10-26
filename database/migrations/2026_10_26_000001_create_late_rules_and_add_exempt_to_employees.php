<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('late_rule_categories')) {
            Schema::create('late_rule_categories', function (Blueprint $table) {
                $table->id();
                $table->string('kode', 50)->unique();
                $table->string('nama', 150);
                $table->text('deskripsi')->nullable();
                $table->integer('toleransi_bulanan')->default(3);
                $table->json('departemen_list')->nullable();
                $table->json('jabatan_keywords')->nullable();
                $table->boolean('is_default')->default(false);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('late_rule_tiers')) {
            Schema::create('late_rule_tiers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('late_rule_category_id')->constrained('late_rule_categories')->cascadeOnDelete();
                $table->integer('tier_order')->default(1);
                $table->string('nama_tier', 100);
                $table->integer('min_menit')->default(1);
                $table->integer('max_menit')->nullable();
                $table->boolean('ada_toleransi')->default(false);
                $table->decimal('nominal_denda', 15, 2)->default(0);
                $table->string('deskripsi', 255)->nullable();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('employees')) {
            Schema::table('employees', function (Blueprint $table) {
                if (!Schema::hasColumn('employees', 'is_exempt')) {
                    $table->boolean('is_exempt')->default(false)->after('status');
                }
                if (!Schema::hasColumn('employees', 'late_category_id')) {
                    $table->foreignId('late_category_id')->nullable()->after('salary_grade_id')->constrained('late_rule_categories')->nullOnDelete();
                }
            });
        }

        $now = now();
        $kantorId = DB::table('late_rule_categories')->insertGetId([
            'kode' => 'KANTOR',
            'nama' => 'Staf Kantor',
            'deskripsi' => 'CS, Dokumen, Finance, Accounting, Pricing, IT, dsb.',
            'toleransi_bulanan' => 3,
            'departemen_list' => json_encode(['Finance & Accounting', 'IT & Tech', 'Marketing', 'HRD & GA']),
            'jabatan_keywords' => json_encode(['cs', 'dokumen', 'finance', 'accounting', 'pricing', 'doc', 'admin']),
            'is_default' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('late_rule_tiers')->insert([
            [
                'late_rule_category_id' => $kantorId,
                'tier_order' => 1,
                'nama_tier' => '1 – 30 Menit',
                'min_menit' => 1,
                'max_menit' => 30,
                'ada_toleransi' => true,
                'nominal_denda' => 10000,
                'deskripsi' => 'Toleransi 3x sebulan. Ke-4 dan seterusnya: Rp 10.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'late_rule_category_id' => $kantorId,
                'tier_order' => 2,
                'nama_tier' => '31 – 60 Menit',
                'min_menit' => 31,
                'max_menit' => 60,
                'ada_toleransi' => false,
                'nominal_denda' => 15000,
                'deskripsi' => 'Potongan sebesar Rp 15.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'late_rule_category_id' => $kantorId,
                'tier_order' => 3,
                'nama_tier' => '61 – 90 Menit',
                'min_menit' => 61,
                'max_menit' => 90,
                'ada_toleransi' => false,
                'nominal_denda' => 20000,
                'deskripsi' => 'Potongan sebesar Rp 20.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'late_rule_category_id' => $kantorId,
                'tier_order' => 4,
                'nama_tier' => '> 90 Menit',
                'min_menit' => 91,
                'max_menit' => null,
                'ada_toleransi' => false,
                'nominal_denda' => 30000,
                'deskripsi' => 'Potongan sebesar Rp 30.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $lapanganId = DB::table('late_rule_categories')->insertGetId([
            'kode' => 'LAPANGAN',
            'nama' => 'Staf Lapangan',
            'deskripsi' => 'Operasional dan Staf Lapangan',
            'toleransi_bulanan' => 3,
            'departemen_list' => json_encode(['Operasional']),
            'jabatan_keywords' => json_encode(['operasional', 'ops', 'lapangan', 'driver', 'kurir']),
            'is_default' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('late_rule_tiers')->insert([
            [
                'late_rule_category_id' => $lapanganId,
                'tier_order' => 1,
                'nama_tier' => '1 – 45 Menit',
                'min_menit' => 1,
                'max_menit' => 45,
                'ada_toleransi' => true,
                'nominal_denda' => 10000,
                'deskripsi' => 'Toleransi 3x sebulan. Ke-4 dan seterusnya: Rp 10.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'late_rule_category_id' => $lapanganId,
                'tier_order' => 2,
                'nama_tier' => '46 – 90 Menit',
                'min_menit' => 46,
                'max_menit' => 90,
                'ada_toleransi' => false,
                'nominal_denda' => 15000,
                'deskripsi' => 'Potongan sebesar Rp 15.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'late_rule_category_id' => $lapanganId,
                'tier_order' => 3,
                'nama_tier' => '91 – 120 Menit',
                'min_menit' => 91,
                'max_menit' => 120,
                'ada_toleransi' => false,
                'nominal_denda' => 20000,
                'deskripsi' => 'Potongan sebesar Rp 20.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'late_rule_category_id' => $lapanganId,
                'tier_order' => 4,
                'nama_tier' => '> 120 Menit',
                'min_menit' => 121,
                'max_menit' => null,
                'ada_toleransi' => false,
                'nominal_denda' => 30000,
                'deskripsi' => 'Potongan sebesar Rp 30.000 / kejadian',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        if (Schema::hasTable('employees')) {
            Schema::table('employees', function (Blueprint $table) {
                if (Schema::hasColumn('employees', 'late_category_id')) {
                    $table->dropForeign(['late_category_id']);
                    $table->dropColumn('late_category_id');
                }
                if (Schema::hasColumn('employees', 'is_exempt')) {
                    $table->dropColumn('is_exempt');
                }
            });
        }

        Schema::dropIfExists('late_rule_tiers');
        Schema::dropIfExists('late_rule_categories');
    }
};
