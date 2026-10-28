<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\Permission;
use App\Models\User;
use App\Notifications\NewPermissionSubmissionNotification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class UserPermissionController extends Controller
{
    protected function getOrCreateUserEmployee($user): Employee
    {
        if ($user->employee) {
            return $user->employee;
        }

        $employee = Employee::where('user_id', $user->id)
            ->orWhere('nama', $user->name)
            ->first();

        if ($employee) {
            if (!$employee->user_id) {
                $employee->update(['user_id' => $user->id]);
            }
            return $employee;
        }

        return Employee::create([
            'user_id' => $user->id,
            'nama' => $user->name,
            'nik' => 'EMP-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT),
            'dept' => 'Umum',
            'jabatan' => 'Staff',
            'status' => 'aktif',
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $baseQuery = Permission::where(function ($q) use ($employee, $user) {
            $q->where('employee_id', $employee->id)
              ->orWhere('user_id', $user->id);
        });

        $countIzin = (clone $baseQuery)->whereIn(DB::raw('LOWER(category)'), ['izin', 'cuti'])->count();
        $countSakit = (clone $baseQuery)->where(DB::raw('LOWER(category)'), 'sakit')->count();
        $countDinas = (clone $baseQuery)->where(DB::raw('LOWER(category)'), 'dinas')->count();
        $countLembur = (clone $baseQuery)->where(DB::raw('LOWER(category)'), 'lembur')->count();
        $countAbsensi = (clone $baseQuery)->where(DB::raw('LOWER(category)'), 'absensi')->count();
        $countMenunggu = (clone $baseQuery)->whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending'])->count();
        $countDisetujui = (clone $baseQuery)->whereIn(DB::raw('LOWER(status)'), ['disetujui', 'approved'])->count();
        $countDitolak = (clone $baseQuery)->whereIn(DB::raw('LOWER(status)'), ['ditolak', 'rejected'])->count();

        $recentPermissions = (clone $baseQuery)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'kategori' => ucfirst($p->category),
                    'raw_kategori' => $p->category,
                    'tanggal_mulai' => Carbon::parse($p->tanggal_mulai)->translatedFormat('d M Y'),
                    'tanggal_selesai' => Carbon::parse($p->tanggal_selesai)->translatedFormat('d M Y'),
                    'tanggal_format' => Carbon::parse($p->tanggal_mulai)->isSameDay(Carbon::parse($p->tanggal_selesai))
                        ? Carbon::parse($p->tanggal_mulai)->translatedFormat('l, d M Y')
                        : Carbon::parse($p->tanggal_mulai)->translatedFormat('d M Y') . ' - ' . Carbon::parse($p->tanggal_selesai)->translatedFormat('d M Y'),
                    'durasi' => $p->durasi . ' Hari',
                    'tipe_lembur' => $p->tipe_lembur,
                    'keterangan' => $p->keterangan,
                    'status' => ucfirst($p->status),
                    'raw_status' => $p->status,
                    'lampiran' => $p->lampiran ? '/uploads/permissions/' . $p->lampiran : null,
                    'catatan_admin' => $p->catatan_admin,
                    'created_at' => Carbon::parse($p->created_at)->translatedFormat('d M Y H:i'),
                ];
            });

        $overtimeService = app(\App\Services\OvertimeCalculationService::class);
        $otCat = $overtimeService->getCategoryForEmployee($employee);
        $staffCategory = $otCat ? strtoupper($otCat->kode) : $overtimeService->determineStaffCategory($employee);
        $categoryName = $otCat ? $otCat->nama : ($staffCategory === 'LAPANGAN' ? 'Staf Lapangan' : 'Staf Kantor');
        $overtimeSettings = $overtimeService->getSettings();
        $catLower = strtolower($staffCategory);

        $todayDate = date('Y-m-d');
        $todayLogs = AttendanceLog::where('employee_id', $employee->id)
            ->whereDate('scan_at', $todayDate)
            ->where('verify_method', 'mobile_gps')
            ->orderBy('scan_at', 'asc')
            ->get();

        $todayAttendance = [
            'has_tap_in' => false,
            'has_tap_out' => false,
            'tap_in' => null,
            'tap_out' => null,
        ];

        foreach ($todayLogs as $tl) {
            $raw = $tl->raw_data ?: [];
            if ($tl->status_scan === '0') {
                $todayAttendance['has_tap_in'] = true;
                $todayAttendance['tap_in'] = [
                    'id' => $tl->id,
                    'time' => substr($tl->getRawOriginal('scan_at'), 11, 5),
                    'keterangan' => $raw['keterangan'] ?? '',
                    'photo' => !empty($raw['lampiran']) ? '/uploads/permissions/' . $raw['lampiran'] : null,
                    'address' => $raw['location_address'] ?? '',
                ];
            } elseif ($tl->status_scan === '1') {
                $todayAttendance['has_tap_out'] = true;
                $todayAttendance['tap_out'] = [
                    'id' => $tl->id,
                    'time' => substr($tl->getRawOriginal('scan_at'), 11, 5),
                    'keterangan' => $raw['keterangan'] ?? '',
                    'photo' => !empty($raw['lampiran']) ? '/uploads/permissions/' . $raw['lampiran'] : null,
                    'address' => $raw['location_address'] ?? '',
                ];
            }
        }

        return response()->json([
            'employee' => [
                'id' => $employee->id,
                'nama' => $employee->nama,
                'nik' => $employee->nik,
                'dept' => $employee->dept,
                'jabatan' => $employee->jabatan,
                'kategori_staf' => $staffCategory,
                'is_exempt' => (bool)$employee->is_exempt,
            ],
            'overtime_rules' => [
                'staff_category' => $staffCategory,
                'category_name' => $categoryName,
                'daily_start' => $otCat ? $otCat->daily_start : ($overtimeSettings['overtime_' . $catLower . '_daily_start'] ?? ($staffCategory === 'LAPANGAN' ? '16:31' : '17:00')),
                'daily_rate' => $otCat ? (float)$otCat->daily_rate : ($overtimeSettings['overtime_' . $catLower . '_daily_rate'] ?? 50000),
                'weekend_start' => $otCat ? $otCat->weekend_start : ($overtimeSettings['overtime_' . $catLower . '_weekend_start'] ?? ($staffCategory === 'LAPANGAN' ? '12:01' : '13:00')),
                'weekend_rate' => $otCat ? (float)$otCat->weekend_rate : ($overtimeSettings['overtime_' . $catLower . '_weekend_rate'] ?? 75000),
                'holiday_rate' => $otCat ? (float)$otCat->holiday_rate : ($overtimeSettings['overtime_' . $catLower . '_holiday_rate'] ?? 300000),
            ],
            'stats' => [
                'izin' => $countIzin,
                'sakit' => $countSakit,
                'dinas' => $countDinas,
                'lembur' => $countLembur,
                'absensi' => $countAbsensi,
                'menunggu' => $countMenunggu,
                'disetujui' => $countDisetujui,
                'ditolak' => $countDitolak,
                'total' => $countIzin + $countSakit + $countDinas + $countLembur + $countAbsensi,
            ],
            'recent' => $recentPermissions,
            'today_attendance' => $todayAttendance,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $filterJenis = $request->query('jenis');
        $filterStatus = $request->query('status');
        $search = $request->query('search');

        $query = Permission::where(function ($q) use ($employee, $user) {
            $q->where('employee_id', $employee->id)
              ->orWhere('user_id', $user->id);
        })->latest('id');

        if (!empty($filterJenis) && $filterJenis !== 'Semua Jenis') {
            $query->where('category', strtolower($filterJenis));
        }

        if (!empty($filterStatus) && $filterStatus !== 'Semua Status') {
            $query->where('status', strtolower($filterStatus));
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('keterangan', 'like', '%' . $search . '%')
                  ->orWhere('category', 'like', '%' . $search . '%')
                  ->orWhere('tanggal_mulai', 'like', '%' . $search . '%')
                  ->orWhere('tanggal_selesai', 'like', '%' . $search . '%');
            });
        }

        $items = $query->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'kategori' => ucfirst($p->category),
                'raw_kategori' => $p->category,
                'tanggal_mulai' => Carbon::parse($p->tanggal_mulai)->format('Y-m-d'),
                'tanggal_selesai' => Carbon::parse($p->tanggal_selesai)->format('Y-m-d'),
                'tanggal_format' => Carbon::parse($p->tanggal_mulai)->isSameDay(Carbon::parse($p->tanggal_selesai))
                    ? Carbon::parse($p->tanggal_mulai)->translatedFormat('l, d M Y')
                    : Carbon::parse($p->tanggal_mulai)->translatedFormat('d M Y') . ' - ' . Carbon::parse($p->tanggal_selesai)->translatedFormat('d M Y'),
                'durasi' => $p->durasi . ' Hari',
                'tipe_lembur' => $p->tipe_lembur,
                'keterangan' => $p->keterangan,
                'status' => ucfirst($p->status),
                'raw_status' => $p->status,
                'lampiran' => $p->lampiran ? '/uploads/permissions/' . $p->lampiran : null,
                'lampiran_nama' => $p->lampiran,
                'catatan_admin' => $p->catatan_admin,
                'created_at' => Carbon::parse($p->created_at)->translatedFormat('d M Y H:i'),
            ];
        });

        return response()->json([
            'permissions' => $items,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:izin,sakit,dinas,cuti,lembur,absensi,Izin,Sakit,Dinas,Cuti,Lembur,Absensi',
            'tap_type' => 'nullable|string|in:in,out',
            'tipe_lembur' => 'nullable|string|in:DAILY,WEEKENDS,HARI_BESAR',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'jam_mulai' => 'nullable|string',
            'jam_selesai' => 'nullable|string',
            'keterangan' => 'required|string|max:1000',
            'lampiran' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
            'photo_base64' => 'nullable|string',
            'location_address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $start = Carbon::parse($validated['tanggal_mulai']);
        $end = Carbon::parse($validated['tanggal_selesai']);
        $duration = $start->diffInDays($end) + 1;

        $attachmentName = null;
        $uploadDir = public_path('uploads/permissions');

        if (!File::exists($uploadDir)) {
            File::makeDirectory($uploadDir, 0755, true);
        }

        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');
            $ext = $file->getClientOriginalExtension();
            $attachmentName = 'user_' . $user->id . '_' . time() . '_' . Str::random(6) . '.' . $ext;
            $file->move($uploadDir, $attachmentName);
        } elseif (!empty($validated['photo_base64'])) {
            $base64Data = $validated['photo_base64'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
                $type = strtolower($type[1]);
                $decoded = base64_decode($base64Data);
                if ($decoded !== false) {
                    $attachmentName = 'cam_' . $user->id . '_' . time() . '_' . Str::random(6) . '.' . $type;
                    file_put_contents($uploadDir . '/' . $attachmentName, $decoded);
                }
            }
        }

        $keterangan = trim($validated['keterangan']);
        if (!empty($validated['location_address'])) {
            $keterangan .= ' (Lokasi: ' . $validated['location_address'] . ')';
        }

        $category = strtolower($validated['category']);

        if ($category === 'absensi') {
            $tapType = $request->input('tap_type');
            $isTapIn = ($tapType === 'in') || str_contains(strtolower($validated['keterangan']), '[tap in]');
            $statusScan = $isTapIn ? '0' : '1';
            $scanDate = $validated['tanggal_mulai'];
            $tapDateTime = Carbon::now();

            $existingLog = AttendanceLog::where('employee_id', $employee->id)
                ->whereDate('scan_at', $scanDate)
                ->where('verify_method', 'mobile_gps')
                ->where('status_scan', $statusScan)
                ->first();

            $attendance = Attendance::firstOrNew([
                'employee_id' => $employee->id,
                'tanggal' => $scanDate,
            ]);
            if (!$attendance->exists) {
                $attendance->user_id = $user->id;
                $attendance->status = 'hadir';
            }
            if ($isTapIn) {
                $attendance->jam_masuk = $tapDateTime;
            } else {
                $attendance->jam_pulang = $tapDateTime;
            }
            $attendance->save();

            if ($existingLog) {
                if ($attachmentName && !empty($existingLog->raw_data['lampiran'])) {
                    $oldFile = public_path('uploads/permissions/' . $existingLog->raw_data['lampiran']);
                    if (File::exists($oldFile)) {
                        @unlink($oldFile);
                    }
                }

                $cloudId = $employee->cloud_id ?: 'MOBILE_GPS';
                $pin = $employee->pin ?: ($employee->nik ?: (string)$employee->id);

                while (AttendanceLog::where('cloud_id', $cloudId)
                    ->where('pin', $pin)
                    ->where('scan_at', $tapDateTime)
                    ->where('id', '!=', $existingLog->id)
                    ->exists()) {
                    $tapDateTime = $tapDateTime->copy()->addSecond();
                }

                $prevRaw = $existingLog->raw_data ?: [];
                $existingLog->scan_at = $tapDateTime;
                $existingLog->raw_data = [
                    'source' => 'absen_luar',
                    'tap_type' => $isTapIn ? 'in' : 'out',
                    'keterangan' => $keterangan,
                    'lampiran' => $attachmentName ?: ($prevRaw['lampiran'] ?? null),
                    'latitude' => $validated['latitude'] ?? ($prevRaw['latitude'] ?? null),
                    'longitude' => $validated['longitude'] ?? ($prevRaw['longitude'] ?? null),
                    'location_address' => $validated['location_address'] ?? ($prevRaw['location_address'] ?? null),
                ];
                $existingLog->save();

                $permTag = $isTapIn ? '%[Tap In]%' : '%[Tap Out]%';
                $existingPerm = Permission::where('employee_id', $employee->id)
                    ->where('category', 'absensi')
                    ->whereDate('tanggal_mulai', $scanDate)
                    ->where('keterangan', 'like', $permTag)
                    ->first();

                if ($existingPerm) {
                    if ($attachmentName && $existingPerm->lampiran && $existingPerm->lampiran !== $attachmentName) {
                        $oldPermFile = public_path('uploads/permissions/' . $existingPerm->lampiran);
                        if (File::exists($oldPermFile)) {
                            @unlink($oldPermFile);
                        }
                    }
                    $existingPerm->update([
                        'keterangan' => $keterangan,
                        'jam_mulai' => $tapDateTime->format('H:i:s'),
                        'lampiran' => $attachmentName ?: $existingPerm->lampiran,
                        'status' => 'disetujui',
                    ]);
                } else {
                    Permission::create([
                        'employee_id' => $employee->id,
                        'user_id' => $user->id,
                        'category' => 'absensi',
                        'tanggal_mulai' => $scanDate,
                        'tanggal_selesai' => $scanDate,
                        'jam_mulai' => $tapDateTime->format('H:i:s'),
                        'durasi' => 1,
                        'keterangan' => $keterangan,
                        'lampiran' => $attachmentName,
                        'status' => 'disetujui',
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Absensi ' . ($isTapIn ? 'Tap In (Masuk)' : 'Tap Out (Pulang)') . ' luar berhasil diperbarui.',
                    'log' => $existingLog,
                ]);
            }

            $cloudId = $employee->cloud_id ?: 'MOBILE_GPS';
            $pin = $employee->pin ?: ($employee->nik ?: (string)$employee->id);

            while (AttendanceLog::where('cloud_id', $cloudId)->where('pin', $pin)->where('scan_at', $tapDateTime)->exists()) {
                $tapDateTime = $tapDateTime->copy()->addSecond();
            }

            $log = AttendanceLog::create([
                'employee_id' => $employee->id,
                'device_id' => null,
                'cloud_id' => $cloudId,
                'pin' => $pin,
                'scan_at' => $tapDateTime,
                'verify_method' => 'mobile_gps',
                'status_scan' => $statusScan,
                'raw_data' => [
                    'source' => 'absen_luar',
                    'tap_type' => $isTapIn ? 'in' : 'out',
                    'keterangan' => $keterangan,
                    'lampiran' => $attachmentName,
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                    'location_address' => $validated['location_address'] ?? null,
                ],
            ]);

            $permission = Permission::create([
                'employee_id' => $employee->id,
                'user_id' => $user->id,
                'category' => 'absensi',
                'tanggal_mulai' => $scanDate,
                'tanggal_selesai' => $scanDate,
                'jam_mulai' => $tapDateTime->format('H:i:s'),
                'durasi' => 1,
                'keterangan' => $keterangan,
                'lampiran' => $attachmentName,
                'status' => 'disetujui',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Absensi ' . ($isTapIn ? 'Tap In (Masuk)' : 'Tap Out (Pulang)') . ' luar berhasil dicatat ke log absensi.',
                'log' => $log,
                'permission' => $permission,
            ], 201);
        }

        $tipeLembur = null;
        if ($category === 'lembur') {
            if (!empty($validated['tipe_lembur'])) {
                $tipeLembur = strtoupper($validated['tipe_lembur']);
            } else {
                $eval = app(\App\Services\OvertimeCalculationService::class)->evaluateOvertimeDay($employee, $validated['tanggal_mulai']);
                $tipeLembur = $eval['tipe_lembur'];
            }
        }

        $jamMulai = $validated['jam_mulai'] ?? null;

        $existing = Permission::where(function ($q) use ($employee, $user) {
                $q->where('employee_id', $employee->id)
                  ->orWhere('user_id', $user->id);
            })
            ->whereIn(DB::raw('LOWER(status)'), ['menunggu', 'pending', 'disetujui', 'approved'])
            ->where(function ($q) use ($validated) {
                $q->whereDate('tanggal_mulai', '<=', $validated['tanggal_selesai'])
                  ->where(function ($sub) use ($validated) {
                      $sub->where(function ($s1) use ($validated) {
                          $s1->whereNotNull('tanggal_selesai')
                             ->where('tanggal_selesai', '!=', '')
                             ->whereDate('tanggal_selesai', '>=', $validated['tanggal_mulai']);
                      })->orWhere(function ($s2) use ($validated) {
                          $s2->where(function ($s3) {
                              $s3->whereNull('tanggal_selesai')
                                 ->orWhere('tanggal_selesai', '');
                          })->whereDate('tanggal_mulai', '>=', $validated['tanggal_mulai']);
                      });
                  });
            })
            ->first();

        if ($existing) {
            $existingCat = ucfirst($existing->category);
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki pengajuan ' . $existingCat . ' pada rentang tanggal tersebut yang berstatus menunggu atau disetujui.',
            ], 422);
        }

        $permission = Permission::create([
            'employee_id' => $employee->id,
            'user_id' => $user->id,
            'category' => $category,
            'tipe_lembur' => $tipeLembur,
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'jam_mulai' => $jamMulai,
            'jam_selesai' => $validated['jam_selesai'] ?? null,
            'durasi' => $duration,
            'keterangan' => $keterangan,
            'lampiran' => $attachmentName,
            'status' => 'menunggu',
        ]);

        $admins = User::where('role', 'admin')->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewPermissionSubmissionNotification($permission->load('employee')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan ' . ucfirst($category) . ' berhasil dikirimkan dan menunggu persetujuan admin.',
            'permission' => $permission,
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $employee = $this->getOrCreateUserEmployee($user);

        $permission = Permission::where('id', $id)
            ->where(function ($q) use ($employee, $user) {
                $q->where('employee_id', $employee->id)
                  ->orWhere('user_id', $user->id);
            })
            ->first();

        if (!$permission) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan.'], 404);
        }

        if ($permission->status !== 'menunggu') {
            return response()->json([
                'message' => 'Hanya pengajuan dengan status menunggu yang dapat dibatalkan.'
            ], 422);
        }

        if ($permission->lampiran) {
            $filePath = public_path('uploads/permissions/' . $permission->lampiran);
            if (File::exists($filePath)) {
                File::delete($filePath);
            }
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil dibatalkan.'
        ]);
    }
}
