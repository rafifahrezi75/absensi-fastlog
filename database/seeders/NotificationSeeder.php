<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $user = User::where('role', 'user')->first();

        if ($admin) {
            DB::table('notifications')->insert([
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\NewPermissionSubmissionNotification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $admin->id,
                    'data' => json_encode([
                        'title' => 'Pengajuan Sakit Baru',
                        'message' => 'Budi Santoso mengajukan sakit (05 Okt 2026 - 06 Okt 2026).',
                        'category' => 'sakit',
                        'action_url' => '/admin/permissions',
                        'reference_id' => 1,
                        'reference_type' => 'permission',
                        'employee_name' => 'Budi Santoso',
                    ]),
                    'read_at' => null,
                    'created_at' => Carbon::now()->subMinutes(15),
                    'updated_at' => Carbon::now()->subMinutes(15),
                ],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\NewPermissionSubmissionNotification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $admin->id,
                    'data' => json_encode([
                        'title' => 'Pengajuan Cuti Baru',
                        'message' => 'alief mengajukan cuti (12 Okt 2026 - 14 Okt 2026).',
                        'category' => 'cuti',
                        'action_url' => '/admin/permissions',
                        'reference_id' => 2,
                        'reference_type' => 'permission',
                        'employee_name' => 'alief',
                    ]),
                    'read_at' => null,
                    'created_at' => Carbon::now()->subHours(2),
                    'updated_at' => Carbon::now()->subHours(2),
                ],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\NewPermissionSubmissionNotification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $admin->id,
                    'data' => json_encode([
                        'title' => 'Pengajuan Izin Baru',
                        'message' => 'Budi Santoso mengajukan izin (01 Okt 2026).',
                        'category' => 'izin',
                        'action_url' => '/admin/permissions',
                        'reference_id' => 3,
                        'reference_type' => 'permission',
                        'employee_name' => 'Budi Santoso',
                    ]),
                    'read_at' => Carbon::now()->subHours(10),
                    'created_at' => Carbon::now()->subDays(1),
                    'updated_at' => Carbon::now()->subHours(10),
                ],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\DeviceAlertNotification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $admin->id,
                    'data' => json_encode([
                        'title' => 'Peringatan Perangkat Offline',
                        'message' => 'Mesin Fingerspot Lantai 1 terputus dari jaringan lokal.',
                        'category' => 'device',
                        'action_url' => '/admin/devices',
                        'reference_id' => null,
                        'reference_type' => 'device',
                    ]),
                    'read_at' => Carbon::now()->subDays(2),
                    'created_at' => Carbon::now()->subDays(2),
                    'updated_at' => Carbon::now()->subDays(2),
                ],
            ]);
        }

        if ($user) {
            DB::table('notifications')->insert([
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\PermissionStatusUpdatedNotification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'title' => 'Pengajuan Izin Disetujui',
                        'message' => 'Pengajuan izin Anda telah disetujui. Catatan: Silakan beristirahat.',
                        'category' => 'izin',
                        'status' => 'disetujui',
                        'action_url' => '/user/riwayat',
                        'reference_id' => 3,
                        'reference_type' => 'permission',
                        'admin_note' => 'Silakan beristirahat.',
                    ]),
                    'read_at' => null,
                    'created_at' => Carbon::now()->subMinutes(30),
                    'updated_at' => Carbon::now()->subMinutes(30),
                ],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\PermissionStatusUpdatedNotification',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'title' => 'Pengajuan Lembur Disetujui',
                        'message' => 'Pengajuan lembur Anda pada tanggal 28 Sep 2026 telah disetujui.',
                        'category' => 'lembur',
                        'status' => 'disetujui',
                        'action_url' => '/user/riwayat',
                        'reference_id' => 4,
                        'reference_type' => 'permission',
                        'admin_note' => null,
                    ]),
                    'read_at' => Carbon::now()->subDays(3),
                    'created_at' => Carbon::now()->subDays(3),
                    'updated_at' => Carbon::now()->subDays(3),
                ],
            ]);
        }
    }
}
