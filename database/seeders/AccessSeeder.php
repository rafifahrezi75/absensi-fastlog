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
            ['name' => 'dashboard.drilldown', 'label' => 'Grafik Drill-Down Kedisiplinan', 'group_name' => 'Dasbor'],

            ['name' => 'attendance.view', 'label' => 'Lihat Log Presensi', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.late_detail', 'label' => 'Lihat Detail Denda & Toleransi Telat', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.fetch', 'label' => 'Tarik Data Log Presensi', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.manual', 'label' => 'Input Presensi Manual', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.koreksi', 'label' => 'Koreksi Jam Presensi', 'group_name' => 'Log Presensi'],
            ['name' => 'attendance.delete', 'label' => 'Hapus Log Presensi', 'group_name' => 'Log Presensi'],

            ['name' => 'permissions.view', 'label' => 'Lihat Izin & Lembur', 'group_name' => 'Izin & Lembur'],
            ['name' => 'permissions.preview', 'label' => 'Lihat Lampiran Bukti Izin', 'group_name' => 'Izin & Lembur'],
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
            ['name' => 'employees.export', 'label' => 'Ekspor Data Karyawan (CSV)', 'group_name' => 'Data Karyawan'],

            ['name' => 'payroll.view', 'label' => 'Lihat Data Penggajian', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.allowance_detail', 'label' => 'Lihat Rincian Kompensasi (Tunjangan & Lembur)', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.deduction_detail', 'label' => 'Lihat Rincian Potongan & Denda', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.attendance_detail', 'label' => 'Lihat Rincian Presensi & Riwayat Telat', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.dispense', 'label' => 'Berikan & Cabut Dispensasi Denda', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.slip_detail', 'label' => 'Lihat Halaman Detail Slip Gaji', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.pay', 'label' => 'Bayar & Cairkan Gaji', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.recalculate', 'label' => 'Kalkulasi Ulang Gaji', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.export', 'label' => 'Ekspor Data Payroll (CSV)', 'group_name' => 'Penggajian'],
            ['name' => 'payroll.export_pdf', 'label' => 'Pratinjau, Cetak & Unduh Slip Gaji PDF', 'group_name' => 'Penggajian'],

            ['name' => 'master_payroll.view', 'label' => 'Lihat Master Penggajian', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.create', 'label' => 'Tambah Master Penggajian', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.update', 'label' => 'Ubah Golongan & Komponen Gaji', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.employee_salary', 'label' => 'Atur Gaji Karyawan Khusus', 'group_name' => 'Master Penggajian'],
            ['name' => 'master_payroll.reset_salary', 'label' => 'Reset Gaji Karyawan ke Standar', 'group_name' => 'Master Penggajian'],
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
            ['name' => 'late_rules.exemption', 'label' => 'Kelola Karyawan Khusus (Bebas Denda & Lembur)', 'group_name' => 'Aturan Keterlambatan'],

            ['name' => 'overtime_rules.view', 'label' => 'Lihat Aturan Lembur', 'group_name' => 'Aturan Lembur'],
            ['name' => 'overtime_rules.create', 'label' => 'Tambah Aturan Lembur', 'group_name' => 'Aturan Lembur'],
            ['name' => 'overtime_rules.update', 'label' => 'Ubah Aturan Lembur', 'group_name' => 'Aturan Lembur'],
            ['name' => 'overtime_rules.delete', 'label' => 'Hapus Aturan Lembur', 'group_name' => 'Aturan Lembur'],

            ['name' => 'reports.view', 'label' => 'Lihat Rekap Laporan Presensi', 'group_name' => 'Laporan Presensi'],
            ['name' => 'reports.employee_detail', 'label' => 'Lihat Rincian Laporan Per Karyawan', 'group_name' => 'Laporan Presensi'],
            ['name' => 'reports.export_excel', 'label' => 'Ekspor Excel Laporan Presensi', 'group_name' => 'Laporan Presensi'],
            ['name' => 'reports.export', 'label' => 'Pratinjau & Cetak PDF Laporan', 'group_name' => 'Laporan Presensi'],

            ['name' => 'settings.view', 'label' => 'Lihat Jam Kerja & Hari Libur', 'group_name' => 'Aturan Kerja & Lembur'],
            ['name' => 'settings.update', 'label' => 'Ubah Jam Kerja Operasional', 'group_name' => 'Aturan Kerja & Lembur'],
            ['name' => 'settings.holidays', 'label' => 'Kelola Hari Libur & Tanggal Merah', 'group_name' => 'Aturan Kerja & Lembur'],

            ['name' => 'devices.view', 'label' => 'Lihat Mesin Sidik Jari', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.update', 'label' => 'Ubah Pengaturan Mesin', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.ping', 'label' => 'Ping Mesin Sidik Jari', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.sync', 'label' => 'Sinkronisasi Log Absensi Mesin', 'group_name' => 'Mesin Sidik Jari'],
            ['name' => 'devices.sync_users', 'label' => 'Sinkron Data Karyawan Mesin', 'group_name' => 'Mesin Sidik Jari'],

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

        foreach ($permissions as $p) {
            AppPermission::updateOrCreate(
                ['name' => $p['name']],
                ['label' => $p['label'], 'group_name' => $p['group_name']]
            );
        }

        $superAdminRole = Role::updateOrCreate(
            ['name' => 'super_admin'],
            [
                'label' => 'Super Admin / BizDev',
                'description' => 'Akses penuh seluruh 74 permissions sistem FastLog.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $dirutRole = Role::updateOrCreate(
            ['name' => 'direktur_utama'],
            [
                'label' => 'Direktur Utama',
                'description' => 'Pimpinan eksekutif: Dasbor KPI, drilldown, tindakan HR, rekap payroll, dan laporan eksekutif.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $dirFinanceRole = Role::updateOrCreate(
            ['name' => 'direktur_finance'],
            [
                'label' => 'Direktur Finance & Accounting',
                'description' => 'Direksi keuangan: Penggajian penuh, master payroll, aturan denda/lembur, dan laporan finansial.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $dirOpsMktRole = Role::updateOrCreate(
            ['name' => 'direktur_ops_mkt'],
            [
                'label' => 'Direktur Operasional & Marketing',
                'description' => 'Direksi operasional & marketing: Dasbor, presensi, izin/lembur, tindakan HR, aturan kerja, dan laporan.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $gmRole = Role::updateOrCreate(
            ['name' => 'general_manager'],
            [
                'label' => 'General Manager',
                'description' => 'Manajemen lintas divisi: Dasbor, monitoring presensi, approval izin manajerial, tindakan HR, dan laporan.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $spvFinanceRole = Role::updateOrCreate(
            ['name' => 'spv_finance'],
            [
                'label' => 'Supervisor Finance & Accounting',
                'description' => 'Supervisi penggajian: Operasional payroll, master payroll, denda, lembur, dan rekapitulasi gaji.',
                'is_system' => true,
                'is_active' => true,
                'show_in_matrix' => true,
            ]
        );

        $spvOpsRole = Role::updateOrCreate(
            ['name' => 'spv_operasional'],
            [
                'label' => 'Supervisor Operasional, CS & GA',
                'description' => 'Supervisi lapangan: Log presensi, koreksi presensi, approval izin/lembur, tindakan HR, dan ping mesin IoT.',
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

        $dirutPermNames = [
            'dashboard.view',
            'dashboard.drilldown',
            'attendance.view',
            'attendance.late_detail',
            'attendance.export',
            'permissions.view',
            'permissions.preview',
            'permissions.approve',
            'employees.view',
            'employees.export',
            'payroll.view',
            'payroll.allowance_detail',
            'payroll.deduction_detail',
            'payroll.attendance_detail',
            'payroll.slip_detail',
            'payroll.export_pdf',
            'master_payroll.view',
            'master_tindakan.view',
            'master_tindakan.create',
            'master_tindakan.update',
            'master_tindakan.delete',
            'employee_hr_actions.view',
            'employee_hr_actions.create',
            'late_rules.view',
            'overtime_rules.view',
            'reports.view',
            'reports.employee_detail',
            'reports.export_excel',
            'reports.export',
            'settings.view',
            'devices.view',
            'master_akun.view',
            'master_role.view',
            'hak_akses.view',
        ];
        $dirutRole->permissions()->sync(
            AppPermission::whereIn('name', $dirutPermNames)->pluck('id')->toArray()
        );

        $dirFinancePermNames = [
            'dashboard.view',
            'attendance.view',
            'permissions.view',
            'permissions.preview',
            'employees.view',
            'employees.export',
            'payroll.view',
            'payroll.allowance_detail',
            'payroll.deduction_detail',
            'payroll.attendance_detail',
            'payroll.dispense',
            'payroll.slip_detail',
            'payroll.pay',
            'payroll.recalculate',
            'payroll.export',
            'payroll.export_pdf',
            'master_payroll.view',
            'master_payroll.create',
            'master_payroll.update',
            'master_payroll.employee_salary',
            'master_payroll.reset_salary',
            'master_payroll.delete',
            'late_rules.view',
            'late_rules.create',
            'late_rules.update',
            'late_rules.delete',
            'late_rules.exemption',
            'overtime_rules.view',
            'overtime_rules.create',
            'overtime_rules.update',
            'overtime_rules.delete',
            'reports.view',
            'reports.employee_detail',
            'reports.export_excel',
            'reports.export',
            'settings.view',
        ];
        $dirFinanceRole->permissions()->sync(
            AppPermission::whereIn('name', $dirFinancePermNames)->pluck('id')->toArray()
        );

        $dirOpsMktPermNames = [
            'dashboard.view',
            'dashboard.drilldown',
            'attendance.view',
            'attendance.late_detail',
            'attendance.export',
            'permissions.view',
            'permissions.preview',
            'permissions.approve',
            'permissions.reject',
            'employees.view',
            'master_tindakan.view',
            'master_tindakan.create',
            'master_tindakan.update',
            'master_tindakan.delete',
            'employee_hr_actions.view',
            'employee_hr_actions.create',
            'late_rules.view',
            'overtime_rules.view',
            'reports.view',
            'reports.employee_detail',
            'reports.export_excel',
            'reports.export',
            'settings.view',
            'devices.view',
        ];
        $dirOpsMktRole->permissions()->sync(
            AppPermission::whereIn('name', $dirOpsMktPermNames)->pluck('id')->toArray()
        );

        $gmPermNames = [
            'dashboard.view',
            'dashboard.drilldown',
            'attendance.view',
            'attendance.late_detail',
            'attendance.export',
            'permissions.view',
            'permissions.preview',
            'permissions.approve',
            'permissions.reject',
            'employees.view',
            'payroll.view',
            'master_payroll.view',
            'master_tindakan.view',
            'master_tindakan.create',
            'master_tindakan.update',
            'master_tindakan.delete',
            'employee_hr_actions.view',
            'employee_hr_actions.create',
            'late_rules.view',
            'overtime_rules.view',
            'reports.view',
            'reports.employee_detail',
            'reports.export_excel',
            'reports.export',
            'settings.view',
            'devices.view',
        ];
        $gmRole->permissions()->sync(
            AppPermission::whereIn('name', $gmPermNames)->pluck('id')->toArray()
        );

        $spvFinancePermNames = [
            'dashboard.view',
            'attendance.view',
            'permissions.view',
            'permissions.preview',
            'employees.view',
            'payroll.view',
            'payroll.allowance_detail',
            'payroll.deduction_detail',
            'payroll.attendance_detail',
            'payroll.dispense',
            'payroll.slip_detail',
            'payroll.pay',
            'payroll.recalculate',
            'payroll.export',
            'payroll.export_pdf',
            'master_payroll.view',
            'master_payroll.create',
            'master_payroll.update',
            'master_payroll.employee_salary',
            'master_payroll.reset_salary',
            'master_payroll.delete',
            'late_rules.view',
            'late_rules.create',
            'late_rules.update',
            'late_rules.delete',
            'late_rules.exemption',
            'overtime_rules.view',
            'overtime_rules.create',
            'overtime_rules.update',
            'overtime_rules.delete',
            'reports.view',
            'reports.employee_detail',
            'reports.export_excel',
            'reports.export',
            'settings.view',
        ];
        $spvFinanceRole->permissions()->sync(
            AppPermission::whereIn('name', $spvFinancePermNames)->pluck('id')->toArray()
        );

        $spvOpsPermNames = [
            'dashboard.view',
            'attendance.view',
            'attendance.late_detail',
            'attendance.manual',
            'attendance.koreksi',
            'permissions.view',
            'permissions.preview',
            'permissions.approve',
            'permissions.reject',
            'employees.view',
            'master_tindakan.view',
            'employee_hr_actions.view',
            'employee_hr_actions.create',
            'late_rules.view',
            'overtime_rules.view',
            'reports.view',
            'reports.employee_detail',
            'settings.view',
            'devices.view',
            'devices.ping',
        ];
        $spvOpsRole->permissions()->sync(
            AppPermission::whereIn('name', $spvOpsPermNames)->pluck('id')->toArray()
        );

        $karyawanRole->permissions()->sync([]);

        $userRoleMap = [
            'bizdev@fastlogem.co.id' => $superAdminRole->id,
            'admin@fastlogem.co.id' => $superAdminRole->id,
            'dirut@fastlogem.co.id' => $dirutRole->id,
            'dir.finance@fastlogem.co.id' => $dirFinanceRole->id,
            'dir.ops@fastlogem.co.id' => $dirOpsMktRole->id,
            'gm@fastlogem.co.id' => $gmRole->id,
            'spv.finance@fastlogem.co.id' => $spvFinanceRole->id,
            'spv.ops@fastlogem.co.id' => $spvOpsRole->id,
            'user@fastlogem.co.id' => $karyawanRole->id,
            'staf.finance@fastlogem.co.id' => $karyawanRole->id,
        ];

        foreach ($userRoleMap as $email => $roleId) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->roles()->sync([$roleId]);
            }
        }

        $otherAdminUsers = User::where('role', 'admin')
            ->whereNotIn('email', array_keys($userRoleMap))
            ->get();
        foreach ($otherAdminUsers as $adminUser) {
            if ($adminUser->roles()->count() === 0) {
                $adminUser->roles()->sync([$superAdminRole->id]);
            }
        }

        $otherRegularUsers = User::where('role', 'user')
            ->whereNotIn('email', array_keys($userRoleMap))
            ->get();
        foreach ($otherRegularUsers as $regularUser) {
            if ($regularUser->roles()->count() === 0) {
                $regularUser->roles()->sync([$karyawanRole->id]);
            }
        }
    }
}
