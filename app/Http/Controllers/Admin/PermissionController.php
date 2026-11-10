<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
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

        $query = Permission::nonAdmin()->with('employee')
            ->where('category', '!=', 'absensi')
            ->latest('created_at');

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($status) && $status !== 'all') {
            $statusVal = strtolower($status);
            if ($statusVal === 'pending' || $statusVal === 'menunggu') {
                $query->whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending']);
            } elseif ($statusVal === 'approved' || $statusVal === 'disetujui') {
                $query->whereIn(DB::raw('LOWER(status)'), ['disetujui', 'approved']);
            } elseif ($statusVal === 'rejected' || $statusVal === 'ditolak') {
                $query->whereIn(DB::raw('LOWER(status)'), ['ditolak', 'rejected']);
            } else {
                $query->where(DB::raw('LOWER(status)'), $statusVal);
            }
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

        $overtimeQuery = OvertimeLog::nonAdmin()->with('employee')->latest('waktu_tap');

        if (!empty($status) && $status !== 'all') {
            $statusUpper = match(strtoupper($status)) {
                'PENDING', 'MENUNGGU' => ['MENUNGGU', 'PENDING'],
                'APPROVED', 'DISETUJUI' => ['DISETUJUI', 'APPROVED'],
                'REJECTED', 'DITOLAK' => ['DITOLAK', 'REJECTED'],
                default => [strtoupper($status), strtolower($status)],
            };
            $overtimeQuery->whereIn('status', $statusUpper);
        }

        if (!empty($search)) {
            $overtimeQuery->where(function ($q) use ($search) {
                $q->where('catatan_admin', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('nama', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
        }

        $overtimes = $overtimeQuery->get();

        $pendingPermissionsCount = Permission::whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending'])
            ->where('category', '!=', 'absensi')
            ->count();

        $approvedLemburs = Permission::where(DB::raw('LOWER(category)'), 'lembur')
            ->whereIn(DB::raw('LOWER(status)'), ['disetujui', 'approved'])
            ->get();

        $totalMinutes = 0;
        $totalDays = 0;
        foreach ($approvedLemburs as $p) {
            if (!empty($p->jam_mulai) && !empty($p->jam_selesai)) {
                try {
                    $st = Carbon::parse($p->jam_mulai);
                    $en = Carbon::parse($p->jam_selesai);
                    if ($en->greaterThan($st)) {
                        $totalMinutes += $st->diffInMinutes($en);
                        continue;
                    }
                } catch (\Throwable $e) {}
            }

            $d = 1;
            if (!empty($p->durasi) && is_numeric($p->durasi)) {
                $d = (int)$p->durasi;
            } elseif (!empty($p->tanggal_mulai) && !empty($p->tanggal_selesai)) {
                $d = Carbon::parse($p->tanggal_mulai)->diffInDays(Carbon::parse($p->tanggal_selesai)) + 1;
            }
            $totalDays += $d;
        }

        if ($totalMinutes > 0 && $totalDays > 0) {
            $hours = floor($totalMinutes / 60);
            $mins = $totalMinutes % 60;
            $timeStr = $hours > 0 ? "{$hours} Jam" : '';
            if ($mins > 0) $timeStr .= ($timeStr ? " " : "") . "{$mins} Menit";
            $lemburDisetujuiDisplay = "{$totalDays} Hari (" . trim($timeStr) . ")";
        } elseif ($totalMinutes > 0) {
            $hours = floor($totalMinutes / 60);
            $mins = $totalMinutes % 60;
            $timeStr = $hours > 0 ? "{$hours} Jam" : '';
            if ($mins > 0) $timeStr .= ($timeStr ? " " : "") . "{$mins} Menit";
            $lemburDisetujuiDisplay = trim($timeStr);
        } else {
            $lemburDisetujuiDisplay = "{$totalDays} Hari";
        }

        $stats = [
            'pending' => $pendingPermissionsCount,
            'menunggu' => $pendingPermissionsCount,
            'di_luar_jadwal' => 0,
            'izin_sakit' => Permission::whereIn(DB::raw('LOWER(category)'), ['izin', 'sakit', 'cuti', 'dispensasi_payroll'])->count(),
            'dinas' => Permission::where(DB::raw('LOWER(category)'), 'dinas')->count(),
            'lembur_disetujui' => $lemburDisetujuiDisplay,
            'lembur_dinas' => $lemburDisetujuiDisplay,
            'sakit' => Permission::where(DB::raw('LOWER(category)'), 'sakit')->count(),
        ];

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
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

        $employee = Employee::nonAdmin()->findOrFail($validated['employee_id']);

        $existing = Permission::where('employee_id', $employee->id)
            ->whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending', 'disetujui', 'approved'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereDate('tanggal_mulai', '<=', $endDate)
                  ->where(function ($sub) use ($startDate) {
                      $sub->where(function ($s1) use ($startDate) {
                          $s1->whereNotNull('tanggal_selesai')
                             ->whereDate('tanggal_selesai', '>=', $startDate);
                      })->orWhere(function ($s2) use ($startDate) {
                          $s2->whereNull('tanggal_selesai')
                             ->whereDate('tanggal_mulai', '>=', $startDate);
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
        $cleanId = preg_replace('/^(ot_|perm_|db_perm_|anom_)/', '', (string)$id);
        $type = $request->input('source') ?? $request->input('type');

        if (str_starts_with((string)$id, 'ot_') || $type === 'overtime' || $type === 'lembur') {
            $overtime = OvertimeLog::find($cleanId);
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
            if ($request->has('tipe_lembur')) {
                $overtime->tipe_lembur = strtoupper($request->input('tipe_lembur'));
            }
            if ($request->has('jam_mulai') && !empty($request->input('jam_mulai'))) {
                $jMulai = $request->input('jam_mulai');
                $dStr = Carbon::parse($overtime->waktu_tap)->format('Y-m-d');
                $overtime->waktu_tap = Carbon::parse($dStr . ' ' . $jMulai);
            }
            if ($request->has('jam_mulai') && $request->has('jam_selesai') && !empty($request->input('jam_mulai')) && !empty($request->input('jam_selesai'))) {
                $t1 = Carbon::parse('2000-01-01 ' . $request->input('jam_mulai'));
                $t2 = Carbon::parse('2000-01-01 ' . $request->input('jam_selesai'));
                if ($t2->lt($t1)) $t2->addDay();
                $overtime->durasi_menit = max(0, $t1->diffInMinutes($t2));
            }
            $overtime->save();
            return response()->json([
                'success' => true,
                'message' => 'Data lembur berhasil diperbarui.',
                'overtime' => $overtime->load('employee'),
            ]);
        }

        $permission = Permission::find($cleanId);

        if (!$permission) {
            $overtime = OvertimeLog::find($cleanId);
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

            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'status' => 'nullable|string|in:menunggu,disetujui,ditolak,pending,approved,rejected',
            'catatan_admin' => 'nullable|string|max:500',
            'keterangan' => 'nullable|string|max:1000',
            'jam_mulai' => 'nullable|string|max:10',
            'jam_selesai' => 'nullable|string|max:10',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'tipe_lembur' => 'nullable|string|max:50',
            'durasi' => 'nullable|string|max:50',
        ]);

        if (array_key_exists('catatan_admin', $validated)) {
            $permission->catatan_admin = $validated['catatan_admin'];
        }

        if (!empty($validated['keterangan'])) {
            $permission->keterangan = $validated['keterangan'];
        }

        if (strtolower($permission->category ?? '') === 'lembur') {
            if (!empty($validated['jam_mulai'])) {
                $permission->jam_mulai = strlen($validated['jam_mulai']) === 5 ? $validated['jam_mulai'] . ':00' : $validated['jam_mulai'];
            }
            if (!empty($validated['jam_selesai'])) {
                $permission->jam_selesai = strlen($validated['jam_selesai']) === 5 ? $validated['jam_selesai'] . ':00' : $validated['jam_selesai'];
            }
            if (!empty($validated['tanggal_mulai'])) {
                $permission->tanggal_mulai = $validated['tanggal_mulai'];
            }
            if (!empty($validated['tanggal_selesai'])) {
                $permission->tanggal_selesai = $validated['tanggal_selesai'];
            }
            if (!empty($validated['tipe_lembur'])) {
                $permission->tipe_lembur = strtoupper($validated['tipe_lembur']);
            }
            if (!empty($validated['durasi'])) {
                $permission->durasi = $validated['durasi'];
            } elseif ($permission->jam_mulai && $permission->jam_selesai) {
                $t1 = Carbon::parse('2000-01-01 ' . $permission->jam_mulai);
                $t2 = Carbon::parse('2000-01-01 ' . $permission->jam_selesai);
                if ($t2->lt($t1)) $t2->addDay();
                $diffMins = $t1->diffInMinutes($t2);
                $diffHours = round($diffMins / 60, 1);
                $permission->durasi = $diffHours . ' Jam';
            }
        }

        if (isset($validated['status'])) {
            $newStatus = match(strtolower($validated['status'])) {
                'pending' => 'menunggu',
                'approved' => 'disetujui',
                'rejected' => 'ditolak',
                default => strtolower($validated['status']),
            };
            $permission->status = $newStatus;
        }

        $permission->save();

        if (strtolower($permission->category ?? '') === 'lembur') {
            if ($permission->status === 'disetujui') {
                $this->syncApprovedPermission($permission, $permission->catatan_admin);
            } elseif ($permission->status === 'ditolak') {
                $startDate = Carbon::parse($permission->tanggal_mulai)->toDateString();
                $endDate = ($permission->tanggal_selesai ? Carbon::parse($permission->tanggal_selesai) : Carbon::parse($permission->tanggal_mulai))->toDateString();
                OvertimeLog::where('employee_id', $permission->employee_id)
                    ->whereDate('waktu_tap', '>=', $startDate)
                    ->whereDate('waktu_tap', '<=', $endDate)
                    ->update(['status' => 'DITOLAK']);
            }
        } elseif ($permission->status === 'disetujui') {
            $this->syncApprovedPermission($permission, $permission->catatan_admin);
        }

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
        $cleanId = preg_replace('/^(ot_|perm_|db_perm_|anom_)/', '', (string)$id);
        $type = $request->input('source') ?? $request->query('source') ?? $request->input('type') ?? $request->query('type');

        if (str_starts_with((string)$id, 'ot_') || $type === 'overtime' || $type === 'lembur') {
            return response()->json(['success' => false, 'message' => 'Data lembur tidak dapat dihapus demi kepatuhan audit dan payroll.'], 403);
        }

        $permission = Permission::find($cleanId);

        if (!$permission) {
            $overtime = OvertimeLog::find($cleanId);
            if ($overtime) {
                return response()->json(['success' => false, 'message' => 'Data lembur tidak dapat dihapus demi kepatuhan audit dan payroll.'], 403);
            }

            return response()->json(['success' => false, 'message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        if (strtolower($permission->category ?? '') === 'lembur') {
            return response()->json(['success' => false, 'message' => 'Data lembur tidak dapat dihapus demi kepatuhan audit dan payroll.'], 403);
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
            $otCat = $overtimeService->getCategoryForEmployee($permission->employee);
            $settings = $overtimeService->getSettings();
            $catLower = strtolower($staffCategory);

            $curr = $startDate->copy();
            while ($curr->lte($endDate)) {
                $dateStr = $curr->toDateString();
                $eval = $overtimeService->evaluateOvertimeDay($permission->employee, $curr);
                $tipeLembur = $permission->tipe_lembur ?: $eval['tipe_lembur'];

                $nominal = match ($tipeLembur) {
                    'HARI_BESAR' => $otCat ? (float)$otCat->holiday_rate : (float)($settings['overtime_' . $catLower . '_holiday_rate'] ?? 0),
                    'WEEKENDS' => $otCat ? (float)$otCat->weekend_rate : (float)($settings['overtime_' . $catLower . '_weekend_rate'] ?? 0),
                    default => $otCat ? (float)$otCat->daily_rate : (float)($settings['overtime_' . $catLower . '_daily_rate'] ?? 0),
                };

                $defaultTime = match ($tipeLembur) {
                    'HARI_BESAR' => '08:00:00',
                    'WEEKENDS' => ($otCat?->weekend_start ? ($otCat->weekend_start . (strlen($otCat->weekend_start) === 5 ? ':00' : '')) : ($staffCategory === 'LAPANGAN' ? '12:01:00' : '13:00:00')),
                    default => ($otCat?->daily_start ? ($otCat->daily_start . (strlen($otCat->daily_start) === 5 ? ':00' : '')) : ($staffCategory === 'LAPANGAN' ? '16:31:00' : '17:00:00')),
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
