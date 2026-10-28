<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\OvertimeLog;
use App\Models\Permission;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\LateCalculationService;
use App\Services\OvertimeCalculationService;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $dept = $request->input('dept');
        $search = $request->input('search');

        if (empty($startDate)) {
            $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
        }
        if (empty($endDate)) {
            $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
        }

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        if ($start->gt($end)) {
            $temp = $startDate;
            $startDate = $endDate;
            $endDate = $temp;
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
        }

        $query = Employee::query()->whereIn('status', ['active', 'aktif']);

        if (!empty($dept)) {
            $query->where('dept', $dept);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', '%' . $search . '%')
                  ->orWhere('nik', 'like', '%' . $search . '%')
                  ->orWhere('pin', 'like', '%' . $search . '%');
            });
        }

        $employees = $query->orderByRaw('nama IS NULL, nama ASC, CAST(pin AS UNSIGNED) ASC')->get();

        $employeeIds = $employees->pluck('id')->all();

        $approvedOvertimes = OvertimeLog::whereIn('employee_id', $employeeIds)
            ->whereIn('status', ['DISETUJUI', 'disetujui', 'APPROVED', 'approved'])
            ->whereBetween('waktu_tap', [$start, $end])
            ->get()
            ->groupBy(function ($ot) {
                return $ot->employee_id . '_' . Carbon::parse($ot->waktu_tap)->format('Y-m-d');
            });

        $approvedPermissions = Permission::whereIn('employee_id', $employeeIds)
            ->whereIn('status', ['DISETUJUI', 'disetujui', 'APPROVED', 'approved'])
            ->where(function ($q) use ($start, $end) {
                $q->whereDate('tanggal_mulai', '<=', $end->format('Y-m-d'))
                  ->whereDate('tanggal_selesai', '>=', $start->format('Y-m-d'));
            })
            ->get();

        $permissionsMap = [];
        foreach ($approvedPermissions as $perm) {
            $pStart = Carbon::parse($perm->tanggal_mulai)->startOfDay();
            $pEnd = Carbon::parse($perm->tanggal_selesai ?? $perm->tanggal_mulai)->endOfDay();
            $cat = strtolower($perm->category ?? 'izin');
            $statusCode = ($cat === 'sakit') ? 'S' : 'I';

            $pCurr = $pStart->copy();
            while ($pCurr->lte($pEnd)) {
                $permissionsMap[$perm->employee_id . '_' . $pCurr->format('Y-m-d')] = $statusCode;
                $pCurr->addDay();
            }
        }

        $logs = AttendanceLog::whereBetween('scan_at', [$start, $end])
            ->orderBy('scan_at', 'asc')
            ->get();

        $groupedLogs = [];
        foreach ($logs as $log) {
            $date = Carbon::parse($log->scan_at)->format('Y-m-d');
            $pin = (string)$log->pin;
            $empId = $log->employee_id ? (string)$log->employee_id : null;

            if ($empId) {
                $key = 'emp_' . $empId . '_' . $date;
                $groupedLogs[$key][] = $log->scan_at;
            }
            $pinKey = 'pin_' . $pin . '_' . $date;
            $groupedLogs[$pinKey][] = $log->scan_at;
        }

        $departments = Employee::whereNotNull('dept')
            ->where('dept', '!=', '')
            ->distinct()
            ->pluck('dept')
            ->values();

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalOut = $settingsData['normal_check_out'] ?? '17:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 0);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satOut = $settingsData['saturday_check_out'] ?? '12:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 0);
        $today = Carbon::today();
        $currentTimeStr = Carbon::now()->format('H:i:s');

        $nowYear = Carbon::now()->format('Y');
        $apiHolidays = Cache::remember('holidays_api_' . $nowYear, 86400, function () use ($nowYear) {
            try {
                $response = Http::withoutVerifying()->timeout(8)->get('https://api-hari-libur.vercel.app/api?year=' . $nowYear);
                if ($response->successful()) {
                    return $response->json('data') ?? [];
                }
            } catch (\Throwable $e) {
            }
            return [];
        });

        $holidaysMap = [];
        foreach ($apiHolidays as $item) {
            if (!empty($item['date'])) {
                $holidaysMap[$item['date']] = $item['description'] ?? 'Hari Libur Nasional';
            }
        }

        $startYear = $start->format('Y');
        if ($startYear !== $nowYear) {
            $periodHolidays = Cache::remember('holidays_api_' . $startYear, 86400, function () use ($startYear) {
                try {
                    $response = Http::withoutVerifying()->timeout(8)->get('https://api-hari-libur.vercel.app/api?year=' . $startYear);
                    if ($response->successful()) {
                        return $response->json('data') ?? [];
                    }
                } catch (\Throwable $e) {
                }
                return [];
            });
            foreach ($periodHolidays as $item) {
                if (!empty($item['date'])) {
                    $holidaysMap[$item['date']] = $item['description'] ?? 'Hari Libur Nasional';
                }
            }
        }

        $dbHolidays = Holiday::all();
        foreach ($dbHolidays as $h) {
            $dStr = Carbon::parse($h->tanggal)->format('Y-m-d');
            $holidaysMap[$dStr] = $h->keterangan;
        }

        $data = [];

        foreach ($employees as $emp) {
            $attendance = [];
            $current = $start->copy();

            while ($current->lte($end)) {
                $dateStr = $current->format('Y-m-d');
                $isSunday = $current->isSunday();
                $isHoliday = isset($holidaysMap[$dateStr]);
                $hasPermission = $permissionsMap[$emp->id . '_' . $dateStr] ?? null;

                if ($emp->is_exempt) {
                    if ($isHoliday) {
                        $status = 'LN';
                    } elseif ($isSunday) {
                        $status = 'L';
                    } elseif ($current->gt($today)) {
                        $status = '-';
                    } else {
                        $status = 'H';
                    }
                } else {
                    $scans = [];
                    $empKey = 'emp_' . $emp->id . '_' . $dateStr;
                    if (isset($groupedLogs[$empKey])) {
                        $scans = $groupedLogs[$empKey];
                    } elseif (!empty($emp->pin) && isset($groupedLogs['pin_' . $emp->pin . '_' . $dateStr])) {
                        $scans = $groupedLogs['pin_' . $emp->pin . '_' . $dateStr];
                    }

                    if (!empty($scans)) {
                        sort($scans);
                        $firstScan = Carbon::parse($scans[0]);
                        $lastScan = count($scans) > 1 ? Carbon::parse(end($scans)) : null;

                        $isSat = $current->isSaturday();
                        $schedInTime = $isSat ? $satIn : $normalIn;
                        $tol = $isSat ? $satTol : $normalTol;

                        $scheduleIn = Carbon::parse($dateStr . ' ' . $schedInTime . ':00');
                        $lateThreshold = $scheduleIn->copy()->addMinutes($tol);
                        $isLate = $firstScan->gt($lateThreshold);

                        $outBase = $isSat ? $satOut : $normalOut;
                        $overtimeThreshold = Carbon::parse($dateStr . ' ' . $outBase . ':00')->addMinutes(30);

                        $hasApprovedOt = isset($approvedOvertimes[$emp->id . '_' . $dateStr]);
                        $hasScanOt = $lastScan && $lastScan->gt($overtimeThreshold);
                        $hasOvertime = $hasApprovedOt || $hasScanOt;

                        if ($hasOvertime && !$isLate) {
                            $status = 'OT';
                        } elseif ($isLate) {
                            $status = 'T';
                        } else {
                            $status = 'H';
                        }
                    } else {
                        if ($isHoliday) {
                            $status = 'LN';
                        } elseif ($isSunday) {
                            $status = 'L';
                        } elseif ($hasPermission) {
                            $status = $hasPermission;
                        } elseif ($current->lt($today)) {
                            $status = 'A';
                        } elseif ($current->equalTo($today)) {
                            $isSat = $current->isSaturday();
                            $schedInTime = $isSat ? $satIn : $normalIn;
                            $tol = $isSat ? $satTol : $normalTol;
                            $lateThreshold = Carbon::parse($dateStr . ' ' . $schedInTime . ':00')->addMinutes($tol)->format('H:i:s');
                            $status = $currentTimeStr > $lateThreshold ? 'A' : '-';
                        } else {
                            $status = '-';
                        }
                    }
                }

                $attendance[$dateStr] = $status;
                $attendance[(int)$current->format('j')] = $status;

                $current->addDay();
            }

            $data[] = [
                'id' => $emp->id,
                'nama' => $emp->nama ?: 'Karyawan PIN ' . $emp->pin,
                'nik' => $emp->nik ?: '-',
                'pin' => $emp->pin ?: '-',
                'dept' => $emp->dept ?: 'Umum',
                'deptLabel' => $emp->dept ?: 'Umum',
                'jabatan' => $emp->jabatan ?: '-',
                'is_exempt' => (bool)$emp->is_exempt,
                'attendance' => $attendance,
            ];
        }

        return response()->json([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'departments' => $departments,
            'employees' => $data,
            'holidays' => $holidaysMap,
        ]);
    }

    private function prepareEmployeeReportData(Employee $employee, string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        if ($start->gt($end)) {
            $temp = $start;
            $start = $end->copy()->startOfDay();
            $end = $temp->copy()->endOfDay();
            $startDate = $start->format('Y-m-d');
            $endDate = $end->format('Y-m-d');
        }

        $nowYear = Carbon::now()->format('Y');
        $apiHolidays = Cache::remember('holidays_api_' . $nowYear, 86400, function () use ($nowYear) {
            try {
                $response = Http::withoutVerifying()->timeout(8)->get('https://api-hari-libur.vercel.app/api?year=' . $nowYear);
                if ($response->successful()) {
                    return $response->json('data') ?? [];
                }
            } catch (\Throwable $e) {
            }
            return [];
        });

        $holidaysMap = [];
        foreach ($apiHolidays as $item) {
            if (!empty($item['date'])) {
                $holidaysMap[$item['date']] = $item['description'] ?? 'Hari Libur Nasional';
            }
        }

        $startYear = $start->format('Y');
        if ($startYear !== $nowYear) {
            $periodHolidays = Cache::remember('holidays_api_' . $startYear, 86400, function () use ($startYear) {
                try {
                    $response = Http::withoutVerifying()->timeout(8)->get('https://api-hari-libur.vercel.app/api?year=' . $startYear);
                    if ($response->successful()) {
                        return $response->json('data') ?? [];
                    }
                } catch (\Throwable $e) {
                }
                return [];
            });
            foreach ($periodHolidays as $item) {
                if (!empty($item['date'])) {
                    $holidaysMap[$item['date']] = $item['description'] ?? 'Hari Libur Nasional';
                }
            }
        }

        $dbHolidays = Holiday::all();
        foreach ($dbHolidays as $h) {
            $dStr = Carbon::parse($h->tanggal)->format('Y-m-d');
            $holidaysMap[$dStr] = $h->keterangan;
        }

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalOut = $settingsData['normal_check_out'] ?? '17:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 0);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satOut = $settingsData['saturday_check_out'] ?? '12:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 0);
        $today = Carbon::today();
        $currentTimeStr = Carbon::now()->format('H:i:s');

        $approvedPermissions = Permission::where('employee_id', $employee->id)
            ->whereIn('status', ['DISETUJUI', 'disetujui', 'APPROVED', 'approved'])
            ->where(function ($q) use ($start, $end) {
                $q->whereDate('tanggal_mulai', '<=', $end->format('Y-m-d'))
                  ->whereDate('tanggal_selesai', '>=', $start->format('Y-m-d'));
            })
            ->get();

        $permissionsMap = [];
        foreach ($approvedPermissions as $perm) {
            $pStart = Carbon::parse($perm->tanggal_mulai)->startOfDay();
            $pEnd = Carbon::parse($perm->tanggal_selesai ?? $perm->tanggal_mulai)->endOfDay();
            $cat = strtolower($perm->category ?? 'izin');
            $statusCode = ($cat === 'sakit') ? 'S' : 'I';
            $pDesc = $perm->alasan ?: ($cat === 'sakit' ? 'Sakit (Disetujui)' : 'Izin (Disetujui)');

            $pCurr = $pStart->copy();
            while ($pCurr->lte($pEnd)) {
                $permissionsMap[$pCurr->format('Y-m-d')] = [
                    'code' => $statusCode,
                    'desc' => $pDesc,
                ];
                $pCurr->addDay();
            }
        }

        $approvedOvertimes = OvertimeLog::where('employee_id', $employee->id)
            ->whereIn('status', ['DISETUJUI', 'disetujui', 'APPROVED', 'approved'])
            ->whereBetween('waktu_tap', [$start, $end])
            ->get()
            ->groupBy(function ($ot) {
                return Carbon::parse($ot->waktu_tap)->format('Y-m-d');
            });

        $logsQuery = AttendanceLog::whereBetween('scan_at', [$start, $end]);
        if (!empty($employee->pin)) {
            $logsQuery->where(function ($q) use ($employee) {
                $q->where('employee_id', $employee->id)
                  ->orWhere('pin', $employee->pin);
            });
        } else {
            $logsQuery->where('employee_id', $employee->id);
        }
        $logs = $logsQuery->orderBy('scan_at', 'asc')->get();

        $groupedLogs = [];
        foreach ($logs as $log) {
            $date = Carbon::parse($log->scan_at)->format('Y-m-d');
            $groupedLogs[$date][] = $log->scan_at;
        }

        $records = [];
        $totalHadir = 0;
        $totalTepatWaktu = 0;
        $totalTelatKali = 0;
        $totalTelatMenit = 0;
        $totalLemburKali = 0;
        $totalLemburMenit = 0;
        $totalIzin = 0;
        $totalSakit = 0;
        $totalAlpha = 0;
        $totalLibur = 0;
        $totalHariKerja = 0;

        $dayNamesIndo = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        $current = $start->copy();
        while ($current->lte($end)) {
            $dateStr = $current->format('Y-m-d');
            $dayOfWeek = $current->dayOfWeek;
            $dayName = $dayNamesIndo[$dayOfWeek] ?? '';
            $isSunday = $current->isSunday();
            $isSaturday = $current->isSaturday();
            $isHoliday = isset($holidaysMap[$dateStr]);
            $holidayName = $holidaysMap[$dateStr] ?? null;
            $permInfo = $permissionsMap[$dateStr] ?? null;

            if (!$isSunday && !$isHoliday && $current->lte($today)) {
                $totalHariKerja++;
            }

            $scans = $groupedLogs[$dateStr] ?? [];
            $firstScanStr = null;
            $lastScanStr = null;
            $lateMinutes = 0;
            $overtimeMinutes = 0;
            $status = '-';
            $statusLabel = 'Belum Ada Data';
            $note = '-';

            if ($employee->is_exempt) {
                if ($isHoliday) {
                    $status = 'LN';
                    $statusLabel = 'Libur Nasional';
                    $note = $holidayName ?: 'Libur Nasional';
                    $totalLibur++;
                } elseif ($isSunday) {
                    $status = 'L';
                    $statusLabel = 'Libur Minggu';
                    $note = 'Libur Akhir Pekan';
                    $totalLibur++;
                } elseif ($current->gt($today)) {
                    $status = '-';
                    $statusLabel = 'Belum Berjalan';
                    $note = 'Jadwal Masa Datang';
                } else {
                    $status = 'H';
                    $statusLabel = 'Hadir Bebas Aturan';
                    $note = 'Karyawan Khusus (Bebas Sanksi & Lembur)';
                    $totalHadir++;
                    $totalTepatWaktu++;
                    if (!empty($scans)) {
                        sort($scans);
                        $firstScanStr = Carbon::parse($scans[0])->format('H:i:s');
                        if (count($scans) > 1) {
                            $lastScanStr = Carbon::parse(end($scans))->format('H:i:s');
                        }
                    }
                }
            } else {
                $schedInTime = $isSaturday ? $satIn : $normalIn;
                $schedOutTime = $isSaturday ? $satOut : $normalOut;
                $tol = $isSaturday ? $satTol : $normalTol;

                $scheduleIn = Carbon::parse($dateStr . ' ' . $schedInTime . ':00');
                $scheduleOut = Carbon::parse($dateStr . ' ' . $schedOutTime . ':00');
                $lateThreshold = $scheduleIn->copy()->addMinutes($tol);
                $overtimeThreshold = $scheduleOut->copy()->addMinutes(30);

                if (!empty($scans)) {
                    sort($scans);
                    $firstScan = Carbon::parse($scans[0]);
                    $lastScan = count($scans) > 1 ? Carbon::parse(end($scans)) : null;

                    $firstScanStr = $firstScan->format('H:i:s');
                    $lastScanStr = $lastScan ? $lastScan->format('H:i:s') : null;

                    $isLate = $firstScan->gt($lateThreshold);
                    if ($isLate) {
                        $lateMinutes = (int) ceil($scheduleIn->diffInSeconds($firstScan) / 60);
                    }

                    $otLogs = $approvedOvertimes[$dateStr] ?? null;
                    if ($otLogs && $otLogs->isNotEmpty()) {
                        $overtimeMinutes = (int) $otLogs->sum('durasi_menit');
                    } elseif ($lastScan && $lastScan->gt($overtimeThreshold)) {
                        $overtimeMinutes = (int) floor($scheduleOut->diffInMinutes($lastScan));
                    }

                    if ($lateMinutes > 0) {
                        $totalTelatKali++;
                        $totalTelatMenit += $lateMinutes;
                    }
                    if ($overtimeMinutes > 0) {
                        $totalLemburKali++;
                        $totalLemburMenit += $overtimeMinutes;
                    }

                    $totalHadir++;

                    if ($isLate) {
                        $status = 'T';
                        $statusLabel = 'Terlambat';
                        $note = 'Terlambat ' . $lateMinutes . ' menit' . ($overtimeMinutes > 0 ? (' & Lembur ' . $overtimeMinutes . ' mnt') : '');
                    } elseif ($overtimeMinutes > 0) {
                        $status = 'OT';
                        $statusLabel = 'Hadir & Lembur';
                        $note = 'Lembur ' . $overtimeMinutes . ' menit';
                        $totalTepatWaktu++;
                    } else {
                        $status = 'H';
                        $statusLabel = 'Hadir Tepat Waktu';
                        $note = 'Hadir Tepat Waktu';
                        $totalTepatWaktu++;
                    }
                } else {
                    if ($isHoliday) {
                        $status = 'LN';
                        $statusLabel = 'Libur Nasional';
                        $note = $holidayName ?: 'Libur Nasional';
                        $totalLibur++;
                    } elseif ($isSunday) {
                        $status = 'L';
                        $statusLabel = 'Libur Minggu';
                        $note = 'Libur Akhir Pekan';
                        $totalLibur++;
                    } elseif ($permInfo) {
                        $status = $permInfo['code'];
                        if ($status === 'S') {
                            $statusLabel = 'Sakit';
                            $totalSakit++;
                        } else {
                            $statusLabel = 'Izin';
                            $totalIzin++;
                        }
                        $note = $permInfo['desc'];
                    } elseif ($current->lt($today)) {
                        $status = 'A';
                        $statusLabel = 'Alpha';
                        $note = 'Tidak Hadir Tanpa Keterangan';
                        $totalAlpha++;
                    } elseif ($current->equalTo($today)) {
                        $lateThresholdStr = $lateThreshold->format('H:i:s');
                        if ($currentTimeStr > $lateThresholdStr) {
                            $status = 'A';
                            $statusLabel = 'Belum Hadir';
                            $note = 'Melebihi Jam Masuk';
                            $totalAlpha++;
                        } else {
                            $status = '-';
                            $statusLabel = 'Menunggu Presensi';
                            $note = 'Menunggu Jam Presensi';
                        }
                    } else {
                        $status = '-';
                        $statusLabel = 'Belum Berjalan';
                        $note = 'Jadwal Mendatang';
                    }
                }
            }

            $records[] = [
                'date' => $dateStr,
                'day_num' => (int)$current->format('j'),
                'day_name' => $dayName,
                'status' => $status,
                'status_label' => $statusLabel,
                'first_scan' => $firstScanStr,
                'last_scan' => $lastScanStr,
                'late_minutes' => $lateMinutes,
                'overtime_minutes' => $overtimeMinutes,
                'note' => $note,
                'scan_count' => count($scans),
            ];

            $current->addDay();
        }

        $lateService = app(LateCalculationService::class);
        $overtimeService = app(OvertimeCalculationService::class);

        $empScansGrouped = [];
        foreach ($groupedLogs as $dStr => $scansList) {
            $empScansGrouped[$dStr] = array_map(fn($s) => Carbon::parse($s), $scansList);
        }

        $dispensations = Permission::where('employee_id', $employee->id)
            ->where('category', 'dispensasi_payroll')
            ->whereIn('status', ['disetujui', 'approved'])
            ->whereDate('tanggal_mulai', '>=', $start->toDateString())
            ->whereDate('tanggal_mulai', '<=', $end->toDateString())
            ->pluck('tanggal_mulai')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        $lateResult = $lateService->calculateMonth(
            $employee,
            $empScansGrouped,
            $dispensations,
            $normalIn,
            $normalTol,
            $satIn,
            $satTol
        );

        $overtimeResult = $overtimeService->calculateMonthOvertime($employee, $start, $end);
        $otCat = $overtimeService->getCategoryForEmployee($employee);
        $otSettings = $overtimeService->getSettings();
        $staffCategory = $otCat ? strtoupper($otCat->kode) : $overtimeService->determineStaffCategory($employee);
        $catLower = strtolower($staffCategory);
        $dailyRate = $otCat ? (float)$otCat->daily_rate : ($otSettings['overtime_' . $catLower . '_daily_rate'] ?? 50000);
        $weekendRate = $otCat ? (float)$otCat->weekend_rate : ($otSettings['overtime_' . $catLower . '_weekend_rate'] ?? 75000);
        $holidayRate = $otCat ? (float)$otCat->holiday_rate : ($otSettings['overtime_' . $catLower . '_holiday_rate'] ?? 300000);

        return [
            'employee' => [
                'id' => $employee->id,
                'nama' => $employee->nama ?: 'Karyawan PIN ' . $employee->pin,
                'nik' => $employee->nik ?: '-',
                'pin' => $employee->pin ?: '-',
                'dept' => $employee->dept ?: 'Umum',
                'jabatan' => $employee->jabatan ?: 'Staff',
                'status' => $employee->status,
                'is_exempt' => (bool)$employee->is_exempt,
            ],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'summary' => [
                'total_hari_kerja' => $totalHariKerja,
                'total_hadir' => $totalHadir,
                'total_tepat_waktu' => $totalTepatWaktu,
                'total_telat_kali' => $totalTelatKali,
                'total_telat_menit' => $totalTelatMenit,
                'total_lembur_kali' => $totalLemburKali,
                'total_lembur_menit' => $totalLemburMenit,
                'total_izin' => $totalIzin,
                'total_sakit' => $totalSakit,
                'total_alpha' => $totalAlpha,
                'total_libur' => $totalLibur,
            ],
            'late_breakdown' => [
                'is_exempt' => (bool)$employee->is_exempt,
                'category_name' => $lateResult['category_name'] ?? ($employee->is_exempt ? 'Bebas Denda & Lembur' : 'Umum'),
                'toleransi_bulanan' => $lateResult['toleransi_bulanan'] ?? 3,
                'total_late_events' => $lateResult['total_late_events'] ?? $totalTelatKali,
                'total_late_minutes' => $totalTelatMenit,
                'tier1_count' => $lateResult['tier1_count'] ?? 0,
                'tier1_tolerated' => $lateResult['tier1_tolerated'] ?? 0,
                'tier1_penalized' => $lateResult['tier1_penalized'] ?? 0,
                'tier2_count' => $lateResult['tier2_count'] ?? 0,
                'tier3_count' => $lateResult['tier3_count'] ?? 0,
                'tier4_count' => $lateResult['tier4_count'] ?? 0,
                'tiers_breakdown' => $lateResult['tiers_breakdown'] ?? [],
                'total_deduction' => $lateResult['total_deduction'] ?? 0,
            ],
            'overtime_breakdown' => [
                'is_exempt' => (bool)$employee->is_exempt,
                'category_name' => $otCat ? $otCat->nama : ($staffCategory === 'LAPANGAN' ? 'Staf Lapangan' : 'Staf Kantor'),
                'total_days' => $overtimeResult['total_days'] ?? $totalLemburKali,
                'total_minutes' => $totalLemburMenit,
                'total_pay' => $overtimeResult['total_pay'] ?? 0,
                'daily_days' => $overtimeResult['daily_days'] ?? 0,
                'daily_rate' => $dailyRate,
                'weekend_days' => $overtimeResult['weekend_days'] ?? 0,
                'weekend_rate' => $weekendRate,
                'holiday_days' => $overtimeResult['holiday_days'] ?? 0,
                'holiday_rate' => $holidayRate,
            ],
            'records' => $records,
        ];
    }

    public function employeeDetail(Request $request, $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $startDate = $request->input('start_date') ?: Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->input('end_date') ?: Carbon::now()->endOfMonth()->format('Y-m-d');

        $data = $this->prepareEmployeeReportData($employee, $startDate, $endDate);
        return response()->json($data);
    }

    public function employeePdf(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $startDate = $request->input('start_date') ?: Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->input('end_date') ?: Carbon::now()->endOfMonth()->format('Y-m-d');

        $data = $this->prepareEmployeeReportData($employee, $startDate, $endDate);
        $pdf = Pdf::loadView('pdf.laporan-karyawan', $data)->setPaper('a4', 'portrait');
        $filename = 'Laporan_Presensi_' . str_replace(' ', '_', $employee->nama ?: 'Karyawan') . '_' . $startDate . '_sd_' . $endDate . '.pdf';

        if ($request->input('download')) {
            return $pdf->download($filename);
        }
        return $pdf->stream($filename);
    }

    public function rekapPdf(Request $request)
    {
        $startDate = $request->input('start_date') ?: Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->input('end_date') ?: Carbon::now()->endOfMonth()->format('Y-m-d');

        $reportData = $this->index($request)->getData(true);
        $pdf = Pdf::loadView('pdf.laporan-rekap-presensi', $reportData)->setPaper('a4', 'landscape');
        $filename = 'Rekap_Presensi_' . $startDate . '_sd_' . $endDate . '.pdf';

        if ($request->input('download')) {
            return $pdf->download($filename);
        }
        return $pdf->stream($filename);
    }
}
