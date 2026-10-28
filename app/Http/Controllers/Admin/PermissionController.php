<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceAnomaly;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\OvertimeLog;
use App\Models\Permission;
use App\Notifications\PermissionStatusUpdatedNotification;
use App\Services\OvertimeCalculationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category') ?? $request->query('kategori');
        $status = $request->query('status');
        $search = $request->query('search') ?? $request->query('cari');

        $query = Permission::with('employee')->latest('created_at');

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($status) && $status !== 'all') {
            $statusVal = match(strtolower($status)) {
                'pending' => 'menunggu',
                'approved' => 'disetujui',
                'rejected' => 'ditolak',
                default => strtolower($status),
            };
            $query->where('status', $statusVal);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%")
                         ->orWhere('dept', 'like', "%{$search}%");
                  });
            });
        }

        $permissions = $query->get();

        $anomaliesQuery = AttendanceAnomaly::with('employee')->latest('waktu_tap');
        $overtimeQuery = OvertimeLog::with('employee')->latest('waktu_tap');

        if (!empty($status) && $status !== 'all') {
            $statusUpper = match(strtoupper($status)) {
                'PENDING', 'MENUNGGU' => 'MENUNGGU',
                'APPROVED', 'DISETUJUI' => 'DISETUJUI',
                'REJECTED', 'DITOLAK' => 'DITOLAK',
                default => strtoupper($status),
            };
            $anomaliesQuery->where('status', $statusUpper);
            $overtimeQuery->where('status', $statusUpper);
        }

        if (!empty($search)) {
            $anomaliesQuery->where(function ($q) use ($search) {
                $q->where('alasan', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
            $overtimeQuery->where(function ($q) use ($search) {
                $q->where('catatan_admin', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
        }

        $anomalies = $anomaliesQuery->get();
        $overtimes = $overtimeQuery->get();

        $pendingPermissionsCount = Permission::whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending'])->count();
        $pendingAnomaliesCount = AttendanceAnomaly::whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending'])->count();
        $pendingOvertimeCount = OvertimeLog::whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending'])->count();

        $stats = [
            'pending' => $pendingPermissionsCount + $pendingAnomaliesCount + $pendingOvertimeCount,
            'menunggu' => $pendingPermissionsCount + $pendingAnomaliesCount + $pendingOvertimeCount,
            'di_luar_jadwal' => AttendanceAnomaly::count(),
            'izin_sakit' => Permission::whereIn(DB::raw('LOWER(category)'), ['izin', 'sakit', 'cuti', 'dispensasi_payroll'])->count(),
            'izin_cuti' => Permission::whereIn(DB::raw('LOWER(category)'), ['izin', 'sakit', 'cuti', 'dispensasi_payroll'])->count(),
            'sakit' => Permission::where(DB::raw('LOWER(category)'), 'sakit')->count(),
            'lembur_dinas' => Permission::whereIn(DB::raw('LOWER(category)'), ['lembur', 'dinas'])->count() + OvertimeLog::count(),
        ];

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
            'anomalies' => $anomalies,
            'overtime' => $overtimes,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $startDate = $request->input('tanggal_mulai') ?? $request->input('start_date');
        $endDate = $request->input('tanggal_selesai') ?? $request->input('end_date') ?? $startDate;
        $startTime = $request->input('jam_mulai') ?? $request->input('start_time');
        $endTime = $request->input('jam_selesai') ?? $request->input('end_time');
        $duration = $request->input('durasi') ?? $request->input('duration');
        $description = $request->input('keterangan') ?? $request->input('description');
        $status = $request->input('status') ?? 'menunggu';

        $statusVal = match(strtolower($status)) {
            'pending' => 'menunggu',
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            default => strtolower($status),
        };

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'category' => 'required|in:izin,sakit,cuti,dinas,lembur',
            'attachment' => 'nullable|file|max:5120',
            'lampiran' => 'nullable|file|max:5120',
        ]);

        if (!$startDate) {
            return response()->json(['success' => false, 'message' => 'Tanggal mulai wajib diisi.'], 422);
        }

        $employee = Employee::findOrFail($validated['employee_id']);

        $existing = Permission::where('employee_id', $employee->id)
            ->whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending', 'disetujui', 'approved'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereDate('tanggal_mulai', '<=', $endDate)
                  ->where(function ($sub) use ($startDate) {
                      $sub->where(function ($s1) use ($startDate) {
                          $s1->whereNotNull('tanggal_selesai')
                             ->where('tanggal_selesai', '!=', '')
                             ->whereDate('tanggal_selesai', '>=', $startDate);
                      })->orWhere(function ($s2) use ($startDate) {
                          $s2->where(function ($s3) {
                              $s3->whereNull('tanggal_selesai')
                                 ->orWhere('tanggal_selesai', '');
                          })->whereDate('tanggal_mulai', '>=', $startDate);
                      });
                  });
            })
            ->first();

        if ($existing) {
            $existingCat = ucfirst($existing->category);
            return response()->json([
                'success' => false,
                'message' => 'Karyawan sudah memiliki pengajuan ' . $existingCat . ' pada rentang tanggal tersebut yang berstatus menunggu atau disetujui.',
            ], 422);
        }

        $attachmentPath = null;
        $file = $request->file('attachment') ?? $request->file('lampiran');
        if ($file) {
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $file->move(public_path('uploads/permissions'), $filename);
            $attachmentPath = $filename;
        }

        if (empty($duration)) {
            if (!empty($startTime) && !empty($endTime)) {
                $duration = $startTime . ' - ' . $endTime;
            } elseif (!empty($endDate) && $endDate !== $startDate) {
                $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
                $duration = $days . ' Hari';
            } else {
                $duration = '1 Hari';
            }
        }

        $permission = Permission::create([
            'employee_id' => $employee->id,
            'user_id' => $employee->user_id,
            'category' => $validated['category'],
            'tanggal_mulai' => $startDate,
            'tanggal_selesai' => $endDate,
            'jam_mulai' => $startTime ?: null,
            'jam_selesai' => $endTime ?: null,
            'durasi' => $duration,
            'keterangan' => $description ?: null,
            'lampiran' => $attachmentPath,
            'status' => $statusVal,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin / lembur berhasil disimpan ke database.',
            'permission' => $permission->load('employee'),
        ], 201);
    }

    public function approve(Request $request, string|int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');

        $permission->status = 'disetujui';
        $permission->catatan_admin = $adminNote;
        $permission->save();

        $this->syncApprovedPermission($permission, $adminNote);

        $targetUser = $permission->user ?? ($permission->employee ? $permission->employee->user : null);
        if ($targetUser) {
            $targetUser->notify(new PermissionStatusUpdatedNotification($permission));
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil disetujui.',
            'permission' => $permission->load('employee'),
        ]);
    }

    public function reject(Request $request, string|int $id): JsonResponse
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $adminNote = $request->input('catatan_admin') ?? $request->input('admin_note');

        $permission->status = 'ditolak';
        $permission->catatan_admin = $adminNote;
        $permission->save();

        if (strtolower($permission->category ?? '') === 'lembur') {
            $startDate = Carbon::parse($permission->tanggal_mulai)->toDateString();
            $endDate = ($permission->tanggal_selesai ? Carbon::parse($permission->tanggal_selesai) : Carbon::parse($permission->tanggal_mulai))->toDateString();
            OvertimeLog::where('employee_id', $permission->employee_id)
                ->whereDate('waktu_tap', '>=', $startDate)
                ->whereDate('waktu_tap', '<=', $endDate)
                ->update(['status' => 'DITOLAK']);
        }

        $targetUser = $permission->user ?? ($permission->employee ? $permission->employee->user : null);
        if ($targetUser) {
            $targetUser->notify(new PermissionStatusUpdatedNotification($permission));
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan telah ditolak.',
            'permission' => $permission->load('employee'),
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $type = $request->input('source') ?? $request->input('type');

        if ($type === 'overtime' || $type === 'lembur') {
            $overtime = OvertimeLog::find($id);
            if (!$overtime) {
                return response()->json(['success' => false, 'message' => 'Data lembur tidak ditemukan.'], 404);
            }
            $statusUpper = match (strtoupper($request->input('status') ?? '')) {
                'DISETUJUI', 'APPROVED' => 'DISETUJUI',
                'DITOLAK', 'REJECTED' => 'DITOLAK',
                'MENUNGGU', 'PENDING' => 'MENUNGGU',
                default => null,
            };
            if ($statusUpper) {
                $overtime->status = $statusUpper;
            }
            if ($request->has('catatan_admin')) {
                $overtime->catatan_admin = $request->input('catatan_admin');
            }
            $overtime->save();
            return response()->json([
                'success' => true,
                'message' => 'Data lembur berhasil diperbarui.',
                'overtime' => $overtime->load('employee'),
            ]);
        }

        if ($type === 'anomaly' || $type === 'di_luar_jadwal') {
            $anomaly = AttendanceAnomaly::find($id);
            if (!$anomaly) {
                return response()->json(['success' => false, 'message' => 'Data di luar jadwal tidak ditemukan.'], 404);
            }
            $statusUpper = match (strtoupper($request->input('status') ?? '')) {
                'DISETUJUI', 'APPROVED' => 'DISETUJUI',
                'DITOLAK', 'REJECTED' => 'DITOLAK',
                'MENUNGGU', 'PENDING' => 'MENUNGGU',
                default => null,
            };
            if ($statusUpper) {
                $anomaly->status = $statusUpper;
            }
            if ($request->has('catatan_admin')) {
                $anomaly->catatan_admin = $request->input('catatan_admin');
            }
            $anomaly->save();
            return response()->json([
                'success' => true,
                'message' => 'Data di luar jadwal berhasil diperbarui.',
                'anomaly' => $anomaly->load('employee'),
            ]);
        }

        $permission = Permission::find($id);

        if (!$permission) {
            $overtime = OvertimeLog::find($id);
            if ($overtime) {
                $statusUpper = match (strtoupper($request->input('status') ?? '')) {
                    'DISETUJUI', 'APPROVED' => 'DISETUJUI',
                    'DITOLAK', 'REJECTED' => 'DITOLAK',
                    'MENUNGGU', 'PENDING' => 'MENUNGGU',
                    default => null,
                };
                if ($statusUpper) {
                    $overtime->status = $statusUpper;
                }
                if ($request->has('catatan_admin')) {
                    $overtime->catatan_admin = $request->input('catatan_admin');
                }
                $overtime->save();
                return response()->json([
                    'success' => true,
                    'message' => 'Data lembur berhasil diperbarui.',
                    'overtime' => $overtime->load('employee'),
                ]);
            }

            $anomaly = AttendanceAnomaly::find($id);
            if ($anomaly) {
                $statusUpper = match (strtoupper($request->input('status') ?? '')) {
                    'DISETUJUI', 'APPROVED' => 'DISETUJUI',
                    'DITOLAK', 'REJECTED' => 'DITOLAK',
                    'MENUNGGU', 'PENDING' => 'MENUNGGU',
                    default => null,
                };
                if ($statusUpper) {
                    $anomaly->status = $statusUpper;
                }
                if ($request->has('catatan_admin')) {
                    $anomaly->catatan_admin = $request->input('catatan_admin');
                }
                $anomaly->save();
                return response()->json([
                    'success' => true,
                    'message' => 'Data di luar jadwal berhasil diperbarui.',
                    'anomaly' => $anomaly->load('employee'),
                ]);
            }

            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'status' => 'nullable|string|in:menunggu,disetujui,ditolak,pending,approved,rejected',
            'catatan_admin' => 'nullable|string|max:500',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        if (isset($validated['status'])) {
            $newStatus = match(strtolower($validated['status'])) {
                'pending' => 'menunggu',
                'approved' => 'disetujui',
                'rejected' => 'ditolak',
                default => strtolower($validated['status']),
            };
            $permission->status = $newStatus;

            if ($newStatus === 'disetujui') {
                $this->syncApprovedPermission($permission, $validated['catatan_admin'] ?? null);
            } elseif ($newStatus === 'ditolak' && strtolower($permission->category ?? '') === 'lembur') {
                $startDate = Carbon::parse($permission->tanggal_mulai)->toDateString();
                $endDate = ($permission->tanggal_selesai ? Carbon::parse($permission->tanggal_selesai) : Carbon::parse($permission->tanggal_mulai))->toDateString();
                OvertimeLog::where('employee_id', $permission->employee_id)
                    ->whereDate('waktu_tap', '>=', $startDate)
                    ->whereDate('waktu_tap', '<=', $endDate)
                    ->update(['status' => 'DITOLAK']);
            }
        }

        if (array_key_exists('catatan_admin', $validated)) {
            $permission->catatan_admin = $validated['catatan_admin'];
        }

        if (!empty($validated['keterangan'])) {
            $permission->keterangan = $validated['keterangan'];
        }

        $permission->save();

        if (isset($validated['status'])) {
            $targetUser = $permission->user ?? ($permission->employee ? $permission->employee->user : null);
            if ($targetUser) {
                $targetUser->notify(new PermissionStatusUpdatedNotification($permission));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data perizinan berhasil diperbarui.',
            'permission' => $permission->load('employee'),
        ]);
    }

    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $type = $request->input('source') ?? $request->query('source') ?? $request->input('type') ?? $request->query('type');

        if ($type === 'overtime' || $type === 'lembur') {
            $overtime = OvertimeLog::find($id);
            if ($overtime) {
                $overtime->delete();
                return response()->json(['success' => true, 'message' => 'Data lembur berhasil dihapus.']);
            }
            return response()->json(['success' => false, 'message' => 'Data lembur tidak ditemukan.'], 404);
        }

        if ($type === 'anomaly' || $type === 'di_luar_jadwal') {
            $anomaly = AttendanceAnomaly::find($id);
            if ($anomaly) {
                $anomaly->delete();
                return response()->json(['success' => true, 'message' => 'Data di luar jadwal berhasil dihapus.']);
            }
            return response()->json(['success' => false, 'message' => 'Data di luar jadwal tidak ditemukan.'], 404);
        }

        $permission = Permission::find($id);

        if (!$permission) {
            $overtime = OvertimeLog::find($id);
            if ($overtime) {
                $overtime->delete();
                return response()->json(['success' => true, 'message' => 'Data lembur berhasil dihapus.']);
            }

            $anomaly = AttendanceAnomaly::find($id);
            if ($anomaly) {
                $anomaly->delete();
                return response()->json(['success' => true, 'message' => 'Data di luar jadwal berhasil dihapus.']);
            }

            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        if ($permission->lampiran && file_exists(public_path('uploads/permissions/' . $permission->lampiran))) {
            @unlink(public_path('uploads/permissions/' . $permission->lampiran));
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pengajuan berhasil dihapus.',
        ]);
    }

    protected function syncApprovedPermission(Permission $permission, ?string $adminNote = null): void
    {
        $category = strtolower($permission->category ?? '');

        if (in_array($category, ['izin', 'sakit', 'cuti', 'dispensasi_payroll'])) {
            $startDate = Carbon::parse($permission->tanggal_mulai);
            $endDate = $permission->tanggal_selesai ? Carbon::parse($permission->tanggal_selesai) : $startDate;

            $curr = $startDate->copy();
            while ($curr->lte($endDate)) {
                $attendance = Attendance::firstOrNew([
                    'employee_id' => $permission->employee_id,
                    'tanggal' => $curr->toDateString(),
                ]);
                if (!$attendance->exists) {
                    $attendance->user_id = $permission->user_id;
                    $attendance->status = 'hadir';
                    $attendance->save();
                }
                $curr->addDay();
            }
            return;
        }

        if ($category === 'absensi') {
            $dateStr = Carbon::parse($permission->tanggal_mulai)->toDateString();
            $desc = strtolower($permission->keterangan ?? '');
            $isTapIn = str_contains($desc, '[tap in]');
            $isTapOut = str_contains($desc, '[tap out]');

            if ($permission->jam_mulai) {
                $tapDateTime = Carbon::parse($dateStr . ' ' . $permission->jam_mulai);
            } elseif ($permission->created_at) {
                $tapDateTime = Carbon::parse($permission->created_at);
            } else {
                $tapDateTime = Carbon::now();
            }

            $attendance = Attendance::firstOrNew([
                'employee_id' => $permission->employee_id,
                'tanggal' => $dateStr,
            ]);

            if (!$attendance->exists) {
                $attendance->user_id = $permission->user_id;
                $attendance->status = 'hadir';
            }

            if (!$isTapIn && !$isTapOut) {
                if (!$attendance->jam_masuk) {
                    $isTapIn = true;
                } else {
                    $isTapOut = true;
                }
            }

            if ($isTapIn) {
                $attendance->jam_masuk = $tapDateTime;
            } else {
                $attendance->jam_pulang = $tapDateTime;
            }
            $attendance->save();

            $cloudId = $permission->employee?->cloud_id ?: 'MOBILE_GPS';
            $pin = $permission->employee?->pin ?: ($permission->employee?->nik ?: (string)$permission->employee_id);

            AttendanceLog::create([
                'employee_id' => $permission->employee_id,
                'device_id' => null,
                'cloud_id' => $cloudId,
                'pin' => $pin,
                'scan_at' => $tapDateTime,
                'verify_method' => 'mobile_gps',
                'status_scan' => $isTapIn ? '0' : '1',
                'raw_data' => [
                    'source' => 'pengajuan_absensi',
                    'permission_id' => $permission->id,
                    'keterangan' => $permission->keterangan,
                    'lampiran' => $permission->lampiran,
                ],
            ]);

            return;
        }

        if ($category === 'lembur') {
            $startDate = Carbon::parse($permission->tanggal_mulai);
            $endDate = $permission->tanggal_selesai ? Carbon::parse($permission->tanggal_selesai) : $startDate;
            $overtimeService = app(OvertimeCalculationService::class);
            $staffCategory = $overtimeService->determineStaffCategory($permission->employee);
            $settings = $overtimeService->getSettings();
            $catLower = strtolower($staffCategory);

            $curr = $startDate->copy();
            while ($curr->lte($endDate)) {
                $dateStr = $curr->toDateString();
                $eval = $overtimeService->evaluateOvertimeDay($permission->employee, $curr);
                $tipeLembur = $permission->tipe_lembur ?: $eval['tipe_lembur'];

                $nominal = match ($tipeLembur) {
                    'HARI_BESAR' => (float)($settings['overtime_' . $catLower . '_holiday_rate'] ?? 300000),
                    'WEEKENDS' => (float)($settings['overtime_' . $catLower . '_weekend_rate'] ?? 75000),
                    default => (float)($settings['overtime_' . $catLower . '_daily_rate'] ?? 50000),
                };

                $defaultTime = match ($tipeLembur) {
                    'HARI_BESAR' => '08:00:00',
                    'WEEKENDS' => ($staffCategory === 'LAPANGAN' ? '12:01:00' : '13:00:00'),
                    default => ($staffCategory === 'LAPANGAN' ? '16:31:00' : '17:00:00'),
                };

                $tapTime = Carbon::parse($dateStr . ' ' . ($permission->jam_mulai ?: $defaultTime));

                $attendance = Attendance::firstOrNew([
                    'employee_id' => $permission->employee_id,
                    'tanggal' => $dateStr,
                ]);
                if (!$attendance->exists) {
                    $attendance->user_id = $permission->user_id;
                    $attendance->status = 'hadir';
                    $attendance->save();
                }

                OvertimeLog::updateOrCreate(
                    [
                        'employee_id' => $permission->employee_id,
                        'waktu_tap' => $tapTime,
                    ],
                    [
                        'user_id' => $permission->user_id,
                        'attendance_id' => $attendance->id,
                        'durasi_menit' => 0,
                        'tipe_lembur' => $tipeLembur,
                        'kategori_staf' => $staffCategory,
                        'nominal' => $nominal,
                        'status' => 'DISETUJUI',
                        'catatan_admin' => $adminNote ?: 'Disetujui dari Pengajuan Lembur',
                    ]
                );

                $curr->addDay();
            }
        }
    }
}
