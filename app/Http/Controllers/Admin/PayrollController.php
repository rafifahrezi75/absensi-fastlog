<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\OvertimeLog;
use App\Models\Payroll;
use App\Models\Permission;
use App\Models\SalaryComponent;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $periode = $request->query('periode');
        if (!$periode || !preg_match('/^\d{4}-\d{2}$/', $periode)) {
            $periode = date('Y-m');
        }

        $payrollData = $this->calculatePayrollForPeriod($periode);

        return response()->json($payrollData);
    }

    public function recalculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $periode = $validated['periode'];
        $payrollData = $this->calculatePayrollForPeriod($periode, true);

        return response()->json([
            'message' => 'Payroll berhasil dikalkulasi ulang.',
            'data' => $payrollData,
        ]);
    }

    public function markPaid(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
        ]);

        $employeeId = $validated['employee_id'];
        $periode = $validated['periode'];

        $payroll = Payroll::where('employee_id', $employeeId)
            ->where('periode', $periode)
            ->first();

        if (!$payroll) {
            $this->calculatePayrollForPeriod($periode);
            $payroll = Payroll::where('employee_id', $employeeId)
                ->where('periode', $periode)
                ->firstOrFail();
        }

        $payroll->update([
            'status' => 'paid',
            'dibayar_pada' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Gaji karyawan berhasil ditandai sebagai dibayar.',
            'payroll' => $payroll,
        ]);
    }

    public function details(Request $request): JsonResponse
    {
        $employeeId = $request->query('employee_id');
        $periode = $request->query('periode', date('Y-m'));

        $employee = Employee::with('salaryGrade')->find($employeeId);
        if (!$employee) {
            return response()->json(['error' => 'Karyawan tidak ditemukan.'], 404);
        }

        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 15);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 15);

        $activeComponents = SalaryComponent::where('status', 'aktif')->get();
        $lateFineComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'keterlambatan') || str_contains(strtolower($c->nama), 'telat');
        });
        $absentComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'alpha') || str_contains(strtolower($c->nama), 'alpa');
        });

        $lateFinePerMinute = ($lateFineComp && (float)$lateFineComp->nilai > 0) ? (float)$lateFineComp->nilai : (float)($settingsData['late_fine_per_minute'] ?? 1000);
        $absentDeduction = ($absentComp && (float)$absentComp->nilai > 0) ? (float)$absentComp->nilai : (float)($settingsData['absent_deduction'] ?? 50000);

        $monthDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $startDate = $monthDate->copy()->startOfMonth();
        $endDate = $monthDate->copy()->endOfMonth();
        $today = Carbon::today();
        $checkLimit = $today->lt($endDate) ? $today : $endDate;

        $logs = AttendanceLog::where('employee_id', $employee->id)
            ->whereDate('scan_at', '>=', $startDate)
            ->whereDate('scan_at', '<=', $endDate)
            ->orderBy('scan_at', 'asc')
            ->get();

        $groupedByDate = [];
        foreach ($logs as $log) {
            $d = Carbon::parse($log->scan_at)->format('Y-m-d');
            if (!isset($groupedByDate[$d])) {
                $groupedByDate[$d] = [];
            }
            $groupedByDate[$d][] = Carbon::parse($log->scan_at);
        }

        $holidays = Holiday::whereBetween('tanggal', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->pluck('keterangan', 'tanggal')
            ->toArray();

        $dispensations = Permission::where('employee_id', $employee->id)
            ->where('category', 'dispensasi_payroll')
            ->whereIn('status', ['disetujui', 'approved'])
            ->whereDate('tanggal_mulai', '>=', $startDate)
            ->whereDate('tanggal_mulai', '<=', $endDate)
            ->pluck('tanggal_mulai')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        $details = [];
        $curr = $checkLimit->copy();

        while ($curr->gte($startDate)) {
            $dateStr = $curr->format('Y-m-d');
            $isSunday = $curr->isSunday();
            $isSaturday = $curr->isSaturday();
            $isHoliday = isset($holidays[$dateStr]);
            $isDispensed = in_array($dateStr, $dispensations);

            if ($isSunday) {
                $details[] = [
                    'date' => $dateStr,
                    'day_name' => $curr->translatedFormat('l'),
                    'type' => 'Hari Libur Akhir Pekan',
                    'first_scan' => null,
                    'minutes' => 0,
                    'deduction' => 0,
                    'is_dispensed' => false,
                    'is_holiday' => true,
                ];
            } elseif ($isHoliday) {
                $details[] = [
                    'date' => $dateStr,
                    'day_name' => $curr->translatedFormat('l'),
                    'type' => 'Libur Nasional: ' . $holidays[$dateStr],
                    'first_scan' => null,
                    'minutes' => 0,
                    'deduction' => 0,
                    'is_dispensed' => false,
                    'is_holiday' => true,
                ];
            } elseif (isset($groupedByDate[$dateStr])) {
                $firstScan = $groupedByDate[$dateStr][0];
                $schedInStr = $isSaturday ? $satIn : $normalIn;
                $tolMin = $isSaturday ? $satTol : $normalTol;
                $scheduleIn = Carbon::parse($dateStr . ' ' . $schedInStr . ':00');
                $lateThreshold = $scheduleIn->copy()->addMinutes($tolMin);

                if ($firstScan->gt($lateThreshold)) {
                    $minutesLate = (int) round($scheduleIn->diffInMinutes($firstScan));
                    $deduction = $isDispensed ? 0 : ($minutesLate * $lateFinePerMinute);
                    $details[] = [
                        'date' => $dateStr,
                        'day_name' => $curr->translatedFormat('l'),
                        'type' => 'Terlambat',
                        'first_scan' => $firstScan->format('H:i:s'),
                        'minutes' => $minutesLate,
                        'deduction' => $deduction,
                        'is_dispensed' => $isDispensed,
                        'is_holiday' => false,
                    ];
                } else {
                    $details[] = [
                        'date' => $dateStr,
                        'day_name' => $curr->translatedFormat('l'),
                        'type' => 'Tepat Waktu',
                        'first_scan' => $firstScan->format('H:i:s'),
                        'minutes' => 0,
                        'deduction' => 0,
                        'is_dispensed' => false,
                        'is_holiday' => false,
                    ];
                }
            } else {
                if ($absentComp && $absentComp->metode === 'harian') {
                    $dailyRate = round(($employee->salaryGrade ? (float)$employee->salaryGrade->gaji_pokok : 3000000) / 22);
                } else {
                    $dailyRate = $absentDeduction;
                }
                $deduction = $isDispensed ? 0 : $dailyRate;
                $details[] = [
                    'date' => $dateStr,
                    'day_name' => $curr->translatedFormat('l'),
                    'type' => 'Alpa / Tidak Hadir',
                    'first_scan' => null,
                    'minutes' => 0,
                    'deduction' => $deduction,
                    'is_dispensed' => $isDispensed,
                    'is_holiday' => false,
                ];
            }

            $curr->subDay();
        }

        return response()->json($details);
    }

    public function dispense(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'is_dispensed' => 'required|boolean',
        ]);

        if ($validated['is_dispensed']) {
            Permission::firstOrCreate([
                'employee_id' => $validated['employee_id'],
                'category' => 'dispensasi_payroll',
                'tanggal_mulai' => $validated['date'],
                'tanggal_selesai' => $validated['date'],
            ], [
                'status' => 'disetujui',
                'keterangan' => 'Dispensasi manual via payroll',
            ]);
        } else {
            Permission::where('employee_id', $validated['employee_id'])
                ->where('category', 'dispensasi_payroll')
                ->where('tanggal_mulai', $validated['date'])
                ->delete();
        }

        $period = Carbon::parse($validated['date'])->format('Y-m');
        $this->calculatePayrollForPeriod($period, false);

        return response()->json(['success' => true]);
    }

    public function userSlip(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = Employee::with('salaryGrade')
            ->where('user_id', $user->id)
            ->first();

        if (!$employee && $user->email) {
            $employee = Employee::with('salaryGrade')
                ->where('nama', $user->name)
                ->first();
        }

        if (!$employee) {
            return response()->json(['payrolls' => []]);
        }

        $activeComponents = SalaryComponent::where('status', 'aktif')->get();

        $payrolls = Payroll::where('employee_id', $employee->id)
            ->orderBy('periode', 'desc')
            ->get()
            ->map(function ($p) use ($employee, $activeComponents) {
                $savedCatatan = $p->catatan ? json_decode($p->catatan, true) : null;
                $bpjsDetails = $savedCatatan['bpjs_details'] ?? [];
                if (empty($bpjsDetails)) {
                    foreach ($activeComponents->where('tipe', 'potongan')->where('metode', 'persen') as $comp) {
                        $basisVal = (float)$p->gaji_pokok;
                        if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                            $basisVal = (float)$comp->batas_dasar;
                        }
                        $bpjsDetails[] = [
                            'nama' => $comp->nama,
                            'persen' => (float)$comp->nilai,
                            'nominal' => round($basisVal * ((float)$comp->nilai / 100)),
                        ];
                    }
                }
                $tunjanganDetails = $savedCatatan['tunjangan_details'] ?? [];
                if (empty($tunjanganDetails)) {
                    $tunjanganDetails = $activeComponents->where('tipe', 'tambahan')->where('metode', 'nominal')->map(fn($c) => [
                        'nama' => $c->nama,
                        'nominal' => (float)$c->nilai,
                    ])->values()->all();
                }

                return [
                    'id' => $p->id,
                    'employee_id' => $employee->id,
                    'nama' => $employee->nama,
                    'nik' => $employee->nik,
                    'dept' => $employee->dept,
                    'jabatan' => $employee->jabatan ?: 'Staff',
                    'golongan' => $employee->salaryGrade?->nama ?: 'Standard',
                    'periode' => $p->periode,
                    'gapok' => (float)$p->gaji_pokok,
                    'tunjangan' => (float)$p->tunjangan,
                    'lembur' => (float)$p->lembur,
                    'bonus' => (float)$p->bonus,
                    'potongan_terlambat' => (float)$p->potongan_terlambat,
                    'potongan_alpa' => (float)$p->potongan_alpa,
                    'potongan_lainnya' => (float)$p->potongan_lainnya,
                    'potongan' => (float)$p->total_potongan,
                    'thp' => (float)$p->thp,
                    'hadir' => $p->hadir_hari,
                    'terlambat' => $p->terlambat_menit,
                    'alpa' => $p->alpa_hari,
                    'lembur_menit' => $p->lembur_menit,
                    'status' => $p->status,
                    'dibayar_pada' => $p->dibayar_pada?->format('Y-m-d H:i:s'),
                    'bpjs_details' => $bpjsDetails,
                    'tunjangan_details' => $tunjanganDetails,
                ];
            });

        return response()->json(['payrolls' => $payrolls]);
    }

    private function calculatePayrollForPeriod(string $periode, bool $forceRecalculate = false): array
    {
        $settingsData = SystemSetting::pluck('nilai', 'kunci')->all();
        $normalIn = $settingsData['normal_check_in'] ?? '08:00';
        $normalTol = (int)($settingsData['normal_tolerance'] ?? 15);
        $satIn = $settingsData['saturday_check_in'] ?? '08:00';
        $satTol = (int)($settingsData['saturday_tolerance'] ?? 15);

        $activeComponents = SalaryComponent::where('status', 'aktif')->get();
        $lateFineComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'keterlambatan') || str_contains(strtolower($c->nama), 'telat');
        });
        $absentComp = $activeComponents->first(function ($c) {
            return str_contains(strtolower($c->nama), 'alpha') || str_contains(strtolower($c->nama), 'alpa');
        });

        $lateFinePerMinute = ($lateFineComp && (float)$lateFineComp->nilai > 0) ? (float)$lateFineComp->nilai : (float)($settingsData['late_fine_per_minute'] ?? 1000);
        $absentDeduction = ($absentComp && (float)$absentComp->nilai > 0) ? (float)$absentComp->nilai : (float)($settingsData['absent_deduction'] ?? 50000);

        $allowancesBreakdown = $activeComponents->where('tipe', 'tambahan')
            ->where('metode', 'nominal')
            ->map(function ($c) {
                return [
                    'nama' => $c->nama,
                    'nominal' => (float)$c->nilai,
                ];
            })->values()->all();
        $allowancesFixed = array_sum(array_column($allowancesBreakdown, 'nominal'));

        $potonganNominalComps = $activeComponents->where('tipe', 'potongan')
            ->where('metode', 'nominal')
            ->map(function ($c) {
                return [
                    'nama' => $c->nama,
                    'nominal' => (float)$c->nilai,
                ];
            })->values()->all();
        $potonganNominalFixed = array_sum(array_column($potonganNominalComps, 'nominal'));

        $monthDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $startDate = $monthDate->copy()->startOfMonth();
        $endDate = $monthDate->copy()->endOfMonth();
        $today = Carbon::today();
        $limitDate = $today->lt($endDate) ? $today : $endDate;

        $holidays = Holiday::whereBetween('tanggal', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->pluck('tanggal')
            ->toArray();

        $employees = Employee::with('salaryGrade')
            ->orderByRaw('nama IS NULL, nama ASC')
            ->get();

        $deptLabels = [
            'it' => 'IT & Tech',
            'hrd' => 'HRD & General Affair',
            'finance' => 'Finance & Accounting',
            'marketing' => 'Marketing',
        ];

        $resultList = [];

        foreach ($employees as $employee) {
            $existingPayroll = Payroll::where('employee_id', $employee->id)
                ->where('periode', $periode)
                ->first();

            if ($existingPayroll && $existingPayroll->status === 'paid' && !$forceRecalculate) {
                $deptLabel = $deptLabels[$employee->dept] ?? $employee->dept;
                $savedCatatan = $existingPayroll->catatan ? json_decode($existingPayroll->catatan, true) : null;
                $bpjsDetails = $savedCatatan['bpjs_details'] ?? [];
                if (empty($bpjsDetails)) {
                    foreach ($activeComponents->where('tipe', 'potongan')->where('metode', 'persen') as $comp) {
                        $basisVal = (float)$existingPayroll->gaji_pokok;
                        if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                            $basisVal = (float)$comp->batas_dasar;
                        }
                        $bpjsDetails[] = [
                            'nama' => $comp->nama,
                            'persen' => (float)$comp->nilai,
                            'nominal' => round($basisVal * ((float)$comp->nilai / 100)),
                        ];
                    }
                }
                $tunjanganDetails = $savedCatatan['tunjangan_details'] ?? $allowancesBreakdown;

                $resultList[] = [
                    'id' => $employee->id,
                    'payroll_id' => $existingPayroll->id,
                    'nama' => $employee->nama,
                    'nik' => $employee->nik,
                    'dept' => $employee->dept,
                    'deptLabel' => $deptLabel ?: 'Umum',
                    'jabatan' => $employee->jabatan ?: 'Staff',
                    'golongan' => $employee->salaryGrade?->nama ?: 'Staff',
                    'gapok' => (float)$existingPayroll->gaji_pokok,
                    'tunjangan' => (float)$existingPayroll->tunjangan,
                    'lembur' => (float)$existingPayroll->lembur,
                    'bonus' => (float)$existingPayroll->bonus,
                    'potongan_terlambat' => (float)$existingPayroll->potongan_terlambat,
                    'potongan_alpa' => (float)$existingPayroll->potongan_alpa,
                    'potongan_lainnya' => (float)$existingPayroll->potongan_lainnya,
                    'potongan' => (float)$existingPayroll->total_potongan,
                    'thp' => (float)$existingPayroll->thp,
                    'status' => $existingPayroll->status,
                    'periode' => $periode,
                    'hadir' => $existingPayroll->hadir_hari,
                    'terlambat' => $existingPayroll->terlambat_menit,
                    'alpa' => $existingPayroll->alpa_hari,
                    'lembur_menit' => $existingPayroll->lembur_menit,
                    'dibayar_pada' => $existingPayroll->dibayar_pada?->format('Y-m-d H:i:s'),
                    'bpjs_details' => $bpjsDetails,
                    'tunjangan_details' => $tunjanganDetails,
                ];
                continue;
            }

            $gajiPokok = $employee->salaryGrade ? (float)$employee->salaryGrade->gaji_pokok : 3000000;
            $tarifLembur = $employee->salaryGrade ? (float)$employee->salaryGrade->tarif_lembur : 50000;

            $logs = AttendanceLog::where('employee_id', $employee->id)
                ->whereDate('scan_at', '>=', $startDate)
                ->whereDate('scan_at', '<=', $endDate)
                ->orderBy('scan_at', 'asc')
                ->get();

            $groupedByDate = [];
            foreach ($logs as $log) {
                $d = Carbon::parse($log->scan_at)->format('Y-m-d');
                if (!isset($groupedByDate[$d])) {
                    $groupedByDate[$d] = [];
                }
                $groupedByDate[$d][] = Carbon::parse($log->scan_at);
            }

            $dispensations = Permission::where('employee_id', $employee->id)
                ->where('category', 'dispensasi_payroll')
                ->whereIn('status', ['disetujui', 'approved'])
                ->whereDate('tanggal_mulai', '>=', $startDate)
                ->whereDate('tanggal_mulai', '<=', $endDate)
                ->pluck('tanggal_mulai')
                ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            $hadirCount = count($groupedByDate);
            $totalLateMinutes = 0;

            foreach ($groupedByDate as $dateStr => $scans) {
                $firstScan = $scans[0];
                $isSat = Carbon::parse($dateStr)->isSaturday();
                $schedInStr = $isSat ? $satIn : $normalIn;
                $tolMin = $isSat ? $satTol : $normalTol;
                $scheduleIn = Carbon::parse($dateStr . ' ' . $schedInStr . ':00');
                $lateThreshold = $scheduleIn->copy()->addMinutes($tolMin);

                if ($firstScan->gt($lateThreshold)) {
                    $minutesLate = (int) round($scheduleIn->diffInMinutes($firstScan));
                    if (!in_array($dateStr, $dispensations)) {
                        $totalLateMinutes += $minutesLate;
                    }
                }
            }

            $alpaCount = 0;
            $curr = $startDate->copy();
            while ($curr->lte($limitDate)) {
                $dateStr = $curr->format('Y-m-d');
                $isSunday = $curr->isSunday();
                $isHoliday = in_array($dateStr, $holidays);

                if (!$isSunday && !$isHoliday) {
                    if (!isset($groupedByDate[$dateStr])) {
                        if (!in_array($dateStr, $dispensations)) {
                            $alpaCount++;
                        }
                    }
                }
                $curr->addDay();
            }

            $overtimeMinutes = OvertimeLog::where('employee_id', $employee->id)
                ->whereBetween('waktu_tap', [$startDate->format('Y-m-d 00:00:00'), $endDate->format('Y-m-d 23:59:59')])
                ->whereIn('status', ['DISETUJUI', 'disetujui', 'APPROVED', 'approved'])
                ->sum('durasi_menit');

            $lemburPay = round(($overtimeMinutes / 60) * $tarifLembur);

            $potonganTerlambat = $totalLateMinutes * $lateFinePerMinute;
            if ($absentComp && $absentComp->metode === 'harian') {
                $potonganAlpa = round(($gajiPokok / 22) * $alpaCount);
            } else {
                $potonganAlpa = $alpaCount * $absentDeduction;
            }

            $potonganBPJSBreakdown = [];
            $potonganPersen = 0;
            foreach ($activeComponents->where('tipe', 'potongan')->where('metode', 'persen') as $comp) {
                $basisVal = $gajiPokok;
                if ($comp->batas_dasar && $basisVal > (float)$comp->batas_dasar) {
                    $basisVal = (float)$comp->batas_dasar;
                }
                $nilaiPot = round($basisVal * ((float)$comp->nilai / 100));
                $potonganPersen += $nilaiPot;
                $potonganBPJSBreakdown[] = [
                    'nama' => $comp->nama,
                    'persen' => (float)$comp->nilai,
                    'nominal' => $nilaiPot,
                ];
            }

            foreach ($potonganNominalComps as $pnc) {
                $potonganBPJSBreakdown[] = [
                    'nama' => $pnc['nama'],
                    'persen' => null,
                    'nominal' => $pnc['nominal'],
                ];
            }

            $potonganLainnya = $potonganPersen + $potonganNominalFixed;
            $totalPotongan = $potonganTerlambat + $potonganAlpa + $potonganLainnya;
            $totalBonus = $allowancesFixed + $lemburPay;
            $thp = max(0, $gajiPokok + $totalBonus - $totalPotongan);

            $currentStatus = $existingPayroll ? $existingPayroll->status : 'draft';
            $paidAt = $existingPayroll ? $existingPayroll->dibayar_pada : null;

            $catatanJson = json_encode([
                'bpjs_details' => $potonganBPJSBreakdown,
                'tunjangan_details' => $allowancesBreakdown,
            ]);

            $savedPayroll = Payroll::updateOrCreate([
                'employee_id' => $employee->id,
                'periode' => $periode,
            ], [
                'gaji_pokok' => $gajiPokok,
                'tunjangan' => $allowancesFixed,
                'lembur' => $lemburPay,
                'bonus' => $totalBonus,
                'potongan_terlambat' => $potonganTerlambat,
                'potongan_alpa' => $potonganAlpa,
                'potongan_lainnya' => $potonganLainnya,
                'total_potongan' => $totalPotongan,
                'thp' => $thp,
                'hadir_hari' => $hadirCount,
                'terlambat_menit' => $totalLateMinutes,
                'alpa_hari' => $alpaCount,
                'lembur_menit' => $overtimeMinutes,
                'status' => $currentStatus,
                'dibayar_pada' => $paidAt,
                'catatan' => $catatanJson,
            ]);

            $deptLabel = $deptLabels[$employee->dept] ?? $employee->dept;

            $resultList[] = [
                'id' => $employee->id,
                'payroll_id' => $savedPayroll->id,
                'nama' => $employee->nama,
                'nik' => $employee->nik,
                'dept' => $employee->dept,
                'deptLabel' => $deptLabel ?: 'Umum',
                'jabatan' => $employee->jabatan ?: 'Staff',
                'golongan' => $employee->salaryGrade?->nama ?: 'Staff',
                'gapok' => $gajiPokok,
                'tunjangan' => (float)$allowancesFixed,
                'lembur' => (float)$lemburPay,
                'bonus' => (float)$totalBonus,
                'potongan_terlambat' => (float)$potonganTerlambat,
                'potongan_alpa' => (float)$potonganAlpa,
                'potongan_lainnya' => (float)$potonganLainnya,
                'potongan' => (float)$totalPotongan,
                'thp' => (float)$thp,
                'status' => $savedPayroll->status,
                'periode' => $periode,
                'hadir' => $hadirCount,
                'terlambat' => $totalLateMinutes,
                'alpa' => $alpaCount,
                'lembur_menit' => $overtimeMinutes,
                'dibayar_pada' => $savedPayroll->dibayar_pada?->format('Y-m-d H:i:s'),
                'bpjs_details' => $potonganBPJSBreakdown,
                'tunjangan_details' => $allowancesBreakdown,
            ];
        }

        return $resultList;
    }
}
