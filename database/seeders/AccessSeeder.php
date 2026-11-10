<?php

namespace Database\Seeders;

use App\Models\AppPermission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccessSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'dashboard.view', 'label' => 'Lihat Dasbor & Statistik', 'group_name' => 'Dasbor'],

            ['name' => 'attendance.view', 'label' => 'Lihat Log Presensi', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.fetch', 'label' => 'Tarik Data Log Presensi', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.manual', 'label' => 'Input Presensi Manual', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.koreksi', 'label' => 'Koreksi Jam Presensi', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.delete', 'label' => 'Hapus Log Presensi', 'group_name' => 'Log Presensi'],

            ['name' => 'permissions.view', 'label' => 'Lihat Izin & Lembur', 'group_name' => 'Izin & Lembur'],
            ['name' => 'permissions.create', 'label' => 'Buat Izin & Lembur', 'group_name' => 'Izin & Lembur'],
            ['name' => 'permissions.update', 'label' => 'Ubah Izin & Lembur', 'group_name' => 'Izin & Lembur'],
            ['name' => 'permissions.approve', 'label' => 'Setujui Izin & Lembur', 'group_name' => 'Izin & Lembur'],
            ['name' => 'permissions.reject', 'label' => 'Tolak Izin & Lembur', 'group_name' => 'Izin & Lembur'],
            ['name' => 'permissions.delete', 'label' => 'Hapus Izin & Lembur', 'group_name' => 'Izin & Lembur'],

            ['name' => 'employees.view', 'label' => 'Lihat Data Karyawan', 'group_name' => 'Data Karyawan'],
            ['name' => 'employees.create', 'label' => 'Tambah Karyawan', 'group_name' => 'Data Karyawan'],
            ['name' => 'employees.update', 'label' => 'Ubah Data Karyawan', 'group_name' => 'Data Karyawan'],
            ['name' => 'employees.delete', 'label' => 'Hapus Data Karyawan', 'group_name' => 'Data Karyawan'],
            ['name' => 'employees.sync_cloud', 'label' => 'Sinkronisasi Mesin Cloud', 'group_name' => 'Data Karyawan'],

            ['name' => 'payroll.view', 'label' => 'Lihat Data Penggajian', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.pay', 'label' => 'Bayar & Cairkan Gaji', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.recalculate', 'label' => 'Kalkulasi Ulang Gaji', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.export', 'label' => 'Cetak & Unduh Slip Gaji PDF', 'group_name' => 'Penggajian'],

            ['name' => 'master_payroll.view', 'label' => 'Lihat Master Penggajian', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.create', 'label' => 'Tambah Master Penggajian', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.update', 'label' => 'Ubah Master Penggajian', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.delete', 'label' => 'Hapus Master Penggajian', 'group_name' => 'Master Penggajian'],

            ['name' => 'master_tindakan.view', 'label' => 'Lihat Master Tindakan HR', 'group_name' => 'Master Tindakan HR'],
            ['name' => 'master_tindakan.create', 'label' => 'Tambah Master Tindakan HR', 'group_name' => 'Master Tindakan HR'],
            ['name' => 'master_tindakan.update', 'label' => 'Ubah Master Tindakan HR', 'group_name' => 'Master Tindakan HR'],
            ['name' => 'master_tindakan.delete', 'label' => 'Hapus Master Tindakan HR', 'group_name' => 'Master Tindakan HR'],

            ['name' => 'employee_hr_actions.view', 'label' => 'Lihat Riwayat Tindakan HR', 'group_name' => 'Tindakan HR Pegawai'],
            ['name' => 'employee_hr_actions.create', 'label' => 'Eksekusi Tindakan HR Pegawai', 'group_name' => 'Tindakan HR Pegawai'],

            ['name' => 'late_rules.view', 'label' => 'Lihat Aturan Keterlambatan', 'group_name' => 'Aturan Keterlambatan'],
            ['name' => 'late_rules.create', 'label' => 'Tambah Aturan Keterlambatan', 'group_name' => 'Aturan Keterlambatan'],
            ['name' => 'late_rules.update', 'label' => 'Ubah Aturan Keterlambatan', 'group_name' => 'Aturan Keterlambatan'],
            ['name' => 'late_rules.delete', 'label' => 'Hapus Aturan Keterlambatan', 'group_name' => 'Aturan Keterlambatan'],

            ['name' => 'overtime_rules.view', 'label' => 'Lihat Aturan Lembur', 'group_name' => 'Aturan Lembur'],
            ['name' => 'overtime_rules.create', 'label' => 'Tambah Aturan Lembur', 'group_name' => 'Aturan Lembur'],
            ['name' => 'overtime_rules.update', 'label' => 'Ubah Aturan Lembur', 'group_name' => 'Aturan Lembur'],
            ['name' => 'overtime_rules.delete', 'label' => 'Hapus Aturan Lembur', 'group_name' => 'Aturan Lembur'],

            ['name' => 'reports.view', 'label' => 'Lihat Laporan Presensi', 'group_name' => 'Laporan Presensi'],
            ['name' => 'reports.export', 'label' => 'Ekspor Rekap Laporan PDF & Excel', 'group_name' => 'Laporan Presensi'],

            ['name' => 'settings.view', 'label' => 'Lihat Aturan Kerja & Hari Libur', 'group_name' => 'Aturan Kerja & Lembur'],
            ['name' => 'settings.update', 'label' => 'Ubah Aturan Kerja & Hari Libur', 'group_name' => 'Aturan Kerja & Lembur'],

            ['name' => 'devices.view', 'label' => 'Lihat Mesin Sidik Jari', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.update', 'label' => 'Ubah Pengaturan Mesin', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.ping', 'label' => 'Ping Mesin Sidik Jari', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.sync', 'label' => 'Sinkronisasi Mesin Sidik Jari', 'group_name' => 'Mesin Sidik Jari'],

            ['name' => 'master_akun.view', 'label' => 'Lihat Master Akun', 'group_name' => 'Master Akun'],
            ['name' => 'master_akun.create', 'label' => 'Tambah Akun Pengguna', 'group_name' => 'Master Akun'],
            ['name' => 'master_akun.update', 'label' => 'Ubah Akun Pengguna', 'group_name' => 'Master Akun'],
            ['name' => 'master_akun.delete', 'label' => 'Hapus Akun Pengguna', 'group_name' => 'Master Akun'],

            ['name' => 'master_role.view', 'label' => 'Lihat Master Role', 'group_name' => 'Master Role'],
            ['name' => 'master_role.create', 'label' => 'Tambah Role Baru', 'group_name' => 'Master Role'],
            ['name' => 'master_role.update', 'label' => 'Ubah Data Role', 'group_name' => 'Master Role'],
            ['name' => 'master_role.delete', 'label' => 'Hapus Role', 'group_name' => 'Master Role'],

            ['name' => 'hak_akses.view', 'label' => 'Lihat Matriks Hak Akses', 'group_name' => 'Matriks Hak Akses'],
            ['name' => 'hak_akses.update', 'label' => 'Ubah Matriks Hak Akses', 'group_name' => 'Matriks Hak Akses'],
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('app_permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        foreach ($permissions as $p) {
            AppPermission::create($p);
        }

        $superAdminRole = Role::updateOrCreate(
            ['name' => 'super_admin'],
            [
                'label' => 'Super Admin',
                'description' => 'Akses penuh ke seluruh modul sistem, hak akses, dan konfigurasi master.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $direksiRole = Role::updateOrCreate(
            ['name' => 'direksi'],
            [
                'label' => 'Direksi / Pimpinan',
                'description' => 'Akses pengawasan eksekutif: dasbor, presensi, persetujuan izin, laporan, dan penggajian.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $hrdRole = Role::updateOrCreate(
            ['name' => 'hrd'],
            [
                'label' => 'HRD & General Affair',
                'description' => 'Pengelolaan data pegawai, monitoring absensi, verifikasi izin, aturan kerja, dan tindakan kedisiplinan.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $financeRole = Role::updateOrCreate(
            ['name' => 'finance'],
            [
                'label' => 'Finance & Payroll',
                'description' => 'Pengelolaan kompensasi, master gaji, kalkulasi payroll bulanan, dan pencairan gaji pegawai.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $supervisorRole = Role::updateOrCreate(
            ['name' => 'supervisor_ops'],
            [
                'label' => 'Supervisor Operasional',
                'description' => 'Pengawasan kehadiran lapangan, pemantauan anomali, dan rekomendasi lembur regu kerja.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $karyawanRole = Role::updateOrCreate(
            ['name' => 'karyawan'],
            [
                'label' => 'Karyawan',
                'description' => 'Akses portal mandiri karyawan: kehadiran pribadi, pengajuan izin/cuti/lembur, dan slip gaji.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => false,
            ]
        );

        $allPermissionIds = AppPermission::pluck('id')->toArray();
        $superAdminRole->permissions()->sync($allPermissionIds);

        $direksiPermNames = [
            'dashboard.view',
            'attendance.view',
            'permissions.view',
            'permissions.approve',
            'employees.view',
            'payroll.view',
            'payroll.export',
            'reports.view',
            'reports.export',
            'employee_hr_actions.view',
        ];
        $direksiRole->permissions()->sync(
            AppPermission::whereIn('name', $direksiPermNames)->pluck('id')->toArray()
        );

        $hrdPermNames = [
            'dashboard.view',
            'attendance.view',
            'attendance.fetch',
            'attendance.manual',
            'attendance.koreksi',
            'permissions.view',
            'permissions.create',
            'permissions.update',
            'permissions.approve',
            'permissions.reject',
            'employees.view',
            'employees.create',
            'employees.update',
            'employees.sync_cloud',
            'master_tindakan.view',
            'master_tindakan.create',
            'master_tindakan.update',
            'employee_hr_actions.view',
            'employee_hr_actions.create',
            'late_rules.view',
            'late_rules.create',
            'late_rules.update',
            'overtime_rules.view',
            'overtime_rules.create',
            'overtime_rules.update',
            'reports.view',
            'reports.export',
            'settings.view',
            'settings.update',
            'devices.view',
            'devices.ping',
            'devices.sync',
            'master_akun.view',
        ];
        $hrdRole->permissions()->sync(
            AppPermission::whereIn('name', $hrdPermNames)->pluck('id')->toArray()
        );

        $financePermNames = [
            'dashboard.view',
            'payroll.view',
            'payroll.pay',
            'payroll.recalculate',
            'payroll.export',
            'master_payroll.view',
            'master_payroll.create',
            'master_payroll.update',
            'employees.view',
            'reports.view',
            'reports.export',
        ];
        $financeRole->permissions()->sync(
            AppPermission::whereIn('name', $financePermNames)->pluck('id')->toArray()
        );

        $supervisorPermNames = [
            'dashboard.view',
            'attendance.view',
            'permissions.view',
            'permissions.create',
            'permissions.approve',
            'reports.view',
        ];
        $supervisorRole->permissions()->sync(
            AppPermission::whereIn('name', $supervisorPermNames)->pluck('id')->toArray()
        );

        $karyawanRole->permissions()->sync([]);

        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $adminUser) {
            $adminUser->roles()->syncWithoutDetaching([$superAdminRole->id]);
        }

        $regularUsers = User::where('role', 'user')->get();
        foreach ($regularUsers as $regularUser) {
            if ($regularUser->roles()->count() === 0) {
                $regularUser->roles()->sync([$karyawanRole->id]);
            }
        }
    }
}
