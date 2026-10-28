<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\Permission;
use App\Models\SystemSetting;
use App\Services\AttendanceTimeWindowService;
use App\Services\FingerspotService;
use App\Services\LateCalculationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filterTanggal = $request->query('tanggal');
        $filterBulan = $request->query('bulan');
        $filterDept = $request->query('dept');
        $filterStatus = $request->query('status');
        $search = $request->query('search');

        $query = AttendanceLog::with([
                'employee:id,nik,nama,dept,jabatan,tipe_staf,late_category_id,is_exempt',
                'device:id,name'
            ])
            ->select(['id', 'employee_id', 'device_id', 'pin', 'scan_at', 'verify_method', 'status_scan', 'raw_data'])
            ->orderBy('scan_at', 'asc');

        if (!empty($filterTanggal)) {
            $query->whereDate('scan_at', $filterTanggal);
        } elseif (!empty($filterBulan)) {
            $startMonthQuery = Carbon::parse($filterBulan . '-01')->startOfMonth()->toDateTimeString();
            $endMonthQuery = Carbon::parse($filterBulan . '-01')->endOfMonth()->toDateTimeString();
            $query->whereBetween('scan_at', [$startMonthQuery, $endMonthQuery]);
        }

        if (!empty($filterDept)) {
            $query->whereHas('employee', function ($eq) use ($filterDept) {
                $eq->where('dept', $filterDept);
            });
        }

        if (!empty($search)) {
            $searchTerm = trim($search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('pin', 'like', "%{$searchTerm}%")
                  ->orWhereHas('employee', function ($eq) use ($searchTerm) {
                      $eq->where('nama', 'like', "%{$searchTerm}%")
                         ->orWhere('nik', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $logs = $query->get();

        $grouped = [];
        foreach ($logs as $log) {
            $rawScan = $log->getRawOriginal('scan_at');
            $date = substr($rawScan, 0, 10);
            $pin = (string)$log->pin;
            $key = $pin . '_' . $date;

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'employee' => $log->employee,
                    'device' => $log->device,
                    'date' => $date,
                    'pin' => $pin,
                    'scans' => [],
                    'outdoor_details' => [],
                ];
            }

            $grouped[$key]['scans'][] = $rawScan;

            if ($log->verify_method === 'mobile_gps' || (!empty($log->raw_data) && !empty($log->raw_data['source']))) {
                $raw = $log->raw_data ?: [];
                $grouped[$key]['outdoor_details'][] = [
                    'scan_at' => $rawScan,
                    'time' => substr($rawScan, 11, 8),
                    'status_scan' => $log->status_scan,
                    'tap_type' => $log->status_scan === '1' ? 'out' : 'in',
                    'raw_data' => $raw,
                    'photo' => !empty($raw['lampiran']) ? '/uploads/permissions/' . $raw['lampiran'] : null,
                    'address' => $raw['location_address'] ?? null,
                    'lat' => $raw['latitude'] ?? null,
                    'lng' => $raw['longitude'] ?? null,
                    'keterangan' => $raw['keterangan'] ?? null,
                ];
            }
        }

        $today = date('Y-m-d');
        $targetDate = !empty($filterTanggal) ? $filterTanggal : $today;
        $targetMonth = !empty($filterBulan) ? $filterBulan : substr($targetDate, 0, 7);
        $startOfMonth = $targetMonth . '-01';
        $endOfMonth = date('Y-m-t', strtotime($startOfMonth));

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalOut = $settingsData['normal_check_out'] ?? '16:30';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 0);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satOut = $settingsData['saturday_check_out'] ?? '12:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 0);

        $categoriesList = ['izin', 'sakit', 'cuti', 'dinas', 'dispensasi_payroll'];
        $totalApprovedIzin = Permission::whereIn('status', ['disetujui', 'approved'])
            ->whereIn('category', $categoriesList)
            ->count();

        $izinCount = Permission::whereIn('status', ['disetujui', 'approved'])
            ->whereIn('category', $categoriesList)
            ->where(function ($q) use ($targetDate) {
                $q->whereDate('tanggal_mulai', '<=', $targetDate)
                  ->where(function ($sub) use ($targetDate) {
                      $sub->where(function ($s1) use ($targetDate) {
                          $s1->whereNotNull('tanggal_selesai')
                             ->where('tanggal_selesai', '!=', '')
                             ->whereDate('tanggal_selesai', '>=', $targetDate);
                      })->orWhere(function ($s2) use ($targetDate) {
                          $s2->where(function ($s3) {
                              $s3->whereNull('tanggal_selesai')
                                 ->orWhere('tanggal_selesai', '');
                          })->whereDate('tanggal_mulai', '>=', $targetDate);
                      });
                  });
            })->count();

        $activeEmployeesCount = Employee::whereIn('status', ['active', 'aktif'])->count();

        $dayLogs = AttendanceLog::with('employee:id,is_exempt')
            ->whereDate('scan_at', $targetDate)
            ->orderBy('scan_at', 'asc')
            ->get(['id', 'employee_id', 'pin', 'scan_at']);

        $dayGrouped = [];
        foreach ($dayLogs as $dl) {
            $p = (string)$dl->pin;
            $dayGrouped[$p]['scans'][] = $dl->getRawOriginal('scan_at');
            $dayGrouped[$p]['emp'] = $dl->employee;
        }

        $hadirToday = count($dayGrouped);
        $terlambatToday = 0;
        $belumPulangToday = 0;

        $targetDaySat = date('N', strtotime($targetDate)) === '6';
        $targetSchedInSeconds = (int)substr($targetDaySat ? $satIn : $normalIn, 0, 2) * 3600
            + (int)substr($targetDaySat ? $satIn : $normalIn, 3, 2) * 60;

        foreach ($dayGrouped as $p => $info) {
            $scans = $info['scans'];
            $emp = $info['emp'];
            $firstScan = $scans[0];
            $inSec = (int)substr($firstScan, 11, 2) * 3600 + (int)substr($firstScan, 14, 2) * 60 + (int)substr($firstScan, 17, 2);
            $hasOut = count($scans) > 1;

            if ($inSec > $targetSchedInSeconds && (!$emp || !$emp->is_exempt)) {
                $terlambatToday++;
            }
            if (!$hasOut) {
                $belumPulangToday++;
            }
        }

        $stats = [
            'hadir' => $hadirToday,
            'terlambat' => $terlambatToday,
            'izin' => $izinCount,
            'total_izin_disetujui' => $totalApprovedIzin,
            'belum_pulang' => $belumPulangToday,
            'total_karyawan' => $activeEmployeesCount > 0 ? $activeEmployeesCount : Employee::count(),
        ];

        $izinBulanCount = Permission::whereIn('status', ['disetujui', 'approved'])
            ->whereIn('category', $categoriesList)
            ->where(function ($q) use ($startOfMonth, $endOfMonth) {
                $q->whereDate('tanggal_mulai', '<=', $endOfMonth)
                  ->where(function ($sub) use ($startOfMonth) {
                      $sub->where(function ($s1) use ($startOfMonth) {
                          $s1->whereNotNull('tanggal_selesai')
                             ->where('tanggal_selesai', '!=', '')
                             ->whereDate('tanggal_selesai', '>=', $startOfMonth);
                      })->orWhere(function ($s2) use ($startOfMonth) {
                          $s2->where(function ($s3) {
                              $s3->whereNull('tanggal_selesai')
                                 ->orWhere('tanggal_selesai', '');
                          })->whereDate('tanggal_mulai', '>=', $startOfMonth);
                      });
                  });
            })->distinct('employee_id')->count('employee_id');

        $empIds = array_filter(array_unique(array_map(fn($item) => $item['employee'] ? $item['employee']->id : null, $grouped)));
        $pins = array_unique(array_map(fn($item) => $item['pin'], $grouped));

        $monthGroupedByPin = [];
        $monthGroupedByEmp = [];

        $monthLogsQuery = AttendanceLog::where('scan_at', '>=', $startOfMonth . ' 00:00:00')
            ->where('scan_at', '<=', $endOfMonth . ' 23:59:59');

        if (!empty($search) || !empty($filterDept)) {
            $monthLogsQuery->where(function ($mq) use ($empIds, $pins) {
                if (!empty($empIds)) {
                    $mq->whereIn('employee_id', $empIds);
                }
                if (!empty($pins)) {
                    $mq->orWhereIn('pin', $pins);
                }
            });
        }

        $monthLogs = $monthLogsQuery->orderBy('scan_at', 'asc')->get(['pin', 'employee_id', 'scan_at']);

        foreach ($monthLogs as $ml) {
            $rawScan = $ml->getRawOriginal('scan_at');
            $d = substr($rawScan, 0, 10);
            $p = (string)$ml->pin;
            $parsed = Carbon::parse($rawScan);
            $monthGroupedByPin[$p][$d][] = $parsed;
            if ($ml->employee_id) {
                $monthGroupedByEmp[$ml->employee_id][$d][] = $parsed;
            }
        }

        $dispensationsByEmp = empty($empIds) ? collect([]) : Permission::where('category', 'dispensasi_payroll')
            ->whereIn('status', ['disetujui', 'approved'])
            ->whereIn('employee_id', $empIds)
            ->whereDate('tanggal_mulai', '>=', $startOfMonth)
            ->whereDate('tanggal_mulai', '<=', $endOfMonth)
            ->get(['employee_id', 'tanggal_mulai'])
            ->groupBy('employee_id');

        $monthHadirPins = [];
        $monthLatePins = [];
        $totalKasusTerlambat = 0;

        foreach ($monthGroupedByPin as $p => $dates) {
            $monthHadirPins[$p] = true;
            foreach ($dates as $dateStr => $scans) {
                $firstScanStr = $scans[0]->format('H:i:s');
                $isSat = date('N', strtotime($dateStr)) === '6';
                $schedIn = ($isSat ? $satIn : $normalIn) . ':00';
                if ($firstScanStr > $schedIn) {
                    $monthLatePins[$p] = true;
                    $totalKasusTerlambat++;
                }
            }
        }

        $monthlyStats = [
            'total_karyawan' => $activeEmployeesCount > 0 ? $activeEmployeesCount : Employee::count(),
            'hadir' => count($monthHadirPins),
            'terlambat' => count($monthLatePins),
            'izin' => $izinBulanCount,
            'total_izin_disetujui' => $totalApprovedIzin,
            'total_kasus_terlambat' => $totalKasusTerlambat,
        ];

        $lateService = app(LateCalculationService::class);
        $calculatedLateByEmp = [];
        $attendanceList = [];
        $counterId = 1;

        $monthsIndo = [
            '01' => 'Jan', '02' => 'Feb', '03' => 'Mar', '04' => 'Apr',
            '05' => 'Mei', '06' => 'Jun', '07' => 'Jul', '08' => 'Agu',
            '09' => 'Sep', '10' => 'Okt', '11' => 'Nov', '12' => 'Des'
        ];
        $dayOfWeekCache = [];

        foreach ($grouped as $item) {
            $emp = $item['employee'];
            $dev = $item['device'];
            $scans = $item['scans'];
            sort($scans);

            $rawIn = $scans[0];
            $rawOut = count($scans) > 1 ? end($scans) : null;

            $inTime = substr($rawIn, 11, 8);
            $outTime = $rawOut ? substr($rawOut, 11, 8) : '';

            $itemDate = $item['date'];
            if (!isset($dayOfWeekCache[$itemDate])) {
                $dayOfWeekCache[$itemDate] = (date('N', strtotime($itemDate)) === '6');
            }
            $isSat = $dayOfWeekCache[$itemDate];
            $schedInTime = $isSat ? $satIn : $normalIn;
            $schedOutTime = $isSat ? $satOut : $normalOut;

            $inSeconds = (int)substr($inTime, 0, 2) * 3600 + (int)substr($inTime, 3, 2) * 60 + (int)substr($inTime, 6, 2);
            $schedInSeconds = (int)substr($schedInTime, 0, 2) * 3600 + (int)substr($schedInTime, 3, 2) * 60;
            $schedOutSeconds = (int)substr($schedOutTime, 0, 2) * 3600 + (int)substr($schedOutTime, 3, 2) * 60;

            $isLate = $inSeconds > $schedInSeconds;
            $minutesLate = $isLate ? (int) ceil(($inSeconds - $schedInSeconds) / 60) : 0;
            $status = $isLate ? 'terlambat' : 'hadir';
            $inStatus = $isLate ? ('Telat ' . $minutesLate . ' Mnt') : 'Tepat';
            $lateInfo = null;

            if ($emp) {
                if (!isset($calculatedLateByEmp[$emp->id])) {
                    $empPin = (string)$item['pin'];
                    $empScans = isset($monthGroupedByEmp[$emp->id])
                        ? $monthGroupedByEmp[$emp->id]
                        : ($monthGroupedByPin[$empPin] ?? []);

                    $empDispensations = isset($dispensationsByEmp[$emp->id])
                        ? $dispensationsByEmp[$emp->id]->pluck('tanggal_mulai')->map(fn($d) => substr((string)$d, 0, 10))->toArray()
                        : [];

                    $calculatedLateByEmp[$emp->id] = $lateService->calculateMonth(
                        $emp,
                        $empScans,
                        $empDispensations,
                        $normalIn,
                        $normalTol,
                        $satIn,
                        $satTol
                    );
                }

                $empLateResult = $calculatedLateByEmp[$emp->id];
                $dayDetail = $empLateResult['daily_details'][$itemDate] ?? null;

                if ($emp->is_exempt) {
                    $isLate = false;
                    $minutesLate = 0;
                    $status = 'hadir';
                    $inStatus = 'Tepat Waktu';
                    $lateInfo = [
                        'is_late' => false,
                        'minutes_late' => 0,
                        'category_name' => 'Karyawan Khusus',
                        'category_code' => 'EXEMPT',
                        'tier_order' => null,
                        'tier_name' => 'Bebas Aturan',
                        'ada_toleransi' => false,
                        'toleransi_ke' => null,
                        'toleransi_max' => 3,
                        'quota_text' => 'Bebas Denda & Lembur',
                        'status_text' => 'Bebas Sanksi (Karyawan Khusus)',
                        'deduction' => 0,
                        'is_exempt' => true,
                    ];
                } elseif ($dayDetail && $dayDetail['minutes_late'] > 0) {
                    $isLate = true;
                    $minutesLate = $dayDetail['minutes_late'];
                    $status = 'terlambat';
                    $inStatus = 'Telat ' . $minutesLate . ' Mnt';

                    $lateInfo = [
                        'is_late' => true,
                        'minutes_late' => $minutesLate,
                        'category_name' => $dayDetail['category_name'] ?? null,
                        'category_code' => $dayDetail['category_code'] ?? null,
                        'tier_order' => $dayDetail['tier_order'] ?? null,
                        'tier_name' => $dayDetail['tier_name'] ?? null,
                        'ada_toleransi' => $dayDetail['ada_toleransi'] ?? false,
                        'toleransi_ke' => $dayDetail['toleransi_ke'] ?? null,
                        'toleransi_terpakai' => $dayDetail['toleransi_terpakai'] ?? null,
                        'toleransi_max' => $dayDetail['toleransi_max'] ?? 3,
                        'quota_text' => $dayDetail['quota_text'] ?? null,
                        'status_text' => $dayDetail['status_text'] ?? null,
                        'deduction' => $dayDetail['deduction'] ?? 0,
                        'is_exempt' => false,
                    ];
                }
            }

            if ($isLate && !$lateInfo && $emp) {
                $cat = $lateService->determineCategory($emp);
                $matchedTier = null;
                foreach ($cat->tiers as $t) {
                    $min = (int)$t->min_menit;
                    $max = $t->max_menit !== null ? (int)$t->max_menit : PHP_INT_MAX;
                    if ($minutesLate >= $min && $minutesLate <= $max) {
                        $matchedTier = $t;
                        break;
                    }
                }
                $deduction = $matchedTier ? (float)$matchedTier->nominal_denda : 30000;
                $isNoTol = $matchedTier ? !$matchedTier->ada_toleransi : true;
                $lateInfo = [
                    'is_late' => true,
                    'minutes_late' => $minutesLate,
                    'category_name' => $cat->nama,
                    'category_code' => $cat->kode,
                    'tier_order' => $matchedTier ? $matchedTier->tier_order : null,
                    'tier_name' => $matchedTier ? $matchedTier->nama_tier : null,
                    'ada_toleransi' => $matchedTier ? (bool)$matchedTier->ada_toleransi : false,
                    'toleransi_ke' => null,
                    'toleransi_terpakai' => null,
                    'toleransi_max' => (int)($cat->toleransi_bulanan ?? 3),
                    'quota_text' => $isNoTol ? 'Tanpa toleransi (Potongan Rp ' . number_format($deduction, 0, ',', '.') . ')' : 'Jatah toleransi terpakai',
                    'status_text' => 'Kategori ' . ($matchedTier ? $matchedTier->tier_order : '') . ' (Potongan Rp ' . number_format($deduction, 0, ',', '.') . ')',
                    'deduction' => $deduction,
                    'is_exempt' => (bool)$emp->is_exempt,
                ];
            }

            if ($rawOut) {
                $outSeconds = (int)substr($outTime, 0, 2) * 3600 + (int)substr($outTime, 3, 2) * 60 + (int)substr($outTime, 6, 2);
                $isEarly = $outSeconds < $schedOutSeconds;
                $outStatus = $isEarly ? 'Pulang Cepat' : 'Tepat';
                $totalMinutes = max(0, (int) round(($outSeconds - $inSeconds) / 60));
                $diffHours = intdiv($totalMinutes, 60);
                $diffMins = $totalMinutes % 60;
                $dur = $diffHours . 'j ' . $diffMins . 'm';
            } else {
                $outStatus = 'Belum Tap';
                $dur = '-';
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

            $isOutdoor = !empty($item['outdoor_details']);
            $outdoorInfo = null;

            if ($isOutdoor) {
                $details = $item['outdoor_details'];
                $tapTypes = array_unique(array_map(fn($d) => $d['tap_type'], $details));
                $tapTypeLabel = (in_array('in', $tapTypes) && in_array('out', $tapTypes))
                    ? 'Tap In & Out'
                    : (in_array('in', $tapTypes) ? 'Tap In' : 'Tap Out');

                $latestPhoto = null;
                $latestAddress = null;
                $latestKeterangan = null;
                foreach ($details as $d) {
                    if (!empty($d['photo'])) $latestPhoto = $d['photo'];
                    if (!empty($d['address'])) $latestAddress = $d['address'];
                    if (!empty($d['keterangan'])) $latestKeterangan = $d['keterangan'];
                }

                $outdoorInfo = [
                    'is_outdoor' => true,
                    'tap_label' => $tapTypeLabel,
                    'taps' => $details,
                    'photo' => $latestPhoto,
                    'address' => $latestAddress,
                    'keterangan' => $latestKeterangan,
                ];
            }

            $locIn = $isOutdoor ? 'Mobile GPS' : ($dev ? ($dev->name ?: 'Mesin Cloud') : 'Mesin Cloud');

            $dateParts = explode('-', $itemDate);
            $tglDisplay = $dateParts[2] . ' ' . ($monthsIndo[$dateParts[1]] ?? $dateParts[1]) . ' ' . $dateParts[0];

            $attendanceList[] = [
                'id' => $counterId++,
                'employee_id' => $emp ? $emp->id : null,
                'nama' => $empName,
                'nik' => $empNik,
                'finger' => $item['pin'],
                'initials' => $initials,
                'dept' => strtolower($empDept),
                'deptDisplay' => $empDept,
                'tgl' => $itemDate,
                'tglDisplay' => $tglDisplay,
                'in' => $inTime,
                'out' => $outTime,
                'dur' => $dur,
                'status' => $status,
                'minutesLate' => $minutesLate,
                'inStatus' => $inStatus,
                'outStatus' => $outStatus,
                'locIn' => $locIn,
                'late_info' => $lateInfo,
                'is_outdoor' => $isOutdoor,
                'outdoor_info' => $outdoorInfo,
                'foto' => $outdoorInfo['photo'] ?? null,
            ];
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
            'monthly_stats' => $monthlyStats,
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

    public function updateKoreksi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'nullable',
            'pin' => 'nullable',
            'tanggal' => 'required|date',
            'jam_masuk' => 'nullable|string',
            'jam_keluar' => 'nullable|string',
            'alasan' => 'nullable|string|max:500',
        ]);

        $employeeId = $validated['employee_id'] ?? null;
        $pin = $validated['pin'] ?? null;
        $tanggal = Carbon::parse($validated['tanggal'])->format('Y-m-d');
        $jamMasuk = !empty($validated['jam_masuk']) ? trim($validated['jam_masuk']) : null;
        $jamKeluar = !empty($validated['jam_keluar']) ? trim($validated['jam_keluar']) : null;
        $alasan = $validated['alasan'] ?? 'Koreksi log absensi oleh Admin';

        if (!$jamMasuk && !$jamKeluar) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal salah satu jam (Jam Masuk atau Jam Keluar) harus diisi.',
            ], 422);
        }

        if ($jamMasuk && strlen($jamMasuk) === 5) {
            $jamMasuk .= ':00';
        }

        if ($jamKeluar && strlen($jamKeluar) === 5) {
            $jamKeluar .= ':00';
        }

        if ($jamMasuk && $jamKeluar && $jamKeluar < $jamMasuk) {
            return response()->json([
                'success' => false,
                'message' => 'Jam keluar tidak boleh lebih awal dari jam masuk.',
            ], 422);
        }

        $employee = null;
        if ($employeeId) {
            $employee = Employee::find($employeeId);
        }
        if (!$employee && $pin) {
            $employee = Employee::where('pin', (string)$pin)->first();
        }
        if (!$employee && $employeeId) {
            $employee = Employee::where('nik', (string)$employeeId)->first();
        }

        $finalPin = $employee ? ($employee->pin ?? (string)$employee->id) : (string)$pin;

        if (!$employee && !$finalPin) {
            return response()->json([
                'success' => false,
                'message' => 'Karyawan atau PIN tidak ditemukan.',
            ], 404);
        }

        DB::beginTransaction();
        try {
            AttendanceLog::whereDate('scan_at', $tanggal)
                ->where(function ($q) use ($employee, $finalPin) {
                    if ($employee && $finalPin) {
                        $q->where('employee_id', $employee->id)
                          ->orWhere('pin', (string)$finalPin);
                    } elseif ($employee) {
                        $q->where('employee_id', $employee->id);
                    } else {
                        $q->where('pin', (string)$finalPin);
                    }
                })
                ->delete();

            if ($jamMasuk) {
                $inDateTime = Carbon::parse($tanggal . ' ' . $jamMasuk);
                AttendanceLog::create([
                    'cloud_id' => $employee?->cloud_id ?? 'MANUAL',
                    'pin' => $finalPin,
                    'employee_id' => $employee?->id,
                    'scan_at' => $inDateTime->format('Y-m-d H:i:s'),
                    'verify_method' => 'koreksi_admin',
                    'status_scan' => '0',
                    'raw_data' => [
                        'source' => 'koreksi_admin',
                        'reason' => $alasan,
                        'updated_at' => Carbon::now()->toIso8601String(),
                    ],
                ]);
            }

            if ($jamKeluar) {
                $outDateTime = Carbon::parse($tanggal . ' ' . $jamKeluar);
                AttendanceLog::create([
                    'cloud_id' => $employee?->cloud_id ?? 'MANUAL',
                    'pin' => $finalPin,
                    'employee_id' => $employee?->id,
                    'scan_at' => $outDateTime->format('Y-m-d H:i:s'),
                    'verify_method' => 'koreksi_admin',
                    'status_scan' => '1',
                    'raw_data' => [
                        'source' => 'koreksi_admin',
                        'reason' => $alasan,
                        'updated_at' => Carbon::now()->toIso8601String(),
                    ],
                ]);
            }

            if ($employee) {
                $attendance = Attendance::firstOrNew([
                    'employee_id' => $employee->id,
                    'tanggal' => $tanggal,
                ]);

                if (!$attendance->exists) {
                    $attendance->user_id = $employee->user_id;
                }

                $attendance->jam_masuk = $jamMasuk ? Carbon::parse($tanggal . ' ' . $jamMasuk) : null;
                $attendance->jam_pulang = $jamKeluar ? Carbon::parse($tanggal . ' ' . $jamKeluar) : null;

                if ($jamMasuk) {
                    $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
                    $isSat = Carbon::parse($tanggal)->isSaturday();
                    $schedInTime = $isSat ? ($settingsData['saturday_check_in'] ?? '08:00') : ($settingsData['normal_check_in'] ?? '08:00');
                    $lateThreshold = Carbon::parse($tanggal . ' ' . $schedInTime . ':00');
                    $isLate = Carbon::parse($tanggal . ' ' . $jamMasuk)->gt($lateThreshold);
                    $attendance->status = $employee->is_exempt ? 'hadir' : ($isLate ? 'terlambat' : 'hadir');
                } else {
                    $attendance->status = $employee->is_exempt ? 'hadir' : 'alpa';
                }

                $attendance->save();
            }

            $period = Carbon::parse($tanggal)->format('Y-m');
            app(PayrollController::class)->calculatePayrollForPeriod($period, true);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Log absensi berhasil diperbarui.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui log absensi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroyKoreksi(Request $request): JsonResponse
    {
        $employeeId = $request->input('employee_id') ?? $request->query('employee_id');
        $pin = $request->input('pin') ?? $request->query('pin');
        $tanggalRaw = $request->input('tanggal') ?? $request->query('tanggal');

        if (!$tanggalRaw) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal absensi wajib diisi.',
            ], 422);
        }

        $tanggal = Carbon::parse($tanggalRaw)->format('Y-m-d');

        $employee = null;
        if ($employeeId) {
            $employee = Employee::find($employeeId);
        }
        if (!$employee && $pin) {
            $employee = Employee::where('pin', (string)$pin)->first();
        }

        $finalPin = $employee ? ($employee->pin ?? (string)$employee->id) : (string)$pin;

        if (!$employee && !$finalPin) {
            return response()->json([
                'success' => false,
                'message' => 'Karyawan atau PIN tidak ditemukan.',
            ], 404);
        }

        DB::beginTransaction();
        try {
            AttendanceLog::whereDate('scan_at', $tanggal)
                ->where(function ($q) use ($employee, $finalPin) {
                    if ($employee && $finalPin) {
                        $q->where('employee_id', $employee->id)
                          ->orWhere('pin', (string)$finalPin);
                    } elseif ($employee) {
                        $q->where('employee_id', $employee->id);
                    } else {
                        $q->where('pin', (string)$finalPin);
                    }
                })
                ->delete();

            if ($employee) {
                Attendance::where('employee_id', $employee->id)
                    ->where('tanggal', $tanggal)
                    ->delete();
            }

            $period = Carbon::parse($tanggal)->format('Y-m');
            app(PayrollController::class)->calculatePayrollForPeriod($period, true);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Log absensi berhasil dihapus.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus log absensi: ' . $e->getMessage(),
            ], 500);
        }
    }
}