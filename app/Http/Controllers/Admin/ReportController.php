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
}
