<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
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

            $scheduleIn = Carbon::parse($item['date'] . ' 08:00:00');
            $scheduleOut = Carbon::parse($item['date'] . ' 16:30:00');

            $isLate = $inScan->gt($scheduleIn);
            $minutesLate = $isLate ? (int) round($scheduleIn->diffInMinutes($inScan)) : 0;

            $status = $isLate ? 'late' : 'ontime';
            $inStatus = $isLate ? ('Telat ' . $minutesLate . ' Mnt') : 'Tepat';

            if ($outScan) {
                $isEarly = $outScan->lt($scheduleOut);
                $outStatus = $isEarly ? 'Pulang Cepat' : 'Tepat';
                $diffTotalMins = (int) $inScan->diffInMinutes($outScan);
                $diffHours = (int) floor($diffTotalMins / 60);
                $diffMins = $diffTotalMins % 60;
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

            if (!empty($filterStatus) && $status !== $filterStatus) {
                continue;
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
}
