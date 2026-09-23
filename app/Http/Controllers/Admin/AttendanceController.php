<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\SystemSetting;
use App\Services\AttendanceTimeWindowService;
use App\Services\FingerspotService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filterTanggal = $request->query('tanggal');
        $filterDept = $request->query('dept');
        $filterStatus = $request->query('status');
        $search = $request->query('search');

        $query = AttendanceLog::with(['employee', 'device'])
            ->orderBy('scan_at', 'asc');

        if (!empty($filterTanggal)) {
            $query->whereDate('scan_at', $filterTanggal);
        }

        $logs = $query->get();

        $grouped = [];

        foreach ($logs as $log) {
            $date = Carbon::parse($log->scan_at)->format('Y-m-d');
            $pin = (string)$log->pin;
            $key = $pin . '_' . $date;

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'employee' => $log->employee,
                    'device' => $log->device,
                    'date' => $date,
                    'pin' => $pin,
                    'scans' => [],
                ];
            }

            $grouped[$key]['scans'][] = $log->scan_at;
        }

        $attendanceList = [];
        $today = Carbon::today()->format('Y-m-d');
        $targetDate = !empty($filterTanggal) ? $filterTanggal : $today;

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalOut = $settingsData['normal_check_out'] ?? '16:30';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 0);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satOut = $settingsData['saturday_check_out'] ?? '12:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 0);

        $stats = [
            'hadir' => 0,
            'terlambat' => 0,
            'izin' => 0,
            'belum_pulang' => 0,
            'total_karyawan' => Employee::count(),
        ];

        $counterId = 1;

        foreach ($grouped as $item) {
            $emp = $item['employee'];
            $dev = $item['device'];
            $scans = $item['scans'];
            sort($scans);

            $inScan = Carbon::parse($scans[0]);
            $outScan = count($scans) > 1 ? Carbon::parse(end($scans)) : null;

            $inTime = $inScan->format('H:i:s');
            $outTime = $outScan ? $outScan->format('H:i:s') : '';

            $itemDate = Carbon::parse($item['date']);
            $isSat = $itemDate->isSaturday();
            $schedInTime = $isSat ? $satIn : $normalIn;
            $schedOutTime = $isSat ? $satOut : $normalOut;
            $tol = $isSat ? $satTol : $normalTol;

            $scheduleIn = Carbon::parse($item['date'] . ' ' . $schedInTime . ':00');
            $scheduleOut = Carbon::parse($item['date'] . ' ' . $schedOutTime . ':00');
            $lateThreshold = $scheduleIn->copy()->addMinutes($tol);

            $isLate = $inScan->gt($lateThreshold);
            $minutesLate = $isLate ? (int) round($scheduleIn->diffInMinutes($inScan)) : 0;

            $status = $isLate ? 'terlambat' : 'hadir';
            $inStatus = $isLate ? ('Telat ' . $minutesLate . ' Mnt') : 'Tepat';

            if ($outScan) {
                $isEarly = $outScan->lt($scheduleOut);
                $outStatus = $isEarly ? 'Pulang Cepat' : 'Tepat';
                $totalMinutes = (int) $inScan->diffInMinutes($outScan);
                $diffHours = intdiv($totalMinutes, 60);
                $diffMins = $totalMinutes % 60;
                $dur = $diffHours . 'j ' . $diffMins . 'm';
            } else {
                $outStatus = 'Belum Tap';
                $dur = '-';
            }

            $empName = ($emp && !empty($emp->nama)) ? $emp->nama : null;
            $empNik = ($emp && !empty($emp->nik)) ? $emp->nik : '-';
            $empDept = ($emp && !empty($emp->dept)) ? $emp->dept : 'Umum';

            $initials = '-';
            if (!empty($empName)) {
                $words = explode(' ', trim($empName));
                $initials = '';
                foreach ($words as $w) {
                    if (!empty($w)) {
                        $initials .= mb_strtoupper(mb_substr($w, 0, 1));
                        if (strlen($initials) >= 2) {
                            break;
                        }
                    }
                }
            }
            if (empty($initials)) {
                $initials = '-';
            }

            $locIn = $dev ? ($dev->name ?: 'Mesin Cloud') : 'Mesin Cloud';

            if ($item['date'] === $targetDate) {
                $stats['hadir']++;
                if ($isLate) {
                    $stats['terlambat']++;
                }
                if (!$outScan) {
                    $stats['belum_pulang']++;
                }
            }

            $row = [
                'id' => $counterId++,
                'nama' => $empName,
                'nik' => $empNik,
                'finger' => $item['pin'],
                'initials' => $initials,
                'dept' => strtolower($empDept),
                'deptDisplay' => $empDept,
                'tgl' => $item['date'],
                'tglDisplay' => Carbon::parse($item['date'])->translatedFormat('d M Y'),
                'in' => $inTime,
                'out' => $outTime,
                'dur' => $dur,
                'status' => $status,
                'minutesLate' => $minutesLate,
                'inStatus' => $inStatus,
                'outStatus' => $outStatus,
                'locIn' => $locIn,
            ];

            if (!empty($filterDept) && strtolower($empDept) !== strtolower($filterDept)) {
                continue;
            }

            if (!empty($filterStatus)) {
                $isTargetHadir = in_array($filterStatus, ['hadir', 'ontime']);
                $isTargetTerlambat = in_array($filterStatus, ['terlambat', 'late']);
                if ($isTargetHadir && !in_array($status, ['hadir', 'ontime'])) {
                    continue;
                }
                if ($isTargetTerlambat && !in_array($status, ['terlambat', 'late'])) {
                    continue;
                }
                if (!$isTargetHadir && !$isTargetTerlambat && $status !== $filterStatus) {
                    continue;
                }
            }

            if (!empty($search)) {
                $s = strtolower($search);
                $nameMatch = $empName ? str_contains(strtolower($empName), $s) : false;
                $nikMatch = ($empNik !== '-') ? str_contains(strtolower($empNik), $s) : false;
                $pinMatch = str_contains((string)$item['pin'], $s);
                if (!$nameMatch && !$nikMatch && !$pinMatch) {
                    continue;
                }
            }

            $attendanceList[] = $row;
        }

        usort($attendanceList, function ($a, $b) {
            $cmp = strcmp($b['tgl'], $a['tgl']);
            if ($cmp !== 0) {
                return $cmp;
            }
            return strcmp($b['in'], $a['in']);
        });

        return response()->json([
            'attendance' => $attendanceList,
            'stats' => $stats,
        ]);
    }

    public function fetch(Request $request, FingerspotService $service): JsonResponse
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $result = $service->fetchAttLog($startDate, $endDate);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    public function storeManual(Request $request, AttendanceTimeWindowService $service): JsonResponse
    {
        $validated = $request->validate([
            'karyawan_id' => 'required',
            'tanggal' => 'required|date',
            'jam_masuk' => 'nullable|string',
            'jam_keluar' => 'nullable|string',
            'alasan' => 'nullable|string|max:500',
        ]);

        $employee = Employee::find($validated['karyawan_id'])
            ?? Employee::where('pin', (string)$validated['karyawan_id'])->first()
            ?? Employee::where('nik', (string)$validated['karyawan_id'])->first();

        if (!$employee) {
            return response()->json(['success' => false, 'message' => 'Karyawan tidak ditemukan.'], 404);
        }

        $tanggal = $validated['tanggal'];
        $jamMasuk = $validated['jam_masuk'] ?? null;
        $jamKeluar = $validated['jam_keluar'] ?? null;
        $alasan = $validated['alasan'] ?? null;

        $results = [];

        if ($jamMasuk) {
            $inTime = Carbon::parse($tanggal . ' ' . $jamMasuk . (strlen($jamMasuk) <= 5 ? ':00' : ''));
            AttendanceLog::create([
                'cloud_id' => $employee->cloud_id ?? 'MANUAL',
                'pin' => $employee->pin ?? (string)$employee->id,
                'employee_id' => $employee->id,
                'scan_at' => $inTime->format('Y-m-d H:i:s'),
                'verify_method' => 'manual',
                'status_scan' => '0',
                'raw_data' => ['source' => 'manual_admin', 'reason' => $alasan],
            ]);

            $resIn = $service->processTap($employee, $inTime, $alasan, true);
            $results['masuk'] = $resIn;
        }

        if ($jamKeluar) {
            $outTime = Carbon::parse($tanggal . ' ' . $jamKeluar . (strlen($jamKeluar) <= 5 ? ':00' : ''));
            AttendanceLog::create([
                'cloud_id' => $employee->cloud_id ?? 'MANUAL',
                'pin' => $employee->pin ?? (string)$employee->id,
                'employee_id' => $employee->id,
                'scan_at' => $outTime->format('Y-m-d H:i:s'),
                'verify_method' => 'manual',
                'status_scan' => '1',
                'raw_data' => ['source' => 'manual_admin', 'reason' => $alasan],
            ]);

            $resOut = $service->processTap($employee, $outTime, $alasan, true);
            $results['keluar'] = $resOut;
        }

        return response()->json([
            'success' => true,
            'message' => 'Data absensi manual berhasil disimpan.',
            'results' => $results,
        ]);
    }
}
