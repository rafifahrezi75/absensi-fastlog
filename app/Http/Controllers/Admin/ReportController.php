<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $query = Employee::query()->where('status', 'active');

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

        $data = [];

        foreach ($employees as $emp) {
            $attendance = [];
            $current = $start->copy();

            while ($current->lte($end)) {
                $dateStr = $current->format('Y-m-d');
                $isSunday = $current->isSunday();

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

                    $scheduleIn = Carbon::parse($dateStr . ' 08:00:00');
                    $isLate = $firstScan->gt($scheduleIn);

                    $hasOvertime = false;
                    if ($lastScan) {
                        $overtimeThreshold = Carbon::parse($dateStr . ' 17:30:00');
                        if ($lastScan->gt($overtimeThreshold) || $firstScan->diffInHours($lastScan) >= 9) {
                            $hasOvertime = true;
                        }
                    }

                    if ($hasOvertime && !$isLate) {
                        $status = 'OT';
                    } elseif ($isLate) {
                        $status = 'T';
                    } else {
                        $status = 'H';
                    }
                } else {
                    $status = $isSunday ? 'L' : '-';
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
        ]);
    }
}
