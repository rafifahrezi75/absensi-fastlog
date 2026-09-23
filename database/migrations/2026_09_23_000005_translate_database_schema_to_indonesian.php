<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('attendances')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->string('status', 50)->default('hadir')->change();
            });

            DB::table('attendances')->where('status', 'present')->update(['status' => 'hadir']);
            DB::table('attendances')->where('status', 'late')->update(['status' => 'terlambat']);
            DB::table('attendances')->where('status', 'absent')->update(['status' => 'alpa']);

            Schema::table('attendances', function (Blueprint $table) {
                $table->renameColumn('date', 'tanggal');
                $table->renameColumn('check_in', 'jam_masuk');
                $table->renameColumn('check_out', 'jam_pulang');
            });
        }

        if (Schema::hasTable('attendance_anomalies')) {
            Schema::table('attendance_anomalies', function (Blueprint $table) {
                $table->string('status', 50)->default('MENUNGGU')->change();
            });

            DB::table('attendance_anomalies')->where('status', 'PENDING')->update(['status' => 'MENUNGGU']);
            DB::table('attendance_anomalies')->where('status', 'APPROVED')->update(['status' => 'DISETUJUI']);
            DB::table('attendance_anomalies')->where('status', 'REJECTED')->update(['status' => 'DITOLAK']);

            Schema::table('attendance_anomalies', function (Blueprint $table) {
                $table->renameColumn('tap_time', 'waktu_tap');
                $table->renameColumn('reason', 'alasan');
                $table->renameColumn('admin_note', 'catatan_admin');
            });
        }

        if (Schema::hasTable('overtime_logs')) {
            Schema::table('overtime_logs', function (Blueprint $table) {
                $table->string('status', 50)->default('MENUNGGU')->change();
            });

            DB::table('overtime_logs')->where('status', 'PENDING')->update(['status' => 'MENUNGGU']);
            DB::table('overtime_logs')->where('status', 'APPROVED')->update(['status' => 'DISETUJUI']);
            DB::table('overtime_logs')->where('status', 'REJECTED')->update(['status' => 'DITOLAK']);

            Schema::table('overtime_logs', function (Blueprint $table) {
                $table->renameColumn('tap_time', 'waktu_tap');
                $table->renameColumn('duration_minutes', 'durasi_menit');
                $table->renameColumn('admin_note', 'catatan_admin');
            });
        }

        if (Schema::hasTable('permissions')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->string('status', 50)->default('menunggu')->change();
            });

            DB::table('permissions')->where('status', 'pending')->update(['status' => 'menunggu']);
            DB::table('permissions')->where('status', 'approved')->update(['status' => 'disetujui']);
            DB::table('permissions')->where('status', 'rejected')->update(['status' => 'ditolak']);

            Schema::table('permissions', function (Blueprint $table) {
                $table->renameColumn('start_date', 'tanggal_mulai');
                $table->renameColumn('end_date', 'tanggal_selesai');
                $table->renameColumn('start_time', 'jam_mulai');
                $table->renameColumn('end_time', 'jam_selesai');
                $table->renameColumn('duration', 'durasi');
                $table->renameColumn('description', 'keterangan');
                $table->renameColumn('attachment', 'lampiran');
                $table->renameColumn('admin_note', 'catatan_admin');
            });
        }

        if (Schema::hasTable('holidays')) {
            Schema::table('holidays', function (Blueprint $table) {
                $table->renameColumn('date', 'tanggal');
                $table->renameColumn('description', 'keterangan');
                $table->renameColumn('is_national', 'libur_nasional');
            });
        }

        if (Schema::hasTable('system_settings')) {
            Schema::table('system_settings', function (Blueprint $table) {
                $table->renameColumn('key', 'kunci');
                $table->renameColumn('value', 'nilai');
                $table->renameColumn('type', 'tipe');
            });
        }

        if (Schema::hasTable('employees')) {
            DB::table('employees')->where('status', 'active')->update(['status' => 'aktif']);
            DB::table('employees')->where('status', 'inactive')->update(['status' => 'nonaktif']);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('attendances')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->renameColumn('tanggal', 'date');
                $table->renameColumn('jam_masuk', 'check_in');
                $table->renameColumn('jam_pulang', 'check_out');
            });

            DB::table('attendances')->where('status', 'hadir')->update(['status' => 'present']);
            DB::table('attendances')->where('status', 'terlambat')->update(['status' => 'late']);
            DB::table('attendances')->where('status', 'alpa')->update(['status' => 'absent']);
        }

        if (Schema::hasTable('attendance_anomalies')) {
            Schema::table('attendance_anomalies', function (Blueprint $table) {
                $table->renameColumn('waktu_tap', 'tap_time');
                $table->renameColumn('alasan', 'reason');
                $table->renameColumn('catatan_admin', 'admin_note');
            });

            DB::table('attendance_anomalies')->where('status', 'MENUNGGU')->update(['status' => 'PENDING']);
            DB::table('attendance_anomalies')->where('status', 'DISETUJUI')->update(['status' => 'APPROVED']);
            DB::table('attendance_anomalies')->where('status', 'DITOLAK')->update(['status' => 'REJECTED']);
        }

        if (Schema::hasTable('overtime_logs')) {
            Schema::table('overtime_logs', function (Blueprint $table) {
                $table->renameColumn('waktu_tap', 'tap_time');
                $table->renameColumn('durasi_menit', 'duration_minutes');
                $table->renameColumn('catatan_admin', 'admin_note');
            });

            DB::table('overtime_logs')->where('status', 'MENUNGGU')->update(['status' => 'PENDING']);
            DB::table('overtime_logs')->where('status', 'DISETUJUI')->update(['status' => 'APPROVED']);
            DB::table('overtime_logs')->where('status', 'DITOLAK')->update(['status' => 'REJECTED']);
        }

        if (Schema::hasTable('permissions')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->renameColumn('tanggal_mulai', 'start_date');
                $table->renameColumn('tanggal_selesai', 'end_date');
                $table->renameColumn('jam_mulai', 'start_time');
                $table->renameColumn('jam_selesai', 'end_time');
                $table->renameColumn('durasi', 'duration');
                $table->renameColumn('keterangan', 'description');
                $table->renameColumn('lampiran', 'attachment');
                $table->renameColumn('catatan_admin', 'admin_note');
            });

            DB::table('permissions')->where('status', 'menunggu')->update(['status' => 'pending']);
            DB::table('permissions')->where('status', 'disetujui')->update(['status' => 'approved']);
            DB::table('permissions')->where('status', 'ditolak')->update(['status' => 'rejected']);
        }

        if (Schema::hasTable('holidays')) {
            Schema::table('holidays', function (Blueprint $table) {
                $table->renameColumn('tanggal', 'date');
                $table->renameColumn('keterangan', 'description');
                $table->renameColumn('libur_nasional', 'is_national');
            });
        }

        if (Schema::hasTable('system_settings')) {
            Schema::table('system_settings', function (Blueprint $table) {
                $table->renameColumn('kunci', 'key');
                $table->renameColumn('nilai', 'value');
                $table->renameColumn('tipe', 'type');
            });
        }

        if (Schema::hasTable('employees')) {
            DB::table('employees')->where('status', 'aktif')->update(['status' => 'active']);
            DB::table('employees')->where('status', 'nonaktif')->update(['status' => 'inactive']);
        }
    }
};
